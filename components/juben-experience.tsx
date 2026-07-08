"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  Check,
  Clapperboard,
  Copy,
  Download,
  FileJson,
  Film,
  Loader2,
  Mic2,
  PanelTop,
  RefreshCcw,
  Scissors,
  Sparkles,
  Video,
} from "lucide-react";
import type {
  JubenAnalysisResult,
  JubenPromptItem,
  JubenRequestBody,
  JubenResult,
  JubenScene,
  JubenShot,
} from "@/lib/ai/juben";
import styles from "./juben-experience.module.css";

type Status = "idle" | "loading" | "ready" | "error";
type AnalyzeStatus = "idle" | "loading" | "ready" | "error";
type EpisodeScope = number | "all";
type TabKey =
  | "bible"
  | "outline"
  | "script"
  | "shots"
  | "storyboard"
  | "camera"
  | "edit"
  | "voice";

const initialForm: Required<JubenRequestBody> = {
  idea:
    "一个女律师发现自己每晚 23:17 都会收到已故母亲发来的微信语音。她一开始以为是诈骗，直到语音准确说出第二天庭审会出现的证据。她越追查，越发现母亲当年的死亡和自己正在辩护的案子有关。",
  genre: "都市悬疑短剧",
  audience: "18-35 岁，喜欢反转、亲情悬疑、强情绪钩子的竖屏短剧用户",
  episodeCount: 4,
  episodeLength: "90 秒",
  aspectRatio: "9:16 竖屏",
  tone: "现实主义、紧张、克制、有情感刺痛",
  productionMode: "短剧分集",
  outputTarget: "Lovart 分镜图 + Grok 视频生成",
  mustHave: "每集必须有真实戏剧动作、人物关系推进、结尾钩子；母女关系要有情感重量。",
  avoid:
    "不要写成宣传片、预告片、概念片；不要只写氛围；不要靠旁白解释；不要每一幕都神神叨叨。",
};

const tabs: Array<{ key: TabKey; label: string; icon: typeof BookOpenText }> = [
  { key: "bible", label: "故事圣经", icon: BookOpenText },
  { key: "outline", label: "分集结构", icon: PanelTop },
  { key: "script", label: "导演剧本", icon: Clapperboard },
  { key: "shots", label: "镜头表", icon: Film },
  { key: "storyboard", label: "分镜 Prompt", icon: Sparkles },
  { key: "camera", label: "运镜 Prompt", icon: Video },
  { key: "edit", label: "剪辑 Prompt", icon: Scissors },
  { key: "voice", label: "配音/导出", icon: Mic2 },
];

function updateField<K extends keyof Required<JubenRequestBody>>(
  form: Required<JubenRequestBody>,
  key: K,
  value: Required<JubenRequestBody>[K],
) {
  return { ...form, [key]: value };
}

function asPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function promptText(items: JubenPromptItem[]) {
  return items
    .map(
      (item) =>
        `${item.id} / ${item.sceneId}\n${item.prompt}\nNegative: ${item.negativePrompt}`,
    )
    .join("\n\n");
}

function resultTabText(result: JubenResult, tab: TabKey) {
  return resultTabTextForScope(result, tab, "all");
}

function sceneEpisode(sceneId: string) {
  const match = sceneId.match(/^E(\d+)/i);

  return match ? Number(match[1]) : 1;
}

function scopedResultParts(result: JubenResult, scope: EpisodeScope) {
  const episode =
    scope === "all" ? null : typeof scope === "number" ? scope : null;
  const scenes =
    episode === null
      ? result.directorScript
      : result.directorScript.filter((scene) => scene.episode === episode);
  const sceneIds = new Set(scenes.map((scene) => scene.sceneId));
  const shots =
    episode === null
      ? result.shotList
      : result.shotList.filter(
          (shot) =>
            sceneIds.has(shot.sceneId) || sceneEpisode(shot.sceneId) === episode,
        );
  const storyboardPrompts =
    episode === null
      ? result.storyboardPrompts
      : result.storyboardPrompts.filter(
          (item) =>
            sceneIds.has(item.sceneId) || sceneEpisode(item.sceneId) === episode,
        );
  const cameraPrompts =
    episode === null
      ? result.cameraPrompts
      : result.cameraPrompts.filter(
          (item) =>
            sceneIds.has(item.sceneId) || sceneEpisode(item.sceneId) === episode,
        );
  const editPrompts =
    episode === null
      ? result.editPrompts
      : result.editPrompts.filter(
          (item) =>
            sceneIds.has(item.sceneId) || sceneEpisode(item.sceneId) === episode,
        );
  const outline =
    episode === null
      ? result.episodeOutline
      : result.episodeOutline.filter((item) => item.episode === episode);

  return {
    episode,
    outline,
    scenes,
    shots,
    storyboardPrompts,
    cameraPrompts,
    editPrompts,
  };
}

function resultTabTextForScope(
  result: JubenResult,
  tab: TabKey,
  scope: EpisodeScope,
) {
  const scoped = scopedResultParts(result, scope);

  switch (tab) {
    case "bible":
      return asPrettyJson({
        diagnosis: result.diagnosis,
        storyBible: result.storyBible,
      });
    case "outline":
      return asPrettyJson(scoped.outline);
    case "script":
      return asPrettyJson(scoped.scenes);
    case "shots":
      return asPrettyJson(scoped.shots);
    case "storyboard":
      return promptText(scoped.storyboardPrompts);
    case "camera":
      return promptText(scoped.cameraPrompts);
    case "edit":
      return promptText(scoped.editPrompts);
    case "voice":
      return asPrettyJson({
        voiceoverScript: result.voiceoverScript,
        productionPack: result.productionPack,
      });
  }
}

function downloadBlob(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, text: string) {
  downloadBlob(filename, text, "application/json;charset=utf-8");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableHtml(
  title: string,
  headers: string[],
  rows: Array<Array<unknown>>,
) {
  return [
    `<h2>${escapeHtml(title)}</h2>`,
    "<table>",
    `<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>`,
    `<tbody>${rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody>`,
    "</table>",
  ].join("");
}

function exportHtml(result: JubenResult) {
  const promptRows = [
    ...result.storyboardPrompts.map((item) => ["分镜", item.id, item.sceneId, item.prompt, item.negativePrompt]),
    ...result.cameraPrompts.map((item) => ["运镜", item.id, item.sceneId, item.prompt, item.negativePrompt]),
    ...result.editPrompts.map((item) => ["剪辑", item.id, item.sceneId, item.prompt, item.negativePrompt]),
  ];

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",Arial,sans-serif;color:#111}
h1{font-size:24px} h2{margin-top:24px;font-size:18px}
table{border-collapse:collapse;width:100%;margin:10px 0 22px}
th,td{border:1px solid #999;padding:8px;vertical-align:top;font-size:12px;line-height:1.45}
th{background:#efefef}
</style>
</head>
<body>
<h1>${escapeHtml(result.meta.title)} - 短剧生产包</h1>
<p>${escapeHtml(result.meta.logline)}</p>
${tableHtml("故事圣经", ["模块", "内容"], [
  ["核心承诺", result.diagnosis.corePromise],
  ["观众钩子", result.diagnosis.realAudienceHook],
  ["预告片风险", result.diagnosis.trailerRisk],
  ["修正策略", result.diagnosis.fixStrategy],
  ["主题", result.storyBible.theme],
  ["世界观", result.storyBible.world],
  ["主角", result.storyBible.protagonist],
  ["反派/阻碍", result.storyBible.antagonist],
  ["冲突引擎", result.storyBible.conflictEngine],
])}
${tableHtml(
  "分集结构",
  ["集数", "标题", "钩子", "节拍", "转折", "结尾钩子"],
  result.episodeOutline.map((episode) => [
    `E${String(episode.episode).padStart(2, "0")}`,
    episode.title,
    episode.hook,
    episode.beats.join("\n"),
    episode.turn,
    episode.cliffhanger,
  ]),
)}
${tableHtml(
  "导演剧本",
  ["场景", "集数", "场景标题", "戏剧目的", "冲突", "动作", "对白", "情绪转折"],
  result.directorScript.map((scene) => [
    scene.sceneId,
    scene.episode,
    scene.sceneHeading,
    scene.dramaticPurpose,
    scene.conflict,
    scene.action,
    scene.dialogue.map((line) => `${line.character}: ${line.line}（${line.subtext}）`).join("\n"),
    scene.emotionalTurn,
  ]),
)}
${tableHtml(
  "镜头表",
  ["镜头", "场景", "景别", "机位", "运镜", "时长", "画面", "动作", "声音", "连续性"],
  result.shotList.map((shot) => [
    shot.shotId,
    shot.sceneId,
    shot.shotSize,
    shot.cameraAngle,
    shot.movement,
    shot.duration,
    shot.visual,
    shot.action,
    shot.sound,
    shot.continuity,
  ]),
)}
${tableHtml("AI Prompt", ["类型", "编号", "场景", "Prompt", "Negative"], promptRows)}
</body>
</html>`;
}

function downloadExcel(result: JubenResult) {
  downloadBlob(
    `${result.meta.title || "juben"}-production-pack.xls`,
    exportHtml(result),
    "application/vnd.ms-excel;charset=utf-8",
  );
}

function downloadWord(result: JubenResult) {
  downloadBlob(
    `${result.meta.title || "juben"}-production-pack.doc`,
    exportHtml(result),
    "application/msword;charset=utf-8",
  );
}

function PromptList({ items }: { items: JubenPromptItem[] }) {
  return (
    <div className={styles.promptList}>
      {items.map((item) => (
        <article className={styles.promptItem} key={item.id}>
          <div>
            <strong>{item.id}</strong>
            <span>{item.sceneId}</span>
          </div>
          <p>{item.prompt}</p>
          <small>{item.negativePrompt}</small>
        </article>
      ))}
    </div>
  );
}

function SceneCard({ scene }: { scene: JubenScene }) {
  return (
    <article className={styles.sceneCard}>
      <header>
        <span>{scene.sceneId}</span>
        <strong>{scene.sceneHeading}</strong>
      </header>
      <p>{scene.action}</p>
      <dl>
        <div>
          <dt>戏剧目的</dt>
          <dd>{scene.dramaticPurpose}</dd>
        </div>
        <div>
          <dt>冲突</dt>
          <dd>{scene.conflict}</dd>
        </div>
        <div>
          <dt>情绪转折</dt>
          <dd>{scene.emotionalTurn}</dd>
        </div>
      </dl>
      <div className={styles.dialogueStack}>
        {scene.dialogue.map((line, index) => (
          <div key={`${scene.sceneId}-${line.character}-${index}`}>
            <strong>{line.character}</strong>
            <p>{line.line}</p>
            <small>{line.subtext}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function ShotCard({ shot }: { shot: JubenShot }) {
  return (
    <article className={styles.shotCard}>
      <header>
        <strong>{shot.shotId}</strong>
        <span>{shot.duration}</span>
      </header>
      <p>{shot.visual}</p>
      <dl>
        <div>
          <dt>景别</dt>
          <dd>{shot.shotSize}</dd>
        </div>
        <div>
          <dt>机位</dt>
          <dd>{shot.cameraAngle}</dd>
        </div>
        <div>
          <dt>运镜</dt>
          <dd>{shot.movement}</dd>
        </div>
        <div>
          <dt>声音</dt>
          <dd>{shot.sound}</dd>
        </div>
      </dl>
      <small>{shot.continuity}</small>
    </article>
  );
}

export default function JubenExperience() {
  const [form, setForm] = useState<Required<JubenRequestBody>>(initialForm);
  const [result, setResult] = useState<JubenResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [analyzeStatus, setAnalyzeStatus] = useState<AnalyzeStatus>("idle");
  const [analysis, setAnalysis] = useState<JubenAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("bible");
  const [episodeScope, setEpisodeScope] = useState<EpisodeScope>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const scopedParts = useMemo(() => {
    if (!result) {
      return null;
    }

    return scopedResultParts(result, episodeScope);
  }, [episodeScope, result]);

  const currentTabText = useMemo(() => {
    if (!result) return "";

    return resultTabTextForScope(result, activeTab, episodeScope);
  }, [activeTab, episodeScope, result]);

  const totals = useMemo(() => {
    if (!result) {
      return { scenes: 0, shots: 0, prompts: 0 };
    }

    return {
      scenes: scopedParts?.scenes.length ?? result.directorScript.length,
      shots: scopedParts?.shots.length ?? result.shotList.length,
      prompts:
        (scopedParts?.storyboardPrompts.length ??
          result.storyboardPrompts.length) +
        (scopedParts?.cameraPrompts.length ?? result.cameraPrompts.length) +
        (scopedParts?.editPrompts.length ?? result.editPrompts.length),
    };
  }, [result, scopedParts]);

  async function copyText(label: string, text: string) {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1200);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setActiveTab("bible");

    try {
      const response = await fetch("/api/juben/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Request failed.");
      }

      const payload = (await response.json()) as JubenResult;
      setResult(payload);
      setEpisodeScope("all");
      setStatus(payload.meta.provider === "deepseek" ? "ready" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function handleAnalyze() {
    if (form.idea.trim().length < 8) return;

    setAnalyzeStatus("loading");

    try {
      const response = await fetch("/api/juben/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Analyze request failed.");
      }

      const payload = (await response.json()) as JubenAnalysisResult;
      setAnalysis(payload);
      setForm({
        ...form,
        genre: payload.genre,
        audience: payload.audience,
        episodeCount: payload.episodeCount,
        episodeLength: payload.episodeLength,
        aspectRatio: payload.aspectRatio,
        tone: payload.tone,
        productionMode: payload.productionMode,
        outputTarget: payload.outputTarget,
        mustHave: payload.mustHave,
        avoid: payload.avoid,
      });
      setAnalyzeStatus("ready");
    } catch {
      setAnalyzeStatus("error");
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a href="/" aria-label="返回 DestinyPixel">
          <ArrowLeft size={16} />
          DestinyPixel
        </a>
        <div>
          <span>AI 短剧生产台</span>
          <strong>/juben</strong>
        </div>
      </header>

      <section className={styles.workspace}>
        <form className={styles.inputPanel} onSubmit={handleSubmit}>
          <div className={styles.panelHeading}>
            <span>创意输入</span>
            <h1>把一个想法拆成能拍、能剪、能生成的视频本子。</h1>
          </div>

          <label className={styles.field}>
            <span>想法 / 大概剧情</span>
            <textarea
              value={form.idea}
              onChange={(event) =>
                setForm(updateField(form, "idea", event.target.value))
              }
            />
          </label>

          <div className={styles.analyzeRow}>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeStatus === "loading" || form.idea.trim().length < 8}
            >
              {analyzeStatus === "loading" ? (
                <Loader2 size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              {analyzeStatus === "loading" ? "正在简析" : "先简析想法"}
            </button>
            <span>
              {analysis
                ? `${analysis.titleSuggestion} · ${analysis.hook}`
                : "先让 AI 补齐类型、受众、集数、气质和生成约束。"}
            </span>
          </div>

          {analysis ? (
            <div className={styles.analysisNote}>
              <strong>{analysis.premise}</strong>
              {analysis.revisionNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          ) : null}

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>类型</span>
              <input
                value={form.genre}
                onChange={(event) =>
                  setForm(updateField(form, "genre", event.target.value))
                }
              />
            </label>
            <label className={styles.field}>
              <span>受众</span>
              <input
                value={form.audience}
                onChange={(event) =>
                  setForm(updateField(form, "audience", event.target.value))
                }
              />
            </label>
            <label className={styles.field}>
              <span>集数</span>
              <select
                value={form.episodeCount}
                onChange={(event) =>
                  setForm(
                    updateField(form, "episodeCount", Number(event.target.value)),
                  )
                }
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((count) => (
                  <option key={count} value={count}>
                    {count} 集
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>单集时长</span>
              <select
                value={form.episodeLength}
                onChange={(event) =>
                  setForm(updateField(form, "episodeLength", event.target.value))
                }
              >
                {["30 秒", "60 秒", "90 秒", "2 分钟", "3 分钟", "5 分钟"].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className={styles.field}>
              <span>画幅</span>
              <select
                value={form.aspectRatio}
                onChange={(event) =>
                  setForm(updateField(form, "aspectRatio", event.target.value))
                }
              >
                {["9:16 竖屏", "16:9 横屏", "1:1 方屏", "4:5 信息流"].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className={styles.field}>
              <span>气质</span>
              <input
                value={form.tone}
                onChange={(event) =>
                  setForm(updateField(form, "tone", event.target.value))
                }
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>必须保留</span>
            <textarea
              className={styles.shortTextarea}
              value={form.mustHave}
              onChange={(event) =>
                setForm(updateField(form, "mustHave", event.target.value))
              }
            />
          </label>

          <label className={styles.field}>
            <span>避免方向</span>
            <textarea
              className={styles.shortTextarea}
              value={form.avoid}
              onChange={(event) =>
                setForm(updateField(form, "avoid", event.target.value))
              }
            />
          </label>

          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setResult(null);
                setStatus("idle");
                setAnalysis(null);
                setAnalyzeStatus("idle");
                setEpisodeScope("all");
              }}
            >
              <RefreshCcw size={16} />
              重置样例
            </button>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              {status === "loading" ? "正在拆解" : "生成剧本包"}
            </button>
          </div>
        </form>

        <section className={styles.outputPanel}>
          <div className={styles.visualPanel}>
            <Image
              src="/juben/director-desk.png"
              alt="导演剧本与分镜工作台"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
            />
            <div className={styles.visualOverlay}>
              <span data-status={status}>
                {status === "loading"
                  ? "DeepSeek 正在拆场"
                  : status === "ready"
                    ? "DeepSeek 生成完成"
                    : status === "error"
                      ? "本地结构化样片"
                      : "等待生成"}
              </span>
              <strong>{result?.meta.title ?? "短剧本子生产线"}</strong>
              <p>{result?.meta.logline ?? "先让剧情成立，再让镜头和 AI prompt 接上。"}</p>
            </div>
          </div>

          <div className={styles.metricRow}>
            <div>
              <small>场景</small>
              <strong>{totals.scenes}</strong>
            </div>
            <div>
              <small>镜头</small>
              <strong>{totals.shots}</strong>
            </div>
            <div>
              <small>Prompt</small>
              <strong>{totals.prompts}</strong>
            </div>
            <div>
              <small>格式</small>
              <strong>
                {episodeScope === "all"
                  ? result?.meta.format ?? form.aspectRatio
                  : `E${String(episodeScope).padStart(2, "0")} · ${form.aspectRatio}`}
              </strong>
            </div>
          </div>

          <div className={styles.resultToolbar}>
            <div className={styles.tabs} role="tablist" aria-label="剧本输出">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.copyActions}>
              <button
                type="button"
                disabled={!result}
                onClick={() => copyText("tab", currentTabText)}
              >
                {copied === "tab" ? <Check size={15} /> : <Copy size={15} />}
                复制当前
              </button>
              <button
                type="button"
                disabled={!result}
                onClick={() => copyText("json", result ? asPrettyJson(result) : "")}
              >
                {copied === "json" ? <Check size={15} /> : <FileJson size={15} />}
                复制 JSON
              </button>
              <button
                type="button"
                disabled={!result}
                onClick={() =>
                  result &&
                  downloadText(
                    `${result.meta.title || "juben"}-production-pack.json`,
                    asPrettyJson(result),
                  )
                }
              >
                <Download size={15} />
                JSON
              </button>
              <button
                type="button"
                disabled={!result}
                onClick={() => result && downloadExcel(result)}
              >
                <Download size={15} />
                Excel
              </button>
              <button
                type="button"
                disabled={!result}
                onClick={() => result && downloadWord(result)}
              >
                <Download size={15} />
                Word
              </button>
            </div>
          </div>

          {result ? (
            <div className={styles.episodeSwitch} role="group" aria-label="选择集数">
              <button
                type="button"
                data-active={episodeScope === "all"}
                onClick={() => setEpisodeScope("all")}
              >
                全部
              </button>
              {result.episodeOutline.map((episode) => (
                <button
                  key={episode.episode}
                  type="button"
                  data-active={episodeScope === episode.episode}
                  onClick={() => setEpisodeScope(episode.episode)}
                >
                  E{String(episode.episode).padStart(2, "0")}
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.resultBody}>
            {!result ? (
              <div className={styles.emptyState}>
                <Clapperboard size={32} />
                <strong>输入剧情后生成第一版生产包。</strong>
                <p>
                  输出会按剧作、导演、摄影、AI 分镜、视频运镜、剪辑和配音拆开。
                </p>
              </div>
            ) : activeTab === "bible" ? (
              <div className={styles.bibleGrid}>
                <article>
                  <span>核心承诺</span>
                  <p>{result.diagnosis.corePromise}</p>
                </article>
                <article>
                  <span>观众钩子</span>
                  <p>{result.diagnosis.realAudienceHook}</p>
                </article>
                <article>
                  <span>预告片风险</span>
                  <p>{result.diagnosis.trailerRisk}</p>
                </article>
                <article>
                  <span>修正策略</span>
                  <p>{result.diagnosis.fixStrategy}</p>
                </article>
                <article>
                  <span>主题</span>
                  <p>{result.storyBible.theme}</p>
                </article>
                <article>
                  <span>冲突引擎</span>
                  <p>{result.storyBible.conflictEngine}</p>
                </article>
                <article>
                  <span>主角</span>
                  <p>{result.storyBible.protagonist}</p>
                </article>
                <article>
                  <span>视觉规则</span>
                  <ul>
                    {result.storyBible.visualRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </article>
              </div>
            ) : activeTab === "outline" ? (
              <div className={styles.episodeList}>
                {(scopedParts?.outline ?? result.episodeOutline).map((episode) => (
                  <article
                    key={episode.episode}
                    data-active={episodeScope === episode.episode}
                    onClick={() => setEpisodeScope(episode.episode)}
                  >
                    <header>
                      <span>E{String(episode.episode).padStart(2, "0")}</span>
                      <strong>{episode.title}</strong>
                    </header>
                    <p>{episode.hook}</p>
                    <ol>
                      {episode.beats.map((beat) => (
                        <li key={beat}>{beat}</li>
                      ))}
                    </ol>
                    <small>{episode.cliffhanger}</small>
                  </article>
                ))}
              </div>
            ) : activeTab === "script" ? (
              <div className={styles.sceneGrid}>
                {(scopedParts?.scenes ?? result.directorScript).map((scene) => (
                  <SceneCard key={scene.sceneId} scene={scene} />
                ))}
              </div>
            ) : activeTab === "shots" ? (
              <div className={styles.shotGrid}>
                {(scopedParts?.shots ?? result.shotList).map((shot) => (
                  <ShotCard key={shot.shotId} shot={shot} />
                ))}
              </div>
            ) : activeTab === "storyboard" ? (
              <PromptList items={scopedParts?.storyboardPrompts ?? result.storyboardPrompts} />
            ) : activeTab === "camera" ? (
              <PromptList items={scopedParts?.cameraPrompts ?? result.cameraPrompts} />
            ) : activeTab === "edit" ? (
              <PromptList items={scopedParts?.editPrompts ?? result.editPrompts} />
            ) : (
              <div className={styles.voiceGrid}>
                <article>
                  <span>旁白原则</span>
                  {result.voiceoverScript.narrator.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </article>
                <article>
                  <span>配音备注</span>
                  <ul>
                    {result.voiceoverScript.dubbingNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <span>Lovart 分镜包</span>
                  <pre>
                    {promptText(
                      scopedParts?.storyboardPrompts ?? result.storyboardPrompts,
                    )}
                  </pre>
                </article>
                <article>
                  <span>Grok 视频包</span>
                  <pre>
                    {promptText(scopedParts?.cameraPrompts ?? result.cameraPrompts)}
                  </pre>
                </article>
              </div>
            )}
          </div>

          {result ? (
            <div className={styles.checklist}>
              {result.qualityChecklist.map((item) => (
                <span key={item}>
                  <Check size={14} />
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
