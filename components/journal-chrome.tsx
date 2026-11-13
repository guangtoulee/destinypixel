import { journalTopicHref, type JournalTopic } from "@/lib/journal-topics";
import { destinySupportHref } from "@/lib/support-contact";
import { getJournalArticle, journalArticleLocales, journalHref, type JournalLocale } from "@/lib/journal";
import { journalLanguageLabels, journalLanguageTags, journalUi, journalHomeHref, journalToolsHref } from "@/lib/journal-locales";
import styles from "@/app/journal/journal.module.css";

const compactLanguageLabels: Record<JournalLocale, string> = {
  en: "EN",
  zh: "简体",
  "zh-TW": "繁體",
  ru: "RU",
};

const mastheadLabels: Record<JournalLocale, string> = {
  en: "Editorial",
  zh: "人文专栏",
  "zh-TW": "人文專欄",
  ru: "Журнал",
};

function realmHref(path: string, locale: JournalLocale) {
  return locale === "en" ? path : `${path}?locale=${locale}`;
}

const realmLinks: Array<{
  key: string;
  href: (locale: JournalLocale) => string;
  labels: Record<JournalLocale, string>;
}> = [
  {
    key: "discover",
    href: (locale) => realmHref("/discover", locale),
    labels: { en: "Day Pillars", zh: "日柱", "zh-TW": "日柱", ru: "Столпы дня" },
  },
  {
    key: "tarot",
    href: (locale) => realmHref("/tarot", locale),
    labels: { en: "Tarot", zh: "塔罗", "zh-TW": "塔羅", ru: "Таро" },
  },
  {
    key: "sticks",
    href: (locale) => realmHref("/sticks", locale),
    labels: { en: "Fortune Sticks", zh: "求签", "zh-TW": "求籤", ru: "Жребии" },
  },
  {
    key: "astrology",
    href: (locale) => realmHref("/astrology", locale),
    labels: { en: "Birth Chart", zh: "星盘", "zh-TW": "星盤", ru: "Астрология" },
  },
  {
    key: "iching",
    href: (locale) => realmHref("/iching", locale),
    labels: { en: "I Ching", zh: "六爻", "zh-TW": "六爻", ru: "И цзин" },
  },
  {
    key: "compatibility",
    href: (locale) => realmHref("/compatibility", locale),
    labels: { en: "Compatibility", zh: "合盘", "zh-TW": "合盤", ru: "Совместимость" },
  },
];

const journalRealmLabel: Record<JournalLocale, string> = {
  en: "Journal",
  zh: "专栏",
  "zh-TW": "專欄",
  ru: "Статьи",
};

// Document navigation keeps query-based language metadata in sync with the body.
// Client-prefetched metadata can otherwise retain the English canonical.
export function JournalHeader({
  locale,
  slug,
  topic,
}: {
  locale: JournalLocale;
  slug?: string;
  topic?: JournalTopic;
}) {
  const ui = journalUi[locale];
  const availableLocales = journalArticleLocales(slug ? getJournalArticle(slug) : undefined);

  return (
    <header className={styles.header} data-journal-masthead>
      <div className={styles.headerTop}>
        <div className={styles.brandGroup}>
          <a className={styles.brand} href={journalHomeHref(locale)}>
            <span aria-hidden="true" />
            DestinyPixel
          </a>
          <span className={styles.mastheadDivider} aria-hidden="true" />
          <a className={styles.mastheadTag} href={journalHref(locale)}>
            {mastheadLabels[locale]}
          </a>
        </div>

        <nav className={styles.languages} aria-label={ui.language}>
          {availableLocales.map((language) => (
            <a
              key={language}
              href={topic && !slug ? journalTopicHref(language, topic) : journalHref(language, slug)}
              hrefLang={journalLanguageTags[language]}
              lang={journalLanguageTags[language]}
              title={journalLanguageLabels[language]}
              aria-label={journalLanguageLabels[language]}
              aria-current={locale === language ? "page" : undefined}
            >
              {compactLanguageLabels[language]}
            </a>
          ))}
        </nav>
      </div>

      <nav className={styles.navigation} aria-label={ui.mainNav}>
        {realmLinks.map((realm) => (
          <a key={realm.key} href={realm.href(locale)} className={styles.realmLink}>
            {realm.labels[locale]}
          </a>
        ))}
        <a
          href={journalHref(locale)}
          className={styles.realmLink}
          data-active="true"
          aria-current={!slug ? "page" : undefined}
        >
          {journalRealmLabel[locale]}
        </a>
      </nav>
    </header>
  );
}

export function JournalFooter({ locale }: { locale: JournalLocale }) {
  const ui = journalUi[locale];
  return (
    <footer className={styles.footer}>
      <div>
        <strong>DestinyPixel</strong>
        <p>{ui.footer}</p>
      </div>
      <nav aria-label={ui.footerNav}>
        <a href={journalHref(locale)}>{ui.all}</a>
        <a href={journalToolsHref(locale)}>{ui.toolDirectory}</a>
        <a href={destinySupportHref}>{ui.contact}</a>
      </nav>
    </footer>
  );
}
