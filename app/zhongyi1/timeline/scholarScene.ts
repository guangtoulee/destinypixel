import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Small, entirely procedural cultural dioramas. Objects are artistic impressions,
 * not measured reconstructions. Coordinates: Y up, positive Z faces the visitor. */
const palette = {
  wood: '#3c3027', woodLight: '#77573a', woodEdge: '#a37e50',
  jade: '#4d7163', jadeLight: '#7c9980', jadeDark: '#294d46',
  paper: '#f2e7cb', paperEdge: '#cdbb91', ink: '#2e3b30',
  stone: '#777669', stoneLight: '#a5a28a', earth: '#a99874',
  bronze: '#b39056', red: '#8e4638', water: '#477f7a',
};
type ColorKey = keyof typeof palette;

/** Merge the hundreds of structural details by material. A complete station is
 * normally under 40 draw calls; only the titled book remains a separate object. */
class DetailBatch {
  readonly root = new THREE.Group();
  private readonly batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();

  material(color: ColorKey | string, roughness = 0.82, metalness = 0): THREE.MeshStandardMaterial {
    const value = color in palette ? palette[color as ColorKey] : color;
    const key = `${value}/${roughness}/${metalness}`;
    let material = this.materials.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color: value, roughness, metalness });
      this.materials.set(key, material);
    }
    return material;
  }

  add(geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3,
    rotation = new THREE.Euler(), scale = new THREE.Vector3(1, 1, 1)) {
    const matrix = new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
    const transformed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    transformed.deleteAttribute('uv');
    transformed.deleteAttribute('uv1');
    transformed.deleteAttribute('color');
    if (!transformed.getAttribute('normal')) transformed.computeVertexNormals();
    transformed.applyMatrix4(matrix);
    const list = this.batches.get(material) ?? [];
    list.push(transformed);
    this.batches.set(material, list);
    geometry.dispose();
  }

  box(x: number, y: number, z: number, w: number, h: number, d: number,
    color: ColorKey | string, rotationY = 0) {
    this.add(new THREE.BoxGeometry(w, h, d), this.material(color), new THREE.Vector3(x, y, z), new THREE.Euler(0, rotationY, 0));
  }

  cylinder(x: number, y: number, z: number, top: number, bottom: number, height: number,
    color: ColorKey | string, radialSegments = 12, rotation = new THREE.Euler()) {
    this.add(new THREE.CylinderGeometry(top, bottom, height, radialSegments), this.material(color), new THREE.Vector3(x, y, z), rotation);
  }

  beam(from: THREE.Vector3, to: THREE.Vector3, radius: number, color: ColorKey | string, radialSegments = 8) {
    const direction = to.clone().sub(from);
    const geometry = new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments);
    const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
    this.add(geometry, this.material(color), from.clone().add(to).multiplyScalar(0.5), rotation);
  }

  tube(points: THREE.Vector3[], radius: number, color: ColorKey | string, segments = 28) {
    const curve = new THREE.CatmullRomCurve3(points);
    this.add(new THREE.TubeGeometry(curve, segments, radius, 5, false), this.material(color), new THREE.Vector3());
  }

  finish() {
    for (const [material, geometries] of this.batches) {
      const merged = mergeGeometries(geometries, false);
      if (merged) {
        const mesh = new THREE.Mesh(merged, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.root.add(mesh);
      }
      geometries.forEach(geometry => geometry.dispose());
    }
    this.batches.clear();
    return this.root;
  }
}

function island(b: DetailBatch, color: ColorKey = 'earth') {
  const outline = new THREE.Shape();
  outline.moveTo(-4.4, -2.7);
  outline.bezierCurveTo(-5.1, -1.2, -4.9, 1.9, -3.9, 2.8);
  outline.bezierCurveTo(-2.3, 3.5, 2.8, 3.5, 4.1, 2.3);
  outline.bezierCurveTo(4.9, 1.3, 4.8, -1.9, 3.9, -2.7);
  outline.bezierCurveTo(1.8, -3.4, -2.6, -3.5, -4.4, -2.7);
  const geometry = new THREE.ExtrudeGeometry(outline, { depth: 0.22, bevelEnabled: true,
    bevelSize: 0.13, bevelThickness: 0.1, bevelSegments: 2, steps: 1, curveSegments: 14 });
  // XY shape becomes XZ ground, with the upper surface at Y 0.22.
  b.add(geometry, b.material(color), new THREE.Vector3(0, 0.22, 0), new THREE.Euler(Math.PI / 2, 0, 0));
}

function rock(b: DetailBatch, x: number, y: number, z: number, sx: number, sy: number, sz: number,
  color: ColorKey = 'jade', seed = 1) {
  const geometry = new THREE.DodecahedronGeometry(1, 0);
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const factor = 1 + Math.sin(i * 7.3 + seed * 11) * 0.1;
    positions.setXYZ(i, positions.getX(i) * factor,
      Math.max(positions.getY(i) * factor, (0.12 - y) / sy), positions.getZ(i) * factor);
  }
  geometry.computeVertexNormals();
  b.add(geometry, b.material(color), new THREE.Vector3(x, y, z), new THREE.Euler(0, seed * 0.8, 0), new THREE.Vector3(sx, sy, sz));
}

function bamboo(b: DetailBatch, x: number, z: number, h = 2.7, seed = 1) {
  const base = new THREE.Vector3(x, 0.25, z);
  const top = new THREE.Vector3(x + 0.12 * Math.sin(seed), h, z + 0.11);
  b.beam(base, top, 0.035, 'jadeDark');
  for (let j = 1; j < 7; j++) {
    const p = base.clone().lerp(top, j / 7);
    b.cylinder(p.x, p.y, p.z, 0.043, 0.043, 0.035, 'bronze', 7);
    if (j > 2) {
      for (let side = -1; side <= 1; side += 2) {
        const tip = p.clone().add(new THREE.Vector3(side * (0.35 + 0.07 * j), 0.2, 0.1 * Math.sin(j + seed)));
        b.beam(p, tip, 0.014, 'jadeDark', 5);
        for (let leaf = 0; leaf < 3; leaf++) {
          const leafStart = p.clone().lerp(tip, 0.35 + leaf * 0.2);
          const g = new THREE.SphereGeometry(1, 5, 3);
          b.add(g, b.material('jade'), leafStart,
            new THREE.Euler(0.2, seed + leaf * 0.7, -side * 0.65), new THREE.Vector3(0.045, 0.3, 0.025));
        }
      }
    }
  }
}

function grass(b: DetailBatch, x: number, z: number, scale = 1) {
  for (let j = 0; j < 5; j++) {
    const a = j * 2.4;
    b.beam(new THREE.Vector3(x, 0.22, z), new THREE.Vector3(x + Math.cos(a) * 0.16 * scale, 0.55 * scale, z + Math.sin(a) * 0.15 * scale), 0.018, j % 2 ? 'jadeLight' : 'jade', 4);
  }
}

function roof(b: DetailBatch, x: number, ridgeY: number, z: number, width: number, depth: number) {
  const vertices: number[] = [];
  const widthSegments = 16;
  const depthSegments = 18;
  const height = (px: number, pz: number) => ridgeY - Math.abs(pz) / (depth / 2) * 0.62
    + Math.pow(Math.abs(pz) / (depth / 2), 5) * 0.26
    + Math.pow(Math.abs(px) / (width / 2), 6) * Math.pow(Math.abs(pz) / (depth / 2), 3) * 0.18;
  const point = (i: number, j: number) => {
    const px = -width / 2 + i / widthSegments * width;
    const pz = -depth / 2 + j / depthSegments * depth;
    return [x + px, height(px, pz), z + pz];
  };
  for (let i = 0; i < widthSegments; i++) for (let j = 0; j < depthSegments; j++) {
    vertices.push(...point(i, j), ...point(i, j + 1), ...point(i + 1, j));
    vertices.push(...point(i + 1, j), ...point(i, j + 1), ...point(i + 1, j + 1));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  const roofMaterial = b.material('jadeDark');
  roofMaterial.side = THREE.DoubleSide;
  b.add(geometry, roofMaterial, new THREE.Vector3());
  // Continuous bowed tile ridges, swept eave lines, and a capped ridge.
  for (let i = 0; i <= Math.floor(width / 0.22); i++) {
    const px = -width / 2 + i / Math.floor(width / 0.22) * width;
    const points = Array.from({ length: 13 }, (_, j) => {
      const pz = -depth / 2 + j / 12 * depth;
      return new THREE.Vector3(x + px, height(px, pz) + 0.025, z + pz);
    });
    b.tube(points, 0.024, 'jade', 18);
  }
  for (const side of [-1, 1]) {
    const pz = side * depth / 2;
    b.tube(Array.from({ length: 9 }, (_, i) => {
      const px = -width / 2 + i / 8 * width;
      return new THREE.Vector3(x + px, height(px, pz), z + pz);
    }), 0.055, 'woodEdge', 16);
  }
  b.beam(new THREE.Vector3(x - width / 2 - 0.08, ridgeY + 0.035, z), new THREE.Vector3(x + width / 2 + 0.08, ridgeY + 0.035, z), 0.07, 'woodEdge');
}

function timberFrame(b: DetailBatch, x: number, z: number, w: number, d: number, eave = 2.75) {
  for (const dx of [-w / 2, w / 2]) for (const dz of [-d / 2, d / 2]) {
    b.cylinder(x + dx, eave / 2 + 0.18, z + dz, 0.09, 0.12, eave, 'wood', 10);
    b.cylinder(x + dx, 0.32, z + dz, 0.19, 0.22, 0.18, 'stoneLight');
    b.box(x + dx, eave - 0.12, z + dz, 0.46, 0.12, 0.24, 'woodLight');
    b.box(x + dx, eave + 0.01, z + dz, 0.65, 0.12, 0.31, 'woodEdge');
  }
  for (const dz of [-d / 2, d / 2]) b.box(x, eave - 0.03, z + dz, w + 0.2, 0.19, 0.16, 'wood');
  for (const dx of [-w / 2, w / 2]) b.box(x + dx, eave - 0.03, z, 0.16, 0.19, d, 'wood');
}

function shelf(b: DetailBatch, x: number, z: number, w = 2.2, h = 2.1, seed = 0) {
  b.box(x, 0.3 + h / 2, z - 0.21, w, h, 0.06, 'woodLight');
  for (const side of [-1, 1]) b.box(x + side * w / 2, 0.3 + h / 2, z, 0.09, h + 0.08, 0.52, 'wood');
  for (let row = 0; row <= 3; row++) {
    const y = 0.3 + row * h / 3;
    b.box(x, y, z, w, 0.075, 0.55, 'wood');
    if (row === 3) continue;
    let cursor = x - w / 2 + 0.13;
    for (let i = 0; i < 12; i++) {
      const bw = 0.085 + ((i + seed + row) % 3) * 0.023;
      if (cursor + bw > x + w / 2 - 0.09) break;
      const bh = 0.36 + ((i * 3 + row + seed) % 5) * 0.043;
      const c: ColorKey = (['jade', 'paperEdge', 'woodEdge', 'jadeDark', 'red'] as ColorKey[])[(i + row * 2 + seed) % 5];
      b.box(cursor + bw / 2, y + 0.045 + bh / 2, z + 0.035, bw, bh, 0.37, c, i % 7 === 0 ? -0.06 : 0);
      b.box(cursor + bw / 2, y + bh * 0.72, z + 0.225, bw * 0.45, bh * 0.34, 0.008, 'paper');
      b.box(cursor + bw / 2, y + bh * 0.22, z + 0.234, bw * 0.8, 0.012, 0.008, 'bronze');
      cursor += bw + 0.027;
    }
  }
}

function table(b: DetailBatch, x: number, z: number, w: number, d: number, y = 1.18) {
  b.box(x, y, z, w, 0.15, d, 'woodLight');
  b.box(x, y - 0.095, z, w + 0.07, 0.06, d + 0.06, 'wood');
  for (const dx of [-w / 2 + 0.16, w / 2 - 0.16]) for (const dz of [-d / 2 + 0.13, d / 2 - 0.13]) {
    b.box(x + dx, y / 2, z + dz, 0.1, y, 0.1, 'wood');
    b.box(x + dx, y - 0.25, z + dz, 0.17, 0.26, 0.17, 'woodEdge');
  }
  b.box(x, 0.42, z, w - 0.25, 0.07, 0.06, 'wood');
  for (let i = 1; i < Math.ceil(w / 0.45); i++) b.box(x - w / 2 + i * 0.45, y + 0.078, z, 0.008, 0.004, d - 0.1, 'wood');
}

function bookStack(b: DetailBatch, x: number, y: number, z: number, count: number, scale = 1) {
  for (let i = 0; i < count; i++) {
    const dx = Math.sin(i * 3.6) * 0.045;
    const angle = Math.sin(i * 1.3) * 0.1;
    b.box(x + dx, y + i * 0.13 * scale, z, 0.77 * scale, 0.1 * scale, 0.48 * scale, 'paperEdge', angle);
    b.box(x + dx, y + (i * 0.13 + 0.054) * scale, z, 0.82 * scale, 0.022 * scale, 0.52 * scale, i % 2 ? 'jadeDark' : 'woodLight', angle);
    for (const side of [-1, 1]) b.box(x + dx + side * 0.25 * scale, y + (i * 0.13 + 0.067) * scale, z, 0.018 * scale, 0.007, 0.53 * scale, 'paper');
  }
}

function scroll(b: DetailBatch, x: number, y: number, z: number, length = 0.8, rotation = 0) {
  const euler = new THREE.Euler(0, rotation, Math.PI / 2);
  b.cylinder(x, y, z, 0.105, 0.105, length, 'paper', 12, euler);
  const dx = Math.cos(rotation) * (length / 2 + 0.025);
  const dz = -Math.sin(rotation) * (length / 2 + 0.025);
  for (const side of [-1, 1]) b.cylinder(x + dx * side, y, z + dz * side, 0.055, 0.055, 0.11, 'woodEdge', 9, euler);
}

function lantern(b: DetailBatch, x: number, y: number, z: number) {
  b.cylinder(x, y, z, 0.15, 0.15, 0.39, 'paper', 10);
  for (const dy of [-0.21, 0.21]) b.cylinder(x, y + dy, z, 0.19, 0.19, 0.045, 'wood', 10);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    b.beam(new THREE.Vector3(x + Math.cos(a) * 0.15, y - 0.2, z + Math.sin(a) * 0.15), new THREE.Vector3(x + Math.cos(a) * 0.15, y + 0.2, z + Math.sin(a) * 0.15), 0.013, 'woodEdge', 4);
  }
  b.beam(new THREE.Vector3(x, y + 0.23, z), new THREE.Vector3(x, y + 0.51, z), 0.018, 'wood');
  b.beam(new THREE.Vector3(x, y - 0.23, z), new THREE.Vector3(x, y - 0.46, z), 0.013, 'red');
}

function inkTexture(title: string, printing = false): THREE.CanvasTexture | undefined {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const c = canvas.getContext('2d');
  if (!c) return undefined;
  c.fillStyle = printing ? '#394235' : '#f0e4c6';
  c.fillRect(0, 0, 1024, 768);
  // Fine paper fibres and restrained double-rule borders.
  for (let i = 0; i < 2300; i++) {
    const x = (i * 173.321) % 1024;
    const y = (i * 97.193) % 768;
    c.fillStyle = `rgba(112,88,48,${0.015 + i % 3 * 0.008})`;
    c.fillRect(x, y, 1 + i % 7, 1);
  }
  c.strokeStyle = printing ? '#bca77e' : '#9e8c64';
  c.lineWidth = 2;
  c.strokeRect(35, 38, 954, 690);
  c.strokeRect(46, 49, 932, 668);
  c.strokeRect(532, 86, 377, 580);
  c.strokeRect(541, 95, 359, 562);
  c.fillStyle = printing ? '#e1d1ae' : '#2f3d32';
  c.font = '56px "Noto Serif SC", "Songti SC", "STSong", serif';
  c.textAlign = 'center';
  const chars = [...title];
  chars.forEach((char, i) => c.fillText(char, 805, 170 + i * Math.min(86, 410 / chars.length)));
  c.font = '21px "Songti SC", serif';
  ['燕', '赵', '医', '脉'].forEach((char, i) => c.fillText(char, 596, 164 + i * 38));
  // Decorative vertical ink marks deliberately contain no quotations or recipes.
  c.strokeStyle = printing ? '#baa780' : '#53604b';
  c.lineWidth = 3;
  for (let col = 0; col < 8; col++) {
    const x = 455 - col * 45;
    c.beginPath(); c.moveTo(x + 10, 113); c.lineTo(x + 10, 645); c.stroke();
    for (let row = 0; row < 14 - col % 3; row++) {
      const y = 133 + row * 34;
      const w = 8 + (col * 3 + row * 7) % 15;
      c.fillStyle = printing ? '#cabb96' : '#53604b';
      c.fillRect(x - 13, y, w, 3);
      c.fillRect(x - 7, y + 7, 2, 11);
      c.fillRect(x - 14, y + 17, w - 2, 2);
    }
  }
  c.strokeStyle = '#914b3a'; c.lineWidth = 3;
  c.strokeRect(850, 598, 39, 40);
  c.beginPath(); c.moveTo(861, 604); c.lineTo(861, 632); c.moveTo(878, 604); c.lineTo(878, 632); c.moveTo(855, 617); c.lineTo(884, 617); c.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function pageSurface(width: number, depth: number) {
  const geometry = new THREE.PlaneGeometry(width, depth, 24, 16);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    positions.setY(i, 0.035 + Math.abs(x / (width / 2)) * 0.105 + Math.pow(Math.abs(x / (width / 2)), 3) * 0.06 + Math.sin(z / depth * Math.PI) * 0.016);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function mainBook(title: string, focusId: string, position: THREE.Vector3, rotationY = 0) {
  const book = new THREE.Group();
  book.name = title;
  book.userData.focusId = focusId;
  book.userData.label = `《${title}》·艺术示意`;
  book.position.copy(position);
  book.rotation.y = rotationY;
  const cover = new THREE.MeshStandardMaterial({ color: palette.jadeDark, roughness: 0.84 });
  const paper = new THREE.MeshStandardMaterial({ color: palette.paperEdge, roughness: 0.95 });
  const width = 2.25, depth = 1.48;
  const lower = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, 0.07, depth + 0.09), cover);
  lower.position.y = -0.045; book.add(lower);
  for (const side of [-1, 1]) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(width / 2 - 0.04, 0.095, depth - 0.02), paper);
    block.position.set(side * width / 4, 0.025, 0); block.rotation.z = side * 0.1; book.add(block);
  }
  const map = inkTexture(title);
  const surface = new THREE.Mesh(pageSurface(width, depth), new THREE.MeshStandardMaterial({
    color: map ? '#ffffff' : palette.paper, ...(map ? { map } : {}), roughness: 0.95, side: THREE.DoubleSide,
  }));
  surface.position.y = 0.063;
  book.add(surface);
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.029, depth, 7), new THREE.MeshStandardMaterial({ color: palette.paperEdge }));
  spine.rotation.x = Math.PI / 2; spine.position.y = 0.1; book.add(spine);
  const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.45), new THREE.MeshStandardMaterial({ color: palette.red, side: THREE.DoubleSide }));
  ribbon.rotation.x = -Math.PI / 2; ribbon.position.set(0.12, 0.1, depth / 2 + 0.12); book.add(ribbon);
  book.traverse(object => { object.userData.focusId = focusId; object.castShadow = true; object.receiveShadow = true; });
  return book;
}

function river(b: DetailBatch) {
  const points = [new THREE.Vector3(-0.5, 0.24, -3.2), new THREE.Vector3(-0.8, 0.24, -1.8),
    new THREE.Vector3(-1.7, 0.24, -0.8), new THREE.Vector3(-1.9, 0.24, 0.5), new THREE.Vector3(-3, 0.24, 2.8)];
  const curve = new THREE.CatmullRomCurve3(points);
  const vertices: number[] = [];
  const edgeA: THREE.Vector3[] = [], edgeB: THREE.Vector3[] = [];
  for (let i = 0; i <= 50; i++) {
    const p = curve.getPoint(i / 50);
    const tangent = curve.getTangent(i / 50);
    const n = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(0.29 + Math.sin(i * 0.2) * 0.05);
    edgeA.push(p.clone().add(n)); edgeB.push(p.clone().sub(n));
  }
  for (let i = 0; i < 50; i++) vertices.push(...edgeA[i].toArray(), ...edgeB[i].toArray(), ...edgeA[i + 1].toArray(), ...edgeA[i + 1].toArray(), ...edgeB[i].toArray(), ...edgeB[i + 1].toArray());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.computeVertexNormals();
  const material = b.material('water', 0.28, 0.18); material.side = THREE.DoubleSide;
  b.add(geometry, material, new THREE.Vector3());
  for (let i = 2; i < 48; i += 4) {
    const p = curve.getPoint(i / 50);
    b.tube([p.clone().add(new THREE.Vector3(-0.1, 0.01, -0.09)), p.clone().add(new THREE.Vector3(0.04, 0.012, 0)), p.clone().add(new THREE.Vector3(0.16, 0.01, 0.04))], 0.008, '#9eb8a0', 6);
  }
  for (let i = 2; i < 48; i += 3) {
    const p = (i % 2 ? edgeA : edgeB)[i];
    rock(b, p.x, 0.26, p.z, 0.15 + i % 3 * 0.04, 0.13, 0.15, 'stoneLight', i);
  }
}

function mountainStudy(b: DetailBatch, group: THREE.Group) {
  island(b, 'jadeLight');
  river(b);
  rock(b, -3.1, 1.5, -2.25, 1.25, 1.9, 0.85, 'jade', 1);
  rock(b, -3.8, 0.85, -1.5, 0.9, 1.25, 0.8, 'jadeDark', 3);
  rock(b, -2.25, 0.82, -2.75, 0.9, 1.2, 0.7, 'jadeLight', 4);
  rock(b, 3.8, 0.7, -2.6, 0.65, 1.0, 0.6, 'jade', 2);
  for (let i = 0; i < 6; i++) {
    const x = -3.7 + i * 0.23;
    b.tube([new THREE.Vector3(x, 1.1, -1.9), new THREE.Vector3(x + 0.07, 1.7, -2), new THREE.Vector3(x + 0.04, 2.1, -2.1)], 0.012, 'jadeLight', 8);
  }
  // Open-sided riverside pavilion on its raised stone platform.
  b.box(1.65, 0.29, -1.05, 3.6, 0.25, 2.9, 'stoneLight');
  for (let i = 0; i < 9; i++) b.box(0.1 + i * 0.38, 0.428, -1.05, 0.36, 0.025, 2.72, 'woodLight');
  timberFrame(b, 1.65, -1.05, 3.15, 2.45, 2.7);
  roof(b, 1.65, 3.39, -1.05, 3.85, 3.14);
  shelf(b, 1.9, -1.95, 2.1, 1.9, 1);
  lantern(b, 0.15, 2.15, 0.02);
  // Low side rail and a bridge with individually capped posts.
  for (let i = 0; i < 6; i++) b.cylinder(3.21, 0.85, -2 + i * 0.37, 0.035, 0.035, 0.78, 'wood');
  b.beam(new THREE.Vector3(3.21, 1.18, -2.2), new THREE.Vector3(3.21, 1.18, 0.02), 0.04, 'wood');
  for (let i = 0; i < 8; i++) b.box(-1.75 + i * 0.15, 0.43 + Math.sin(i / 7 * Math.PI) * 0.14, 0.65, 0.14, 0.09, 1.02, 'woodEdge');
  for (const z of [0.13, 1.17]) b.tube([new THREE.Vector3(-1.85, 0.85, z), new THREE.Vector3(-1.23, 1.02, z), new THREE.Vector3(-0.55, 0.85, z)], 0.035, 'wood', 12);
  for (const x of [-1.8, -0.6]) for (const z of [0.13, 1.17]) b.cylinder(x, 0.64, z, 0.055, 0.055, 0.57, 'wood', 8);
  for (const [x, z, h] of [[3.75, -1.6, 2.7], [3.95, -0.8, 2.4], [-3.7, 0.45, 2.1], [-3.95, 1.2, 1.8]]) bamboo(b, x, z, h, x);
  for (const [x, z] of [[-3, 1.2], [-2.4, 2.3], [-0.5, -2.6], [3.6, 1.9], [2.7, 2.6], [-4, -0.8]]) grass(b, x, z, 0.85);
  table(b, 0.65, 1.85, 3, 1.7, 1.0);
  bookStack(b, 1.75, 1.15, 1.6, 3, 0.65);
  scroll(b, -0.35, 1.2, 1.48, 0.65, 0.2);
  group.add(mainBook('医学启源', 'zhang-book', new THREE.Vector3(0.5, 1.12, 2.03), -0.08));
}

function cityGate(b: DetailBatch) {
  const facade = new THREE.Shape();
  facade.moveTo(-1.45, 0); facade.lineTo(1.45, 0); facade.lineTo(1.45, 2.5); facade.lineTo(-1.45, 2.5); facade.closePath();
  const arch = new THREE.Path();
  arch.moveTo(-0.54, 0); arch.lineTo(-0.54, 1.2); arch.absarc(0, 1.2, 0.54, Math.PI, 0, true); arch.lineTo(0.54, 0); arch.closePath();
  facade.holes.push(arch);
  b.add(new THREE.ExtrudeGeometry(facade, { depth: 0.65, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 1 }), b.material('stone'), new THREE.Vector3(-2.5, 0.23, -2.5));
  for (let row = 0; row < 9; row++) for (let col = 0; col < 6; col++) {
    const x = -3.85 + col * 0.48 + row % 2 * 0.18;
    const y = 0.34 + row * 0.26;
    if (y < 1.9 && Math.abs(x + 2.5) < 0.64) continue;
    if (x > -1.13) continue;
    b.box(x, y, -1.82, 0.435, 0.21, 0.035, row % 3 ? 'stone' : 'stoneLight');
  }
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI - i / 8 * Math.PI;
    const p = new THREE.Vector3(-2.5 + Math.cos(a) * 0.66, 1.43 + Math.sin(a) * 0.66, -1.78);
    b.add(new THREE.BoxGeometry(0.21, 0.18, 0.13), b.material('stoneLight'), p, new THREE.Euler(0, 0, a - Math.PI / 2));
  }
  for (const side of [-1, 1]) {
    b.box(-2.5 + side * 0.65, 0.85, -1.78, 0.2, 1.2, 0.13, 'stoneLight');
    b.box(-2.5 + side * 1.78, 1.05, -2.18, 0.62, 1.7, 0.55, 'stone');
    for (let i = 0; i < 2; i++) b.box(-2.5 + side * (1.55 + i * 0.4), 1.99, -2.18, 0.24, 0.34, 0.58, 'stoneLight');
  }
  b.box(-2.5, 2.85, -2.16, 2.55, 0.6, 0.84, 'wood');
  for (const x of [-3.5, -3.1, -2.7, -2.3, -1.9, -1.5]) b.box(x, 2.88, -1.72, 0.04, 0.42, 0.025, 'woodEdge');
  roof(b, -2.5, 3.55, -2.15, 3.4, 1.5);
  for (let i = 0; i < 4; i++) b.box(-2.5, 0.2 + i * 0.045, -0.15 - i * 0.35, 1.45, 0.12, 0.36, 'stoneLight');
}

function cityStudy(b: DetailBatch, group: THREE.Group) {
  island(b);
  cityGate(b);
  // A half-open bookshop: no front wall obscures the shelves or its work table.
  b.box(1.55, 0.28, -0.75, 4.45, 0.22, 3.48, 'stoneLight');
  for (let i = 0; i < 12; i++) b.box(-0.47 + i * 0.36, 0.405, -0.75, 0.34, 0.025, 3.34, 'woodLight');
  timberFrame(b, 1.55, -0.75, 3.95, 2.94, 3.1);
  roof(b, 1.55, 3.83, -0.75, 4.7, 3.55);
  shelf(b, 0.55, -1.9, 1.7, 2.42, 2);
  shelf(b, 2.45, -1.9, 1.7, 2.42, 3);
  for (let i = 0; i < 7; i++) {
    b.box(3.5, 1.5, -1.85 + i * 0.36, 0.055, 1.85, 0.028, 'wood');
    b.box(3.5, 0.8 + i * 0.24, -0.75, 0.055, 0.025, 2.22, 'wood');
  }
  lantern(b, -0.35, 2.54, 0.7); lantern(b, 3.45, 2.54, 0.7);
  table(b, 0.15, 1.8, 3.4, 1.75, 1.15);
  bookStack(b, 1.35, 1.32, 1.57, 4, 0.67);
  scroll(b, -1.05, 1.34, 1.57, 0.72, -0.1);
  // Round stool and stepped path add depth to the foreground.
  b.cylinder(2.7, 0.72, 1.92, 0.4, 0.4, 0.12, 'woodLight', 18);
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2;
    b.beam(new THREE.Vector3(2.7 + Math.cos(a) * 0.25, 0.25, 1.92 + Math.sin(a) * 0.25), new THREE.Vector3(2.7 + Math.cos(a) * 0.21, 0.69, 1.92 + Math.sin(a) * 0.21), 0.045, 'wood');
  }
  for (let i = 0; i < 7; i++) b.box(-3.6 + i * 0.36, 0.25, 1.0 + i * 0.18, 0.47, 0.05, 0.56, i % 2 ? 'stone' : 'stoneLight', i * 0.06);
  bamboo(b, 4.1, 1.35, 2.4, 2); grass(b, -4.15, 1.9); grass(b, 3.85, 2.45);
  group.add(mainBook('脾胃论', 'li-book', new THREE.Vector3(-0.1, 1.28, 2.02), 0.06));
}

function hangingPage(b: DetailBatch, group: THREE.Group, x: number, y: number, z: number, angle: number, index: number) {
  const geometry = new THREE.PlaneGeometry(0.59, 0.91, 4, 8);
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    const py = position.getY(i);
    position.setZ(i, Math.sin((py + 0.46) * 4.2 + index * 0.7) * 0.055);
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: palette.paper, roughness: 0.94, side: THREE.DoubleSide }));
  mesh.position.set(x, y, z); mesh.rotation.y = angle; mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
  // The actual line marks are small batched pieces, not a separate text texture per sheet.
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 6; row++) {
      const px = x - 0.2 + col * 0.09;
      b.box(px, y + 0.28 - row * 0.105, z + 0.061, 0.041, 0.009, 0.004, 'ink');
    }
  }
  for (const dx of [-0.2, 0.2]) b.box(x + dx, y + 0.47, z, 0.055, 0.1, 0.045, 'woodEdge');
}

function printWorkshop(b: DetailBatch, group: THREE.Group) {
  island(b);
  for (let i = 0; i < 14; i++) b.box(-3.9 + i * 0.58, 0.235, -0.1, 0.56, 0.045, 5.3, i % 3 ? 'woodLight' : 'woodEdge');
  // Open timber canopy at the rear left, contrasting with the other full roofs.
  timberFrame(b, -2.25, -1.72, 2.7, 1.75, 2.9);
  for (let i = 0; i < 10; i++) b.box(-3.85 + i * 0.35, 3.05, -1.72, 0.12, 0.14, 2.3, 'wood');
  b.box(-2.25, 3.17, -2.1, 3.4, 0.035, 1.45, 'paperEdge');
  shelf(b, -2.35, -2.35, 2.3, 1.75, 4);
  // Slender bamboo drying racks with real hanging, gently bent paper surfaces.
  for (const x of [0.55, 3.65]) {
    for (const z of [-2.65, -1.15]) b.cylinder(x, 1.8, z, 0.045, 0.06, 3.15, 'woodEdge', 8);
    b.beam(new THREE.Vector3(x, 3.35, -2.8), new THREE.Vector3(x, 3.35, -0.98), 0.055, 'woodEdge');
    b.beam(new THREE.Vector3(x, 0.4, -2.65), new THREE.Vector3(x, 2.8, -1.15), 0.026, 'wood');
  }
  for (const z of [-2.58, -1.78, -1.13]) {
    b.beam(new THREE.Vector3(0.48, 3.22, z), new THREE.Vector3(3.72, 3.22, z), 0.032, 'woodEdge');
    for (let i = 0; i < 4; i++) hangingPage(b, group, 0.9 + i * 0.76, 2.72, z + 0.03, 0, i);
  }
  table(b, -0.4, 0.1, 5.2, 1.8, 1.22);
  // Carved printing block with a field of tiny relief strokes.
  b.box(-1.65, 1.36, 0.1, 1.75, 0.13, 1.3, 'wood');
  b.box(-1.65, 1.43, 0.1, 1.64, 0.025, 1.2, 'ink');
  for (let col = 0; col < 11; col++) for (let row = 0; row < 9; row++) {
    const x = -2.35 + col * 0.14, z = -0.43 + row * 0.12;
    b.box(x, 1.449, z, 0.073, 0.016, 0.012, 'woodEdge');
    if ((col + row) % 3) b.box(x + 0.02, 1.449, z + 0.024, 0.011, 0.016, 0.045, 'woodEdge');
  }
  // Paper laid on the inked board, with an exposed corner and a brush.
  const proofMap = inkTexture('卫生宝鉴');
  const proof = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.05), new THREE.MeshStandardMaterial({ color: '#ffffff', ...(proofMap ? { map: proofMap } : {}), roughness: 1, side: THREE.DoubleSide }));
  proof.rotation.x = -Math.PI / 2; proof.rotation.z = 0.05; proof.position.set(0.35, 1.315, 0.07); group.add(proof);
  b.box(1.45, 1.35, 0.24, 0.6, 0.12, 0.85, 'stone');
  b.cylinder(1.45, 1.417, 0.34, 0.2, 0.21, 0.014, 'ink', 18);
  b.beam(new THREE.Vector3(0.95, 1.5, -0.45), new THREE.Vector3(1.84, 1.5, -0.16), 0.045, 'woodEdge');
  b.add(new THREE.ConeGeometry(0.09, 0.26, 10), b.material('ink'), new THREE.Vector3(1.94, 1.5, -0.13), new THREE.Euler(0, 0, -Math.PI / 2 + 0.3));
  for (let i = 0; i < 8; i++) b.box(1.15 + (i % 2) * 0.012, 1.33 + i * 0.016, -0.48, 0.83, 0.014, 0.65, 'paper');
  bookStack(b, -3.3, 0.38, 0.9, 6, 0.95);
  scroll(b, -3.4, 1.17, 0.9, 0.8, 0.15);
  table(b, 0.0, 2.04, 2.95, 1.6, 1.02);
  bookStack(b, 1.01, 1.16, 1.95, 3, 0.6);
  lantern(b, -3.45, 2.28, -0.77);
  bamboo(b, 4.15, 0.3, 2.15, 6); grass(b, 3.9, 2.25); grass(b, -3.9, 2.25);
  group.add(mainBook('卫生宝鉴', 'luo-book', new THREE.Vector3(-0.22, 1.14, 2.19), -0.08));
}

/** Shared-lighting scene builder. No renderer, camera, light, network or asset load. */
export function buildScholarScene(variant: 0 | 1 | 2): THREE.Group {
  const group = new THREE.Group();
  group.name = ['易水山亭·艺术意象', '真定书坊·艺术意象', '整理与续传·艺术意象'][variant];
  group.userData.artisticImpression = true;
  const batch = new DetailBatch();
  if (variant === 0) mountainStudy(batch, group);
  else if (variant === 1) cityStudy(batch, group);
  else printWorkshop(batch, group);
  group.add(batch.finish());
  return group;
}
