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
