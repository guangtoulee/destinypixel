import * as THREE from 'three';

/** A cultural landscape, deliberately not an archaeological reconstruction. */
export function buildFuxiScene(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'fuxi-cultural-landscape';
  root.userData.artisticInterpretation = true;

  const random = seededRandom(1836);
  const stoneTexture = makeStoneTexture();
  const materials = {
    stone: new THREE.MeshStandardMaterial({ color: '#b3b9a0', map: stoneTexture, roughness: 0.94 }),
    pale: new THREE.MeshStandardMaterial({ color: '#d4d3b7', map: stoneTexture, roughness: 0.9 }),
    edge: new THREE.MeshStandardMaterial({ color: '#526f64', roughness: 1 }),
    earth: new THREE.MeshStandardMaterial({ color: '#244a43', roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ color: '#355b57', map: stoneTexture, roughness: 0.98 }),
    rockLight: new THREE.MeshStandardMaterial({ color: '#597b6b', roughness: 0.98 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#a18b52', metalness: 0.7, roughness: 0.46 }),
    bronzeDark: new THREE.MeshStandardMaterial({ color: '#447a6d', metalness: 0.52, roughness: 0.6 }),
    gold: new THREE.MeshStandardMaterial({ color: '#d3ba78', metalness: 0.62, roughness: 0.4 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#5c6550', roughness: 0.95 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#3c7663', roughness: 0.93 }),
    leafLight: new THREE.MeshStandardMaterial({ color: '#668d6b', roughness: 0.93 }),
    grass: new THREE.MeshStandardMaterial({ color: '#75916b', roughness: 1, side: THREE.DoubleSide }),
    water: new THREE.MeshStandardMaterial({ color: '#629e91', metalness: 0.3, roughness: 0.32 }),
    ripple: new THREE.MeshStandardMaterial({ color: '#a3c9ae', metalness: 0.3, roughness: 0.44 }),
  };
  const land = new GeometryBatch();

  // The top stays at y = 0; irregular strata give the floating island real depth.
  const island = new THREE.CylinderGeometry(4.65, 3.65, 0.9, 56, 3);
  const islandPosition = island.getAttribute('position');
  for (let i = 0; i < islandPosition.count; i += 1) {
    const x = islandPosition.getX(i);
    const z = islandPosition.getZ(i);
    const a = Math.atan2(z, x);
    const f = 1 + Math.sin(a * 5 + 0.4) * 0.045 + Math.cos(a * 9) * 0.028;
    islandPosition.setXYZ(i, x * f, islandPosition.getY(i), z * f * 0.84);
  }
  island.computeVertexNormals();
  land.add(island, materials.earth, [0, -0.48, 0]);
  land.add(new THREE.CylinderGeometry(4.67, 4.54, 0.16, 56), materials.edge, [0, -0.1, 0], [0, 0, 0], [1, 1, 0.84]);
  land.add(new THREE.CylinderGeometry(4.56, 4.63, 0.08, 56), materials.stone, [0, -0.02, 0], [0, 0, 0], [1, 1, 0.84]);

  // An octagonal altar with individually cut radial paving stones and front steps.
  land.add(new THREE.CylinderGeometry(2.38, 2.45, 0.13, 8), materials.edge, [0, 0.06, -0.45], [0, Math.PI / 8, 0]);
  land.add(new THREE.CylinderGeometry(2.22, 2.29, 0.15, 8), materials.pale, [0, 0.17, -0.45], [0, Math.PI / 8, 0]);
  land.add(new THREE.CylinderGeometry(2.06, 2.13, 0.14, 8), materials.stone, [0, 0.31, -0.45], [0, Math.PI / 8, 0]);
  land.add(new THREE.CylinderGeometry(1.91, 1.98, 0.08, 8), materials.pale, [0, 0.42, -0.45], [0, Math.PI / 8, 0]);
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    const curve = new THREE.LineCurve3(new THREE.Vector3(Math.sin(a) * 0.42, 0.468, Math.cos(a) * 0.42 - 0.45), new THREE.Vector3(Math.sin(a) * 1.87, 0.468, Math.cos(a) * 1.87 - 0.45));
    land.add(new THREE.TubeGeometry(curve, 1, 0.009, 3, false), materials.edge);
  }
  for (let i = 0; i < 3; i += 1) {
    land.add(new THREE.BoxGeometry(1.52 + i * 0.17, 0.11, 0.33), i % 2 ? materials.stone : materials.pale, [0, 0.33 - i * 0.11, 1.43 + i * 0.27]);
  }
  const floorRing = new THREE.TorusGeometry(1.62, 0.017, 4, 80);
  land.add(floorRing, materials.bronzeDark, [0, 0.472, -0.45], [-Math.PI / 2, 0, 0]);

  // The primary exhibit is a supported, freestanding ring, rather than a flat decal.
  const ring = new THREE.Group();
  ring.name = 'eight-trigram-bronze-ring';
  ring.userData.focusId = 'fuxi-ring';
  ring.position.set(0, 2.13, -0.24);
  const ringBatch = new GeometryBatch();
  ringBatch.add(new THREE.TorusGeometry(1.36, 0.075, 10, 88), materials.bronze);
  ringBatch.add(new THREE.TorusGeometry(1.15, 0.025, 6, 80), materials.bronzeDark);
  ringBatch.add(new THREE.TorusGeometry(1.48, 0.015, 5, 88), materials.gold);
  const trigrams = [
    [1, 1, 1], [0, 1, 1], [0, 1, 0], [0, 0, 1],
    [0, 0, 0], [1, 0, 0], [1, 0, 1], [1, 1, 0],
  ];
  trigrams.forEach((lines, index) => {
    const angle = (index * Math.PI) / 4;
    const frame = new THREE.Object3D();
    frame.position.set(Math.sin(angle) * 1.01, Math.cos(angle) * 1.01, 0.02);
    frame.rotation.z = -angle;
    frame.updateMatrix();
    lines.forEach((solid, row) => {
      const y = (row - 1) * 0.084;
      if (solid) {
        ringBatch.addWithMatrix(new THREE.BoxGeometry(0.32, 0.045, 0.065), materials.gold, new THREE.Matrix4().multiplyMatrices(frame.matrix, new THREE.Matrix4().makeTranslation(0, y, 0)));
      } else {
        [-1, 1].forEach((side) => ringBatch.addWithMatrix(new THREE.BoxGeometry(0.125, 0.045, 0.065), materials.gold, new THREE.Matrix4().multiplyMatrices(frame.matrix, new THREE.Matrix4().makeTranslation(side * 0.098, y, 0))));
      }
    });
    // Delicate ray brackets and cast rivets make the ring read as an object.
    ringBatch.add(new THREE.SphereGeometry(0.039, 6, 5), materials.bronzeDark, [Math.sin(angle) * 1.36, Math.cos(angle) * 1.36, 0.072]);
  });
  // Small, sculpted yin-yang emblem suspended in the open central void.
  const emblem = new THREE.Shape();
  emblem.absarc(0, 0, 0.36, -Math.PI / 2, Math.PI / 2, false);
  emblem.absarc(0, 0.18, 0.18, Math.PI / 2, -Math.PI / 2, true);
  emblem.absarc(0, -0.18, 0.18, Math.PI / 2, -Math.PI / 2, false);
  const emblemGeometry = new THREE.ExtrudeGeometry(emblem, { depth: 0.052, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.013, bevelThickness: 0.013, curveSegments: 18 });
  ringBatch.add(emblemGeometry, materials.bronze);
  ringBatch.add(emblemGeometry.clone(), materials.bronzeDark, [0, 0, 0], [0, 0, Math.PI]);
  ringBatch.add(new THREE.SphereGeometry(0.052, 8, 6), materials.bronzeDark, [0, 0.18, 0.067]);
  ringBatch.add(new THREE.SphereGeometry(0.052, 8, 6), materials.gold, [0, -0.18, 0.067]);
  ringBatch.add(new THREE.TorusGeometry(0.4, 0.018, 5, 48), materials.gold);
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    ringBatch.add(new THREE.CylinderGeometry(0.008, 0.008, 0.58, 3), materials.bronzeDark, [Math.sin(a) * 0.63, Math.cos(a) * 0.63, 0], [0, 0, -a]);
  }
  ringBatch.finish(ring);
  root.add(ring);
  [-1, 1].forEach((side) => {
    land.add(new THREE.CylinderGeometry(0.16, 0.24, 0.17, 8), materials.edge, [side * 0.92, 0.55, -0.24]);
    land.add(new THREE.CylinderGeometry(0.1, 0.15, 0.68, 10), materials.bronzeDark, [side * 0.92, 0.96, -0.24]);
    land.add(new THREE.TorusGeometry(0.14, 0.024, 5, 20), materials.bronze, [side * 0.92, 0.71, -0.24], [Math.PI / 2, 0, 0]);
  });

  // Broken ink-green ridges frame the back, leaving the ring silhouette readable.
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rocks: [number, number, number, number, number, number][] = [
    [-3.2, 0.8, -1.5, 0.75, 1.25, 0.7], [-2.55, 1.21, -2.12, 0.71, 1.9, 0.69],
    [-1.77, 0.82, -2.45, 0.6, 1.27, 0.58], [-3.6, 0.36, -0.83, 0.61, 0.6, 0.54],
    [1.82, 0.35, -2.5, 0.77, 0.54, 0.57], [3.45, 0.55, -1.65, 0.69, 0.88, 0.59],
    [3.69, 0.28, -0.8, 0.55, 0.46, 0.55], [3.3, 0.18, 1.49, 0.6, 0.3, 0.39],
  ];
  rocks.forEach(([x, y, z, sx, sy, sz], i) => land.add(rockGeometry.clone(), i % 3 ? materials.rock : materials.rockLight, [x, y, z], [0.08, i * 0.8, -0.17 + i * 0.045], [sx, sy, sz]));
  for (let i = 0; i < 25; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 3.7 + random() * 0.58;
    const size = 0.09 + random() * 0.2;
    land.add(rockGeometry.clone(), i % 2 ? materials.rock : materials.rockLight, [Math.cos(angle) * radius, size * 0.25, Math.sin(angle) * radius * 0.83], [random(), random() * 3, random()], [size * 1.5, size, size]);
  }

  // A gnarled pine at the back right balances the stone ridges on the left.
  addOldPine(land, materials, [2.64, 0.1, -1.52]);
  addPine(land, materials, [-3.47, 0.05, 0.78], 0.92);
  addPine(land, materials, [-3.0, 0.06, 1.18], 0.63);
  addPine(land, materials, [3.65, 0.05, 0.56], 0.67);
  addPine(land, materials, [1.57, 0.04, -2.97], 0.7);

  // A turquoise, inset stream winds across the foreground, with uneven stones.
  const streamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.1, 0.039, 0.56), new THREE.Vector3(-2.45, 0.039, 1.42),
    new THREE.Vector3(-1.48, 0.039, 2.35), new THREE.Vector3(0.11, 0.039, 2.71),
    new THREE.Vector3(1.62, 0.039, 2.02), new THREE.Vector3(3.9, 0.039, 1.02),
  ]);
  land.add(ribbonGeometry(streamCurve, 0.32, 64), materials.water);
  [-1, 1].forEach((side) => {
    const points = streamCurve.getPoints(64).map((point, i) => {
      const tangent = streamCurve.getTangent(i / 64);
      return point.add(new THREE.Vector3(-tangent.z, 0.005, tangent.x).multiplyScalar(side * 0.175));
    });
    land.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.019, 4), materials.edge);
  });
  for (let i = 0; i < 8; i += 1) {
    const point = streamCurve.getPoint(0.12 + i * 0.105);
    land.add(new THREE.TorusGeometry(0.065 + (i % 3) * 0.023, 0.006, 3, 18, Math.PI * 1.15), materials.ripple, [point.x, 0.048, point.z], [-Math.PI / 2, 0, i * 0.8]);
  }
  for (let i = 0; i < 4; i += 1) {
    land.add(new THREE.CylinderGeometry(0.18, 0.21, 0.065, 7), materials.pale, [-0.43 + i * 0.29, 0.087, 2.6 - i * 0.11], [0, i * 0.7, 0], [1, 1, 0.75]);
  }

  // Fine grasses, a few fern fans, and copper votive disks are all actual geometry.
  const blade = new THREE.BufferGeometry();
  blade.setAttribute('position', new THREE.Float32BufferAttribute([-0.018, 0, 0, 0.018, 0, 0, 0.025, 0.24, 0.035], 3));
  blade.computeVertexNormals();
  for (let i = 0; i < 145; i += 1) {
    const a = random() * Math.PI * 2;
    const r = 2.55 + random() * 1.55;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.8;
    if (z > 1.25 && Math.abs(x) < 2.7) continue;
    const scale = 0.45 + random() * 0.85;
    land.add(blade.clone(), materials.grass, [x, 0.055, z], [0, random() * Math.PI * 2, (random() - 0.5) * 0.4], [scale, scale, scale]);
  }
  for (let i = 0; i < 5; i += 1) {
    const angle = (i * Math.PI) / 4 + 0.25;
    const x = Math.cos(angle) * 2.55;
    const z = Math.sin(angle) * 2.5;
    for (let j = 0; j < 5; j += 1) {
      const leaf = new THREE.SphereGeometry(1, 6, 4);
      land.add(leaf, j % 2 ? materials.leaf : materials.leafLight, [x + Math.sin(j) * 0.12, 0.15 + j * 0.025, z + Math.cos(j) * 0.12], [0.4, j * 1.2, -0.55], [0.045, 0.28, 0.12]);
    }
  }
  // A quiet pair of short marker columns, not a reconstructed historic building.
  [-1, 1].forEach((side) => {
    land.add(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 8), materials.pale, [side * 2.2, 0.12, 0.78]);
    land.add(new THREE.CylinderGeometry(0.1, 0.14, 0.64, 10), materials.edge, [side * 2.2, 0.48, 0.78]);
    land.add(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 10), materials.bronze, [side * 2.2, 0.83, 0.78]);
    land.add(new THREE.SphereGeometry(0.13, 10, 6), materials.bronzeDark, [side * 2.2, 0.92, 0.78], [0, 0, 0], [1, 0.7, 1]);
  });
  land.finish(root);
  return root;
}

type Palette = {
  trunk: THREE.Material;
  leaf: THREE.Material;
  leafLight: THREE.Material;
  rock: THREE.Material;
};
type Triple = [number, number, number];

function addPine(batch: GeometryBatch, palette: Palette, position: Triple, scale: number) {
  const [x, y, z] = position;
  batch.add(new THREE.CylinderGeometry(0.035 * scale, 0.08 * scale, 1.1 * scale, 6), palette.trunk, [x, y + 0.55 * scale, z]);
  for (let level = 0; level < 4; level += 1) {
    const radius = (0.48 - level * 0.087) * scale;
    const geometry = new THREE.ConeGeometry(radius, 0.58 * scale, 7, 1);
    batch.add(geometry, level % 2 ? palette.leafLight : palette.leaf, [x, y + (0.65 + level * 0.25) * scale, z], [0, level * 0.52, -0.025]);
  }
}

function addOldPine(batch: GeometryBatch, palette: Palette, position: Triple) {
  const base = new THREE.Vector3(...position);
  const trunkPoints = [[0, 0, 0], [-0.1, 0.65, 0.03], [0.04, 1.4, -0.08], [-0.24, 2.07, 0.05], [-0.11, 2.9, 0.11]].map((v) => new THREE.Vector3(v[0], v[1], v[2]).add(base));
  const trunkCurve = new THREE.CatmullRomCurve3(trunkPoints);
  batch.add(new THREE.TubeGeometry(trunkCurve, 14, 0.125, 7), palette.trunk);
  for (let i = 0; i < 5; i += 1) {
    const a = i * 1.256;
    const end = base.clone().add(new THREE.Vector3(Math.cos(a) * 0.65, 0.04, Math.sin(a) * 0.44));
    const curve = new THREE.CatmullRomCurve3([base.clone().add(new THREE.Vector3(0, 0.4, 0)), base.clone().add(new THREE.Vector3(Math.cos(a) * 0.23, 0.13, Math.sin(a) * 0.18)), end]);
    batch.add(new THREE.TubeGeometry(curve, 6, 0.055, 5), palette.trunk);
  }
  const branches: [Triple, Triple, Triple, number][] = [
    [[-0.04, 1.23, 0], [0.72, 1.7, 0.1], [1.17, 1.9, 0.03], 0.76],
    [[-0.05, 1.58, 0], [-0.63, 1.98, 0.24], [-1.0, 2.15, 0.33], 0.7],
    [[-0.2, 2.03, 0], [0.35, 2.44, -0.39], [0.69, 2.53, -0.47], 0.7],
    [[-0.18, 2.48, 0.08], [-0.63, 2.8, 0], [-0.74, 2.96, -0.02], 0.63],
    [[-0.12, 2.8, 0.1], [0.1, 3.08, 0.12], [0.35, 3.17, 0.12], 0.62],
  ];
  branches.forEach(([start, mid, end, width], i) => {
    const points = [start, mid, end].map((v) => new THREE.Vector3(...v).add(base));
    batch.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 8, 0.058 - i * 0.005, 5), palette.trunk);
    // Flattened, overlapping, faceted foliage clusters form the old pine canopy.
    for (let j = 0; j < 4; j += 1) {
      const tip = points[2];
      batch.add(new THREE.IcosahedronGeometry(1, 1), (i + j) % 3 ? palette.leaf : palette.leafLight, [tip.x + Math.cos(j * 2.1) * width * 0.35, tip.y + j * 0.055, tip.z + Math.sin(j * 2.1) * width * 0.3], [0, i + j, 0], [width * 0.69, 0.18 + j * 0.02, width * 0.58]);
    }
  });
}

/** Bakes transforms and merges static geometry by material to keep draw calls low. */
class GeometryBatch {
  private buckets = new Map<THREE.Material, { positions: number[]; normals: number[]; uvs: number[] }>();

  add(geometry: THREE.BufferGeometry, material: THREE.Material, position: Triple = [0, 0, 0], rotation: Triple = [0, 0, 0], scale: Triple = [1, 1, 1]) {
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale));
    this.addWithMatrix(geometry, material, matrix);
  }

  addWithMatrix(source: THREE.BufferGeometry, material: THREE.Material, matrix: THREE.Matrix4) {
    const geometry = source.index ? source.toNonIndexed() : source.clone();
    geometry.applyMatrix4(matrix);
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    const uv = geometry.getAttribute('uv');
    const bucket = this.buckets.get(material) ?? { positions: [], normals: [], uvs: [] };
    for (let i = 0; i < position.count; i += 1) {
      bucket.positions.push(position.getX(i), position.getY(i), position.getZ(i));
      bucket.normals.push(normal?.getX(i) ?? 0, normal?.getY(i) ?? 1, normal?.getZ(i) ?? 0);
      bucket.uvs.push(uv?.getX(i) ?? 0, uv?.getY(i) ?? 0);
    }
    this.buckets.set(material, bucket);
    geometry.dispose();
    source.dispose();
  }

  finish(parent: THREE.Group) {
    this.buckets.forEach((bucket, material) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bucket.normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(bucket.uvs, 2));
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
    });
    this.buckets.clear();
  }
}

function ribbonGeometry(curve: THREE.Curve<THREE.Vector3>, width: number, segments: number) {
  const vertices: number[] = [];
  for (let i = 0; i < segments; i += 1) {
    const pairs = [i / segments, (i + 1) / segments].map((t) => {
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
      return [point.clone().add(normal), point.clone().sub(normal)];
    });
    [pairs[0][0], pairs[1][0], pairs[0][1], pairs[0][1], pairs[1][0], pairs[1][1]].forEach((v) => vertices.push(v.x, v.y, v.z));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

function makeStoneTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const random = seededRandom(42);
  context.fillStyle = '#d7d5bc';
  context.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2900; i += 1) {
    context.fillStyle = `rgba(50,75,59,${random() * 0.095})`;
    context.fillRect(random() * 256, random() * 256, random() * 2.5 + 0.3, random() * 1.4 + 0.3);
  }
  for (let i = 0; i < 13; i += 1) {
    context.strokeStyle = `rgba(58,87,69,${0.025 + random() * 0.04})`;
    context.lineWidth = 0.6 + random() * 1.2;
    const y = random() * 256;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(80, y - 15, 150, y + 20, 256, y + 9);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}
