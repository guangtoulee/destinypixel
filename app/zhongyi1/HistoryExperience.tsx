"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ARTIFACTS, TIMELINE_NODES } from "./timeline/content";
import type { ProjectedMarker, TimelineEngine, TimelineMode } from "./timeline/engine";
import s from "./history.module.css";

const BookJourney = dynamic(() => import("./BookJourney"), { ssr: false, loading: () => <div className={s.gameLoading}>正在推开书坊的门…</div> });

export default function HistoryExperience() {
  const host = useRef<HTMLDivElement>(null);
  const markers = useRef<HTMLDivElement>(null);
  const engine = useRef<TimelineEngine | null>(null);
  const sources = useRef<HTMLDialogElement>(null);
  const motionPreference = useRef<boolean | null>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<TimelineMode>("journey");
  const [artifactId, setArtifactId] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [fallbackReason, setFallbackReason] = useState("");
  const [reduced, setReduced] = useState(false);
  const [retry, setRetry] = useState(0);
  const [game, setGame] = useState(false);
  const node = TIMELINE_NODES[index];
  const artifact = ARTIFACTS[artifactId];

  useEffect(() => {
    const previous = document.documentElement.lang; document.documentElement.lang = "zh-CN";
    return () => { document.documentElement.lang = previous; };
  }, []);
  useEffect(() => {
    if (game || !host.current) return;
    let cancelled = false; let instance: TimelineEngine | undefined;
    const target = host.current;
    const preferReduced = motionPreference.current ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    motionPreference.current = preferReduced;
    const updateMarkers = (positions: ProjectedMarker[]) => {
      const container = markers.current; if (!container) return;
      for (const position of positions) {
        const marker = container.querySelector<HTMLElement>(`[data-artifact-marker="${position.id}"]`);
        if (!marker) continue;
        marker.hidden = !position.visible;
        if (position.visible) marker.style.transform = `translate(${position.x}px,${position.y}px) translate(-50%,-50%)`;
      }
    };
    async function begin() {
      setStatus("loading"); setReduced(preferReduced);
      try {
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
        if ((memory !== undefined && memory <= 2) || navigator.hardwareConcurrency === 1) throw new Error("low-memory");
        const { createTimelineEngine } = await import("./timeline/engine");
        if (cancelled) return;
        instance = createTimelineEngine(target, {
          onReady: () => { if (!cancelled) setStatus("ready"); },
          onFallback: reason => { if (!cancelled) { setFallbackReason(reason); setStatus("fallback"); instance?.dispose(); engine.current = null; } },
          onNode: setIndex,
          onMode: (next, id) => { setMode(next); setArtifactId(id || ""); },
          onProgress: setProgress,
          onMarkers: updateMarkers,
        }, preferReduced);
        engine.current = instance;
      } catch (error) {
        if (cancelled) return;
        setFallbackReason(error instanceof Error && error.message === "low-memory" ? "已为这台设备启用轻量时间长卷。六个年代与全部史实来源仍可探索。" : "这台设备暂未能打开实时3D，已为你准备轻量时间长卷。"); setStatus("fallback");
      }
    }
    void begin();
    return () => { cancelled = true; instance?.dispose(); engine.current = null; };
  }, [game, retry]);

  function select(next: number) { const safe = Math.max(0, Math.min(5, next)); setIndex(safe); setMode("journey"); setArtifactId(""); setProgress(safe / 5); engine.current?.selectNode(safe); }
  function focus(id: string) { setArtifactId(id); setMode("inspect"); engine.current?.focus(id); }
  function returnToTimeline() { setMode("journey"); setArtifactId(""); engine.current?.returnToTimeline(); }
  function overview() { setMode("overview"); setArtifactId(""); engine.current?.overview(); }
  function toggleReduced() { const next = !reduced; motionPreference.current = next; setReduced(next); engine.current?.setReducedMotion(next); }

  if (game) return <div className={s.gameShell}><button className={s.returnFromGame} onClick={() => setGame(false)}>← 返回 3D 医脉长卷</button><BookJourney/></div>;

  return <main className={s.experience} lang="zh-CN" data-testid="history-experience" data-mode={mode} data-node={node.id}>
    <div className={s.canvasHost} ref={host} />
    <div className={s.vignette} aria-hidden="true"/>
    <header className={s.header}>
      <button className={s.brand} onClick={overview} aria-label="医脉长卷总览"><span className={s.seal}>燕<br/>赵</span><span><strong>燕赵医脉</strong><small>石家庄中医药史</small></span></button>
      <span className={s.headerMiddle}>A JOURNEY THROUGH MEDICAL HERITAGE</span>
      <div className={s.tools}><button onClick={overview} aria-pressed={mode === "overview"} aria-label="查看六境全卷">⌘ <span>全卷</span></button><button onClick={toggleReduced} aria-pressed={reduced} aria-label={reduced ? "关闭减弱动态" : "开启减弱动态"}>{reduced ? "◉" : "◎"}<span>{reduced ? "减弱动态已开" : "减弱动态"}</span></button><button onClick={() => sources.current?.showModal()} aria-label="查看史实与来源">ⓘ <span>来源</span></button><button onClick={() => setGame(true)} className={s.gameLink} aria-label="进入书坊小游戏">书坊小游戏 ↗</button></div>
    </header>

    {status === "loading" && <div className={s.loading} role="status"><span className={s.loadingOrbit}/><strong>医脉长卷正在展开</strong><small>搭建山川、器物与六个时代的空间</small></div>}

    {status === "fallback" && <div className={s.staticWorld}><svg viewBox="0 0 1000 700" aria-label="轻量医脉时间长卷"><defs><linearGradient id="zi-route" x2="1" y2="1"><stop stopColor="#ccaa66"/><stop offset="1" stopColor="#5b8d77"/></linearGradient></defs><path d="M135 590C710 670 75 290 570 370S950 125 680 105" fill="none" stroke="url(#zi-route)" strokeWidth="3"/>{[[135,590],[410,505],[375,355],[600,365],[815,260],[680,105]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><ellipse cy="21" rx="73" ry="20" fill="#285448"/><circle r={i === index ? 53 : 42} fill="#315f4f" stroke={i === index ? "#dbbd7b" : "#778b67"}/><path d={i === 0 ? "M-22 0a22 22 0 1 0 44 0a22 22 0 1 0-44 0M0-22V22" : i === 1 ? "M-21 13Q-37-15-3-21Q35-10 21 13ZM-17-6H17" : "M-24-18Q-10-23 0-17Q12-23 24-18V19Q10 12 0 19Q-10 12-24 19ZM0-17V19"} stroke="#dbc88e" strokeWidth="2" fill="none"/><text x="0" y="84" fill="#d1d5b8" textAnchor="middle" fontSize="15">{TIMELINE_NODES[i].title}</text></g>)}</svg><p>{fallbackReason}</p><button onClick={() => setRetry(value => value + 1)}>重新尝试实时 3D ↗</button></div>}

    <div ref={markers} className={s.markers} hidden={status !== "ready"} aria-label="立体场景观察点">{Object.keys(ARTIFACTS).map(id => <button hidden data-artifact-marker={id} key={id} onClick={() => focus(id)} aria-label={`聚焦${ARTIFACTS[id].title}`}><span>＋</span><small>{ARTIFACTS[id].title.split(" · ")[0]}</small></button>)}</div>

    <aside className={`${s.caption} ${mode === "overview" ? s.overviewCaption : ""} ${mode === "inspect" ? s.inspectCaption : ""}`} aria-live="polite">
      {mode === "overview" ? <><p className={s.kicker}><span/> 六境一脉 · 实时三维长卷</p><h1>在时光深处，<br/>走近燕赵医脉。</h1><p className={s.intro}>从地方传说到考古线索，<br/>从易水师承到当代承续。<br/>一条铜线，串起六个可走近的时代。</p><button className={s.primary} onClick={() => select(0)}>沿医脉出发 <span>↗</span></button><p className={s.gesture}>滚动 / 拖动穿行　·　点亮器物细节</p></> : <>
        <p className={s.kicker}><span/> {mode === "inspect" ? "走近一件物" : `第 ${String(index+1).padStart(2,"0")} 境 / 共 06 境`} <i>{node.category}</i></p>
        <p className={s.era}>{node.era}</p><h2>{mode === "inspect" && artifact ? artifact.title.split(" · ")[0] : node.title}</h2>
        <p className={s.place}>{node.subtitle}</p>
        <p className={s.description}>{mode === "inspect" && artifact ? artifact.description : node.description}</p>
        {mode === "inspect" ? <><p className={s.evidenceNote}>{artifact?.note}</p><button className={s.returnButton} onClick={returnToTimeline}>← 返回时间长卷</button>{status === "ready" ? <><div className={s.objectTools}><button onClick={() => engine.current?.rotate(-1)} aria-label="向左旋转观察">↶</button><button onClick={() => engine.current?.rotate(1)} aria-label="向右旋转观察">↷</button><button onClick={() => engine.current?.zoom(-1)} aria-label="缩小观察物">−</button><button onClick={() => engine.current?.zoom(1)} aria-label="放大观察物">＋</button></div><span className={s.objectHint}>拖动环看 · 滚轮或 ＋－ 缩放</span></> : <span className={s.objectHint}>轻量观赏 · 保留器物说明与可信来源</span>}</> : <div className={s.objectLinks}>{node.artifactIds.map(id => <button key={id} onClick={() => focus(id)} aria-label={`走近${ARTIFACTS[id].title}`}><span>＋</span> {ARTIFACTS[id].title.split(" · ")[0]} <span>↗</span></button>)}</div>}
        <button className={s.sourceLink} onClick={() => sources.current?.showModal()}>查看本境史实与来源 ↗</button>
      </>}
    </aside>

    {status === "ready" && <div className={s.liveBadge}><i/> LIVE 3D <span>{mode === "overview" ? "六境全卷" : mode === "inspect" ? "器物观赏" : "时间穿行"}</span></div>}
    <div className={s.verticalLabel} aria-hidden="true">医 道 有 源 · 薪 火 有 续</div>

    <footer className={s.timelinePanel}>
      <div className={s.timelineTop}><p>{status === "fallback" ? "轻量时间长卷 · 点选年代继续" : mode === "inspect" ? "正在观赏细节 · 可拖动环看" : "拖动铜线，或选择一个年代"}</p><div><button onClick={() => select(index-1)} disabled={index === 0} aria-label="上一年代">←</button><span>{String(index+1).padStart(2,"0")} <i>/ 06</i></span><button onClick={() => select(index+1)} disabled={index === 5} aria-label="下一年代">→</button></div></div>
      <nav className={s.eraNav} aria-label="医脉历史年代">{TIMELINE_NODES.map((item,i)=><button key={item.id} onClick={() => select(i)} className={i === index && mode !== "overview" ? s.currentEra : ""} aria-current={i === index && mode !== "overview" ? "step" : undefined} aria-label={`前往${item.title}`}><span className={s.nodeDot}/><small>{item.era}</small><strong>{item.title}</strong></button>)}</nav>
      <input className={s.range} aria-label="拖动医脉时间线" type="range" min="0" max="1000" step="1" value={Math.round(progress*1000)} onChange={event => { const next = Number(event.target.value)/1000; setProgress(next); setMode("journey"); setArtifactId(""); setIndex(Math.round(next*5)); engine.current?.setProgress(next); }}/>
      <div className={s.finePrint}><span>独立文化体验 · 场景与器物均为艺术示意</span><span>按叙事均匀布局，非等比例年代轴</span><span>非官方博物馆 · 不提供医疗服务</span></div>
    </footer>

    <dialog ref={sources} className={s.sourceDialog} aria-labelledby="history-source-title"><div className={s.dialogTop}><span>史实 / 传说 / 艺术示意</span><button aria-label="关闭来源" onClick={() => sources.current?.close()}>×</button></div><h2 id="history-source-title">{node.title} · 史实与来源</h2><span className={s.dialogEra}>{node.era} / {node.category}</span><p>{node.description}</p><p className={s.dialogNote}>{node.evidenceNote}</p>{mode === "inspect" && artifact && <div className={s.contextNote}><strong>{artifact.title}</strong><p>{artifact.description}</p><p>{artifact.note}</p></div>}<ul>{node.sources.map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a></li>)}</ul><div className={s.contextNote}><strong>这条长卷如何阅读</strong><p>伏羲台以地方传说为序章，不设置历史年份；台西以考古证据及用途解释展开；张元素 → 李东垣 → 罗天益呈现师承关系。路志正一站呈现学术承续，不表示已证实的连续嫡传。</p><p>六站按叙事均匀布局，非等比例年代。微缩地貌、建筑、器物与书页均为程序化艺术示意，非测绘、考古或古籍版本复原。本页为独立文化演示，不冒充官方博物馆，不提供医疗服务或用药建议。</p></div><button className={s.primary} onClick={() => sources.current?.close()}>回到时间长卷 <span>↗</span></button></dialog>
  </main>;
}
