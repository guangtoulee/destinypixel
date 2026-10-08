import type { JournalLocale } from "@/lib/journal-locales";
import { tarotLearningCatalog } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { editorialCardIds, relatedEditorialSlugs, tarotEditorialCatalog, tarotEducationCopy } from "@/lib/tarot-editorial/navigation";
import styles from "@/app/journal/journal.module.css";

export default function TarotEditorialLinks({ slug, locale }: { slug: string; locale: JournalLocale }) {
  const related = relatedEditorialSlugs(slug), ids = editorialCardIds[slug] ?? [];
  if (!related.length && !ids.length) return null;
  const copy = tarotEducationCopy[locale], catalog = tarotEditorialCatalog(locale);
  const suffix = locale === "en" ? "" : `?locale=${locale}`;
  const legacy = slug === "how-to-connect-three-tarot-cards" ? "how-to-read-three-card-tarot" : slug === "tarot-from-game-to-occult-traditions" ? "pamela-colman-smith-tarot-artist" : undefined;
  const legacyLabels = {
    en: { "how-to-read-three-card-tarot": "Three-card tarot: questions and positions", "pamela-colman-smith-tarot-artist": "Pamela Colman Smith: the artist behind RWS" },
    zh: { "how-to-read-three-card-tarot": "三张牌入门：问题与牌位", "pamela-colman-smith-tarot-artist": "Pamela Colman Smith：RWS 背后的画家" },
    "zh-TW": { "how-to-read-three-card-tarot": "三張牌入門：問題與牌位", "pamela-colman-smith-tarot-artist": "Pamela Colman Smith：RWS 背後的畫家" },
    ru: { "how-to-read-three-card-tarot": "Три карты: вопросы и позиции", "pamela-colman-smith-tarot-artist": "Памела Колман Смит: художница RWS" },
  };
  return <nav className={styles.pillarRelated} aria-label={copy.related} data-editorial-links>
    <h2>{copy.related}</h2>
    {related.map(id => <a key={id} href={`/journal/${id}${suffix}`}>{catalog[id].title}<span aria-hidden="true">→</span></a>)}
    {legacy && <a href={`/journal/${legacy}${suffix}`}>{legacyLabels[locale][legacy]}<span aria-hidden="true">→</span></a>}
    {ids.length > 0 && <><h3>{copy.cards}</h3>{ids.map(id => <a key={id} href={tarotLearningHref(id, locale)}>{tarotLearningCatalog(locale).find(c => c.cardId === id)?.nameLocalized}<span aria-hidden="true">→</span></a>)}</>}
    <a href={`/journal${suffix}#tarot-education`}>{copy.title}<span aria-hidden="true">→</span></a>
  </nav>;
}
