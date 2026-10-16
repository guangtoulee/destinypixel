function inherited(object, key) {
  for (let current = object; current; current = current.parent) {
    if (current.userData?.[key] !== undefined) return current.userData[key];
  }
  return undefined;
}

export function isOceanWall(object, material) {
  const names = inherited(object, 'oceanWallMaterialNames');
  if (material && (names?.includes(material.name) || /深海蓝结构展墙/.test(material.name || ''))) return true;
  // A source mesh may contain walls, scene plinths and case covers. Its
  // non-wall material slots must never inherit a whole-object blue override.
  if (inherited(object, 'oceanMixedSource')) return false;
  if (inherited(object, 'oceanWall') === true) return true;
  return ['wall', 'column'].includes(inherited(object, 'oceanRole'));
}

export function isOceanGlass(object, material) {
  if (inherited(object, 'oceanGlass') === true) return true;
  if (material && (material.transparent && material.opacity < .995 || material.transmission > .001 || /glass|玻璃|透明/i.test(material.name || ''))) return true;
  for (let current = object; current; current = current.parent) {
    if (String(current.name || '').includes('玻璃')) return true;
    const collection = String(current.userData?.collection || current.userData?.source_collection || '');
    if (/^(?:SU_NEW_)?07[_ ]/.test(collection)) return true;
  }
  return !material && (Array.isArray(object.material) ? object.material : [object.material]).some(m => m && isOceanGlass(object, m));
}

function preserveExhibitMaterial(object, material) {
  return inherited(object, 'oceanWhiteModelEligible') === false || material.map || material.emissiveMap || material.emissive?.getHex() > 0 || /地坪|地面|釉|陶瓷|乌木|沉积木|船肋|装备黄|骨骼|亚克力|屏|文字|灯|光|深海蓝|暗顶炭黑金属/.test(material.name || '');
}

export function materialForMuseumView(object, style, original, white, blueWall) {
  if (style !== 'white') return original;
  const convert = material => isOceanGlass(object, material) ? material : isOceanWall(object, material) ? blueWall : preserveExhibitMaterial(object, material) ? material : white;
  return Array.isArray(original) ? original.map(convert) : convert(original);
}
