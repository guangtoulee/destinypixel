export type JubenRequestBody = {
  idea?: string;
  genre?: string;
  audience?: string;
  episodeCount?: number;
  episodeLength?: string;
  aspectRatio?: string;
  tone?: string;
  productionMode?: string;
  outputTarget?: string;
  mustHave?: string;
  avoid?: string;
};

export type JubenDialogueLine = {
  character: string;
  line: string;
  subtext: string;
};

export type JubenScene = {
  sceneId: string;
  episode: number;
  sceneHeading: string;
  dramaticPurpose: string;
  conflict: string;
  action: string;
  dialogue: JubenDialogueLine[];
  emotionalTurn: string;
};

export type JubenShot = {
  shotId: string;
  sceneId: string;
  shotSize: string;
  cameraAngle: string;
  movement: string;
  duration: string;
  visual: string;
  action: string;
  sound: string;
  continuity: string;
};

export type JubenPromptItem = {
  id: string;
  sceneId: string;
  prompt: string;
  negativePrompt: string;
};

export type JubenResult = {
  meta: {
    title: string;
    logline: string;
    format: string;
    provider: "deepseek" | "local-structured-fallback";
    model: string;
    generatedAt: string;
  };
  diagnosis: {
    corePromise: string;
    realAudienceHook: string;
    trailerRisk: string;
    fixStrategy: string;
  };
  storyBible: {
    theme: string;
    world: string;
    protagonist: string;
    antagonist: string;
    relationshipEngine: string;
    conflictEngine: string;
    visualRules: string[];
  };
  episodeOutline: Array<{
    episode: number;
    title: string;
    hook: string;
    beats: string[];
    turn: string;
    cliffhanger: string;
  }>;
  directorScript: JubenScene[];
  shotList: JubenShot[];
  storyboardPrompts: JubenPromptItem[];
  cameraPrompts: JubenPromptItem[];
  editPrompts: JubenPromptItem[];
  voiceoverScript: {
    narrator: string[];
    characterLines: JubenDialogueLine[];
    dubbingNotes: string[];
  };
  productionPack: {
    lovartStoryboard: string;
    grokVideo: string;
    editTimeline: string[];
    soundDesign: string[];
  };
  qualityChecklist: string[];
};

type ChatMessage = { role: "system" | "user"; content: string };

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ??
  "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";

const maxIdeaLength = 4200;

function clampEpisodeCount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 3;

  return Math.min(12, Math.max(1, Math.round(value)));
}

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;

  return value.trim().slice(0, maxIdeaLength);
}

export function normalizeJubenRequest(body: JubenRequestBody): Required<JubenRequestBody> {
  return {
    idea:
      cleanText(body.idea) ||
      "一个外卖骑手在暴雨夜送错一份盒饭，发现收餐人三年前已经死亡；他越想退款，越被卷入一桩旧案和一个仍在等待真相的家庭。",
    genre: cleanText(body.genre, "悬疑短剧"),
    audience: cleanText(body.audience, "18-35 岁，喜欢强钩子、强反转、真实人物动机的短剧用户"),
    episodeCount: clampEpisodeCount(body.episodeCount),
    episodeLength: cleanText(body.episodeLength, "90 秒"),
    aspectRatio: cleanText(body.aspectRatio, "9:16 竖屏"),
    tone: cleanText(body.tone, "现实主义、紧张、克制、有生活质感"),
    productionMode: cleanText(body.productionMode, "短剧分集"),
    outputTarget: cleanText(body.outputTarget, "Lovart 分镜图 + Grok 视频生成"),
    mustHave: cleanText(body.mustHave, "每集必须有明确戏剧动作、对白推进、结尾钩子，不用旁白解释剧情"),
    avoid: cleanText(
      body.avoid,
      "不要写成宣传片、预告片、概念片、诗意混剪；不要只有氛围句；不要堆空镜；不要每句都像金句。",
    ),
  };
}

function resultSchemaHint() {
  return [
    "{",
    '  "meta": {"title": "...", "logline": "...", "format": "...", "provider": "deepseek", "model": "...", "generatedAt": "ISO string"},',
    '  "diagnosis": {"corePromise": "...", "realAudienceHook": "...", "trailerRisk": "...", "fixStrategy": "..."},',
    '  "storyBible": {"theme": "...", "world": "...", "protagonist": "...", "antagonist": "...", "relationshipEngine": "...", "conflictEngine": "...", "visualRules": ["..."]},',
    '  "episodeOutline": [{"episode": 1, "title": "...", "hook": "...", "beats": ["..."], "turn": "...", "cliffhanger": "..."}],',
    '  "directorScript": [{"sceneId": "E01-S01", "episode": 1, "sceneHeading": "内/外. 地点 - 时间", "dramaticPurpose": "...", "conflict": "...", "action": "...", "dialogue": [{"character": "...", "line": "...", "subtext": "..."}], "emotionalTurn": "..."}],',
    '  "shotList": [{"shotId": "E01-S01-01", "sceneId": "E01-S01", "shotSize": "...", "cameraAngle": "...", "movement": "...", "duration": "3s", "visual": "...", "action": "...", "sound": "...", "continuity": "..."}],',
    '  "storyboardPrompts": [{"id": "SB-01", "sceneId": "E01-S01", "prompt": "...", "negativePrompt": "..."}],',
    '  "cameraPrompts": [{"id": "CAM-01", "sceneId": "E01-S01", "prompt": "...", "negativePrompt": "..."}],',
    '  "editPrompts": [{"id": "ED-01", "sceneId": "E01-S01", "prompt": "...", "negativePrompt": "..."}],',
    '  "voiceoverScript": {"narrator": ["..."], "characterLines": [{"character": "...", "line": "...", "subtext": "..."}], "dubbingNotes": ["..."]},',
    '  "productionPack": {"lovartStoryboard": "...", "grokVideo": "...", "editTimeline": ["..."], "soundDesign": ["..."]},',
    '  "qualityChecklist": ["..."]',
    "}",
  ].join("\n");
}

export function buildJubenMessages(input: Required<JubenRequestBody>): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "你是短剧平台的资深编剧、分镜导演和AI视频生产总监。",
        "你的任务不是写宣传片、预告片、概念片或广告文案，而是把一个想法拆成能连续拍摄、能剪辑、能生成分镜图和视频的短剧生产包。",
        "必须遵守影视剧本基本格式：场景标题要包含内/外、地点、时间；动作要可拍；对白要推动关系、冲突和信息，不要用旁白替代戏剧动作。",
        "必须遵守制片拆解逻辑：先给故事承诺和人物目标，再给分集钩子、场景目的、镜头尺寸、机位、运镜、声音、连续性、剪辑节奏。",
        "每一场都要回答：谁想要什么，谁阻止他，观众此刻知道了什么，下一秒为什么要继续看。",
        "镜头必须服务叙事，避免只写空镜、氛围、慢动作、震撼、史诗感、燃、大片感等预告片词。",
        "输出给 Lovart/Grok 的 prompt 要具体到人物、地点、动作、构图、光线、镜头焦段感、情绪和连续性。不要只写风格词。",
        "返回严格 JSON。不要 Markdown，不要代码块，不要解释。",
        "JSON 必须完全符合这个结构，所有字段都要有内容：",
        resultSchemaHint(),
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          creativeBrief: input,
          outputRules: [
            "episodeOutline 数量必须等于 episodeCount。",
            "每集至少 2 个导演场景；每个导演场景至少 3 个镜头。",
            "directorScript 必须像剧本，不要像梗概。",
            "shotList 必须能被导演、摄影、AI视频工具直接使用。",
            "storyboardPrompts 用于分镜图生成；cameraPrompts 用于视频运镜；editPrompts 用于剪辑节奏。",
            "voiceoverScript 只在需要时使用旁白，优先对白和行动推进。",
            "qualityChecklist 必须包含反宣传片检查项。",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

function episodeTitle(base: string, episode: number) {
  const titles = ["错送", "旧门牌", "等不到的人", "最后一单", "雨停之前", "门后证词"];

  return `${titles[(episode - 1) % titles.length]}：${base}`;
}

export function fallbackJubenResult(
  input: Required<JubenRequestBody>,
  reason = "DeepSeek 暂不可用，已使用本地结构化样片。",
): JubenResult {
  const title = input.idea.includes("外卖") ? "雨夜错单" : "第一场真相";
  const episodeCount = input.episodeCount;
  const episodeOutline = Array.from({ length: episodeCount }, (_, index) => {
    const episode = index + 1;

    return {
      episode,
      title: episodeTitle(title, episode),
      hook:
        episode === 1
          ? "主角完成一件看似普通的小事，却发现收件人身份不成立。"
          : "上一集留下的证据被推翻，主角必须换一种方式接近真相。",
      beats: [
        "开场用一个具体行动切入，不解释世界观。",
        "主角遇到阻碍，对方用现实利益或情感压力逼他退后。",
        "一个细节反转旧判断，让观众重新理解上一场。",
      ],
      turn: "主角从被动卷入变成主动验证。",
      cliffhanger:
        episode === episodeCount
          ? "真相出现，但代价落到主角自己身上。"
          : "关键人物说出一句与证据相反的话，切黑。",
    };
  });

  const directorScript: JubenScene[] = episodeOutline.flatMap((episode) => [
    {
      sceneId: `E${String(episode.episode).padStart(2, "0")}-S01`,
      episode: episode.episode,
      sceneHeading: "外. 老小区楼下 - 夜",
      dramaticPurpose: "用一个可拍行动把主角推入事件，不靠旁白解释。",
      conflict: "主角只想完成订单离开，保安坚持楼里没有这个人。",
      action:
        "雨水打在外卖箱上。主角核对手机地址，门牌号和取餐备注完全一致。保安把登记本推过来，三年前那一页被撕掉一角。",
      dialogue: [
        {
          character: "骑手",
          line: "我就送个饭，签收了我马上走。",
          subtext: "他急着脱身，不想承认这单不正常。",
        },
        {
          character: "保安",
          line: "这栋楼没有 404，三年前就封了。",
          subtext: "保安知道更多，但在试探骑手。",
        },
      ],
      emotionalTurn: "主角从烦躁变成警觉。",
    },
    {
      sceneId: `E${String(episode.episode).padStart(2, "0")}-S02`,
      episode: episode.episode,
      sceneHeading: "内. 楼道四层 - 夜",
      dramaticPurpose: "把悬念落到人物选择：退单还是敲门。",
      conflict: "门内传出筷子碰碗声，但猫眼是黑的。",
      action:
        "楼道感应灯忽明忽暗。主角把盒饭放在门口，手机弹出催单提示。门缝里慢慢推出一张泛黄收据，收据日期停在三年前。",
      dialogue: [
        {
          character: "门内女声",
          line: "你终于送来了。",
          subtext: "她不像在等饭，更像在等一个证人。",
        },
        {
          character: "骑手",
          line: "你是谁？",
          subtext: "他第一次承认这不是一单普通配送。",
        },
      ],
      emotionalTurn: "主角被迫进入门后的真相。",
    },
  ]);

  const shotList: JubenShot[] = directorScript.flatMap((scene) => [
    {
      shotId: `${scene.sceneId}-01`,
      sceneId: scene.sceneId,
      shotSize: "近景",
      cameraAngle: "略低机位，贴近外卖箱",
      movement: "手持轻微跟拍",
      duration: "4s",
      visual: "雨水从外卖箱边缘滴下，订单小票被打湿但门牌号清楚。",
      action: "主角停下脚步，低头核对地址。",
      sound: "雨声、塑料箱摩擦、手机震动。",
      continuity: "小票门牌号必须和下一镜手机画面一致。",
    },
    {
      shotId: `${scene.sceneId}-02`,
      sceneId: scene.sceneId,
      shotSize: "过肩中景",
      cameraAngle: "从主角肩后看向阻挡者或门缝",
      movement: "慢推",
      duration: "5s",
      visual: scene.conflict,
      action: "对方给出阻碍，主角没有立刻退。",
      sound: "对白压低，环境声不断。",
      continuity: "人物站位保持左主角右阻碍。",
    },
    {
      shotId: `${scene.sceneId}-03`,
      sceneId: scene.sceneId,
      shotSize: "特写",
      cameraAngle: "正面平视",
      movement: "静止后突然切黑",
      duration: "3s",
      visual: scene.emotionalTurn,
      action: "关键物件出现，主角表情变化。",
      sound: "环境声瞬间抽空，只留一个低频点。",
      continuity: "结尾留足 8 帧黑场接下一场。",
    },
  ]);

  const promptItems = shotList.slice(0, 12).map((shot, index) => ({
    id: `SB-${String(index + 1).padStart(2, "0")}`,
    sceneId: shot.sceneId,
    prompt: `${input.aspectRatio} 短剧分镜图，${shot.shotSize}，${shot.cameraAngle}，${shot.visual}，人物动作：${shot.action}，现实主义短剧质感，生活化服装，清晰场景连续性，暗雨夜但主体可辨认。`,
    negativePrompt:
      "不要电影海报，不要预告片构图，不要夸张光效，不要空镜堆砌，不要多余文字，不要人物变脸，不要欧美大片风。",
  }));

  return {
    meta: {
      title,
      logline:
        "一个普通人被一件小事拖入旧案，他越想置身事外，越成为唯一能让真相重新开口的人。",
      format: `${input.productionMode} · ${episodeCount} 集 · ${input.episodeLength} · ${input.aspectRatio}`,
      provider: "local-structured-fallback",
      model: reason,
      generatedAt: new Date().toISOString(),
    },
    diagnosis: {
      corePromise: "用日常职业动作撞上不可解释的现实缝隙，制造短剧的强钩子。",
      realAudienceHook: "观众追的不是奇观，而是门后那个人到底是谁、主角为什么不能走。",
      trailerRisk: "如果只写雨夜、旧楼、神秘女声，会变成悬疑氛围预告片，没有戏剧推进。",
      fixStrategy: "每场都让主角做选择、付代价、拿到一个会推翻上一判断的新证据。",
    },
    storyBible: {
      theme: "普通人的善意一旦碰到沉默的旧案，就会变成危险的责任。",
      world: "真实城市边缘的老小区、外卖系统、物业登记和被遗忘的家庭。",
      protagonist: "外卖骑手，现实、谨慎、怕麻烦，但有最低限度的良心。",
      antagonist: "不是单个反派，而是所有想让旧案继续沉默的人。",
      relationshipEngine: "骑手和门内女声从互相防备到被迫交换真相。",
      conflictEngine: "每次接近真相，主角的工作、收入、安全和亲情都会被现实反噬。",
      visualRules: [
        "优先现实场景和可拍行动，不靠抽象意象撑戏。",
        "每集至少一个可记住的物件：小票、门牌、登记本、旧收据。",
        "镜头连续性固定：主角左侧入画，阻碍右侧压迫，真相从门缝或屏幕出现。",
      ],
    },
    episodeOutline,
    directorScript,
    shotList,
    storyboardPrompts: promptItems,
    cameraPrompts: promptItems.map((item, index) => ({
      ...item,
      id: `CAM-${String(index + 1).padStart(2, "0")}`,
      prompt: `${item.sceneId} 视频运镜：${shotList[index]?.movement}，镜头时长 ${shotList[index]?.duration}，动作必须按“停顿-反应-发现”推进，保持人物服装、雨夜光线、门牌和外卖箱连续。`,
    })),
    editPrompts: promptItems.map((item, index) => ({
      ...item,
      id: `ED-${String(index + 1).padStart(2, "0")}`,
      prompt: `${item.sceneId} 剪辑：前 2 秒给行动，中段给阻碍，末尾用物件或一句对白制造钩子。不要混剪，不要跳成预告片节奏。镜头 ${index + 1} 保持声音桥接。`,
    })),
    voiceoverScript: {
      narrator: [
        "旁白只在转场或信息缺口时使用，不解释人物已经做出来的动作。",
        "示例：那天雨太大，他以为只是系统派错了一单。",
      ],
      characterLines: directorScript.flatMap((scene) => scene.dialogue),
      dubbingNotes: [
        "男主语速偏快，前半段带职业疲惫，发现异常后降速。",
        "门内女声不要鬼片化，要像一个等太久的人终于压住情绪。",
      ],
    },
    productionPack: {
      lovartStoryboard: promptItems.map((item) => `${item.id}: ${item.prompt}`).join("\n\n"),
      grokVideo: shotList
        .slice(0, 12)
        .map((shot) => `${shot.shotId} | ${shot.duration} | ${shot.movement} | ${shot.visual} | ${shot.action}`)
        .join("\n"),
      editTimeline: [
        "0-3s：用动作开场，不上世界观。",
        "3-18s：阻碍出现，观众得到第一个异常信息。",
        "18-55s：主角验证，信息反转。",
        "最后 5s：一句对白或一个物件做 cliffhanger。",
      ],
      soundDesign: ["现实环境声优先", "低频只在证据出现时进入", "不要全程铺史诗音乐"],
    },
    qualityChecklist: [
      "每场都有场景标题、人物目标、阻碍、动作和对白。",
      "每个镜头都能回答拍什么、怎么拍、拍几秒、接哪里。",
      "没有把核心剧情写成旁白简介。",
      "没有连续三个以上空镜或纯氛围镜头。",
      "每集结尾不是口号，而是新证据或新危险。",
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(text.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function looksLikeJubenResult(value: unknown): value is JubenResult {
  if (!isRecord(value)) return false;

  return (
    isRecord(value.meta) &&
    isRecord(value.storyBible) &&
    Array.isArray(value.episodeOutline) &&
    Array.isArray(value.directorScript) &&
    Array.isArray(value.shotList) &&
    Array.isArray(value.storyboardPrompts) &&
    isRecord(value.productionPack)
  );
}

function makePromptFromShot(
  shot: JubenShot,
  type: "storyboard" | "camera" | "edit",
  index: number,
): JubenPromptItem {
  const idPrefix = type === "storyboard" ? "SB" : type === "camera" ? "CAM" : "ED";
  const baseId = `${idPrefix}-${String(index + 1).padStart(2, "0")}`;

  if (type === "camera") {
    return {
      id: baseId,
      sceneId: shot.sceneId,
      prompt: `${shot.shotId} 运镜生成：${shot.shotSize}，${shot.cameraAngle}，${shot.movement}，时长 ${shot.duration}。画面内容：${shot.visual}。人物动作：${shot.action}。保持同一场景、服装、道具、光线和情绪连续，不要跳成预告片混剪。`,
      negativePrompt:
        "不要空镜堆砌，不要大幅度无目的摇晃，不要电影预告片节奏，不要人物变脸，不要随机换景。",
    };
  }

  if (type === "edit") {
    return {
      id: baseId,
      sceneId: shot.sceneId,
      prompt: `${shot.shotId} 剪辑指令：镜头 ${shot.duration}，先给可见动作，再给反应或证据。声音使用 ${shot.sound}，转场要服务 ${shot.continuity}。结尾必须推动下一镜，不做纯氛围停留。`,
      negativePrompt:
        "不要宣传片蒙太奇，不要无意义闪白，不要史诗音乐硬推，不要把剧情用字幕解释完。",
    };
  }

  return {
    id: baseId,
    sceneId: shot.sceneId,
    prompt: `${shot.shotId} 分镜图，${shot.shotSize}，${shot.cameraAngle}，${shot.visual}。人物动作：${shot.action}。现实主义短剧质感，主体清楚，构图服务戏剧冲突，保留关键道具和场景连续性。`,
    negativePrompt:
      "不要海报构图，不要预告片大片感，不要抽象空镜，不要夸张光效，不要多余文字，不要人物五官不连续。",
  };
}

function ensurePromptCoverage(
  existing: JubenPromptItem[],
  shots: JubenShot[],
  type: "storyboard" | "camera" | "edit",
) {
  const normalized = existing.filter((item) => item.sceneId && item.prompt);

  shots.forEach((shot) => {
    if (normalized.length < shots.length) {
      normalized.push(makePromptFromShot(shot, type, normalized.length));
    }
  });

  return normalized;
}

function ensureJubenCoverage(result: JubenResult): JubenResult {
  const storyboardPrompts = ensurePromptCoverage(
    result.storyboardPrompts,
    result.shotList,
    "storyboard",
  );
  const cameraPrompts = ensurePromptCoverage(
    result.cameraPrompts,
    result.shotList,
    "camera",
  );
  const editPrompts = ensurePromptCoverage(result.editPrompts, result.shotList, "edit");

  return {
    ...result,
    storyboardPrompts,
    cameraPrompts,
    editPrompts,
    productionPack: {
      ...result.productionPack,
      lovartStoryboard: storyboardPrompts
        .map((item) => `${item.id} / ${item.sceneId}: ${item.prompt}`)
        .join("\n\n"),
      grokVideo: cameraPrompts
        .map((item) => `${item.id} / ${item.sceneId}: ${item.prompt}`)
        .join("\n\n"),
    },
  };
}

export async function generateJubenResult(
  body: JubenRequestBody,
): Promise<JubenResult> {
  const input = normalizeJubenRequest(body);
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return fallbackJubenResult(input, "DEEPSEEK_API_KEY is not configured.");
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.38,
        max_tokens: Number(process.env.JUBEN_DEEPSEEK_MAX_TOKENS ?? 14000),
        response_format: { type: "json_object" },
        messages: buildJubenMessages(input),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackJubenResult(
        input,
        `DeepSeek request failed with ${response.status}.`,
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? parseJsonObject(content) : null;

    if (!looksLikeJubenResult(parsed)) {
      return fallbackJubenResult(input, "DeepSeek JSON did not match the expected structure.");
    }

    return ensureJubenCoverage({
      ...parsed,
      meta: {
        ...parsed.meta,
        provider: "deepseek",
        model: DEEPSEEK_MODEL,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return fallbackJubenResult(input, "DeepSeek request failed before completion.");
  }
}
