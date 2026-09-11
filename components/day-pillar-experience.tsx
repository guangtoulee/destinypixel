"use client";

import { destinySupportHref } from "@/lib/support-contact";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { ArrowRight, CalendarDays, Check, Compass, Copy, Download, Gem, Loader2, MoveUpRight, Rotate3D, ShieldCheck, Sparkles } from "lucide-react";
import type { DayPillarCard, DayPillarLocale } from "@/lib/day-pillar-cards";
import { dayPillarSharePath } from "@/lib/day-pillar-share";
import { trackToolEvent } from "@/lib/analytics";
import styles from "./day-pillar-experience.module.css";

const copy = {
  en: {
    home: "Home", tools: "Explore", language: "Language", eyebrow: "A FREE FIRST GLIMPSE", title: "One birthday.\nA symbolic companion.",
    intro: "Meet one of sixty day pillar archetypes, then take a small moment to reflect. Your first card is free, with no account needed.",
    date: "Your Gregorian birth date", reveal: "Reveal my day card", busy: "Finding your card…", privacy: "Calculated in this page. Your date is not uploaded or saved.",
    conventionTitle: "A date preview, with room to refine.", convention: "This uses the Gregorian calendar and changes the day pillar at midnight. Birth time and birthplace have not been calibrated. It is a provisional day card, not a complete birth chart.",
    invalid: "Enter a valid Gregorian date, including the year.", range: "Choose a birth date from 1800 to 2100.", future: "Your birth date cannot be in the future.", unavailable: "The card calculator could not load. Please try again.",
    sample: "SAMPLE ARCHETYPE", shared: "SHARED ARCHETYPE", calculated: "YOUR PROVISIONAL DAY CARD", sampleNote: "An example from the sixty-card collection. Enter your date to find your preview.", sharedNote: "This link shares a card type only. Enter your own date to find your preview.", calculatedNote: "Based on your calendar date. Your birth time and city may change the calibrated result, especially near midnight.",
    portrait: "The symbolic portrait", reflection: "A direction for reflection", reflectionNote: "Which part feels familiar, and which part would you describe differently? Let your own experience lead.", cultural: "DestinyPixel’s original imagery draws on the sixty stem–branch combinations. These archetypes are a cultural and creative lens for reflection, not a personality test or a prediction.",
    tilt: "Tilt the card", resetTilt: "Reset the tilt", image: "Save image", share: "Copy card link", copied: "Link copied — your birth date is not included.", manualCopy: "Copy this public card link.", shareLabel: "Public card link", shareNote: "Shares this archetype, never your birth date or a private report.",
    next: "BRING THE REST OF YOUR STORY", nextTitle: "Your day card is the beginning.", nextBody: "Continue on the main site with your birth time and city. The shared calculation engine will calibrate the day pillar and build the wider birth map. A result near midnight can shift to the adjacent day.", nextAction: "Continue to my birth map", nextNote: "You will enter your details again on the main form. This page does not transfer or store them.",
    atelier: "Explore the crystal bracelet atelier", footer: "Birth symbolism. Space for your own meaning.", contact: "Contact", collection: "60 ARCHETYPES · ONE FIRST STEP",
  },
  zh: {
    home: "首页", tools: "探索工具", language: "语言", eyebrow: "从一张免费意象卡开始", title: "一个生日，\n一位意象同伴。",
    intro: "从六十甲子中，遇见一张与你生日相连的意象卡。留一点时间观察自己，无需注册，也无需付费。",
    date: "你的公历出生日期", reveal: "看看我的日柱卡", busy: "正在寻找你的卡片…", privacy: "仅在当前页面计算，出生日期不上传、不保存。",
    conventionTitle: "先看日期意象，再补齐出生坐标。", convention: "初算采用公历日期，以午夜零点换日，尚未按出生时间与地点校准。这是一张暂定日柱卡，不是完整命盘。",
    invalid: "请输入有效的公历日期，包含完整年份。", range: "请选择 1800 至 2100 年之间的出生日期。", future: "出生日期不能晚于今天。", unavailable: "计算组件暂时未能加载，请再试一次。",
    sample: "意象卡示例", shared: "分享的意象卡", calculated: "你的暂定日柱卡", sampleNote: "这是六十张意象卡中的一张示例。输入生日，查看你的日期初算结果。", sharedNote: "这个链接只分享一种卡片意象。输入自己的生日，再看你的日期初算结果。", calculatedNote: "当前结果基于公历日期。补充出生时间和城市后，校准结果可能改变，尤其在午夜附近。",
    portrait: "这张卡的象征意象", reflection: "留给自己的观察方向", reflectionNote: "哪一部分让你感到熟悉？哪一部分，你会有不同的表达？请以自己的真实经历为准。", cultural: "这些原创意象以六十干支为创作起点，用于文化体验与自我观察，不是人格测验，也不预言未来。",
    tilt: "轻转卡片", resetTilt: "恢复正面", image: "保存卡面", share: "复制卡片链接", copied: "链接已复制，不包含你的出生日期。", manualCopy: "可以复制下方的公开卡片链接。", shareLabel: "公开卡片链接", shareNote: "分享的只有这种意象，不包含生日或私人报告。",
    next: "把出生坐标补充完整", nextTitle: "日柱卡，只是故事的开头。", nextBody: "回到主站，补充出生时间与城市。共用的排盘引擎会校准日柱，并建立更完整的出生图谱。午夜附近的结果可能移到相邻一天。", nextAction: "继续查看出生图谱", nextNote: "需要在主站表单重新填写资料；本页不会传递或储存出生信息。",
    atelier: "去灵石手串工坊看看", footer: "从出生意象出发，为自己的理解留白。", contact: "联系反馈", collection: "六十种意象 · 一个开始",
  },
};

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function DayPillarExperience({ locale, cards, initialPillar, isShared }: { locale: DayPillarLocale; cards: DayPillarCard[]; initialPillar: string; isShared: boolean }) {
  const text = copy[locale];
  const [birthDate, setBirthDate] = useState("");
  const [pillar, setPillar] = useState(initialPillar);
  const [mode, setMode] = useState<"sample" | "shared" | "calculated">(isShared ? "shared" : "sample");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [tilted, setTilted] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const card = cards.find((item) => item.pillar === pillar) ?? cards[0];
  const home = locale === "zh" ? "/?locale=zh" : "/";

  async function reveal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { calculateDateDayPillar } = await import("@/lib/day-pillar");
      const result = calculateDateDayPillar(birthDate, localToday());
      if (!result.ok) { setError(result.error === "unsupported-year" ? text.range : result.error === "future-date" ? text.future : text.invalid); trackToolEvent("tool_error", "day_pillar"); return; }
      if (!cards.some((item) => item.pillar === result.pillar)) { setError(text.unavailable); trackToolEvent("tool_error", "day_pillar"); return; }
      setPillar(result.pillar); setMode("calculated"); setShareLink(""); setShareMessage(""); setTilted(false);
      trackToolEvent("tool_success", "day_pillar");
      resultRef.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 820px)").matches) resultRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    } catch { setError(text.unavailable); trackToolEvent("tool_error", "day_pillar"); }
    finally { setBusy(false); }
  }

  function moveLight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    artRef.current?.style.setProperty("--rotate-x", `${(0.5 - y) * 10}deg`);
    artRef.current?.style.setProperty("--rotate-y", `${(x - 0.5) * 10}deg`);
    artRef.current?.style.setProperty("--light-x", `${x * 100}%`);
    artRef.current?.style.setProperty("--light-y", `${y * 100}%`);
  }

  function resetLight() {
    for (const property of ["--rotate-x", "--rotate-y", "--light-x", "--light-y"]) artRef.current?.style.removeProperty(property);
  }

  async function copyLink() {
    const url = new URL(dayPillarSharePath(locale, card.slug), window.location.origin).href;
    setShareLink(url);
    try { await navigator.clipboard.writeText(url); setShareMessage(text.copied); trackToolEvent("tool_share", "day_pillar"); }
    catch { setShareMessage(text.manualCopy); }
  }

  return <main className={styles.page} lang={locale === "zh" ? "zh-Hans" : "en"}>
    <header className={styles.header}><Link className={styles.brand} href={home}><span aria-hidden="true" />DestinyPixel</Link><nav aria-label={locale === "zh" ? "主导航" : "Main navigation"}><Link href={home}>{text.home}</Link><Link href={locale === "zh" ? "/tools?locale=zh" : "/tools"}>{text.tools}</Link></nav><nav className={styles.languages} aria-label={text.language}><Link href={mode === "sample" ? "/day-pillar" : dayPillarSharePath("en", card.slug)} lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href={mode === "sample" ? "/day-pillar?locale=zh" : dayPillarSharePath("zh", card.slug)} lang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</Link></nav></header>
    <div className={styles.mainGrid}>
      <section className={styles.introduction}>
        <p className={styles.eyebrow}><Sparkles size={14} aria-hidden="true" />{text.eyebrow}</p><h1>{text.title}</h1><p className={styles.lead}>{text.intro}</p>
        <form className={styles.form} onSubmit={reveal} noValidate>
          <label htmlFor="day-pillar-date"><CalendarDays size={15} aria-hidden="true" />{text.date}</label>
          <input id="day-pillar-date" type="date" value={birthDate} onChange={(event) => { setBirthDate(event.target.value); setError(""); }} min="1800-01-01" max="2100-12-31" autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? "day-pillar-error day-pillar-convention" : "day-pillar-convention"} required />
          <button className={styles.primary} disabled={busy} type="submit">{busy ? <Loader2 size={17} className={styles.spin} aria-hidden="true" /> : <Sparkles size={17} aria-hidden="true" />}{busy ? text.busy : text.reveal}<ArrowRight size={16} aria-hidden="true" /></button>
          {error && <p id="day-pillar-error" className={styles.error} role="alert">{error}</p>}
          <p className={styles.privacy}><ShieldCheck size={14} aria-hidden="true" />{text.privacy}</p>
        </form>
        <aside className={styles.convention} id="day-pillar-convention"><Compass size={20} aria-hidden="true" /><div><h2>{text.conventionTitle}</h2><p>{text.convention}</p></div></aside>
      </section>
      <section className={styles.result} ref={resultRef} tabIndex={-1} aria-label={text[mode]}>
        <div className={styles.resultHeading}><p className={styles.eyebrow} aria-live="polite">{text[mode]}</p><span>{card.pillar}</span></div>
        <div className={styles.stage} onPointerMove={moveLight} onPointerLeave={resetLight}>
          {/* Single-image surface. Future registered background/subject/frame layers can replace this surface without changing the date model. */}
          <div className={styles.cardSurface} ref={artRef} data-tilted={tilted}><Image src={card.image} alt={`${card.pillar} · ${card.name}`} width={896} height={1200} priority sizes="(max-width: 820px) 86vw, 350px" /><div className={styles.glint} aria-hidden="true" /></div>
          <span className={styles.orbit} aria-hidden="true" />
        </div>
        <div className={styles.cardTools}><button type="button" onClick={() => { resetLight(); setTilted((value) => !value); }} aria-pressed={tilted}><Rotate3D size={14} aria-hidden="true" />{tilted ? text.resetTilt : text.tilt}</button><a href={card.image} download={`destinypixel-${card.slug}.jpg`} onClick={() => trackToolEvent("tool_export", "day_pillar")}><Download size={14} aria-hidden="true" />{text.image}</a></div>
        <p className={styles.resultNote}>{mode === "sample" ? text.sampleNote : mode === "shared" ? text.sharedNote : text.calculatedNote}</p>
      </section>
    </div>
    <section className={styles.reading} aria-labelledby="day-card-title">
      <div className={styles.readingTitle}><span className={styles.pillarSeal}>{card.pillar}</span><div><p className={styles.eyebrow}>{text.collection}</p><h2 id="day-card-title">{card.name}</h2></div><button type="button" className={styles.shareButton} onClick={() => void copyLink()}><Copy size={15} aria-hidden="true" />{text.share}</button></div>
      <div className={styles.readingGrid}><article><span className={styles.sectionNumber}>01</span><h3>{text.portrait}</h3><p>{card.essence}</p></article><article><span className={styles.sectionNumber}>02</span><h3>{text.reflection}</h3><p>{card.growth}</p><p className={styles.prompt}>{text.reflectionNote}</p></article></div>
      <p className={styles.cultural}>{text.cultural}</p>
      {shareLink && <div className={styles.shareBox}><p role="status"><Check size={14} aria-hidden="true" />{shareMessage}</p><label htmlFor="day-card-share">{text.shareLabel}</label><input id="day-card-share" readOnly value={shareLink} onFocus={(event) => event.target.select()} /><small>{text.shareNote}</small></div>}
    </section>
    <section className={styles.nextStep}><div><p className={styles.eyebrow}>{text.next}</p><h2>{text.nextTitle}</h2><p>{text.nextBody}</p><p className={styles.nextNote}>{text.nextNote}</p></div><div className={styles.nextActions}><Link className={styles.primary} href={`${home}#report`} onClick={() => trackToolEvent("tool_start", "day_pillar")}>{text.nextAction}<MoveUpRight size={17} aria-hidden="true" /></Link><Link className={styles.atelier} href={locale === "zh" ? "/atelier?locale=zh" : "/atelier"}><Gem size={16} aria-hidden="true" />{text.atelier}<ArrowRight size={14} aria-hidden="true" /></Link></div></section>
    <footer className={styles.footer}><div><strong>DestinyPixel</strong><p>{text.footer}</p></div><Link href={home}>{text.home}</Link><a href={destinySupportHref}>{text.contact}</a></footer>
  </main>;
}
