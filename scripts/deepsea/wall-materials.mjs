// Node extras mark physical walls and columns, without matching graphic-panel names.
export function isOceanWall(object) {
  for (let current = object; current; current = current.parent) {
    const data = current.userData || {};
    if (data.oceanWall === true || data.oceanRole === 'wall' || data.oceanRole === 'column') return true;
  }
  return false;
}

export function isOceanGlass(object) {
  for (let current = object; current; current = current.parent) {
    if (String(current.name || '').includes('玻璃')) return true;
    const collection = String(current.userData?.collection || current.userData?.source_collection || '');
    if (/^07[_ ]/.test(collection)) return true;
  }
  return false;
}

export function materialForMuseumView(object, style, original, white, blueWall) {
  return style === 'white' && !isOceanGlass(object) ? (isOceanWall(object) ? blueWall : white) : original;
}
