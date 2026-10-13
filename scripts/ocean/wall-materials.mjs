// Node extras mark physical walls and columns, without matching graphic-panel names.
export function isOceanWall(object) {
  for (let current = object; current; current = current.parent) {
    const data = current.userData || {};
    if (data.oceanWall === true || data.oceanRole === 'wall' || data.oceanRole === 'column') return true;
  }
  return false;
}

export function materialForMuseumView(object, style, original, white, blueWall) {
  return style === 'white' ? (isOceanWall(object) ? blueWall : white) : original;
}
