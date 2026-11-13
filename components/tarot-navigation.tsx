import type { ReportLocale } from "@/lib/report-i18n";
import { celestialHref, celestialLocales } from "@/lib/celestial/copy";
import { recordCopy, memberAccountHref } from "@/lib/celestial/record-copy";
import { journalLanguageTags } from "@/lib/journal-locales";
import { tarotWorkspaceCopy } from "@/lib/tarot-workspace-copy";
import styles from "./tarot-navigation.module.css";
import { TarotDocumentLanguage } from "./tarot-document-language";

type RealmItem = {
  key: string;
  path: string;
  labels: Record<ReportLocale, string>;
};

const REALM_ITEMS: readonly RealmItem[] = [
  {
    key: "discover",
    path: "/discover",
    labels: {
      en: "Day Pillars",
      zh: "六十日柱",
      "zh-TW": "六十日柱",
      ru: "Столпы дня",
    },
  },
  {
    key: "tarot",
    path: "/tarot",
    labels: {
      en: "Tarot",
      zh: "山湖塔罗",
      "zh-TW": "山湖塔羅",
      ru: "Таро",
    },
  },
  {
    key: "sticks",
    path: "/sticks",
    labels: {
      en: "Fortune Sticks",
      zh: "灵签问事",
      "zh-TW": "靈籤問事",
      ru: "Жребий",
    },
  },
  {
    key: "astrology",
    path: "/astrology",
    labels: {
      en: "Birth Chart",
      zh: "本命星盘",
      "zh-TW": "本命星盤",
      ru: "Натальная карта",
    },
  },
  {
    key: "iching",
    path: "/iching",
    labels: {
      en: "I Ching",
      zh: "易经六爻",
      "zh-TW": "易經六爻",
      ru: "И цзин",
    },
  },
  {
    key: "compatibility",
    path: "/compatibility",
    labels: {
      en: "Compatibility",
      zh: "关系合盘",
      "zh-TW": "關係合盤",
      ru: "Совместимость",
    },
  },
  {
    key: "journal",
    path: "/journal",
    labels: {
      en: "Journal",
      zh: "深度专栏",
      "zh-TW": "深度專欄",
      ru: "Статьи",
    },
  },
];

const REALMS_HEADING: Record<ReportLocale, string> = {
  en: "Realms",
  zh: "探索全站",
  "zh-TW": "探索全站",
  ru: "Разделы",
};

const LOCALE_LABELS: Record<ReportLocale, string> = {
  en: "EN",
  zh: "简",
  "zh-TW": "繁",
  ru: "RU",
};

function isActiveRealm(currentPath: string, itemPath: string): boolean {
  if (currentPath === itemPath) return true;
  if (itemPath === "/journal" && currentPath.startsWith("/journal")) return true;
  return false;
}

export function TarotHeader({
  locale,
  path,
  availableLocales = celestialLocales,
  edition,
}: {
  locale: ReportLocale;
  path: string;
  availableLocales?: readonly ReportLocale[];
  edition?: string;
}) {
  const badge = edition ?? (path === "/astrology" ? "ASTROLOGY" : "TAROT");
  const realmsLabel = REALMS_HEADING[locale];

  return (
    <header className={styles.headerShell} data-celestial-header>
      <TarotDocumentLanguage language={journalLanguageTags[locale]} />
      <div className={styles.topRow}>
        <a className={styles.brand} href={celestialHref("/", locale)}>
          <span className={styles.brandStar} aria-hidden="true">
            ✧
          </span>
          <span className={styles.brandText}>DestinyPixel</span>
          <span className={styles.edition}>{badge}</span>
        </a>

        <div className={styles.tools}>
          <a className={styles.account} href={memberAccountHref(locale)}>
            {recordCopy(locale).account}
          </a>
          <nav aria-label="Language" className={styles.languages}>
            {availableLocales.map((l) => (
              <a
                key={l}
                href={celestialHref(path, l)}
                hrefLang={journalLanguageTags[l]}
                lang={journalLanguageTags[l]}
                aria-current={l === locale ? "page" : undefined}
              >
                {LOCALE_LABELS[l]}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <nav className={styles.realmsBar} aria-label={realmsLabel} data-realms-bar>
        <span className={styles.realmsKicker} aria-hidden="true">
          {realmsLabel}
        </span>
        <div className={styles.realmsTrack}>
          {REALM_ITEMS.map((item) => {
            const active = isActiveRealm(path, item.path);
            return (
              <a
                key={item.key}
                href={celestialHref(item.path, locale)}
                className={styles.realmPill}
                aria-current={active ? "page" : undefined}
              >
                {item.labels[locale]}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export function TarotNavigation({
  locale,
  current,
}: {
  locale: ReportLocale;
  current?: "table" | "library" | "guide";
}) {
  const c = tarotWorkspaceCopy(locale);
  return (
    <nav className={styles.navigation} aria-label={c.nav} data-tarot-navigation>
      <a
        href={`${celestialHref("/tarot", locale)}#table`}
        aria-current={current === "table" ? "page" : undefined}
      >
        <span aria-hidden="true">01</span>
        {c.draw}
      </a>
      <a
        href={celestialHref("/journal/tarot-cards", locale)}
        aria-current={current === "library" ? "page" : undefined}
      >
        <span aria-hidden="true">02</span>
        {c.atlas}
      </a>
      <a
        href={celestialHref("/journal/how-to-connect-three-tarot-cards", locale)}
        aria-current={current === "guide" ? "page" : undefined}
      >
        <span aria-hidden="true">03</span>
        {c.guide}
      </a>
    </nav>
  );
}
