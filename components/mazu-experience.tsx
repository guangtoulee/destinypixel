"use client";

import Image from "next/image";
import {
  Anchor,
  ArrowRight,
  Compass,
  Languages,
  MapPinned,
  Play,
  ScrollText,
  Shield,
  Sparkles,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./mazu-experience.module.css";

const storyBeats = [
  {
    kicker: "Origin",
    title: "A girl from Meizhou",
    body: "Mazu begins as Lin Moniang, a young woman from Fujian whose story is carried by sea towns, temple halls, and families who live with the ocean.",
  },
  {
    kicker: "Myth",
    title: "The watcher of dangerous water",
    body: "Her legend is not loud conquest. It is rescue, distance, weather, waiting, and the promise that someone is looking toward the horizon with you.",
  },
  {
    kicker: "World",
    title: "A living goddess across oceans",
    body: "From Meizhou to Taiwan, Southeast Asia, and overseas Chinese communities, Mazu became a portable home for people crossing uncertain seas.",
  },
];

const guardians = [
  {
    id: "travelers",
    label: "Travelers",
    icon: Compass,
    title: "For people between places",
    body: "Mazu is an elegant entry point for stories about travel, migration, homecoming, and the emotional cost of distance.",
    line: "Protection is a direction, not a destination.",
  },
  {
    id: "families",
    label: "Families",
    icon: Shield,
    title: "For families waiting on shore",
    body: "The strongest Mazu hook is not only the sailor at sea, but the mother, partner, and child waiting for a safe return.",
    line: "The shore is part of the voyage.",
  },
  {
    id: "seekers",
    label: "Seekers",
    icon: Sparkles,
    title: "For spiritual searchers",
    body: "Western audiences already understand goddess archetypes. Mazu adds a grounded Chinese language of mercy, water, ritual, and place.",
    line: "A goddess of calm power, not spectacle.",
  },
];

const contentHooks = [
  "The Chinese sea goddess worshiped by millions, but barely known in the West.",
  "Before she became Mazu, she was a girl watching storms from Fujian.",
  "Why immigrants carried this goddess across oceans.",
  "A temple is not a museum. It is a map of longing.",
  "The goddess of safe return, explained in 45 seconds.",
  "What Mazu reveals about Chinese ideas of protection.",
];

const signals = [
  { value: "2009", label: "UNESCO recognition" },
  { value: "Fujian", label: "cultural source" },
  { value: "Ocean", label: "universal symbol" },
];

const zhCopy = {
  hero:
    "这是一个面向海外用户的妈祖故事入口：她不是普通的东方女神，而是穿过风暴、母亲、船员、移民、庙宇与故乡思念的海上守护神。",
  storyIntro:
    "最强的出海角度不是景区宣传，而是把中国海洋信仰翻译成所有人都能感受到的情绪：危险、远方、等待与保护。",
  archetypeIntro:
    "海外观众已经熟悉 Athena、Aphrodite、Hecate 这样的女神原型。妈祖可以通过大海、旅行、家庭与迁徙进入他们的理解框架。",
  contentIntro:
    "这些句子可以直接变成 TikTok、Shorts、X thread 或 YouTube 开场。网站保持高级，短视频负责冲出去。",
  source:
    "真正的优势不只是 AI 视觉，而是你能接触到活着的文化源头、真实庙宇、地方记忆，以及一个在互联网之前就已经跨海传播的神话。",
};

const zhStoryBeats = [
  {
    title: "来自湄洲岛的女孩",
    body: "妈祖的故事始于林默娘，一个来自福建海边的年轻女性。她的传说被海镇、庙宇和与大海共同生活的家庭一代代讲下去。",
  },
  {
    title: "危险海面上的守望者",
    body: "她的神话不是征服，而是救援、远方、天气、等待，以及有人始终与你一起望向海平线的承诺。",
  },
  {
    title: "跨越海洋的活态女神",
    body: "从湄洲到台湾、东南亚与海外华人社区，妈祖成为一种可以随身携带的故乡感。",
  },
];

const zhGuardians = [
  {
    id: "travelers",
    body: "妈祖非常适合讲旅行、迁徙、回家，以及远方给人带来的情绪代价。",
    line: "保护不是终点，而是一种方向。",
  },
  {
    id: "families",
    body: "妈祖故事最动人的不只是海上的船员，还有岸上等待平安归来的母亲、伴侣与孩子。",
    line: "岸边，也是航程的一部分。",
  },
  {
    id: "seekers",
    body: "对灵性探索者来说，妈祖是一种沉静、有根、有水气的中国式守护原型。",
    line: "她的力量是安定，不是喧哗。",
  },
];

const zhContentHooks = [
  "一个被数百万人敬奉、却几乎还没被西方认识的中国海上女神。",
  "在成为妈祖之前，她只是一个在福建海边看见风暴的女孩。",
  "为什么移民会把这位女神带过一片又一片海。",
  "庙不是博物馆，而是一张关于思念的地图。",
  "45 秒讲懂：平安归来的女神。",
  "妈祖如何解释中国人对“保护”的理解。",
];

export default function MazuExperience() {
  const [activeGuardian, setActiveGuardian] = useState(guardians[0].id);
  const [showChinese, setShowChinese] = useState(false);
  const currentGuardian = useMemo(
    () => guardians.find((item) => item.id === activeGuardian) ?? guardians[0],
    [activeGuardian],
  );
  const currentZhGuardian =
    zhGuardians.find((item) => item.id === activeGuardian) ?? zhGuardians[0];
  const GuardianIcon = currentGuardian.icon;

  return (
    <main className={styles.shell}>
      <section className={styles.hero} aria-labelledby="mazu-title">
        <Image
          src="/mazu/mazu-hero.png"
          alt="A refined mythic portrait of Mazu facing the sea at dawn"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroVeil} />
        <header className={styles.nav}>
          <a className={styles.brand} href="/">
            <span className={styles.brandSeal}>DP</span>
            <span>DestinyPixel</span>
          </a>
          <nav className={styles.navLinks} aria-label="Mazu sections">
            <a href="#story">Story</a>
            <a href="#archetype">Archetype</a>
            <a href="#content">Hooks</a>
          </nav>
          <button
            className={styles.languageToggle}
            type="button"
            onClick={() => setShowChinese((value) => !value)}
            aria-pressed={showChinese}
          >
            <Languages size={15} aria-hidden="true" />
            {showChinese ? "English" : "中文释义"}
          </button>
        </header>

        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Waves size={16} aria-hidden="true" />
            Fujian sea goddess culture
          </div>
          <h1 id="mazu-title">Mazu, the goddess of safe return.</h1>
          <p>
            A premium story gateway for the Chinese sea goddess whose myth moves
            through storms, mothers, sailors, immigrants, temples, and the
            longing for home.
          </p>
          {showChinese ? <p className={styles.zhLead}>{zhCopy.hero}</p> : null}
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#story">
              <Play size={17} aria-hidden="true" />
              {showChinese ? "进入故事" : "Enter the story"}
            </a>
            <a className={styles.secondaryAction} href="#content">
              {showChinese ? "查看内容钩子" : "Build the content engine"}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.signalDock} aria-label="Mazu cultural signals">
          {signals.map((signal) => (
            <div className={styles.signal} key={signal.label}>
              <strong>{signal.value}</strong>
              <span>{signal.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.storyBand} id="story">
        <div className={styles.sectionIntro}>
          <span>Story spine</span>
          <h2>Not a tourist poster. A myth people can feel.</h2>
          <p>
            The strongest overseas angle is simple: Mazu turns Chinese coastal
            belief into a universal emotional language of danger, distance, and
            protection.
          </p>
          {showChinese ? <p className={styles.zhText}>{zhCopy.storyIntro}</p> : null}
        </div>

        <div className={styles.storyGrid}>
          {storyBeats.map((beat, index) => (
            <article className={styles.storyCard} key={beat.title}>
              <div className={styles.storyIndex}>0{index + 1}</div>
              <span>{beat.kicker}</span>
              <h3>{beat.title}</h3>
              <p>{beat.body}</p>
              {showChinese ? (
                <p className={styles.zhText}>
                  <strong>{zhStoryBeats[index].title}</strong>
                  {zhStoryBeats[index].body}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.archetypeBand} id="archetype">
        <div className={styles.archetypeCopy}>
          <span>Audience bridge</span>
          <h2>Translate Mazu as an archetype, not just a deity.</h2>
          <p>
            Western viewers already understand Athena, Aphrodite, Hecate, and
            saintly protectors. Mazu can enter that language through the sea,
            travel, family, and migration.
          </p>
          {showChinese ? (
            <p className={styles.zhText}>{zhCopy.archetypeIntro}</p>
          ) : null}
        </div>

        <div className={styles.guardianPanel}>
          <div className={styles.guardianTabs} role="tablist" aria-label="Mazu archetype lenses">
            {guardians.map((guardian) => {
              const Icon = guardian.icon;
              const selected = guardian.id === activeGuardian;

              return (
                <button
                  className={selected ? styles.guardianTabActive : styles.guardianTab}
                  key={guardian.id}
                  onClick={() => setActiveGuardian(guardian.id)}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                >
                  <Icon size={17} aria-hidden="true" />
                  {guardian.label}
                </button>
              );
            })}
          </div>
          <div className={styles.guardianBody}>
            <div className={styles.guardianIcon}>
              <GuardianIcon size={28} aria-hidden="true" />
            </div>
            <h3>{currentGuardian.title}</h3>
            <p>{currentGuardian.body}</p>
            <blockquote>{currentGuardian.line}</blockquote>
            {showChinese ? (
              <div className={styles.zhPanel}>
                <p>{currentZhGuardian.body}</p>
                <strong>{currentZhGuardian.line}</strong>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.contentBand} id="content">
        <div className={styles.sectionIntro}>
          <span>Short-form hooks</span>
          <h2>Six openings that can become a content pipeline.</h2>
          <p>
            Treat each line as a TikTok, Shorts, X thread, or YouTube opener.
            The site stays premium while the clips do the street work.
          </p>
          {showChinese ? <p className={styles.zhText}>{zhCopy.contentIntro}</p> : null}
        </div>

        <div className={styles.hookGrid}>
          {contentHooks.map((hook, index) => (
            <article className={styles.hookCard} key={hook}>
              <div className={styles.hookTopline}>
                <ScrollText size={17} aria-hidden="true" />
                <span>Hook {index + 1}</span>
              </div>
              <p>{hook}</p>
              {showChinese ? (
                <p className={styles.zhHook}>{zhContentHooks[index]}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sourceBand}>
        <div className={styles.sourceInner}>
          <div>
            <span>From place to platform</span>
            <h2>Meizhou gives the story a real coastline.</h2>
          </div>
          <div className={styles.sourceText}>
            <p>
              The advantage is not only AI visuals. It is access to a living
              cultural source, real temples, local memory, and a myth that already
              crossed oceans before the internet existed.
            </p>
            {showChinese ? <p className={styles.zhSource}>{zhCopy.source}</p> : null}
          </div>
          <a
            className={styles.sourceLink}
            href="https://ich.unesco.org/en/RL/mazu-belief-and-customs-00227"
            target="_blank"
            rel="noreferrer"
          >
            <MapPinned size={17} aria-hidden="true" />
            UNESCO reference
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerMark}>
          <Anchor size={18} aria-hidden="true" />
          <span>Mazu by DestinyPixel</span>
        </div>
        <p>Chinese myth, translated for the global imagination.</p>
        <a href="/">Return to DestinyPixel</a>
      </footer>
    </main>
  );
}
