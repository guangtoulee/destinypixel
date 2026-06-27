"use client";

import Image from "next/image";
import {
  Anchor,
  ArrowUpRight,
  Crown,
  Languages,
  Orbit,
  Radar,
  Sailboat,
  ScanLine,
  Waves,
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import styles from "./meizhouma-experience.module.css";

type Locale = "en" | "zh";
type MotionState = "idle" | "active" | "unsupported";

const copy = {
  en: {
    nav: ["Crown", "Signal", "Ritual"],
    lang: "中文",
    motion: "Motion",
    eyebrow: "Meizhou Mazu kinetic study",
    title: "Meizhou Ma",
    subtitle:
      "A sea goddess rendered as crown, current, signal, and living myth.",
    primary: "Enter the signal",
    secondary: "View classic story",
    crownTitle: "The crown is the symbol.",
    crownBody:
      "Mazu is visually recognized through the Tianhou crown: gold structure, pearl bead curtain, red ornaments, and a calm face beneath ceremonial power.",
    signalTitle: "A myth that behaves like navigation.",
    signalBody:
      "For global audiences, the strongest angle is not explanation. It is a feeling: direction in danger, a shore inside the storm, and a name carried across oceans.",
    ritualTitle: "From Meizhou into the feed.",
    ritualBody:
      "The modern version can become a visual system: crown close-ups, ocean geometry, temple silhouettes, short hooks, and bilingual captions.",
    cards: [
      ["Crown", "The first frame must say Tianhou, not generic goddess."],
      ["Sea", "The ocean is the interface: distance, migration, return."],
      ["Signal", "Geometry turns folk belief into a modern visual language."],
    ],
    footer: "A visual direction for Mazu culture, built for global attention.",
  },
  zh: {
    nav: ["头冠", "信号", "仪式"],
    lang: "EN",
    motion: "重力",
    eyebrow: "湄洲妈祖动态视觉实验",
    title: "湄洲妈祖",
    subtitle: "把海上女神翻译成头冠、洋流、信号与活态神话。",
    primary: "进入信号",
    secondary: "查看经典版",
    crownTitle: "头冠就是第一识别点。",
    crownBody:
      "妈祖不能画成泛泛的东方女神。她的视觉核心是天后冠：金色冠体、珠帘冕旒、红色绒球与庄严平静的面容。",
    signalTitle: "这个神话像导航系统一样工作。",
    signalBody:
      "面向全球用户，最强的不是解释，而是感觉：危险中的方向、风暴里的岸、以及一个被人带过海洋的名字。",
    ritualTitle: "从湄洲进入信息流。",
    ritualBody:
      "现代版妈祖可以形成视觉系统：头冠特写、海图几何、庙宇剪影、短视频钩子和双语字幕。",
    cards: [
      ["头冠", "第一帧必须是天后，不是普通女神。"],
      ["大海", "海是界面：远方、迁徙、归来。"],
      ["信号", "几何线条让民间信仰变成现代视觉语言。"],
    ],
    footer: "一个面向全球注意力的妈祖文化视觉方向。",
  },
} satisfies Record<
  Locale,
  {
    nav: string[];
    lang: string;
    motion: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
    crownTitle: string;
    crownBody: string;
    signalTitle: string;
    signalBody: string;
    ritualTitle: string;
    ritualBody: string;
    cards: [string, string][];
    footer: string;
  }
>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function MeizhouMaExperience() {
  const [locale, setLocale] = useState<Locale>("en");
  const [motion, setMotion] = useState({ x: 0, y: 0 });
  const [motionState, setMotionState] = useState<MotionState>("idle");
  const text = copy[locale];
  const style = useMemo(
    () =>
      ({
        "--mx": motion.x.toFixed(3),
        "--my": motion.y.toFixed(3),
      }) as CSSProperties,
    [motion],
  );

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      setMotion({
        x: clamp(event.gamma / 34, -1, 1),
        y: clamp((event.beta - 48) / 42, -1, 1),
      });
      setMotionState("active");
    };

    const orientationEvent = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<PermissionState>;
        })
      | undefined;

    if (!orientationEvent?.requestPermission) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMotion({
      x: clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 2,
      y: clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * 2,
    });
  };

  const requestMotion = async () => {
    const orientationEvent = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<PermissionState>;
        })
      | undefined;

    if (!orientationEvent) {
      setMotionState("unsupported");
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      setMotion({
        x: clamp(event.gamma / 34, -1, 1),
        y: clamp((event.beta - 48) / 42, -1, 1),
      });
      setMotionState("active");
    };

    if (orientationEvent.requestPermission) {
      const result = await orientationEvent.requestPermission();
      if (result !== "granted") return;
    }

    window.addEventListener("deviceorientation", handleOrientation);
    setMotionState("active");
  };

  return (
    <main className={styles.shell} style={style} onPointerMove={handlePointerMove}>
      <section className={styles.hero} aria-labelledby="meizhouma-title">
        <div className={styles.energyField} aria-hidden="true" />
        <div className={styles.radialGrid} aria-hidden="true" />
        <div className={styles.orbitOne} aria-hidden="true" />
        <div className={styles.orbitTwo} aria-hidden="true" />
        <div className={styles.scan} aria-hidden="true" />

        <header className={styles.header}>
          <a className={styles.brand} href="/">
            <span>DP</span>
            DestinyPixel
          </a>
          <nav className={styles.nav} aria-label="Meizhou Ma sections">
            {text.nav.map((item, index) => (
              <a key={item} href={["#crown", "#signal", "#ritual"][index]}>
                {item}
              </a>
            ))}
          </nav>
          <div className={styles.actions}>
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => setLocale((value) => (value === "en" ? "zh" : "en"))}
              aria-label="Toggle language"
            >
              <Languages size={16} aria-hidden="true" />
              {text.lang}
            </button>
            <button
              className={styles.iconButton}
              type="button"
              onClick={requestMotion}
              aria-label="Enable motion layers"
            >
              <Orbit size={16} aria-hidden="true" />
              {motionState === "active" ? "ON" : text.motion}
            </button>
          </div>
        </header>

        <div className={styles.figureLayer}>
          <Image
            src="/meizhouma/meizhouma-hero.png"
            alt="A modern geometric portrait of Mazu with a golden Tianhou crown and pearl bead curtain"
            fill
            priority
            sizes="100vw"
            className={styles.figureImage}
          />
        </div>

        <div className={styles.copyLayer}>
          <div className={styles.eyebrow}>
            <Radar size={16} aria-hidden="true" />
            {text.eyebrow}
          </div>
          <h1 id="meizhouma-title">{text.title}</h1>
          <p>{text.subtitle}</p>
          <div className={styles.ctaRow}>
            <a href="#crown" className={styles.primaryCta}>
              <Crown size={17} aria-hidden="true" />
              {text.primary}
            </a>
            <a href="/mazu" className={styles.secondaryCta}>
              {text.secondary}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.sidePanel} aria-label="visual system">
          <div>
            <ScanLine size={16} aria-hidden="true" />
            <span>001</span>
            <strong>Tianhou crown</strong>
          </div>
          <div>
            <Waves size={16} aria-hidden="true" />
            <span>002</span>
            <strong>Ocean geometry</strong>
          </div>
          <div>
            <Sailboat size={16} aria-hidden="true" />
            <span>003</span>
            <strong>Safe return</strong>
          </div>
        </div>
      </section>

      <section className={styles.statement} id="crown">
        <div className={styles.statementText}>
          <span>01 / Crown code</span>
          <h2>{text.crownTitle}</h2>
          <p>{text.crownBody}</p>
        </div>
        <div className={styles.crownGlyph} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className={styles.statementAlt} id="signal">
        <div className={styles.signalMap} aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
        <div className={styles.statementText}>
          <span>02 / Sea signal</span>
          <h2>{text.signalTitle}</h2>
          <p>{text.signalBody}</p>
        </div>
      </section>

      <section className={styles.cards} id="ritual">
        <div className={styles.cardsIntro}>
          <span>03 / Visual system</span>
          <h2>{text.ritualTitle}</h2>
          <p>{text.ritualBody}</p>
        </div>
        <div className={styles.cardGrid}>
          {text.cards.map(([title, body], index) => (
            <article className={styles.card} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <Anchor size={18} aria-hidden="true" />
          <span>{text.footer}</span>
        </div>
        <a href="/mazu">/mazu</a>
      </footer>
    </main>
  );
}
