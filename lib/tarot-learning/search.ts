/** Search names only: prose and meanings must not create accidental matches. */
export function normalizeTarotSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\p{P}\p{Z}\s]+/gu, " ").trim();
}

export function tarotCardMatches(aliases: readonly string[], query: string): boolean {
  const normalized = normalizeTarotSearch(query);
  if (!normalized) return true;
  // Each word must match a whole word; CJK names may be searched by part.
  // This keeps 1 separate from 10, and ace/sun separate from space/sunset.
  const tokens = normalized.match(/[\p{Script=Han}]+|[^\p{Script=Han}\s]+/gu) ?? [];
  return aliases.some(alias => {
    const name = normalizeTarotSearch(alias);
    const words = name.split(" ");
    return tokens.every(token => /\p{Script=Han}/u.test(token) ? name.includes(token) : words.includes(token));
  });
}
