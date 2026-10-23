import { getJournalArticle, journalHref, type JournalLocale } from "@/lib/journal";
import { tarotMethodLocales, tarotMethodSlugs } from "@/lib/journal-tarot-methods";
import styles from "@/app/journal/journal.module.css";

/** Add the authored methods to the existing learning path without inventing editions. */
export default function TarotMethodLinks({ slug, locale }: { slug: string; locale: JournalLocale }) {
  if (!tarotMethodLocales.some(language => language === locale)) return null;
  if (![...tarotMethodSlugs, "how-to-read-three-card-tarot", "how-to-connect-three-tarot-cards"].some(candidate => candidate === slug)) return null;
  const title = locale === "zh" ? "继续练习：牌阵与读牌记录" : "Keep practising: spreads and reading notes";
  return <nav className={styles.pillarRelated} aria-label={title} data-tarot-method-links>
    <h2>{title}</h2>
    {tarotMethodSlugs.filter(candidate => candidate !== slug).map(candidate => {
      const article = getJournalArticle(candidate);
      return article ? <a key={candidate} href={journalHref(locale, candidate)}>{article.translations[locale].title}<span aria-hidden="true">→</span></a> : null;
    })}
  </nav>;
}
