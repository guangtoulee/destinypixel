"use client";

import { useRef, useState } from "react";
import styles from "./peace.module.css";

const copy = {
  zh: {
    home: "首页", edition: "一个免费的文化祝愿小仪式", nav: "页面导航", languages: "页面语言", eyebrow: "太岁平安 · 给自己的片刻",
    title: ["为自己，", "许个平安愿。"], intro: "心中的念，比形式更重要。愿你心有所安，行有所向。",
    prompt: "不必写下，也不必说出口。心中有念，就在这里停一会儿。", light: "点亮平安，送出心愿", lit: "这盏灯，为你亮着", reread: "再读一遍祝福", share: "分享这份祝福", copy: "复制页面链接", copied: "链接已复制。愿温暖，也抵达你惦念的人。", shareDone: "已打开分享。", shareCancelled: "分享已取消，你的灯依然亮着。", copyFailed: "可以选择下方链接，手动复制分享。", link: "页面链接",
    before: "留一盏灯的位置，给心里的牵挂。", blessing: "愿这份心意，陪你踏实走好每一天。", blessingTitle: "送给此刻的你", after: "灯亮了。慢慢呼吸，愿你安稳，也愿你有继续向前的力量。", symbol: "“送出”是把祝愿寄托在这盏灯上的表达；这里不会提交或保存你的心愿。",
    lampOff: "尚未点亮的平安灯", lampOn: "已点亮的平安灯", seal: "平安", ornament: "愿 · 安 · 行", small: "无需账户或个人资料 · 免费点亮",
    next: "让这份心安，多一点明白。", nextIntro: "祝愿可以温柔，理解也可以清楚。把太岁名词读明白，再把日子过回自己的节奏。",
    cards: [
      { n: "01", tag: "先解开一个误会", title: "本命年一定不好吗？", text: "值、冲、刑、害、破分别是什么？2027 年涉及哪些生肖，又有哪些流派分歧？", link: "读懂太岁关系", path: "/journal/ben-ming-nian-tai-sui" },
      { n: "02", tag: "轻松读年度主题", title: "2027 十二生肖星级榜", text: "用可解释的编辑星级和生活短评找个话题，不把生肖标签当作你整年的判决。", link: "看生肖星级榜", path: "/2027", hash: "#zodiac-ranking" },
      { n: "03", tag: "回到自己的节奏", title: "免费个人年度手册", text: "从 1 月到 12 月，分别查看八字与星盘参照；出生时辰不确定，也保留它的边界。", link: "打开我的 2027", path: "/2027", hash: "#your-year" },
    ],
    about: "关于这盏灯", note: "这是本站原创的文化祝愿与自我安定小仪式，尊重民俗中的祝愿心意。它不预测吉凶，也不保证消灾改运，不等同于宗教仪式的功效承诺。你无需购买任何化解套餐。把祝愿留在心里，也给生活中的实际行动与需要的帮助留个位置。", footer: "愿有所念，也有所行。", free: "不收取费用 · 不保存心愿",
  },
  en: {
    home: "Home", edition: "A free moment of cultural reflection", nav: "Page navigation", languages: "Page language", eyebrow: "TAI SUI PEACE · A MOMENT FOR YOU",
    title: ["A little light.", "A wish for peace."], intro: "The meaning you bring matters more than the form. May you find peace within, and a direction to follow.",
    prompt: "No need to write it down or say it aloud. Hold a wish in mind, and pause here for a moment.", light: "Light the lamp, offer your wish", lit: "A little light, here for you", reread: "Read the blessing again", share: "Share this blessing", copy: "Copy page link", copied: "Link copied. May a little warmth reach someone on your mind, too.", shareDone: "Share options opened.", shareCancelled: "Sharing cancelled. Your lamp is still glowing.", copyFailed: "Select the link below to copy and share it yourself.", link: "Page link",
    before: "A place for a little light, and whatever is on your mind.", blessing: "May this quiet intention keep you company, one steady day at a time.", blessingTitle: "A wish for you, right now", after: "Your lamp is lit. Take an easy breath. May you feel grounded, with the strength to keep going.", symbol: "Offering a wish is symbolic: nothing you hold in mind is submitted or saved here.",
    lampOff: "An unlit peace lamp", lampOn: "A glowing peace lamp", seal: "安", ornament: "WISH · PEACE · A WAY FORWARD", small: "Free to light · No account or personal details",
    next: "A calmer mind. A clearer understanding.", nextIntro: "A warm wish can sit beside a thoughtful explanation. Read the traditions in context, then return to the life you are actually living.",
    cards: [
      { n: "01", tag: "UNPACK THE TRADITION", title: "Is your zodiac year always unlucky?", text: "Understand Tai Sui matching, clash, punishment, harm and break, including the 2027 signs and differences between schools.", link: "Explore the Tai Sui guide", path: "/journal/ben-ming-nian-tai-sui" },
      { n: "02", tag: "BROWSE A YEARLY THEME", title: "2027 zodiac star rankings", text: "Clear editorial stars and short reflections offer a conversation starter, with no verdict on your entire year.", link: "See the zodiac rankings", path: "/2027", hash: "#zodiac-ranking" },
      { n: "03", tag: "MAKE IT PERSONAL", title: "Your free 2027 year guide", text: "Explore January through December with separate Bazi and birth-chart perspectives, keeping unknown birth times visible.", link: "Open my 2027", path: "/2027", hash: "#your-year" },
    ],
    about: "About this little light", note: "This original cultural blessing offers a small moment of calm, with respect for folk traditions. It does not predict events, promise protection or a change in fortune, or claim the effects of a religious ceremony. No remedy package is needed. Let a kind intention sit alongside practical steps and any support you need.", footer: "A wish in mind. A step ahead.", free: "Free to use · No wishes saved",
  },
};

function ShareArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" /></svg>;
}

function PeaceLamp({ lit, label, seal }: { lit: boolean; label: string; seal: string }) {
  return <svg className={styles.lamp} viewBox="0 0 460 500" role="img" aria-label={label}>
    <defs>
      <linearGradient id="peace-brass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c09149" /><stop offset=".45" stopColor="#f0d797" /><stop offset=".7" stopColor="#9b713b" /><stop offset="1" stopColor="#d6b66f" /></linearGradient>
      <linearGradient id="peace-glass" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#c9945a" stopOpacity=".05" /><stop offset=".5" stopColor="#f9df9c" stopOpacity={lit ? ".32" : ".08"} /><stop offset="1" stopColor="#c9945a" stopOpacity=".06" /></linearGradient>
      <radialGradient id="peace-aura"><stop stopColor="#ffce73" stopOpacity={lit ? ".25" : "0"} /><stop offset="1" stopColor="#eeb258" stopOpacity="0" /></radialGradient>
      <radialGradient id="peace-flame"><stop stopColor="#fff7cf" /><stop offset=".45" stopColor="#ffdb78" /><stop offset="1" stopColor="#db8a32" stopOpacity=".2" /></radialGradient>
    </defs>
    <circle cx="230" cy="242" r="212" fill="url(#peace-aura)" className={styles.aura} />
    <g fill="none" stroke="#c7ae70" strokeWidth=".7" opacity=".28"><circle cx="230" cy="236" r="178" /><circle cx="230" cy="236" r="191" strokeDasharray="1 10" /><path d="M230 32v22m0 364v22M31 236h25m349 0h25" /></g>
    <g fill="#e7ce8e" opacity=".55"><path d="m102 95 2 7 7 2-7 2-2 7-2-7-7-2 7-2zM361 126l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5z" /><circle cx="87" cy="305" r="1.5" /><circle cx="380" cy="306" r="2" /><circle cx="153" cy="389" r="1" /></g>
    <ellipse cx="230" cy="452" rx="94" ry="11" fill="#061812" opacity=".45" />
    <path d="M209 106c0-24 42-24 42 0" fill="none" stroke="url(#peace-brass)" strokeWidth="5" />
    <path d="m225 91 5-13 5 13" fill="none" stroke="#d9bd7e" strokeWidth="2" />
    <path d="M187 145h86l23 231H164z" fill="url(#peace-glass)" stroke="#c9a767" strokeWidth="1.5" />
    <path d="M198 154h64l15 210h-94z" fill="none" stroke="#d7bc82" strokeWidth=".5" opacity=".4" />
    <path d="m188 145-18 231m102-231 18 231M230 146v228" stroke="#c5a569" strokeWidth="1.5" opacity=".5" />
    <path d="M155 145c23-7 48-23 57-37h36c9 14 34 30 57 37z" fill="url(#peace-brass)" />
    <path d="M155 145h150l-10 8H165z" fill="#8c6838" />
    <path d="M173 134h114m-86-14h58" stroke="#f4dfac" strokeWidth="1" opacity=".55" />
    <g className={`${styles.flame} ${lit ? styles.flameLit : ""}`}><ellipse cx="230" cy="283" rx="50" ry="72" fill="url(#peace-flame)" opacity=".22" /><path d="M230 239c-4 20-22 31-22 51a22 22 0 0 0 44 0c0-17-12-29-22-51z" fill="url(#peace-flame)" /><path d="M231 269c-3 11-10 17-10 26 0 13 20 13 20 0 0-10-6-17-10-26z" fill="#fff5cf" /></g>
    <path d="M208 326h44v28h-44z" fill="#d3b16d" /><ellipse cx="230" cy="326" rx="22" ry="5" fill="#f1d79b" /><path d="M230 320v-10" stroke="#805f38" strokeWidth="3" />
    <path d="M157 376h146l-8 14H165zM176 390h108v16H176zM186 406h88l14 22H172zM158 428h144v12H158z" fill="url(#peace-brass)" />
    <path d="M165 382h130M184 400h92M178 423h104M166 434h128" stroke="#f5dda5" opacity=".45" />
    <rect x="211" y="169" width="38" height="47" rx="18" fill="#18372e" stroke="#d2b274" strokeWidth=".7" />
    <text x="230" y="199" fill="#e6cc91" fontSize="18" textAnchor="middle" fontFamily="serif">{seal}</text>
  </svg>;
}

export function TaiSuiPeace({ locale, shareUrl }: { locale: "zh" | "en"; shareUrl: string }) {
  const c = copy[locale];
  const [lit, setLit] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [showLink, setShowLink] = useState(false);
  const blessingRef = useRef<HTMLParagraphElement>(null);
  const query = locale === "zh" ? "?locale=zh" : "";
  const href = (path: string, hash = "") => `${path}${query}${hash}`;

  function lightLamp() {
    setLit(true);
    // Keep the response visible on small screens; motion preferences apply here too.
    requestAnimationFrame(() => blessingRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }));
  }

  async function share() {
    setShareStatus("");
    if (navigator.share) {
      try { await navigator.share({ title: locale === "zh" ? "太岁平安 · 为自己许个愿" : "A little light, a wish for peace", text: c.blessing, url: shareUrl }); setShareStatus(c.shareDone); return; }
      catch (error) { if (error instanceof Error && error.name === "AbortError") { setShareStatus(c.shareCancelled); return; } }
    }
    try { await navigator.clipboard.writeText(shareUrl); setShareStatus(c.copied); }
    catch { setShowLink(true); setShareStatus(c.copyFailed); }
  }

  return <main className={styles.page} lang={locale === "zh" ? "zh-CN" : "en"} data-server-localized>
    <div className={styles.heroWrap}>
      <header className={styles.header}><a className={styles.brand} href={href("/")}><span aria-hidden="true">✳</span>DestinyPixel</a><p>{c.edition}</p><nav aria-label={c.languages}><a href="/taisui?locale=zh" lang="zh-CN" hrefLang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</a><span aria-hidden="true">/</span><a href="/taisui" lang="en" hrefLang="en" aria-current={locale === "en" ? "page" : undefined}>EN</a></nav></header>
      <section className={styles.hero} aria-labelledby="peace-title" data-lit={lit}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}>{c.eyebrow}</p><h1 id="peace-title">{c.title.map(line => <span key={line}>{line}</span>)}</h1><p className={styles.intro}>{c.intro}</p><p className={styles.prompt}>{c.prompt}</p><button type="button" className={styles.lightButton} aria-pressed={lit} onClick={lightLamp}><span aria-hidden="true">{lit ? "✦" : "✧"}</span>{lit ? c.lit : c.light}</button><p className={styles.small}>{c.small}</p></div>
        <div className={styles.lampStage}><div className={styles.lampFrame}><PeaceLamp lit={lit} label={lit ? c.lampOn : c.lampOff} seal={c.seal} /></div><span className={styles.ornament} aria-hidden="true">{c.ornament}</span></div>
        <div className={styles.blessingBox}><p className={styles.blessingLabel}>{lit ? c.blessingTitle : "✦"}</p><p ref={blessingRef} tabIndex={-1} className={styles.blessing} role="status" aria-live="polite" aria-atomic="true">{lit ? c.blessing : c.before}</p>{lit && <p className={styles.after}>{c.after}</p>}<div className={styles.blessingActions}>{lit && <button type="button" onClick={() => blessingRef.current?.focus()}>{c.reread}<span aria-hidden="true">↺</span></button>}<button type="button" onClick={share}>{c.share}<ShareArrow /></button></div><p className={styles.shareStatus} role="status" aria-live="polite">{shareStatus}</p>{showLink && <label className={styles.fallbackLink}>{c.link}<input readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} /></label>}</div>
      </section>
      <p className={styles.symbol}>{c.symbol}</p>
    </div>
    <section className={styles.explore} aria-labelledby="peace-explore"><p className={styles.exploreEyebrow}>A LITTLE CONTEXT</p><div className={styles.exploreHeading}><h2 id="peace-explore">{c.next}</h2><p>{c.nextIntro}</p></div><div className={styles.cards}>{c.cards.map(card => <a className={styles.card} key={card.n} href={href(card.path, "hash" in card ? card.hash : "")}><div className={styles.cardTop}><span>{card.n}</span><span>{card.tag}</span></div><h3>{card.title}</h3><p>{card.text}</p><span className={styles.cardLink}>{card.link}<ShareArrow /></span></a>)}</div></section>
    <section className={styles.about} aria-labelledby="peace-about"><span className={styles.aboutIcon} aria-hidden="true">✧</span><div><h2 id="peace-about">{c.about}</h2><p>{c.note}</p></div></section>
    <footer className={styles.footer}><a className={styles.brand} href={href("/")}><span aria-hidden="true">✳</span>DestinyPixel</a><p>{c.footer}</p><span>{c.free}</span></footer>
  </main>;
}
