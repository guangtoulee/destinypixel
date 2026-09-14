import { destinySupportHref } from "@/lib/support-contact";
import { journalHref, type JournalLocale } from "@/lib/journal";
import { journalLocales, journalLanguageLabels, journalLanguageTags, journalUi, journalHomeHref, journalToolsHref } from "@/lib/journal-locales";
import styles from "@/app/journal/journal.module.css";

// Document navigation keeps query-based language metadata in sync with the body.
// Client-prefetched metadata can otherwise retain the English canonical.
export function JournalHeader({ locale, slug }: { locale: JournalLocale; slug?: string }) {
  const ui = journalUi[locale];
  return (
    <header className={styles.header}>
      <a className={styles.brand} href={journalHomeHref(locale)}><span aria-hidden="true" />DestinyPixel</a>
      <nav className={styles.navigation} aria-label={ui.mainNav}>
        <a href={journalToolsHref(locale)}>{ui.tools}</a>
        <a href={journalHref(locale)} aria-current={!slug ? "page" : undefined}>{ui.journal}</a>
      </nav>
      <nav className={styles.languages} aria-label={ui.language}>
        {journalLocales.map((language) => <a key={language} href={journalHref(language, slug)} hrefLang={journalLanguageTags[language]} lang={journalLanguageTags[language]} aria-current={locale === language ? "page" : undefined}>{journalLanguageLabels[language]}</a>)}
      </nav>
    </header>
  );
}

export function JournalFooter({ locale }: { locale: JournalLocale }) {
  const ui = journalUi[locale];
  return (
    <footer className={styles.footer}>
      <div><strong>DestinyPixel</strong><p>{ui.footer}</p></div>
      <nav aria-label={ui.footerNav}><a href={journalHref(locale)}>{ui.all}</a><a href={journalToolsHref(locale)}>{ui.toolDirectory}</a><a href={destinySupportHref}>{ui.contact}</a></nav>
    </footer>
  );
}
