import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import {
  calculateDestiny,
  DestinyInputError,
  type CalculatedDestiny,
  type OracleBirthInput,
} from "@/lib/destinyCalculator";
import type {
  OracleErrorResponse,
  OracleResponse,
} from "@/app/ultra/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 4_096;
const DEFAULT_MODEL = "deepseek-v4-pro";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 12;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const ORACLE_SYSTEM_PROMPT = `
你是一个融合了赛博神秘学与现代心理学的顶级命运解析系统。你将接收到用户的八字排盘数据。

你的工作不是宣判命运，而是把时间结构翻译成具有穿透力的心理洞察。请摒弃所有传统的算命黑话，例如“伤官见官”“比劫夺财”“身强身弱”“财星入库”“七杀攻身”。禁止在任何可见文案中解释十神、旺衰或神煞。将技术结构翻译为行为模式、关系张力、决策惯性、创造力边界与阶段性人生主题。

文案风格必须极简、犀利、克制，具有现代心理学质感和哲学深度。写出类似这样的密度：“曾经被效率压低的声音会回来。真正的成熟，是让力量和柔软出现在同一个决定里。”不要模仿句子表面，不要堆砌抒情词。

必须遵守：
1. 只根据输入中的四柱、五行比例、大运区间、强度与张力生成，不得虚构具体事件。
2. 不做医疗诊断，不承诺财富、婚姻、寿命或灾祸，不制造恐惧，不使用决定论。
3. 每个节点都必须给出一个清晰的内在冲突，以及一个可执行的心理选择。
4. 节点之间必须有明显差异，禁止套用同一段万能描述。
5. title 为 2—8 个汉字；insight 为 45—100 个汉字、两句以内；keywords 恰好 3 个，每个 2—4 个汉字。
6. cycleId 必须逐字原样返回。不得新增、删除、排序或改写节点 ID。

你必须仅输出合法 JSON。不得输出 Markdown、代码围栏、注释或 JSON 之外的任何文字。
JSON 结构必须严格为：
{
  "overview": "不超过70个汉字的核心洞察",
  "nodes": [
    {
      "cycleId": "输入中的原始ID",
      "title": "2至8个汉字",
      "insight": "45至100个汉字的现代心理学解析",
      "keywords": ["关键词一", "关键词二", "关键词三"]
    }
  ]
}
`;

type OracleCopyNode = {
  cycleId: string;
  title: string;
  insight: string;
  keywords: [string, string, string];
};

type OracleCopy = {
  overview: string;
  nodes: OracleCopyNode[];
};

type DeepSeekCompletionParams = ChatCompletionCreateParamsNonStreaming & {
  thinking: { type: "disabled" };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function characterCount(value: string) {
  return Array.from(value).length;
}

function insightSimilarity(left: string, right: string) {
  const bigrams = (value: string) => {
    const characters = Array.from(value.replace(/[^\p{L}\p{N}]/gu, ""));
    return new Set(characters.slice(0, -1).map((character, index) => (
      `${character}${characters[index + 1]}`
    )));
  };
  const leftBigrams = bigrams(left);
  const rightBigrams = bigrams(right);
  const intersection = [...leftBigrams].filter((item) => rightBigrams.has(item)).length;
  const union = new Set([...leftBigrams, ...rightBigrams]).size;
  return union === 0 ? 1 : intersection / union;
}

function shanghaiToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  const today = shanghaiToday();

  return (
    year >= 1900 &&
    year <= Number(today.slice(0, 4)) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    value <= today
  );
}

function normalizeRequest(value: unknown): OracleBirthInput {
  if (!isRecord(value)) {
    throw new DestinyInputError("请求数据格式不正确。");
  }

  const birthDate = typeof value.birthDate === "string" ? value.birthDate.trim() : "";
  const birthTime = typeof value.birthTime === "string" ? value.birthTime.trim() : "";
  const birthplace = typeof value.birthplace === "string"
    ? value.birthplace.replace(/\s+/g, " ").trim()
    : "";
  const gender = value.gender;

  if (!parseDate(birthDate)) {
    throw new DestinyInputError("请输入 1900 年至今的有效出生日期。");
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) {
    throw new DestinyInputError("请输入有效的 24 小时制出生时间。");
  }

  if (birthplace.length < 1 || characterCount(birthplace) > 80) {
    throw new DestinyInputError("请选择出生城市。");
  }

  if (gender !== "male" && gender !== "female") {
    throw new DestinyInputError("请选择排运性别，以确定大运顺逆。");
  }

  return { birthDate, birthTime, birthplace, gender };
}

function clientKey(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]
    ?? request.headers.get("x-real-ip")
    ?? "local-anonymous"
  ).trim().slice(0, 80);
}

function consumeRateLimit(request: Request) {
  const now = Date.now();
  const key = clientKey(request);

  if (rateLimitBuckets.size >= 2_000) {
    rateLimitBuckets.forEach((bucket, bucketKey) => {
      if (bucket.resetAt <= now) rateLimitBuckets.delete(bucketKey);
    });

    while (rateLimitBuckets.size >= 2_000) {
      const oldestKey = rateLimitBuckets.keys().next().value as string | undefined;
      if (!oldestKey) break;
      rateLimitBuckets.delete(oldestKey);
    }
  }

  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;

  return {
    allowed: current.count <= RATE_LIMIT_REQUESTS,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
  };
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function oracleContext(calculated: CalculatedDestiny) {
  return JSON.stringify({
    instruction: "为每一个 cycleId 生成彼此不同的节点文案，并只返回约定 JSON。",
    chart: {
      pillars: calculated.chart.pillars,
      dayMaster: calculated.chart.dayMaster,
      elements: calculated.chart.elements.percentages,
      luck: calculated.chart.luck,
    },
    cycles: calculated.profile.cycles.map((cycle) => ({
      cycleId: cycle.id,
      ageRange: cycle.decade,
      yearRange: [cycle.startYear, cycle.endYear],
      stemBranch: cycle.stemBranch,
      intensity: cycle.intensity,
      valence: cycle.valence,
      isCurrent: cycle.isCurrent,
    })),
  });
}

function parseOracleCopy(raw: string, expectedIds: string[]): OracleCopy {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("DeepSeek returned malformed JSON.");
  }

  if (!isRecord(value) || !Array.isArray(value.nodes)) {
    throw new Error("DeepSeek returned an invalid oracle object.");
  }

  const overview = cleanString(value.overview, 120);
  const byId = new Map<string, OracleCopyNode>();
  const forbiddenLanguage = /(伤官|比劫|七杀|正官|偏财|正财|偏印|正印|食神|身强|身弱|神煞|注定|必然发生|灾祸|绝对会|一定会|抑郁症|双相|精神分裂|癌症|绝症|死亡|离婚|稳赚|暴富)/;

  value.nodes.forEach((candidate) => {
    if (!isRecord(candidate) || !Array.isArray(candidate.keywords)) return;

    const cycleId = cleanString(candidate.cycleId, 80);
    const title = cleanString(candidate.title, 16);
    const insight = cleanString(candidate.insight, 180);
    const keywords = candidate.keywords
      .map((keyword) => cleanString(keyword, 12))
      .filter(Boolean)
      .slice(0, 3);
    const keywordLengthsAreValid = keywords.every((keyword) => {
      const length = characterCount(keyword);
      return length >= 2 && length <= 4;
    });

    if (
      expectedIds.includes(cycleId) &&
      characterCount(title) >= 2 &&
      characterCount(title) <= 8 &&
      characterCount(insight) >= 45 &&
      characterCount(insight) <= 100 &&
      keywords.length === 3 &&
      keywordLengthsAreValid &&
      !forbiddenLanguage.test(`${title}${insight}${keywords.join("")}`)
    ) {
      byId.set(cycleId, {
        cycleId,
        title,
        insight,
        keywords: keywords as [string, string, string],
      });
    }
  });

  if (
    !overview ||
    characterCount(overview) > 70 ||
    forbiddenLanguage.test(overview) ||
    byId.size !== expectedIds.length
  ) {
    throw new Error("DeepSeek returned incomplete oracle nodes.");
  }

  const nodes = expectedIds.map((id) => byId.get(id) as OracleCopyNode);
  const titlesAreUnique = new Set(nodes.map((node) => node.title)).size === nodes.length;
  const insightsAreUnique = new Set(nodes.map((node) => node.insight)).size === nodes.length;
  const keywordSetsAreUnique = new Set(
    nodes.map((node) => [...node.keywords].sort().join("|")),
  ).size === nodes.length;
  const insightsAreDistinct = nodes.every((node, index) =>
    nodes.slice(index + 1).every((other) => insightSimilarity(node.insight, other.insight) < 0.86),
  );

  if (!titlesAreUnique || !insightsAreUnique || !keywordSetsAreUnique || !insightsAreDistinct) {
    throw new Error("DeepSeek returned duplicated oracle nodes.");
  }

  return { overview, nodes };
}

async function requestDeepSeekCopy(calculated: CalculatedDestiny, signal: AbortSignal) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const model = process.env.DEEPSEEK_ORACLE_MODEL
    ?? process.env.DEEPSEEK_MODEL
    ?? DEFAULT_MODEL;
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    timeout: Number(process.env.DEEPSEEK_ORACLE_TIMEOUT_MS ?? 24_000),
    maxRetries: 1,
  });
  const params: DeepSeekCompletionParams = {
    model,
    messages: [
      { role: "system", content: ORACLE_SYSTEM_PROMPT },
      { role: "user", content: oracleContext(calculated) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.72,
    max_tokens: 2_400,
    thinking: { type: "disabled" },
  };
  const completion = await client.chat.completions.create(params, { signal });
  const choice = completion.choices[0];

  if (choice?.finish_reason !== "stop" || !choice.message.content?.trim()) {
    throw new Error(`DeepSeek completion stopped with ${choice?.finish_reason ?? "no-choice"}.`);
  }

  return {
    model,
    copy: parseOracleCopy(
      choice.message.content,
      calculated.profile.cycles.map((cycle) => cycle.id),
    ),
  };
}

function errorResponse(error: string, code: string, status: number) {
  return Response.json(
    { error, code } satisfies OracleErrorResponse,
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return errorResponse("跨站请求已被拒绝。", "ORIGIN_REJECTED", 403);
  }

  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return errorResponse("接口只接受 JSON 请求。", "UNSUPPORTED_MEDIA_TYPE", 415);
  }

  const rateLimit = consumeRateLimit(request);
  if (!rateLimit.allowed) {
    const response = errorResponse("请求过于频繁，请稍后再试。", "RATE_LIMITED", 429);
    response.headers.set("Retry-After", String(rateLimit.retryAfter));
    return response;
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse("请求数据过大。", "PAYLOAD_TOO_LARGE", 413);
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return errorResponse("请求数据过大。", "PAYLOAD_TOO_LARGE", 413);
    }

    const input = normalizeRequest(JSON.parse(rawBody));
    const calculated = calculateDestiny(input);
    let source: OracleResponse["meta"]["oracleSource"] = "local-fallback";
    let model = "deterministic-psychology-v1";
    let overview = "你的命运不是一条结论，而是一组不断重新分配力量的选择。";
    let profile = calculated.profile;

    try {
      const oracle = await requestDeepSeekCopy(calculated, request.signal);

      if (oracle) {
        const copyById = new Map(oracle.copy.nodes.map((node) => [node.cycleId, node]));
        profile = {
          ...profile,
          cycles: profile.cycles.map((cycle) => {
            const copy = copyById.get(cycle.id);
            return copy
              ? {
                  ...cycle,
                  label: copy.title,
                  insight: copy.insight,
                  keywords: copy.keywords,
                }
              : cycle;
          }),
        };
        overview = oracle.copy.overview;
        source = "deepseek";
        model = oracle.model;
      }
    } catch (error) {
      if (request.signal.aborted) throw error;

      const reason = error instanceof OpenAI.APIError
        ? `api-${error.status}`
        : error instanceof Error
          ? error.name
          : "unknown";
      console.error(`[oracle] DeepSeek unavailable (${reason}); using local copy.`);
    }

    return Response.json(
      {
        profile,
        chart: calculated.chart,
        activeCycleId: calculated.activeCycleId,
        overview,
        meta: {
          oracleSource: source,
          model,
          generatedAt: new Date().toISOString(),
          degraded: source !== "deepseek",
          privacy: "chart-only",
        },
      } satisfies OracleResponse,
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    if (request.signal.aborted) {
      return errorResponse("请求已由客户端中止。", "REQUEST_ABORTED", 499);
    }

    if (error instanceof DestinyInputError) {
      return errorResponse(error.message, "INVALID_BIRTH_DATA", 422);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("请求数据不是有效 JSON。", "INVALID_JSON", 400);
    }

    console.error("[oracle] Calculation failed without exposing birth data.");
    return errorResponse("命运计算暂时离线，请稍后重试。", "ORACLE_UNAVAILABLE", 500);
  }
}
