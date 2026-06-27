"use client";

import Image from "next/image";
import {
  Anchor,
  ArrowRight,
  Compass,
  MapPinned,
  Play,
  ScrollText,
  Shield,
  ShipWheel,
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

export default function MazuExperience() {
  const [activeGuardian, setActiveGuardian] = useState(guardians[0].id);
  const currentGuardian = useMemo(
    () => guardians.find((item) => item.id === activeGuardian) ?? guardians[0],
    [activeGuardian],
  );
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
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#story">
              <Play size={17} aria-hidden="true" />
              Enter the story
            </a>
            <a className={styles.secondaryAction} href="#content">
              Build the content engine
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
        </div>

        <div className={styles.storyGrid}>
          {storyBeats.map((beat, index) => (
            <article className={styles.storyCard} key={beat.title}>
              <div className={styles.storyIndex}>0{index + 1}</div>
              <span>{beat.kicker}</span>
              <h3>{beat.title}</h3>
              <p>{beat.body}</p>
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
        </div>

        <div className={styles.hookGrid}>
          {contentHooks.map((hook, index) => (
            <article className={styles.hookCard} key={hook}>
              <div className={styles.hookTopline}>
                <ScrollText size={17} aria-hidden="true" />
                <span>Hook {index + 1}</span>
              </div>
              <p>{hook}</p>
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
          <p>
            The advantage is not only AI visuals. It is access to a living
            cultural source, real temples, local memory, and a myth that already
            crossed oceans before the internet existed.
          </p>
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
