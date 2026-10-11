export const trigramIds = ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"] as const;
export type TrigramId = typeof trigramIds[number];
// Three-line identities are stored and counted from the bottom upward.
export const trigramIdentities = {
  qian: { id: "qian", name: "乾", pinyin: "Qián", symbol: "☰", bits: [1, 1, 1], pureHexagram: 1 },
  dui: { id: "dui", name: "兌", pinyin: "Duì", symbol: "☱", bits: [1, 1, 0], pureHexagram: 58 },
  li: { id: "li", name: "離", pinyin: "Lí", symbol: "☲", bits: [1, 0, 1], pureHexagram: 30 },
  zhen: { id: "zhen", name: "震", pinyin: "Zhèn", symbol: "☳", bits: [1, 0, 0], pureHexagram: 51 },
  xun: { id: "xun", name: "巽", pinyin: "Xùn", symbol: "☴", bits: [0, 1, 1], pureHexagram: 57 },
  kan: { id: "kan", name: "坎", pinyin: "Kǎn", symbol: "☵", bits: [0, 1, 0], pureHexagram: 29 },
  gen: { id: "gen", name: "艮", pinyin: "Gèn", symbol: "☶", bits: [0, 0, 1], pureHexagram: 52 },
  kun: { id: "kun", name: "坤", pinyin: "Kūn", symbol: "☷", bits: [0, 0, 0], pureHexagram: 2 },
} as const;
export function isTrigramId(value: string): value is TrigramId {
  return trigramIds.some(id => id === value);
}
export function trigramSlug(id: TrigramId) { return `trigram-${id}`; }
export function trigramIdFromSlug(slug: string): TrigramId | undefined {
  const id = slug.startsWith("trigram-") ? slug.slice(8) : "";
  return isTrigramId(id) ? id : undefined;
}
