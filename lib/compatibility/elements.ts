export const fiveElements = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
export type FiveElement = typeof fiveElements[number];
export type ElementConnection = { kind: "same" | "nourishes" | "controls"; source: 0 | 1; target: 0 | 1; sourceElement: FiveElement; targetElement: FiveElement };
const produces: Record<FiveElement, FiveElement> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
const controls: Record<FiveElement, FiveElement> = { Wood: "Earth", Earth: "Water", Water: "Fire", Fire: "Metal", Metal: "Wood" };
/** Direction is essential: 土生金 is not 金生土. Keep it separate from the symmetric score. */
export function elementConnection(a: string, b: string): ElementConnection {
  if (!fiveElements.includes(a as FiveElement) || !fiveElements.includes(b as FiveElement)) throw new Error("Unknown day element");
  const x = a as FiveElement, y = b as FiveElement;
  if (x === y) return { kind: "same", source: 0, target: 1, sourceElement: x, targetElement: y };
  if (produces[x] === y) return { kind: "nourishes", source: 0, target: 1, sourceElement: x, targetElement: y };
  if (produces[y] === x) return { kind: "nourishes", source: 1, target: 0, sourceElement: y, targetElement: x };
  if (controls[x] === y) return { kind: "controls", source: 0, target: 1, sourceElement: x, targetElement: y };
  return { kind: "controls", source: 1, target: 0, sourceElement: y, targetElement: x };
}
