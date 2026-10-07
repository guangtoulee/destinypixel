import { tarotDeck } from "@/lib/oracle/cast";
export type DrawnCard = {
  id: string;
  reversed: boolean;
  revealed: boolean;
  x: number;
  y: number;
  rotation: number;
  slot: number;
};
export type DeckCard = { id: string; reversed: boolean };
export const spreadSizes = {
  single: 1,
  three: 3,
  relationship: 5,
  choice: 5,
  celtic: 10,
} as const;
export type SpreadId = keyof typeof spreadSizes;
export type TableState = {
  deck: DeckCard[];
  cards: DrawnCard[];
  mode: "spread" | "free";
  spread: SpreadId;
};
export function randomInt(max: number) {
  if (!Number.isInteger(max) || max < 1)
    throw new Error("INVALID_RANDOM_RANGE");
  const array = new Uint32Array(1),
    ceiling = Math.floor(4294967296 / max) * max;
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= ceiling);
  return array[0] % max;
}
export function shuffleDeck(
  deck: DeckCard[],
  reversals: boolean,
  pick: (max: number) => number = randomInt,
): DeckCard[] {
  const shuffled = deck.map((c) => ({
    ...c,
    reversed: reversals ? pick(2) === 1 : false,
  }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
export function initialTable(
  mode: TableState["mode"] = "spread",
  spread: SpreadId = "three",
): TableState {
  return {
    deck: tarotDeck.map((c) => ({ id: c.id, reversed: false })),
    cards: [],
    mode,
    spread,
  };
}
/** A deliberate lift-and-return moves the next card beneath the remaining deck.
 * Preserve card orientation, dealt cards and all other reading state. */
export function cycleDeck(state: TableState): TableState {
  if (state.deck.length < 2) return state;
  return {...state, deck: [...state.deck.slice(1), state.deck[0]]};
}

export function takeCard(
  state: TableState,
  index: number,
  slot: number,
): TableState {
  const card = state.deck[index];
  if (
    !card ||
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot > 77 ||
    (state.mode === "spread" && slot >= spreadSizes[state.spread])
  )
    return state;
  const previous = state.cards.find((c) => c.slot === slot);
  const cards = state.cards.filter((c) => c.slot !== slot);
  const deck = state.deck.filter((_, i) => i !== index);
  if (previous) deck.push({ id: previous.id, reversed: previous.reversed });
  cards.push({
    ...card,
    revealed: false,
    x: 12 + (slot % 4) * 22,
    y: 12 + (Math.floor(slot / 4) % 4) * 20,
    rotation: 0,
    slot,
  });
  return { ...state, deck, cards: cards.sort((a, b) => a.slot - b.slot) };
}
export function returnCard(state: TableState, slot: number): TableState {
  const card = state.cards.find((c) => c.slot === slot);
  if (!card) return state;
  return {
    ...state,
    deck: [...state.deck, { id: card.id, reversed: card.reversed }],
    cards: state.cards.filter((c) => c.slot !== slot),
  };
}
export function parseTarotInput(raw: Record<string, unknown>, requireQuestion = false) {
  if (raw.mode !== "free" && raw.mode !== "spread")
    throw new Error("INVALID_INPUT");
  if (typeof raw.spread !== "string" || !Object.hasOwn(spreadSizes, raw.spread))
    throw new Error("INVALID_INPUT");
  if (
    !Array.isArray(raw.cards) ||
    raw.cards.length < 1 ||
    raw.cards.length > 78
  )
    throw new Error("INVALID_INPUT");
  const spread = raw.spread as SpreadId;
  if (raw.mode === "spread" && raw.cards.length !== spreadSizes[spread])
    throw new Error("INCOMPLETE_SPREAD");
  const used = new Set<string>(),
    slots = new Set<number>();
  const cards = raw.cards
    .map((v: unknown) => {
      if (!v || typeof v !== "object") throw new Error("INVALID_INPUT");
      const r = v as Record<string, unknown>,
        card = tarotDeck.find((c) => c.id === r.id);
      if (
        !card ||
        used.has(card.id) ||
        typeof r.reversed !== "boolean" ||
        !Number.isInteger(r.slot) ||
        Number(r.slot) < 0 ||
        Number(r.slot) >= (raw.mode === "spread" ? spreadSizes[spread] : 78) ||
        slots.has(Number(r.slot))
      )
        throw new Error("INVALID_INPUT");
      used.add(card.id);
      slots.add(Number(r.slot));
      return {
        id: card.id,
        name: card.en,
        reversed: r.reversed,
        slot: Number(r.slot),
      };
    })
    .sort((a, b) => a.slot - b.slot);
  if (
    raw.question !== undefined &&
    (typeof raw.question !== "string" || raw.question.length > 500)
  )
    throw new Error("INVALID_INPUT");
  if (raw.details !== undefined && (typeof raw.details !== "string" || raw.details.length > 3000))
    throw new Error("INVALID_INPUT");
  if (requireQuestion && (typeof raw.question !== "string" || !raw.question.trim()))
    throw new Error("QUESTION_REQUIRED");
  return {
    mode: raw.mode as "free" | "spread",
    spread,
    cards,
    question: typeof raw.question === "string" ? raw.question.trim() : "",
    details: typeof raw.details === "string" ? raw.details.trim() : "",
  };
}
