"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpenText,
  Boxes,
  Check,
  ChevronDown,
  CircleDot,
  Clapperboard,
  Clipboard,
  Copy,
  Download,
  FileJson,
  FileText,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Lock,
  Menu,
  Mic2,
  Play,
  Plus,
  RefreshCcw,
  Save,
  Scissors,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type {
  DirectorAsset,
  DirectorEpisodePackage,
  DirectorProject,
  DirectorRequest,
  DirectorVideoUnit,
} from "@/lib/ai/daoyan";
import styles from "./daoyan-experience.module.css";

type View = "overview" | "assets" | "episodes" | "director" | "delivery";
type Status = "idle" | "loading" | "ready" | "error";

const STORAGE_KEY = "destinypixel-daoyan-v1";

const initialForm: Required<DirectorRequest> = {
  idea:
    "《画皮》的西方哥特改编：白玫瑰王子在暴雨夜救下落难女子。她表面怀念亡夫、处处替王妃说好话，实际以嫉妒为食，让王子和他最信任的人彼此反目。要有绿茶博弈、误会、暧昧、惊悚和超自然反转，但所有戏都要前后连得上。",
  genre: "哥特悬疑爱情微短剧",
  audience: "18-40岁，喜欢禁忌爱情、绿茶博弈、超自然反转的海外竖屏观众",
  episodeCount: 6,
  episodeLength: "90秒",
  aspectRatio: "9:16竖屏",
  visualStyle: "写实电影感，15世纪英格兰哥特风，冷雨、烛火与红白玫瑰对照",
  dialogueLanguage: "英语对白，中文制作说明",
  platform: "TikTok / YouTube Shorts / Reels",
  mustHave: "每集有强开场、人物欲望、误会升级、关系反转和可截图的结尾钩子",
  avoid: "不要宣传片、概念片、诗意混剪；不要用旁白代替人物行动；不要互不相干的六秒片段",
};

const views: Array<{ key: View; label: string; icon: typeof Film }> = [
  { key: "overview", label: "项目蓝图", icon: LayoutDashboard },
  { key: "assets", label: "资产锁定", icon: Boxes },
  { key: "episodes", label: "分集结构", icon: BookOpenText },
  { key: "director", label: "单集导演", icon: Clapperboard },
  { key: "delivery", label: "交付中心", icon: Download },
];

function episodeCode(value: number) {
  return `E${String(value).padStart(2, "0")}`;
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 500);
}

function unitText(unit: DirectorVideoUnit) {
  const beatText = unit.beats
    .map((beat) => {
      const dialogue = beat.dialogue
        .map(
          (line) =>
            `${line.speaker}：“${line.line}”\n语气：${line.delivery}\n潜台词：${line.subtext}`,
        )
        .join("\n");
      return [
        `【${beat.range}】`,
        `画面：${beat.visual}`,
        `表演：${beat.performance}`,
        `运镜：${beat.camera}`,
        dialogue,
        `声音：${beat.sound}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [
    `${unit.id} · ${unit.duration}`,
    `戏剧任务：${unit.storyFunction}`,
    `转入：${unit.transitionIn}`,
    `起始状态：${unit.startState}`,
    "",
    beatText,
    "",
    `结束状态：${unit.endState}`,
    `转出：${unit.transitionOut}`,
    "",
    "【首帧 Prompt】",
    unit.firstFramePrompt,
    "",
    "【关键帧 Prompt】",
    unit.keyFramePrompt,
    "",
    "【末帧 Prompt】",
    unit.lastFramePrompt,
    "",
    "【完整视频 Prompt】",
    unit.videoPrompt,
    "",
    `负向约束：${unit.negativePrompt}`,
    `连续性进入：${unit.continuityIn}`,
    `连续性输出：${unit.continuityOut}`,
  ].join("\n");
}

function episodeMarkdown(project: DirectorProject, pack: DirectorEpisodePackage) {
  const body = pack.units.map(unitText).join("\n\n---\n\n");
  return [
    `# ${project.meta.title} · ${episodeCode(pack.episode)} ${pack.title}`,
    "",
    `目标时长：${pack.targetRuntime}`,
    `戏剧问题：${pack.dramaticQuestion}`,
    "",
    "## 因果链",
    ...pack.causalChain.map((item, index) => `${index + 1}. ${item}`),
    "",
    body,
    "",
    "## 连续性审计",
    ...pack.continuityAudit.map((item) => `- ${item}`),
  ].join("\n");
}

function StepRail({ current, project, packs }: { current: View; project: DirectorProject | null; packs: Record<number, DirectorEpisodePackage> }) {
  const currentIndex = views.findIndex((item) => item.key === current);
  return (
    <div className={styles.stepRail}>
      {views.map((item, index) => {
        const complete =
          index < currentIndex ||
          (item.key === "overview" && Boolean(project)) ||
          (item.key === "assets" && Boolean(project?.assets.some((asset) => asset.status === "locked"))) ||
          (item.key === "director" && Object.keys(packs).length > 0);
        return (
          <div key={item.key} data-current={current === item.key} data-complete={complete}>
            <span>{complete ? <Check size={12} /> : index + 1}</span>
            <small>{item.label}</small>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function AssetRow({ asset, onToggle, onCopy, copied }: { asset: DirectorAsset; onToggle: () => void; onCopy: () => void; copied: boolean }) {
  return (
    <article className={styles.assetRow}>
      <div className={styles.assetIdentity}>
        <span data-type={asset.type}>{asset.id}</span>
        <div>
          <strong>{asset.name}</strong>
          <small>{asset.type === "character" ? "人物" : asset.type === "location" ? "场景" : "道具"}</small>
        </div>
      </div>
      <p className={styles.assetUse}>{asset.narrativeUse}</p>
      <div className={styles.assetPrompt}>
        <p>{asset.lockPrompt}</p>
        <button type="button" title="复制定妆 Prompt" onClick={onCopy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <div className={styles.assetRules}>
        {asset.referenceViews.map((item) => <span key={item}>{item}</span>)}
      </div>
      <button className={styles.lockButton} type="button" data-locked={asset.status === "locked"} onClick={onToggle}>
        {asset.status === "locked" ? <Lock size={14} /> : <CircleDot size={14} />}
        {asset.status === "locked" ? "已锁定" : "待审批"}
      </button>
    </article>
  );
}

function PromptPane({ label, icon: Icon, text, id, copied, onCopy }: { label: string; icon: typeof Film; text: string; id: string; copied: string | null; onCopy: (id: string, text: string) => void }) {
  return (
    <section className={styles.promptPane}>
      <header>
        <span><Icon size={14} />{label}</span>
        <button type="button" title={`复制${label}`} onClick={() => onCopy(id, text)}>
          {copied === id ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </header>
      <p>{text}</p>
    </section>
  );
}

function UnitCard({ unit, copied, onCopy, onStatus }: { unit: DirectorVideoUnit; copied: string | null; onCopy: (id: string, text: string) => void; onStatus: (status: DirectorVideoUnit["status"]) => void }) {
  const statusLabels: Record<DirectorVideoUnit["status"], string> = {
    script: "脚本完成",
    frames: "三帧完成",
    video: "视频完成",
    approved: "已通过",
  };
  const nextStatus: Record<DirectorVideoUnit["status"], DirectorVideoUnit["status"]> = {
    script: "frames",
    frames: "video",
    video: "approved",
    approved: "script",
  };

  return (
    <article className={styles.unitCard}>
      <header className={styles.unitHeader}>
        <div>
          <span>{unit.id}</span>
          <strong>{unit.storyFunction}</strong>
        </div>
        <div>
          <small>{unit.duration}</small>
          <button type="button" data-status={unit.status} onClick={() => onStatus(nextStatus[unit.status])}>
            {unit.status === "approved" ? <Check size={13} /> : <CircleDot size={13} />}
            {statusLabels[unit.status]}
          </button>
          <button type="button" title="复制完整视频单元" onClick={() => onCopy(unit.id, unitText(unit))}>
            {copied === unit.id ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </header>

      <div className={styles.handoff}>
        <div><span>承接进入</span><p>{unit.transitionIn}</p></div>
        <div><span>交给下一条</span><p>{unit.transitionOut}</p></div>
      </div>

      <div className={styles.beatTimeline}>
        {unit.beats.map((beat, index) => (
          <section key={`${unit.id}-${beat.range}`}>
            <div className={styles.beatTime}><span>{index + 1}</span><strong>{beat.range}</strong></div>
            <div className={styles.beatBody}>
              <div className={styles.beatGrid}>
                <p><span>画面</span>{beat.visual}</p>
                <p><span>表演</span>{beat.performance}</p>
                <p><span>运镜</span>{beat.camera}</p>
                <p><span>声音</span>{beat.sound}</p>
              </div>
              {beat.dialogue.length > 0 ? (
                <div className={styles.dialogueList}>
                  {beat.dialogue.map((line, lineIndex) => (
                    <div key={`${line.speaker}-${lineIndex}`}>
                      <strong>{line.speaker}</strong>
                      <p>“{line.line}”</p>
                      <small>{line.delivery} · 潜台词：{line.subtext}</small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <div className={styles.promptGrid}>
        <PromptPane label="首帧" icon={ImageIcon} text={unit.firstFramePrompt} id={`${unit.id}-first`} copied={copied} onCopy={onCopy} />
        <PromptPane label="关键帧" icon={CircleDot} text={unit.keyFramePrompt} id={`${unit.id}-key`} copied={copied} onCopy={onCopy} />
        <PromptPane label="末帧" icon={ImageIcon} text={unit.lastFramePrompt} id={`${unit.id}-last`} copied={copied} onCopy={onCopy} />
        <PromptPane label="视频 + 内部运镜" icon={Video} text={unit.videoPrompt} id={`${unit.id}-video`} copied={copied} onCopy={onCopy} />
      </div>
      <details className={styles.unitDetails}>
        <summary>连续性与负向约束 <ChevronDown size={14} /></summary>
        <p><strong>进入：</strong>{unit.continuityIn}</p>
        <p><strong>输出：</strong>{unit.continuityOut}</p>
        <p><strong>禁止：</strong>{unit.negativePrompt}</p>
      </details>
    </article>
  );
}

export default function DaoyanExperience() {
  const [form, setForm] = useState<Required<DirectorRequest>>(initialForm);
  const [project, setProject] = useState<DirectorProject | null>(null);
  const [packs, setPacks] = useState<Record<number, DirectorEpisodePackage>>({});
  const [view, setView] = useState<View>("overview");
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [projectStatus, setProjectStatus] = useState<Status>("idle");
  const [episodeStatus, setEpisodeStatus] = useState<Status>("idle");
  const [uploadStatus, setUploadStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as { form?: Required<DirectorRequest>; project?: DirectorProject; packs?: Record<number, DirectorEpisodePackage>; selectedEpisode?: number };
        if (data.form) setForm(data.form);
        if (data.project) setProject(data.project);
        if (data.packs) setPacks(data.packs);
        if (data.selectedEpisode) setSelectedEpisode(data.selectedEpisode);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, project, packs, selectedEpisode }));
  }, [form, hydrated, packs, project, selectedEpisode]);

  const currentPack = packs[selectedEpisode] ?? null;
  const lockedAssets = project?.assets.filter((asset) => asset.status === "locked").length ?? 0;
  const projectRuntime = useMemo(() => {
    if (!project) return "0";
    const seconds = Number(project.brief.episodeLength.match(/\d+/)?.[0] ?? 90);
    return `${Math.round((seconds * project.episodes.length) / 60)} 分钟`;
  }, [project]);

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1200);
  }

  function updateField<K extends keyof Required<DirectorRequest>>(key: K, value: Required<DirectorRequest>[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleProject(event?: FormEvent) {
    event?.preventDefault();
    setProjectStatus("loading");
    setPacks({});
    try {
      const response = await fetch("/api/daoyan/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("项目蓝图生成失败");
      const data = (await response.json()) as DirectorProject;
      setProject(data);
      setSelectedEpisode(1);
      setView("overview");
      setProjectStatus(data.meta.provider === "deepseek" ? "ready" : "error");
      setSidebarOpen(false);
    } catch {
      setProjectStatus("error");
    }
  }

  async function handleEpisode(episode = selectedEpisode) {
    if (!project) return;
    setSelectedEpisode(episode);
    setEpisodeStatus("loading");
    setView("director");
    try {
      const response = await fetch("/api/daoyan/episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, project, episode }),
      });
      if (!response.ok) throw new Error("单集生成失败");
      const data = (await response.json()) as DirectorEpisodePackage;
      setPacks((current) => ({ ...current, [episode]: data }));
      setEpisodeStatus("ready");
    } catch {
      setEpisodeStatus("error");
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus("loading");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/juben/extract", { method: "POST", body: data });
      if (!response.ok) throw new Error("读取失败");
      const payload = (await response.json()) as { text?: string };
      if (!payload.text) throw new Error("没有读取到文字");
      updateField("idea", payload.text);
      setUploadStatus("ready");
    } catch {
      setUploadStatus("error");
    } finally {
      event.target.value = "";
    }
  }

  function toggleAsset(id: string) {
    setProject((current) => current ? {
      ...current,
      assets: current.assets.map((asset) => asset.id === id ? { ...asset, status: asset.status === "locked" ? "draft" : "locked" } : asset),
    } : current);
  }

  function updateUnitStatus(unitId: string, status: DirectorVideoUnit["status"]) {
    setPacks((current) => {
      const pack = current[selectedEpisode];
      if (!pack) return current;
      return { ...current, [selectedEpisode]: { ...pack, units: pack.units.map((unit) => unit.id === unitId ? { ...unit, status } : unit) } };
    });
  }

  function resetWorkspace() {
    setProject(null);
    setPacks({});
    setView("overview");
    setProjectStatus("idle");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportProjectJson() {
    if (!project) return;
    download(`${project.meta.title}-director-project.json`, JSON.stringify({ project, episodes: packs }, null, 2), "application/json;charset=utf-8");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brandGroup}>
          <Link href="/" title="返回 DestinyPixel"><ArrowLeft size={17} /></Link>
          <div className={styles.brandMark}><Clapperboard size={18} /></div>
          <div><strong>DAOYAN</strong><span>AI 导演工作台</span></div>
        </div>
        <StepRail current={view} project={project} packs={packs} />
        <div className={styles.topActions}>
          <span data-status={projectStatus}>{project?.meta.provider === "deepseek" ? "AI 在线" : project ? "本地样例" : "待立项"}</span>
          <button type="button" title="自动保存状态"><Save size={15} /></button>
          <button className={styles.mobileMenu} type="button" title="打开项目设置" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar} data-open={sidebarOpen}>
          <div className={styles.sidebarHeader}>
            <div><span>PROJECT INTAKE</span><strong>项目输入</strong></div>
            <button type="button" title="关闭" onClick={() => setSidebarOpen(false)}><X size={17} /></button>
          </div>
          <form onSubmit={handleProject}>
            <label className={styles.field}>
              <span>故事、原稿或改编要求</span>
              <textarea value={form.idea} onChange={(event) => updateField("idea", event.target.value)} />
            </label>
            <div className={styles.uploadLine}>
              <label data-status={uploadStatus}>
                {uploadStatus === "loading" ? <Loader2 size={14} /> : <Upload size={14} />}
                导入原稿
                <input type="file" accept=".txt,.md,.docx,.pdf,.png,.jpg,.jpeg" onChange={handleUpload} />
              </label>
              <button type="button" onClick={() => setForm(initialForm)}><RefreshCcw size={13} />画皮样例</button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.field}><span>类型</span><input value={form.genre} onChange={(event) => updateField("genre", event.target.value)} /></label>
              <label className={styles.field}><span>集数</span><input type="number" min={1} max={12} value={form.episodeCount} onChange={(event) => updateField("episodeCount", Math.min(12, Math.max(1, Number(event.target.value))))} /></label>
              <label className={styles.field}><span>单集时长</span><select value={form.episodeLength} onChange={(event) => updateField("episodeLength", event.target.value)}><option>60秒</option><option>90秒</option><option>2分钟</option><option>3分钟</option></select></label>
              <label className={styles.field}><span>画幅</span><select value={form.aspectRatio} onChange={(event) => updateField("aspectRatio", event.target.value)}><option>9:16竖屏</option><option>16:9横屏</option><option>2.39:1电影宽银幕</option></select></label>
            </div>
            <label className={styles.field}><span>目标观众</span><input value={form.audience} onChange={(event) => updateField("audience", event.target.value)} /></label>
            <label className={styles.field}><span>整体画面风格</span><textarea className={styles.shortArea} value={form.visualStyle} onChange={(event) => updateField("visualStyle", event.target.value)} /></label>
            <div className={styles.formGrid}>
              <label className={styles.field}><span>对白语言</span><select value={form.dialogueLanguage} onChange={(event) => updateField("dialogueLanguage", event.target.value)}><option>英语对白，中文制作说明</option><option>中文对白与制作说明</option><option>无对白，英文旁白</option></select></label>
              <label className={styles.field}><span>发布平台</span><select value={form.platform} onChange={(event) => updateField("platform", event.target.value)}><option>TikTok / YouTube Shorts / Reels</option><option>抖音 / 视频号 / 小红书</option><option>YouTube 横屏剧集</option></select></label>
            </div>
            <label className={styles.field}><span>必须出现</span><textarea className={styles.shortArea} value={form.mustHave} onChange={(event) => updateField("mustHave", event.target.value)} /></label>
            <label className={styles.field}><span>绝对不要</span><textarea className={styles.shortArea} value={form.avoid} onChange={(event) => updateField("avoid", event.target.value)} /></label>
            <button className={styles.generateButton} type="submit" disabled={projectStatus === "loading"}>
              {projectStatus === "loading" ? <Loader2 size={16} /> : <WandSparkles size={16} />}
              {project ? "重新生成项目蓝图" : "生成项目蓝图"}
            </button>
            {projectStatus === "error" ? <p className={styles.fallbackNote}>AI 接口未返回完整结构，已自动载入高质量本地导演样例，所有流程仍可操作。</p> : null}
          </form>
        </aside>

        {sidebarOpen ? <button className={styles.scrim} type="button" aria-label="关闭侧栏" onClick={() => setSidebarOpen(false)} /> : null}

        <section className={styles.mainPanel}>
          <nav className={styles.viewTabs}>
            {views.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" data-active={view === key} disabled={!project && key !== "overview"} onClick={() => setView(key)}>
                <Icon size={15} />{label}
                {key === "assets" && project ? <small>{lockedAssets}/{project.assets.length}</small> : null}
                {key === "director" && Object.keys(packs).length > 0 ? <small>{Object.keys(packs).length}</small> : null}
              </button>
            ))}
          </nav>

          {!project ? (
            <div className={styles.emptyWorkspace}>
              <div className={styles.emptyIcon}><Film size={28} /></div>
              <span>DIRECTOR WORKFLOW</span>
              <h1>先把故事变成一部剧，再把它拆成视频。</h1>
              <p>输入故事后，系统先锁整季因果、角色、场景和道具；批准资产后，再逐集生成带内部运镜、完整对白与首末帧交接的导演生产包。</p>
              <div className={styles.emptyFlow}>
                <div><strong>01</strong><span>故事诊断</span></div>
                <div><strong>02</strong><span>资产定妆</span></div>
                <div><strong>03</strong><span>分集因果</span></div>
                <div><strong>04</strong><span>连续导演本</span></div>
                <div><strong>05</strong><span>生产交付</span></div>
              </div>
              <button type="button" onClick={() => setSidebarOpen(true)}><Plus size={16} />打开项目输入</button>
            </div>
          ) : null}

          {project && view === "overview" ? (
            <div className={styles.content}>
              <header className={styles.pageHeading}>
                <div><span>PROJECT BLUEPRINT</span><h1>{project.meta.title}</h1><p>{project.meta.logline}</p></div>
                <button type="button" onClick={() => setSidebarOpen(true)}><RefreshCcw size={14} />调整立项</button>
              </header>
              <div className={styles.metrics}>
                <Metric label="剧集" value={`${project.episodes.length} 集`} note={project.brief.episodeLength} />
                <Metric label="资产" value={project.assets.length} note={`${lockedAssets} 项已锁定`} />
                <Metric label="预计成片" value={projectRuntime} note={project.brief.aspectRatio} />
                <Metric label="已完成导演本" value={Object.keys(packs).length} note={`共 ${project.episodes.length} 集`} />
              </div>
              <section className={styles.diagnosisBand}>
                <div><span>现在的问题</span><p>{project.diagnosis.currentWeakness}</p></div>
                <div><span>观众承诺</span><p>{project.diagnosis.audiencePromise}</p></div>
                <div><span>反宣传片规则</span><p>{project.diagnosis.antiTrailerRule}</p></div>
              </section>
              <div className={styles.twoColumns}>
                <section className={styles.sectionBlock}>
                  <header><span>STORY ENGINE</span><h2>戏剧发动机</h2></header>
                  <dl className={styles.definitionList}>
                    <div><dt>主角想要</dt><dd>{project.storyEngine.protagonistDesire}</dd></div>
                    <div><dt>致命缺陷</dt><dd>{project.storyEngine.fatalFlaw}</dd></div>
                    <div><dt>阻碍力量</dt><dd>{project.storyEngine.opposition}</dd></div>
                    <div><dt>关系升级</dt><dd>{project.storyEngine.relationshipEngine}</dd></div>
                    <div><dt>整季问题</dt><dd>{project.storyEngine.seasonQuestion}</dd></div>
                    <div><dt>结局兑现</dt><dd>{project.storyEngine.endingPayoff}</dd></div>
                  </dl>
                </section>
                <section className={styles.sectionBlock}>
                  <header><span>QUALITY GATES</span><h2>开拍前检查</h2></header>
                  <div className={styles.checklist}>
                    {project.qualityGates.map((item) => <div key={item}><ShieldCheck size={15} /><p>{item}</p></div>)}
                  </div>
                </section>
              </div>
              <div className={styles.nextAction}>
                <div><Boxes size={20} /><span>下一步</span><strong>先生成并确认人物、场景、道具参考图</strong></div>
                <button type="button" onClick={() => setView("assets")}>进入资产锁定</button>
              </div>
            </div>
          ) : null}

          {project && view === "assets" ? (
            <div className={styles.content}>
              <header className={styles.pageHeading}>
                <div><span>ASSET LOCK</span><h1>先定演员和世界，再批量生镜头</h1><p>每个资产先用定妆 Prompt 生成参考图；确认满意后点“待审批”锁定。后续单集会继承这些约束。</p></div>
                <button type="button" onClick={() => project.assets.forEach((asset) => asset.status !== "locked" && toggleAsset(asset.id))}><Lock size={14} />全部锁定</button>
              </header>
              <div className={styles.assetTableHeader}><span>资产</span><span>叙事用途</span><span>定妆 Prompt</span><span>参考视图</span><span>状态</span></div>
              <div className={styles.assetList}>
                {project.assets.map((asset) => <AssetRow key={asset.id} asset={asset} onToggle={() => toggleAsset(asset.id)} copied={copied === asset.id} onCopy={() => copyText(asset.id, asset.lockPrompt)} />)}
              </div>
              <div className={styles.visualRules}>
                <section><span>色彩</span><div>{project.visualSystem.palette.map((item) => <i key={item}>{item}</i>)}</div></section>
                <section><span>摄影</span><ul>{project.visualSystem.cameraRules.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section><span>表演</span><ul>{project.visualSystem.performanceRules.map((item) => <li key={item}>{item}</li>)}</ul></section>
              </div>
            </div>
          ) : null}

          {project && view === "episodes" ? (
            <div className={styles.content}>
              <header className={styles.pageHeading}>
                <div><span>SEASON MAP</span><h1>每一集都由上一集的后果启动</h1><p>这里审批的是因果和关系，不是镜头。确认哪一集后，单独进入导演室生成完整生产包。</p></div>
              </header>
              <div className={styles.episodeMap}>
                {project.episodes.map((episode, index) => (
                  <article key={episode.episode} data-ready={Boolean(packs[episode.episode])}>
                    <div className={styles.episodeNumber}><span>{episodeCode(episode.episode)}</span><small>{packs[episode.episode] ? "导演本已生成" : "结构已完成"}</small></div>
                    <div className={styles.episodeStory}>
                      <header><h2>{episode.title}</h2><p>{episode.hook}</p></header>
                      <div><span>开场画面</span><p>{episode.openingImage}</p></div>
                      <div className={styles.episodeConflict}><p><span>欲望</span>{episode.desire}</p><p><span>阻碍</span>{episode.obstacle}</p><p><span>转折</span>{episode.turn}</p></div>
                      <ol>{episode.escalation.map((item) => <li key={item}>{item}</li>)}</ol>
                      <footer><span>结尾钩子</span><strong>{episode.cliffhanger}</strong></footer>
                    </div>
                    <button type="button" disabled={episodeStatus === "loading"} onClick={() => handleEpisode(episode.episode)}>
                      {episodeStatus === "loading" && selectedEpisode === episode.episode ? <Loader2 size={15} /> : packs[episode.episode] ? <RefreshCcw size={15} /> : <WandSparkles size={15} />}
                      {packs[episode.episode] ? "重新生成" : "生成导演本"}
                    </button>
                    {index < project.episodes.length - 1 ? <div className={styles.episodeLink}><span>{episode.continuityOut}</span></div> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {project && view === "director" ? (
            <div className={styles.content}>
              <header className={styles.directorHeader}>
                <div className={styles.episodePicker}>
                  {project.episodes.map((episode) => <button key={episode.episode} type="button" data-active={selectedEpisode === episode.episode} data-ready={Boolean(packs[episode.episode])} onClick={() => setSelectedEpisode(episode.episode)}>{episodeCode(episode.episode)}</button>)}
                </div>
                <button type="button" disabled={episodeStatus === "loading"} onClick={() => handleEpisode()}>
                  {episodeStatus === "loading" ? <Loader2 size={15} /> : <WandSparkles size={15} />}
                  {currentPack ? "重新生成本集" : "生成本集导演包"}
                </button>
              </header>
              {episodeStatus === "loading" ? (
                <div className={styles.generatingState}><Loader2 size={28} /><strong>正在写完整的第 {selectedEpisode} 集</strong><p>会逐一检查因果链、对白动作、内部运镜和首末帧交接，通常需要几十秒。</p></div>
              ) : currentPack ? (
                <>
                  <section className={styles.episodeBrief}>
                    <div><span>{episodeCode(currentPack.episode)} · {currentPack.targetRuntime}</span><h1>{currentPack.title}</h1><p>{currentPack.dramaticQuestion}</p></div>
                    <div className={styles.causalChain}>{currentPack.causalChain.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
                  </section>
                  <div className={styles.sceneStrip}>{currentPack.scenes.map((scene) => <div key={scene.id}><span>{scene.id}</span><strong>{scene.slugline}</strong><p>{scene.dramaticPurpose}</p></div>)}</div>
                  <div className={styles.unitList}>{currentPack.units.map((unit) => <UnitCard key={unit.id} unit={unit} copied={copied} onCopy={copyText} onStatus={(status) => updateUnitStatus(unit.id, status)} />)}</div>
                </>
              ) : (
                <div className={styles.noEpisode}>
                  <Clapperboard size={28} />
                  <strong>{episodeCode(selectedEpisode)} 还没有导演生产包</strong>
                  <p>蓝图只决定这一集发生什么。点击生成后，才会写出可连续播放的对白、动作、内部转场和首末帧 Prompt。</p>
                  <button type="button" onClick={() => handleEpisode()}><WandSparkles size={15} />生成本集</button>
                </div>
              )}
            </div>
          ) : null}

          {project && view === "delivery" ? (
            <div className={styles.content}>
              <header className={styles.pageHeading}>
                <div><span>DELIVERY</span><h1>把已批准内容交给 Lovart、Grok 或团队</h1><p>JSON 保留全部结构和生产状态；Markdown 适合直接扔进模型、飞书或 Google Docs。</p></div>
              </header>
              <div className={styles.deliveryGrid}>
                <button type="button" onClick={exportProjectJson}><FileJson size={22} /><strong>完整项目 JSON</strong><span>项目蓝图、资产、全部已生成单集和生产状态</span><Download size={15} /></button>
                {Object.values(packs).sort((a, b) => a.episode - b.episode).map((pack) => (
                  <button key={pack.episode} type="button" onClick={() => download(`${project.meta.title}-${episodeCode(pack.episode)}-director.md`, episodeMarkdown(project, pack), "text/markdown;charset=utf-8")}>
                    <FileText size={22} /><strong>{episodeCode(pack.episode)} 导演生产包</strong><span>{pack.units.length} 个连续视频单元 · {pack.targetRuntime}</span><Download size={15} />
                  </button>
                ))}
                <button type="button" onClick={() => copyText("global-prompt", `${project.visualSystem.globalPrompt}\n\nNegative: ${project.visualSystem.globalNegative}`)}>
                  <Clipboard size={22} /><strong>全局视觉锁定</strong><span>复制全局正向与负向约束</span>{copied === "global-prompt" ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
              <section className={styles.productionBoard}>
                <header><span>PRODUCTION BOARD</span><h2>整季完成度</h2></header>
                {project.episodes.map((episode) => {
                  const pack = packs[episode.episode];
                  const approved = pack?.units.filter((unit) => unit.status === "approved").length ?? 0;
                  return <div key={episode.episode}><span>{episodeCode(episode.episode)}</span><strong>{episode.title}</strong><div><i style={{ width: pack ? `${Math.max(8, (approved / pack.units.length) * 100)}%` : "0%" }} /></div><small>{pack ? `${approved}/${pack.units.length} 已通过` : "未生成"}</small></div>;
                })}
              </section>
              <button className={styles.resetButton} type="button" onClick={resetWorkspace}><RefreshCcw size={14} />清空并新建项目</button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
