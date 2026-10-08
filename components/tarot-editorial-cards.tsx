import Image from "next/image";
import type { JournalLocale } from "@/lib/journal-locales";
import { editorialCardIds, tarotEducationCopy } from "@/lib/tarot-editorial/navigation";
import { tarotLearningCatalog } from "@/lib/tarot-learning/metadata";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import { tarotLearningCopy } from "@/lib/tarot-learning/copy";
import { defaultTarotDeck, tarotArtworkEditions } from "@/lib/celestial/tarot-decks";
import styles from "@/app/journal/journal.module.css";

export default function TarotEditorialCards({ slug, locale }: { slug: string; locale: JournalLocale }) {
  const ids = editorialCardIds[slug];
  if (!ids?.length) return null;
  const cards = tarotLearningCatalog(locale);
  return <aside className={styles.editorialCards} aria-label={tarotEducationCopy[locale].cards}>
    <div>{ids.map(id => {
      const name = cards.find(card => card.cardId === id)!.nameLocalized;
      return <figure key={id}><a href={tarotLearningHref(id, locale)}><Image src={defaultTarotDeck.faces[id]} alt={name} width={560} height={960} sizes="(max-width:650px) 35vw, 150px" /></a><figcaption>{name}</figcaption></figure>;
    })}</div>
    <p>{tarotArtworkEditions[0].credits} · <a href={defaultTarotDeck.attribution}>{tarotLearningCopy(locale).source}</a></p>
  </aside>;
}
