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
  JubenPromptItem,
  JubenRequestBody,
  JubenResult,
  JubenScene,
  JubenShot,
} from "@/lib/ai/juben";
import styles from "./juben-experience.module.css";

type Status = "idle" | "loading" | "ready" | "error";
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
  switch (tab) {
    case "bible":
      return asPrettyJson({
        diagnosis: result.diagnosis,
        storyBible: result.storyBible,
      });
    case "outline":
      return asPrettyJson(result.episodeOutline);
    case "script":
      return asPrettyJson(result.directorScript);
    case "shots":
      return asPrettyJson(result.shotList);
    case "storyboard":
      return promptText(result.storyboardPrompts);
    case "camera":
      return promptText(result.cameraPrompts);
    case "edit":
      return promptText(result.editPrompts);
    case "voice":
      return asPrettyJson({
        voiceoverScript: result.voiceoverScript,
        productionPack: result.productionPack,
      });
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
  const [activeTab, setActiveTab] = useState<TabKey>("bible");
  const [copied, setCopied] = useState<string | null>(null);

  const currentTabText = useMemo(() => {
    if (!result) return "";

    return resultTabText(result, activeTab);
  }, [activeTab, result]);

  const totals = useMemo(() => {
    if (!result) {
      return { scenes: 0, shots: 0, prompts: 0 };
    }

    return {
      scenes: result.directorScript.length,
      shots: result.shotList.length,
      prompts:
        result.storyboardPrompts.length +
        result.cameraPrompts.length +
        result.editPrompts.length,
    };
  }, [result]);

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
      setStatus(payload.meta.provider === "deepseek" ? "ready" : "error");
    } catch {
      setStatus("error");
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
              <strong>{result?.meta.format ?? form.aspectRatio}</strong>
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
                下载
              </button>
            </div>
          </div>

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
                {result.episodeOutline.map((episode) => (
                  <article key={episode.episode}>
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
                {result.directorScript.map((scene) => (
                  <SceneCard key={scene.sceneId} scene={scene} />
                ))}
              </div>
            ) : activeTab === "shots" ? (
              <div className={styles.shotGrid}>
                {result.shotList.map((shot) => (
                  <ShotCard key={shot.shotId} shot={shot} />
                ))}
              </div>
            ) : activeTab === "storyboard" ? (
              <PromptList items={result.storyboardPrompts} />
            ) : activeTab === "camera" ? (
              <PromptList items={result.cameraPrompts} />
            ) : activeTab === "edit" ? (
              <PromptList items={result.editPrompts} />
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
                  <pre>{result.productionPack.lovartStoryboard}</pre>
                </article>
                <article>
                  <span>Grok 视频包</span>
                  <pre>{result.productionPack.grokVideo}</pre>
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
