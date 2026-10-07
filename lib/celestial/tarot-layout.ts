export type TableBounds = { width: number; height: number };
export function freeCardWidth(bounds: TableBounds) {
  return Math.max(24, Math.min(100, bounds.width * .22, (bounds.height - 20) / 2));
}
/** Clamp the rotated rectangle, including room for its selection outline. */
export function constrainCard(x: number, y: number, rotation: number, bounds: TableBounds, width = freeCardWidth(bounds), height = width * 1.72) {
  const radians = rotation * Math.PI / 180;
  const rotatedWidth = Math.abs(Math.cos(radians)) * width + Math.abs(Math.sin(radians)) * height;
  const rotatedHeight = Math.abs(Math.sin(radians)) * width + Math.abs(Math.cos(radians)) * height;
  const extraX = (rotatedWidth - width) / 2, extraY = (rotatedHeight - height) / 2;
  const clamp = (value: number, min: number, max: number) => min > max ? (min + max) / 2 : Math.max(min, Math.min(max, value));
  return {
    x: clamp(x * bounds.width / 100, extraX + 8, bounds.width - width - extraX - 8) / bounds.width * 100,
    y: clamp(y * bounds.height / 100, extraY + 8, bounds.height - height - extraY - 8) / bounds.height * 100,
  };
}
