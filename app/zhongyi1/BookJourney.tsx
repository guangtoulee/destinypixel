"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import s from "./journey.module.css";

const Artifact = dynamic(() => import("./ApothecaryArtifact"), { ssr: false, loading: () => <div className={s.artifactLoading}><span className={s.loadingRing} />正在开匣 · 轻量器物展台</div> });
const chapters = ["拾页", "校序", "刷印", "赏器"];
const leaves = [{ name: "山川", verse: "一方山川，孕育一方草木。", mark: "壹" }, { name: "本草", verse: "一页本草，留下观察的心意。", mark: "贰" }, { name: "书坊", verse: "一室书香，让所见流传。", mark: "叁" }];
const sequence = [1, 2, 0];

function Arrow({ back = false }: { back?: boolean }) { return <span aria-hidden="true">{back ? "←" : "↗"}</span>; }
function Botanical({ variant = 0 }: { variant?: number }) {
  return <svg viewBox="0 0 200 240" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M98 224C90 181 118 148 101 95C95 70 109 46 112 21"/><path d="M102 185C73 171 65 147 43 128M102 144C123 131 138 108 154 89M101 99C76 87 69 69 60 49M106 64C123 53 133 39 143 23"/>{(variant === 1 ? [[64,151,-40],[127,124,35],[77,74,-35],[123,46,40]] : [[66,154,-45],[132,115,40],[78,77,-30],[124,45,40]]).map(([x,y,r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><path d="M0 0C-23-4-26-22-17-38C1-27 11-13 0 0Z" fill="currentColor" fillOpacity=".1"/><path d="M0 0L-16-31M-6-11L-16-14M-10-20L-9-28"/></g>)}<path d="M91 225L78 237M99 221L106 236M96 222L92 238"/>{variant === 2 && <g><path d="M111 21C96 8 112-6 120 8C135-3 146 11 130 21C140 39 117 40 111 21Z" fill="currentColor" fillOpacity=".15"/><circle cx="122" cy="19" r="4"/></g>}</g></svg>;
}

export default function BookJourney() {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [ordered, setOrdered] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState("");
  const [inked, setInked] = useState(false);
  const [paper, setPaper] = useState(false);
  const [rubbed, setRubbed] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [artifactDone, setArtifactDone] = useState(false);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [muted, setMuted] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const heroImage = useRef<HTMLImageElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const source = useRef<HTMLDialogElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const dragPage = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const rubbing = useRef(false);

  useEffect(() => { const old = document.documentElement.lang; document.documentElement.lang = "zh-CN"; return () => { document.documentElement.lang = old; void audio.current?.close(); }; }, []);
  useEffect(() => {
    if (step !== 0) return;
    // A cached failure can happen before hydration attaches React's error event.
    const frame = requestAnimationFrame(() => {
      const image = heroImage.current;
      if (image?.complete && image.naturalWidth === 0) setImageFailed(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);
  function chime() {
    if (muted) return;
    try {
      const context = audio.current ?? new AudioContext(); audio.current = context; void context.resume();
      const tone = context.createOscillator(); const volume = context.createGain(); tone.type = "sine"; tone.frequency.setValueAtTime(523.25, context.currentTime); tone.frequency.exponentialRampToValueAtTime(784, context.currentTime + .18); volume.gain.setValueAtTime(.045, context.currentTime); volume.gain.exponentialRampToValueAtTime(.001, context.currentTime + .5); tone.connect(volume); volume.connect(context.destination); tone.start(); tone.stop(context.currentTime + .5);
    } catch { /* Sound is optional; the experience remains available. */ }
  }
  function go(next: number) { setStep(next); setHint(""); window.scrollTo({ top: 0, behavior: "instant" }); requestAnimationFrame(() => heading.current?.focus()); }
  function reset() { setFound([]); setOrdered([]); setSelected(null); setHint(""); setInked(false); setPaper(false); setRubbed([]); setRevealed(false); setArtifactDone(false); setSkipped([]); go(1); }
  function skip() { setSkipped((old) => old.includes(step) ? old : [...old, step]); go(step + 1); }
  function collect(index: number) { if (found.includes(index)) return; setFound((old) => [...old, index]); chime(); }
  function place(index: number, slot: number) {
    if (slot !== ordered.length) { setHint("请先从第一格开始，依次放入书页。"); return; }
    if (index !== slot) { setHint(`再看一眼线索：第${["一", "二", "三"][slot]}页是「${leaves[slot].name}」。可以重新选择。`); return; }
    setOrdered((old) => [...old, index]); setSelected(null); setHint(slot === 2 ? "书页已归序。山川生本草，书坊传书香。" : "这一页放对了，继续下一页。"); chime();
  }
  function startPage(event: PointerEvent<HTMLButtonElement>, index: number) { if (event.button !== 0) return; dragPage.current = index; dragStart.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }
  function finishPage(event: PointerEvent<HTMLButtonElement>) { if (dragPage.current === null || !dragStart.current) return; const distance = Math.hypot(event.clientX - dragStart.current.x, event.clientY - dragStart.current.y); if (distance > 12) { const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-page-slot]"); if (target) place(dragPage.current, Number(target.dataset.pageSlot)); } dragPage.current = null; dragStart.current = null; }
  function rubAt(event: PointerEvent<HTMLDivElement>) { if (!paper || revealed || !rubbing.current) return; const rect = event.currentTarget.getBoundingClientRect(); const band = Math.max(0, Math.min(3, Math.floor(((event.clientX - rect.left) / rect.width) * 4))); setRubbed((old) => old.includes(band) ? old : [...old, band]); }
  const complete = step === 1 ? found.length === 3 : step === 2 ? ordered.length === 3 : step === 3 ? revealed : artifactDone;
  const stampCount = [found.length === 3, ordered.length === 3, revealed, artifactDone].filter(Boolean).length;

  return <main className={s.experience} lang="zh-CN">
    <a href="#journey-content" className={s.skipLink}>跳到体验内容</a>
    <header className={s.header}>
      <button className={s.brand} onClick={() => go(0)} aria-label="返回书坊入口"><span className={s.seal}>燕<br/>赵</span><span><strong>燕赵本草长卷</strong><small>一部书的旅行</small></span></button>
      <div className={s.headerTools}><span className={s.demoBadge}>历史文化演示</span><button onClick={() => setMuted((old) => !old)} className={s.iconButton} aria-label={muted ? "开启音效" : "关闭音效"} aria-pressed={!muted}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5Z"/>{muted ? <path d="m16 9 5 6m0-6-5 6"/> : <><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></>}</svg><span>{muted ? "音效关" : "音效开"}</span></button><button className={s.sourceButton} onClick={() => source.current?.showModal()}>缘起与来源 <span aria-hidden="true">＋</span></button></div>
    </header>

    {step === 0 ? <>
      <section className={`${s.hero} ${imageFailed ? s.heroFallback : ""}`} id="journey-content">
        <picture className={s.heroImage}><source media="(max-width: 640px)" srcSet="/zhongyi1/bookshop-mobile.webp"/><img ref={heroImage} src="/zhongyi1/bookshop.webp" alt="青绿山水窗景、古籍与青瓷相伴的想象书坊" fetchPriority="high" onError={() => setImageFailed(true)}/></picture>
        <div className={s.heroShade}/><div className={s.heroContent}><p className={s.eyebrow}><span/> 云上书坊 · 文化互动样板</p><h1 ref={heading} tabIndex={-1}>把一页书，<br/>交给时间<span className={s.titleDot}>。</span></h1><p className={s.heroDescription}>推开书坊的门，循着草木与墨香，<br/>亲手续写一部医书的传承回声。</p><button className={s.primary} onClick={reset}>开始「一部书的旅行」<Arrow/></button><p className={s.duration}>约 3—5 分钟 <i/> 无需登录 <i/> 随时可跳过</p></div>
        <div className={s.verticalNote}>一叶本草 · 一脉书香</div><div className={s.heroCaption}><span>燕赵</span>想象书坊 · 艺术示意</div>
      </section>
      <section className={s.intro}><div><p className={s.eyebrow}>THE JOURNEY OF A BOOK</p><h2>书有来处，<br/>也有新的去处。</h2></div><div className={s.introText}><p>元代医家罗天益曾整理刊出李杲的多部医学著作，并著有《卫生宝鉴》。这一次，我们从“整理与传承”出发，走进一间想象中的燕赵书坊。</p><p>拾起散页，理顺书序，刷印一页，再细看案边青瓷。让文化不止被看见，也在指尖发生。</p><span className={s.fictionNote}>书坊、任务与旅程为文化互动创作，并非史实复现。</span></div></section>
      <div className={s.chapterPreview}>{chapters.map((name,i) => <div key={name}><span>0{i+1}</span><strong>{name}</strong><small>{["在书案间，拾起三页来处", "循着线索，让散页成卷", "墨落纸上，亲手留下印迹", "转动青瓷，看见器物细节"][i]}</small></div>)}</div>
    </> : <>
      <nav className={s.progress} aria-label="旅程进度"><button onClick={() => go(0)} className={s.exit}><Arrow back/> 书坊入口</button><ol>{chapters.map((name,i) => <li key={name} className={`${step === i+1 ? s.active : ""} ${step > i+1 ? s.past : ""}`} aria-current={step === i+1 ? "step" : undefined}><span>{step > i+1 ? "✓" : `0${i+1}`}</span><strong>{name}</strong></li>)}</ol><span className={s.progressEnd}>一页书的回声</span></nav>
      <section className={`${s.activity} ${step === 5 ? s.finalActivity : ""}`} id="journey-content" aria-labelledby="activity-title">
        {step < 5 && <div className={s.storyCopy}><p className={s.eyebrow}>第{["一", "二", "三", "四"][step-1]}幕 / {chapters[step-1]}</p><h1 id="activity-title" ref={heading} tabIndex={-1}>{["散落的书页，\n等一个拾书人。", "让散页，\n重新成为一部书。", "一抹墨香，\n一页新生。", "转动一件器物，\n看见生活的温度。"][step-1].split("\n").map((line,i) => <span key={line}>{line}{i === 0 && <br/>}</span>)}</h1><p>{["书坊将歇，案上还留着三页未归的散页。轻点纸页，收拢它们，也拾起山川、草木与书坊之间的联系。", "先有山川，再识本草，最后走进书坊。按这条创作线索，将三页依次放入书册。", "版已刻好，纸亦备齐。试着上墨、覆纸、刷印、揭纸，感受一页书从木版来到手中的过程。", "一只想象中的青瓷药罐，静静陪伴书案。转动它，放大细节，再轻点三个热点，读一读器物的形与色。"][step-1]}</p><div className={s.storyAside}><span>书坊札记</span>{["传承，有时就从拾起一页开始。", "整理，使零散的知识重新相遇。", "一版可印多页，书香由此传远。", "器物的价值，也藏在日常的使用里。"][step-1]}</div><span className={s.fictionNote}>文化互动创作 · 无诊疗或药方内容</span></div>}

        {step === 1 && <div className={s.workspace}><div className={s.workspaceTop}><span>案上寻页</span><span aria-live="polite">已收集 {found.length} / 3</span></div><div className={s.collectDesk}><div className={s.deskGlow}/><span className={s.deskRule}>拾 页 成 卷</span><div className={s.closedBook}><span>本草<br/>长卷</span><i/><i/><i/></div>{leaves.map((leaf,i) => <button key={leaf.name} className={`${s.loosePage} ${s[`loose${i}`]} ${found.includes(i) ? s.collected : ""}`} onClick={() => collect(i)} disabled={found.includes(i)} aria-label={`收集${leaf.name}书页`}><span className={s.pageMark}>{leaf.mark}</span><Botanical variant={i}/><strong>{leaf.name}</strong><span className={s.pageLines}/><small>{found.includes(i) ? "已入册 ✓" : "轻点拾取 ＋"}</small></button>)}<div className={s.brush}/><div className={s.inkstone}/></div><div className={s.workspaceBottom} role="status">{found.length === 3 ? "三页已齐。带着它们，去理一理书的次序。" : "轻点书案上的三张散页。"}</div></div>}

        {step === 2 && <div className={s.workspace}><div className={s.workspaceTop}><span>依线索校序</span><span>{ordered.length} / 3 页归序</span></div><div className={s.arrangeArea}><div className={s.clue}>山川 → 本草 → 书坊</div><div className={s.slots}>{leaves.map((leaf,i) => <button key={leaf.name} className={`${s.slot} ${ordered.includes(i) ? s.slotFilled : ""}`} data-page-slot={i} onClick={() => selected === null ? setHint("先轻点下方的一页，再轻点这里放入。") : place(selected,i)} aria-label={`第${i+1}格${ordered.includes(i) ? `已放入${leaf.name}` : "，放入选中书页"}`}><span className={s.slotNumber}>0{i+1}</span>{ordered.includes(i) ? <><Botanical variant={i}/><strong>{leaf.name}</strong></> : <><span className={s.slotPlus}>＋</span><small>点选后放入</small></>}</button>)}</div><div className={s.pageTray}>{sequence.map((i) => <button key={i} className={`${s.trayPage} ${selected === i ? s.selectedPage : ""}`} disabled={ordered.includes(i)} onClick={() => { setSelected(i); setHint(`已选「${leaves[i].name}」，请轻点对应空格。`); }} onPointerDown={(event) => startPage(event,i)} onPointerUp={finishPage} onPointerCancel={() => { dragPage.current = null; dragStart.current = null; }} aria-pressed={selected === i} aria-label={`选择${leaves[i].name}书页`}><span>{leaves[i].mark}</span><Botanical variant={i}/><strong>{leaves[i].name}</strong></button>)}</div><p className={s.interactionTip}>拖入书格，或轻点书页后再点空格</p></div><div className={s.workspaceBottom} role="status">{hint || "循着上方线索，从左向右整理书页。"}</div></div>}

        {step === 3 && <div className={s.workspace}><div className={s.workspaceTop}><span>木版刷印 · 简化体验</span><span>{revealed ? "一页已成" : !inked ? "01 上墨" : !paper ? "02 覆纸" : rubbed.length < 4 ? "03 刷印" : "04 揭纸"}</span></div><div className={s.printArea}><div className={`${s.printBlock} ${inked ? s.inked : ""} ${paper ? s.papered : ""} ${revealed ? s.revealed : ""}`} onPointerDown={(event) => { if (!paper || revealed) return; rubbing.current = true; event.currentTarget.setPointerCapture(event.pointerId); rubAt(event); }} onPointerMove={rubAt} onPointerUp={() => { rubbing.current = false; }} onPointerCancel={() => { rubbing.current = false; }} aria-label="刷印区域"><div className={s.blockInner}><Botanical variant={2}/><div className={s.printText}><span>燕趙</span><strong>本草長卷</strong><small>草木有心 · 書香有續</small></div><span className={s.printSeal}>書香</span></div>{paper && !revealed && <div className={s.paperOverlay}>{[0,1,2,3].map(i => <span key={i} className={rubbed.includes(i) ? s.rubbedBand : ""}/>)}<span className={s.rubPrompt}>{rubbed.length < 4 ? "划过纸面，让墨色慢慢浮现" : "墨已匀，请揭纸"}</span></div>}</div><div className={s.printActions}>{!inked ? <button className={s.toolButton} onClick={() => { setInked(true); chime(); }}><span>一</span> 为木版上墨 <Arrow/></button> : !paper ? <button className={s.toolButton} onClick={() => { setPaper(true); chime(); }}><span>二</span> 覆上一张宣纸 <Arrow/></button> : !revealed && rubbed.length < 4 ? <button className={s.toolButton} onClick={() => { setRubbed((old) => [...old, [0,1,2,3].find(i => !old.includes(i))!]); chime(); }}><span>三</span> 点按刷印（{rubbed.length}/4）<Arrow/></button> : !revealed ? <button className={s.toolButton} onClick={() => { setRevealed(true); chime(); }}><span>四</span> 轻轻揭起书页 <Arrow/></button> : <p className={s.printSuccess}>✓ 墨色已留在纸上，书香由你接续。</p>}</div></div><div className={s.workspaceBottom} role="status">{revealed ? "这是你亲手刷印的一页。下一站，看看案边的器物。" : paper ? "横向划过纸面，或使用下方「点按刷印」完成。" : "依次完成上墨、覆纸、刷印与揭纸。"}</div></div>}

        {step === 4 && <div className={s.artifactSpace}><Artifact initialComplete={artifactDone} onComplete={() => setArtifactDone(true)}/></div>}

        {step === 5 && <><div className={s.finalCopy}><p className={s.eyebrow}>一部书的旅行 · 留念</p><h1 id="activity-title" ref={heading} tabIndex={-1}>一页有来处，<br/>书香有回声。</h1><p>从散页到成卷，从墨迹到器物，<br/>你已走过这间想象中的书坊。<br/>愿每一次翻阅，都是一次新的抵达。</p><p className={s.completionNote}>已体验 {stampCount} / 4 个章节{skipped.length > 0 ? " · 含跳过章节" : " · 四枚书坊印记已集齐"}</p><div className={s.finalButtons}><a className={s.primary} href="/zhongyi1/keepsake.svg" download="燕赵书坊-文化纪念卡.svg">收藏文化纪念卡 <span aria-hidden="true">↓</span></a><button className={s.secondary} onClick={reset}>重新体验 <span aria-hidden="true">↻</span></button></div><span className={s.fictionNote}>纪念卡为文化互动作品，可保存为 SVG 图片。</span></div><div className={s.keepsakeWrap}><div className={s.keepsake}><div className={s.cardTop}>燕 赵 本 草 长 卷 <span>文化留念</span></div><div className={s.cardArt}><div className={s.moon}/><div className={s.mountainOne}/><div className={s.mountainTwo}/><Botanical variant={2}/><span className={s.cardVertical}>一页有来处<br/>书香有回声</span></div><div className={s.cardBottom}><span>一部书的旅行<small>THE JOURNEY OF A BOOK</small></span><span className={s.cardSeal}>拾页<br/>成卷</span></div><p className={s.cardDisclaimer}>独立历史文化演示 · 互动创作纪念</p></div><span className={s.keepsakeShadow}/></div></>}
      </section>
      {step < 5 && <div className={s.bottomNav}><button className={s.back} onClick={() => go(step-1)}><Arrow back/> {step === 1 ? "返回入口" : "上一幕"}</button><span className={s.bottomHint}>{step === 4 ? artifactDone ? "三处细节已阅览" : "三个热点，三处细节" : `${["拾齐三页", "整理三页", "刷印成页"][step-1]}，续下一段书香`}</span><div><button className={s.skip} onClick={skip}>跳过本幕</button><button className={s.continueButton} disabled={!complete} onClick={() => go(step+1)}>{step === 4 ? "领取纪念卡" : `前往${chapters[step]}`} <Arrow/></button></div></div>}
    </>}

    <footer className={s.footer}><div><span className={s.footerMark}>燕赵</span><span>石家庄中医文化主题 · 独立体验样板<small>历史文化演示，非正式官方博物馆；不提供医疗服务。</small></span></div><button onClick={() => source.current?.showModal()}>史实与创作说明 ↗</button></footer>
    <dialog ref={source} className={s.sourceDialog} aria-labelledby="source-title"><div className={s.sourceDialogTop}><span className={s.eyebrow}>ABOUT THIS EXPERIENCE</span><button onClick={() => source.current?.close()} aria-label="关闭来源说明">×</button></div><h2 id="source-title">书有来处</h2><p>这是一件以石家庄中医文化为主题的独立演示作品，非正式官方博物馆。人物背景有据可查；书坊空间、散页任务、书序线索及旅程为文化互动创作，无具体历史路线、人物原话、医疗疗效或药方。</p><ol><li><a href="https://bowuguan.bucm.edu.cn/kpzl/ysmt/43941.htm" target="_blank" rel="noreferrer">北京中医药大学中医药博物馆 ·《元代名医——罗天益》↗</a><span>人物与著述背景：罗天益整理刊出李杲的多部医学著作，并著《卫生宝鉴》。</span></li><li><a href="https://www.ihchina.cn/diaobanyinshua.html" target="_blank" rel="noreferrer">中国非物质文化遗产网 · 中国雕版印刷技艺 ↗</a><span>雕版、刷印与装订的传统工艺背景。</span></li><li><a href="https://www.nlc.cn/pcab/zx/xw/20260507_2652721.shtml" target="_blank" rel="noreferrer">国家图书馆 ·《指尖传古艺，匠心护典籍》↗</a><span>体验参考：上墨、覆纸、压印、揭纸，页面已作简化。</span></li></ol><p className={s.sourceSmall}>入口为 AI 生成艺术场景；青瓷罐为程序化器物示意，非馆藏复原；植物图形为装饰创作，不作为药材辨识依据。体验数据仅保留在本次页面状态中。</p><button className={s.primary} onClick={() => source.current?.close()}>回到书坊 <Arrow back/></button></dialog>
  </main>;
}
