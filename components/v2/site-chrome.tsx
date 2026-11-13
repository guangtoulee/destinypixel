"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { destinySupportHref } from "@/lib/support-contact";
import { toTraditional } from "@/lib/journal-locales";
import { sectionHref } from "@/lib/section-journeys";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./site-chrome.module.css";

export type V2RealmKey =
  | "discover"
  | "tarot"
  | "sticks"
  | "astrology"
  | "iching"
  | "compatibility"
  | "tuteng"
  | "journal"
  | "tools"
  | "atelier";

type RealmItem = {
  key: Exclude<V2RealmKey, "tools" | "atelier">;
  path: string;
  glyph: string;
  label: string;
};

const navLabels = {
  en: {
    subtitle: "Celestial Manuscript",
    navAria: "DestinyPixel realms",
    langAria: "Language",
    more: "All tools",
    learn: "How it works",
    facts: "Pricing & methods",
    contact: "Contact",
    year2027: "2027 Guide",
    colRealms: "Six Core Realms",
    colReference: "Library & Transparency",
    statement:
      "An East–West symbolic observatory uniting 60 GanZhi Day Pillars, tropical natal charts, Mountain-Lake Tarot, temple fortune sticks, and I Ching casting.",
    boundary: "Symbolic & cultural reflection · Never a fixed verdict.",
    items: {
      discover: "60 Day Pillars",
      tarot: "Tarot",
      sticks: "Fortune Sticks",
      astrology: "Birth Chart",
      iching: "I Ching",
      compatibility: "Synastry",
      tuteng: "Birth Totem",
      journal: "Journal",
    },
  },
  zh: {
    subtitle: "东方星历 · 问事观心",
    navAria: "DestinyPixel 核心领域导航",
    langAria: "切换语言",
    more: "全部工具",
    learn: "使用指南",
    facts: "价格与计算说明",
    contact: "联系我们",
    year2027: "2027 流年手册",
    colRealms: "核心星历与问事",
    colReference: "典籍专栏与透明边界",
    statement:
      "融合六十甲子日柱意象、西方回归星盘、本命几何灵构、山湖塔罗、五系灵签与易经六爻的现代命理观星台。",
    boundary: "所有排盘与占问皆作文化体验与自我观照，不替人生下判决。",
    items: {
      discover: "六十日柱",
      tarot: "山湖塔罗",
      sticks: "灵签问事",
      astrology: "本命星盘",
      iching: "易经六爻",
      compatibility: "关系合盘",
      tuteng: "本命灵构",
      journal: "深度专栏",
    },
  },
  ru: {
    subtitle: "Небесный манускрипт",
    navAria: "Разделы DestinyPixel",
    langAria: "Язык",
    more: "Все инструменты",
    learn: "Руководство",
    facts: "Методы и цены",
    contact: "Контакт",
    year2027: "Гид 2027 (EN)",
    colRealms: "Главные обсерватории",
    colReference: "Библиотека и прозрачность",
    statement:
      "Восточно-западная символическая обсерватория: 60 столпов дня Бацзы, натальная карта, Таро горного озера, храмовые жребии и гексаграммы И цзин.",
    boundary: "Символическое исследование для самоанализа, а не приговор.",
    items: {
      discover: "60 столпов дня",
      tarot: "Таро",
      sticks: "Жребии",
      astrology: "Звёздная карта",
      iching: "И цзин",
      compatibility: "Совместимость",
      tuteng: "Тотем",
      journal: "Журнал",
    },
  },
} as const;

export function getV2ChromeCopy(locale: ReportLocale) {
  if (locale === "zh-TW") {
    return JSON.parse(toTraditional(JSON.stringify(navLabels.zh))) as (typeof navLabels)["zh"];
  }
  return locale === "zh" ? navLabels.zh : locale === "ru" ? navLabels.ru : navLabels.en;
}

export function getV2RealmItems(locale: ReportLocale): RealmItem[] {
  const c = getV2ChromeCopy(locale);
  return [
    { key: "discover", path: "/discover", glyph: "✦", label: c.items.discover },
    { key: "tarot", path: "/tarot", glyph: "☽", label: c.items.tarot },
    { key: "sticks", path: "/sticks", glyph: "◈", label: c.items.sticks },
    { key: "astrology", path: "/astrology", glyph: "☉", label: c.items.astrology },
    { key: "iching", path: "/iching", glyph: "☰", label: c.items.iching },
    { key: "compatibility", path: "/compatibility", glyph: "∞", label: c.items.compatibility },
    { key: "tuteng", path: "/tuteng", glyph: "❖", label: c.items.tuteng },
    { key: "journal", path: "/journal", glyph: "§", label: c.items.journal },
  ];
}

export function AstrolabeEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`${styles.emblemSvg} ${className ?? ""}`}
    >
      <defs>
        <linearGradient id="v2-emblem-gold" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D6A965" />
          <stop offset="52%" stopColor="#8A6BA8" />
          <stop offset="100%" stopColor="#6D9B8E" />
        </linearGradient>
      </defs>
      <g className={styles.emblemRing}>
        <circle cx="16" cy="16" r="13.5" stroke="url(#v2-emblem-gold)" strokeWidth="1.15" strokeDasharray="2.2 2.2" />
        <circle cx="16" cy="2.5" r="1.3" fill="#C69753" />
        <circle cx="16" cy="29.5" r="1.1" fill="#8A6BA8" />
      </g>
      <circle cx="16" cy="16" r="10.2" stroke="rgba(92, 73, 110, 0.34)" strokeWidth="0.9" />
      <ellipse cx="16" cy="16" rx="10.2" ry="4.6" transform="rotate(-28 16 16)" stroke="url(#v2-emblem-gold)" strokeWidth="0.95" />
      <path
        d="M16 7.2L17.9 14.1L24.8 16L17.9 17.9L16 24.8L14.1 17.9L7.2 16L14.1 14.1L16 7.2Z"
        fill="url(#v2-emblem-gold)"
        fillOpacity="0.9"
      />
      <circle cx="16" cy="16" r="2.1" fill="#FAF6EE" />
    </svg>
  );
}

export function AmbientAstrolabe({
  tone = "parchment",
}: {
  tone?: "parchment" | "night";
} = {}) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    let raf = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = ((event.clientX / window.innerWidth) * 100).toFixed(1);
        const y = ((event.clientY / window.innerHeight) * 100).toFixed(1);
        layerRef.current?.style.setProperty("--aura-x", `${x}%`);
        layerRef.current?.style.setProperty("--aura-y", `${y}%`);
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.ambientLayer} data-tone={tone} aria-hidden="true">
      <div className={styles.auraGlow} />
      <div className={styles.vellumGrain} />
      <svg className={styles.astrolabeBackdrop} viewBox="0 0 600 600" fill="none">
        <g className={styles.slowSpin}>
          <circle cx="300" cy="300" r="276" stroke="currentColor" strokeWidth="1" />
          <circle cx="300" cy="300" r="254" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 7" />
          <circle cx="300" cy="300" r="198" stroke="currentColor" strokeWidth="0.85" />
          <ellipse cx="300" cy="300" rx="254" ry="104" transform="rotate(-24 300 300)" stroke="currentColor" strokeWidth="0.9" />
          <ellipse cx="300" cy="300" rx="254" ry="104" transform="rotate(36 300 300)" stroke="currentColor" strokeWidth="0.75" strokeDasharray="5 6" />
          <line x1="24" y1="300" x2="576" y2="300" stroke="currentColor" strokeWidth="0.7" />
          <line x1="300" y1="24" x2="300" y2="576" stroke="currentColor" strokeWidth="0.7" />
          <circle cx="300" cy="46" r="4.5" fill="currentColor" />
          <circle cx="498" cy="300" r="3.5" fill="currentColor" />
          <circle cx="158" cy="442" r="4" fill="currentColor" />
        </g>
        <g className={styles.reverseSpin}>
          <circle cx="300" cy="300" r="136" stroke="currentColor" strokeWidth="0.85" strokeDasharray="2 5" />
          <polygon points="300,164 418,368 182,368" stroke="currentColor" strokeWidth="0.7" />
          <polygon points="300,436 418,232 182,232" stroke="currentColor" strokeWidth="0.7" />
        </g>
      </svg>

      <svg className={styles.astrolabeBackdropSecondary} viewBox="0 0 500 500" fill="none">
        <g className={styles.reverseSpin}>
          <circle cx="250" cy="250" r="228" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="250" cy="250" r="176" stroke="currentColor" strokeWidth="0.85" />
          <ellipse cx="250" cy="250" rx="212" ry="88" transform="rotate(28 250 250)" stroke="currentColor" strokeWidth="0.85" />
        </g>
      </svg>
    </div>
  );
}

const localeShortLabels: Record<ReportLocale, string> = {
  en: "EN",
  zh: "简体",
  "zh-TW": "繁體",
  ru: "RU",
};

export function SiteHeaderV2({
  locale,
  current,
  basePath = "/",
  locales = ["en", "zh", "zh-TW", "ru"],
  languageSlot,
}: {
  locale: ReportLocale;
  current?: V2RealmKey;
  basePath?: string;
  locales?: readonly ReportLocale[];
  languageSlot?: ReactNode;
}) {
  const copy = getV2ChromeCopy(locale);
  const realms = getV2RealmItems(locale);

  return (
    <header className={styles.headerWrap} data-v2-header>
      <div className={styles.headerInner}>
        <a className={styles.brandLink} href={sectionHref("/", locale)}>
          <AstrolabeEmblem />
          <span className={styles.brandText}>
            <span className={styles.brandWordmark}>DestinyPixel</span>
            <span className={styles.brandSub}>{copy.subtitle}</span>
          </span>
        </a>

        <nav className={styles.realmNav} aria-label={copy.navAria}>
          {realms.map(item => (
            <a
              key={item.key}
              className={styles.realmPill}
              href={sectionHref(item.path, locale)}
              aria-current={current === item.key ? "page" : undefined}
            >
              <span className={styles.realmGlyph} aria-hidden="true">
                {item.glyph}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {languageSlot ? (
          <div className={styles.localeSlot}>{languageSlot}</div>
        ) : (
          <nav className={styles.localeBar} aria-label={copy.langAria}>
            {locales.map(target => (
              <a
                key={target}
                className={styles.localeLink}
                href={sectionHref(basePath, target)}
                aria-current={target === locale ? "page" : undefined}
              >
                {localeShortLabels[target]}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export function SiteFooterV2({ locale }: { locale: ReportLocale }) {
  const copy = getV2ChromeCopy(locale);
  const realms = getV2RealmItems(locale);
  const yearHref = locale === "zh" || locale === "zh-TW" ? "/2027?locale=zh" : "/2027";

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <a className={styles.brandLink} href={sectionHref("/", locale)}>
            <AstrolabeEmblem />
            <span className={styles.brandText}>
              <span className={styles.brandWordmark}>DestinyPixel</span>
              <span className={styles.brandSub}>{copy.subtitle}</span>
            </span>
          </a>
          <p className={styles.footerStatement}>{copy.statement}</p>
        </div>

        <div>
          <p className={styles.footerColTitle}>{copy.colRealms}</p>
          <nav className={styles.footerNav} aria-label={copy.colRealms}>
            {realms.slice(0, 6).map(item => (
              <a key={item.key} href={sectionHref(item.path, locale)}>
                {item.label}
              </a>
            ))}
            <a href={sectionHref("/tuteng", locale)}>{copy.items.tuteng}</a>
            <a href={yearHref} hrefLang={yearHref.includes("locale=zh") ? "zh-Hans" : "en"}>
              {copy.year2027}
            </a>
          </nav>
        </div>

        <div>
          <p className={styles.footerColTitle}>{copy.colReference}</p>
          <nav className={styles.footerNav} aria-label={copy.colReference}>
            <a href={sectionHref("/tools", locale)}>{copy.more}</a>
            <a href={sectionHref("/journal", locale)}>{copy.items.journal}</a>
            <a href={sectionHref("/learn", locale)}>{copy.learn}</a>
            <a href={sectionHref("/product-facts", locale)}>{copy.facts}</a>
            <a href={destinySupportHref}>{copy.contact}</a>
          </nav>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} DestinyPixel · Celestial Manuscript Edition</span>
        <span>{copy.boundary}</span>
      </div>
    </footer>
  );
}
