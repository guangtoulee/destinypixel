import type { ReportLocale } from "@/lib/report-i18n";
import { celestialHref, celestialLocales } from "@/lib/celestial/copy";
import { recordCopy, memberAccountHref } from "@/lib/celestial/record-copy";
import { journalLanguageTags } from "@/lib/journal-locales";
import { tarotWorkspaceCopy } from "@/lib/tarot-workspace-copy";
import styles from "./tarot-navigation.module.css";

export function TarotHeader({ locale, path }: { locale: ReportLocale; path: string }) {
  return <header className={styles.header}>
    <a className={styles.brand} href={celestialHref("/", locale)}><span aria-hidden="true">✧</span>DestinyPixel<span className={styles.edition}>TAROT</span></a>
    <div className={styles.tools}><a className={styles.account} href={memberAccountHref(locale)}>{recordCopy(locale).account}</a>
      <nav aria-label="Language" className={styles.languages}>{celestialLocales.map(l => <a key={l} href={celestialHref(path, l)} hrefLang={journalLanguageTags[l]} lang={journalLanguageTags[l]} aria-current={l === locale ? "page" : undefined}>{{ en: "EN", zh: "简", "zh-TW": "繁", ru: "RU" }[l]}</a>)}</nav>
    </div>
  </header>;
}

export function TarotNavigation({ locale, current }: { locale: ReportLocale; current?: "table" | "library" | "guide" }) {
  const c = tarotWorkspaceCopy(locale);
  return <nav className={styles.navigation} aria-label={c.nav} data-tarot-navigation>
    <a href={`${celestialHref("/tarot", locale)}#table`} aria-current={current === "table" ? "page" : undefined}><span aria-hidden="true">01</span>{c.draw}</a>
    <a href={celestialHref("/journal/tarot-cards", locale)} aria-current={current === "library" ? "page" : undefined}><span aria-hidden="true">02</span>{c.atlas}</a>
    <a href={celestialHref("/journal/how-to-connect-three-tarot-cards", locale)} aria-current={current === "guide" ? "page" : undefined}><span aria-hidden="true">03</span>{c.guide}</a>
  </nav>;
}
