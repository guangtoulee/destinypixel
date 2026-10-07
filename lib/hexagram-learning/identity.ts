// Rows are upper trigrams, columns lower trigrams. Both bit keys are bottom-up.
// Explicit traditional King Wen order, verified against all 64 approved identities.
const trigrams = ["111", "110", "101", "100", "011", "010", "001", "000"];
export const kingWenTable = [
  [1,10,13,25,44,6,33,12], [43,58,49,17,28,47,31,45],
  [14,38,30,21,50,64,56,35], [34,54,55,51,32,40,62,16],
  [9,61,37,42,57,59,53,20], [5,60,63,3,48,29,39,8],
  [26,41,22,27,18,4,52,23], [11,19,36,24,46,7,15,2],
] as const;
export function kingWenFromBits(bits: readonly number[]): number | undefined {
  if (bits.length !== 6 || bits.some(bit => bit !== 0 && bit !== 1)) return undefined;
  const lower = trigrams.indexOf(bits.slice(0,3).join(""));
  const upper = trigrams.indexOf(bits.slice(3,6).join(""));
  return kingWenTable[upper]?.[lower];
}
export function kingWenFromCast(lines: readonly {yang:boolean}[]) {
  return kingWenFromBits(lines.map(line => line.yang ? 1 : 0));
}
export const hexagramIds = Array.from({length:64}, (_,i) => `hexagram-${String(i+1).padStart(2,"0")}`);
export function hexagramNumber(slug:string):number|undefined {
  return /^hexagram-(0[1-9]|[1-5][0-9]|6[0-4])$/.test(slug) ? Number(slug.slice(-2)) : undefined;
}
export function hexagramSymbol(number:number) { return String.fromCodePoint(0x4dc0+number-1); }
