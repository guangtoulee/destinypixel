import { tarotDeck } from "@/lib/oracle/cast";

/** Card identities and meanings are independent of artwork. Future decks map
 * these same IDs to their own licensed files without changing reading state. */
export type TarotDeckManifest = {
  id: string;
  attribution: string;
  faces: Readonly<Record<string, string>>;
};
export const defaultTarotDeck: TarotDeckManifest = {
  id: "rws-taionwc",
  attribution: "/tarot/attribution.json",
  faces: Object.fromEntries(tarotDeck.map(card => [card.id, `/tarot/rws/${card.id}.webp`])),
};

export type TarotArtworkEdition = TarotDeckManifest & {
  name: Readonly<Record<import("@/lib/report-i18n").ReportLocale, string>>;
  credits: string;
};

/** Only editions with sourced artwork belong here. Product aliases are not
 * separate editions, and missing faces must not borrow another edition's art. */
export const tarotArtworkEditions: readonly TarotArtworkEdition[] = [{
  ...defaultTarotDeck,
  name: {
    en: "RWS · TaionWC historical scans",
    zh: "韦特塔罗 · TaionWC 历史扫描",
    "zh-TW": "韋特塔羅 · TaionWC 歷史掃描",
    ru: "RWS · исторические сканы TaionWC",
  },
  credits: "Pamela Colman Smith · Pam-A · TaionWC",
}];

export function artworkEditionsForCard(cardId: string, editions = tarotArtworkEditions) {
  return editions.filter(edition => Boolean(edition.faces[cardId]));
}
