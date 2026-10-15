import * as THREE from 'three';

/** An imagined contemporary gallery, rather than a reconstruction of an actual museum. */
export function buildModernScene(): THREE.Group {
  const scene = new THREE.Group();
  scene.name = 'contemporary-inheritance-gallery';

  const stone = new THREE.MeshStandardMaterial({ color: '#e4e2d4', roughness: 0.7 });
  const edgeStone = new THREE.MeshStandardMaterial({ color: '#aebfb4', roughness: 0.65 });
  const ivory = new THREE.MeshStandardMaterial({ color: '#f6efdc', roughness: 0.42 });
  const jade = new THREE.MeshStandardMaterial({ color: '#315d54', roughness: 0.4, metalness: 0.17 });
  const paleJade = new THREE.MeshStandardMaterial({ color: '#78978b', roughness: 0.51 });
  const darkWood = new THREE.MeshStandardMaterial({ color: '#3d352c', roughness: 0.57 });
  const bronze = new THREE.MeshStandardMaterial({ color: '#b39459', roughness: 0.32, metalness: 0.78 });
  const paper = new THREE.MeshStandardMaterial({ color: '#efe4c9', roughness: 0.88, side: THREE.DoubleSide });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#b6d3c8', metalness: 0.02, roughness: 0.12, transmission: 0.35,
    transparent: true, opacity: 0.2, thickness: 0.05, depthWrite: false,
  });
  const warmLine = new THREE.MeshStandardMaterial({
    color: '#d8bc7e', emissive: '#bd9955', emissiveIntensity: 0.45,
    roughness: 0.3, metalness: 0.45,
  });

  function addMesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = scene) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function box(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
    const mesh = addMesh(new THREE.BoxGeometry(w, h, d), material, parent);
    mesh.position.set(x, y, z);
    return mesh;
  }

  function ring(radius: number, tube: number, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
    const mesh = addMesh(new THREE.TorusGeometry(radius, tube, 8, 96), material, parent);
    mesh.position.set(x, y, z);
    return mesh;
  }

  function tube(points: THREE.Vector3[], width: number, material: THREE.Material, parent: THREE.Object3D = scene) {
    return addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 56, width, 6, false), material, parent);
  }

  function arcRibbon(radius: number, bottom: number, height: number, start: number, end: number, depth: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    const segments = 70;
    for (let i = 0; i <= segments; i++) {
      const angle = start + (end - start) * i / segments;
      const x = Math.sin(angle) * radius;
      const y = -Math.cos(angle) * radius;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    for (let i = segments; i >= 0; i--) {
      const angle = start + (end - start) * i / segments;
      shape.lineTo(Math.sin(angle) * (radius + depth), -Math.cos(angle) * (radius + depth));
    }
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 40 });
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, bottom + height, 0);
    return addMesh(geometry, material);
  }

  function ellipseInlay(rx: number, rz: number, y: number, material: THREE.Material, radius = 0.018) {
    const points = Array.from({ length: 97 }, (_, i) => {
      const a = i / 96 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * rx, y, Math.sin(a) * rz);
    });
    tube(points, radius, material);
  }

  // Three hovering stone courses and fine bronze reveals give the gallery a sculpted silhouette.
  const footing = addMesh(new THREE.CylinderGeometry(4.65, 4.76, 0.2, 96), edgeStone);
  footing.scale.z = 0.78;
  footing.position.y = 0.12;
  const reveal = addMesh(new THREE.CylinderGeometry(4.57, 4.63, 0.1, 96), bronze);
  reveal.scale.z = 0.78;
  reveal.position.y = 0.24;
  const floor = addMesh(new THREE.CylinderGeometry(4.53, 4.6, 0.18, 96), stone);
  floor.scale.z = 0.78;
  floor.position.y = 0.36;
  ellipseInlay(4.24, 3.25, 0.456, bronze);
  ellipseInlay(4.08, 3.1, 0.457, paleJade, 0.008);

  // Open curved rear wall; vertical fins are instanced to keep the gallery inexpensive to draw.
  arcRibbon(3.62, 0.45, 0.4, -1.27, 1.27, 0.25, jade);
  arcRibbon(3.65, 2.8, 0.12, -1.27, 1.27, 0.29, ivory);
  arcRibbon(3.7, 2.93, 0.025, -1.27, 1.27, 0.19, bronze);
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.095, 1.94, 0.24), paleJade, 35);
  const transform = new THREE.Object3D();
  for (let i = 0; i < 35; i++) {
    const angle = -1.23 + 2.46 * i / 34;
    transform.position.set(Math.sin(angle) * 3.76, 1.83, -Math.cos(angle) * 3.76);
    transform.rotation.set(0, -angle, 0);
    transform.updateMatrix();
    fins.setMatrixAt(i, transform.matrix);
  }
  fins.castShadow = true;
  fins.receiveShadow = true;
  scene.add(fins);

  // A circular light aperture is architectural geometry, with a clear opening into the distance.
  const moon = new THREE.Group();
  moon.position.set(0.75, 2.41, -2.78);
  moon.rotation.y = -0.08;
  scene.add(moon);
  ring(1.62, 0.105, ivory, 0, 0, 0, moon);
  ring(1.48, 0.025, warmLine, 0, 0, 0.04, moon);
  ring(1.76, 0.025, bronze, 0, 0, -0.035, moon);
  const moonFoot = addMesh(new THREE.CylinderGeometry(0.29, 0.41, 0.47, 32), stone, moon);
  moonFoot.position.set(0, -1.69, 0);

  // Copper book-veins travel through the stone floor to connect the stages of transmission.
  tube([
    new THREE.Vector3(-4.25, 0.48, 0.95), new THREE.Vector3(-2.9, 0.48, 0.42),
    new THREE.Vector3(-1.2, 0.48, -0.9), new THREE.Vector3(0.5, 0.48, -1.23),
    new THREE.Vector3(2.2, 0.48, -0.3), new THREE.Vector3(3.9, 0.48, 1.25),
  ], 0.032, bronze);
  tube([
    new THREE.Vector3(-3.5, 0.48, 1.67), new THREE.Vector3(-1.7, 0.48, 1.15),
    new THREE.Vector3(0.2, 0.48, 1.6), new THREE.Vector3(2.5, 0.48, 1.85),
    new THREE.Vector3(3.85, 0.48, 0.86),
  ], 0.013, bronze);

  // An abstract growing manuscript: sweeping stems with paper and jade leaves, no imagined portrait.
  const sculpture = new THREE.Group();
  sculpture.position.set(-2.6, 0.48, -0.95);
  sculpture.rotation.y = -0.28;
  scene.add(sculpture);
  const sculptureBase = addMesh(new THREE.CylinderGeometry(0.76, 0.86, 0.22, 48), ivory, sculpture);
  sculptureBase.position.y = 0.11;
  const sculptureRim = ring(0.71, 0.025, bronze, 0, 0.23, 0, sculpture);
  sculptureRim.rotation.x = Math.PI / 2;
  const stems = [
    [new THREE.Vector3(0, 0.22, 0), new THREE.Vector3(-0.28, 1.04, 0), new THREE.Vector3(0.07, 1.9, 0.08), new THREE.Vector3(0.28, 3.22, 0)],
    [new THREE.Vector3(-0.1, 0.67, 0.02), new THREE.Vector3(-0.54, 1.28, 0.12), new THREE.Vector3(-0.78, 2.19, 0.17)],
    [new THREE.Vector3(0, 1.35, 0), new THREE.Vector3(0.6, 1.95, -0.08), new THREE.Vector3(0.9, 2.65, 0.1)],
  ];
  stems.forEach((points, i) => tube(points, i === 0 ? 0.057 : 0.034, bronze, sculpture));
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(-0.42, 0.15, -0.42, 0.72, 0, 0.93);
  leafShape.bezierCurveTo(0.42, 0.72, 0.42, 0.15, 0, 0);
  const leafGeometry = new THREE.ExtrudeGeometry(leafShape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, steps: 1 });
  const leafPlacements = [
    [-0.24, 0.96, 0.02, 0.9, 0.2], [0, 1.4, 0, -0.85, -0.1],
    [-0.57, 1.59, 0.12, 0.75, -0.15], [-0.7, 1.99, 0.16, -0.45, 0.12],
    [0.43, 1.94, -0.03, -0.85, 0.28], [0.73, 2.38, 0.07, -0.6, -0.3],
    [0.17, 2.27, 0.05, 0.76, 0.1], [0.24, 2.78, 0.01, -0.25, -0.1],
  ];
  leafPlacements.forEach(([x, y, z, tilt, yaw], i) => {
    const leaf = addMesh(leafGeometry, i % 3 === 0 ? jade : ivory, sculpture);
    leaf.position.set(x, y, z);
    leaf.rotation.set(0.12, yaw, tilt);
    leaf.scale.setScalar(i === 7 ? 0.66 : 0.83);
    const seam = tube([new THREE.Vector3(0, 0.1, 0.06), new THREE.Vector3(0, 0.46, 0.07), new THREE.Vector3(0, 0.78, 0.06)], 0.009, bronze, leaf);
    seam.castShadow = false;
  });

  // Hero exhibit: an open teaching book on a carved jade lectern inside a light glass canopy.
  const mainBook = new THREE.Group();
  mainBook.name = 'modern-book';
  mainBook.userData.focusId = 'modern-book';
  mainBook.position.set(0.15, 0.46, 1.05);
  mainBook.rotation.y = -0.12;
  scene.add(mainBook);
  const base = addMesh(new THREE.CylinderGeometry(1.22, 1.37, 0.18, 64), edgeStone, mainBook);
  base.scale.z = 0.72;
  base.position.y = 0.09;
  const podium = addMesh(new THREE.CylinderGeometry(0.89, 1.08, 0.79, 4), jade, mainBook);
  podium.rotation.y = Math.PI / 4;
  podium.scale.z = 0.75;
  podium.position.y = 0.55;
  box(2.12, 0.055, 1.43, bronze, 0, 0.98, 0, mainBook);
  box(2.08, 0.09, 1.39, darkWood, 0, 1.045, 0, mainBook);
  const book = new THREE.Group();
  book.position.set(0, 1.13, -0.03);
  book.rotation.x = 0.12;
  mainBook.add(book);
  box(1.86, 0.045, 1.19, bronze, 0, 0, 0, book);
  box(1.84, 0.035, 1.17, jade, 0, 0.025, 0, book);

  function pageGeometry(side: -1 | 1, yOffset = 0) {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const cols = 16;
    const rows = 10;
    for (let iz = 0; iz <= rows; iz++) {
      for (let ix = 0; ix <= cols; ix++) {
        const u = ix / cols;
        positions.push(side * (0.018 + u * 0.86), 0.06 + yOffset + 0.12 * Math.sin(u * Math.PI * 0.82) + u * u * 0.035, (iz / rows - 0.5) * 1.09);
        uvs.push(side === 1 ? u : 1 - u, iz / rows);
      }
    }
    for (let iz = 0; iz < rows; iz++) {
      for (let ix = 0; ix < cols; ix++) {
        const a = iz * (cols + 1) + ix;
        indices.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  // The printed marks are abstract lines, deliberately not a fabricated medical prescription.
  let printedPaper: THREE.Material = paper;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#eee4ca';
      ctx.fillRect(0, 0, 512, 768);
      ctx.strokeStyle = '#b9aa88';
      ctx.lineWidth = 2;
      ctx.strokeRect(49, 54, 414, 657);
      ctx.fillStyle = '#40594a';
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText('医脉相承', 256, 128);
      ctx.fillStyle = '#8f8772';
      for (let column = 0; column < 9; column++) {
        for (let line = 0; line < 23; line++) {
          ctx.fillRect(85 + column * 41, 181 + line * 19, 18 + (line % 3) * 3, 3);
        }
      }
      ctx.strokeStyle = '#a04d36';
      ctx.lineWidth = 4;
      ctx.strokeRect(355, 620, 54, 54);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      printedPaper = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.87, side: THREE.DoubleSide });
    }
  }
  for (const side of [-1, 1] as const) {
    addMesh(pageGeometry(side), printedPaper, book);
    for (let p = 1; p <= 3; p++) addMesh(pageGeometry(side, -p * 0.013), paper, book);
  }
  const spine = addMesh(new THREE.CylinderGeometry(0.026, 0.026, 1.16, 12), bronze, book);
  spine.rotation.x = Math.PI / 2;
  spine.position.y = 0.062;
  const ribbon = box(0.055, 0.012, 0.68, bronze, 0.3, 0.205, 0.34, book);
  ribbon.rotation.z = -0.07;

  // Thin brass mullions make the transparent case legible without hiding the hero object.
  box(2.2, 1.04, 0.018, glass, 0, 1.68, -0.76, mainBook);
  box(0.018, 1.04, 1.53, glass, -1.1, 1.68, 0, mainBook);
  box(0.018, 1.04, 1.53, glass, 1.1, 1.68, 0, mainBook);
  box(2.2, 0.018, 1.53, glass, 0, 2.2, 0, mainBook);
  [-1.1, 1.1].forEach(x => {
    box(0.018, 1.12, 0.018, bronze, x, 1.65, -0.76, mainBook);
    box(0.018, 1.12, 0.018, bronze, x, 1.65, 0.76, mainBook);
  });
  const plaque = box(0.76, 0.04, 0.27, ivory, 0, 1.12, 0.62, mainBook);
  plaque.rotation.x = 0.17;
  const plaqueMark = box(0.33, 0.008, 0.025, bronze, 0, 1.145, 0.62, mainBook);
  plaqueMark.rotation.x = 0.17;

  // Side vitrine with bound volumes and a suspended page, a second depth layer behind the hero.
  const vitrine = new THREE.Group();
  vitrine.position.set(2.7, 0.46, -0.8);
  vitrine.rotation.y = -0.35;
  scene.add(vitrine);
  const vbase = addMesh(new THREE.CylinderGeometry(0.76, 0.85, 0.91, 48), ivory, vitrine);
  vbase.position.y = 0.455;
  const vrim = ring(0.76, 0.02, bronze, 0, 0.92, 0, vitrine);
  vrim.rotation.x = Math.PI / 2;
  const bell = addMesh(new THREE.CylinderGeometry(0.68, 0.68, 1.27, 48, 1, true), glass, vitrine);
  bell.position.y = 1.57;
  const vtop = addMesh(new THREE.CircleGeometry(0.68, 48), glass, vitrine);
  vtop.rotation.x = -Math.PI / 2;
  vtop.position.y = 2.2;
  for (let i = 0; i < 4; i++) {
    const cover = box(0.92 - i * 0.04, 0.095, 0.64, i % 2 ? jade : darkWood, 0, 0.98 + i * 0.13, 0, vitrine);
    cover.rotation.y = (i % 2 ? -1 : 1) * 0.05;
    box(0.8 - i * 0.04, 0.065, 0.61, paper, 0.025, 0.99 + i * 0.13, 0.015, vitrine);
  }
  const floatingPage = box(0.51, 0.7, 0.025, paper, 0, 1.76, 0, vitrine);
  floatingPage.rotation.set(-0.15, -0.4, 0.14);
  const pageLine = box(0.26, 0.016, 0.008, bronze, 0, 0.15, 0.021, floatingPage);
  pageLine.castShadow = false;

  // Low round seats and shallow entry steps ground the exhibition in an inhabitable space.
  for (const [x, z] of [[-2.7, 1.7], [2.72, 1.72]]) {
    const seat = addMesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 40), darkWood);
    seat.position.set(x, 1.02, z);
    const stem = addMesh(new THREE.CylinderGeometry(0.18, 0.24, 0.48, 24), bronze);
    stem.position.set(x, 0.72, z);
    const foot = addMesh(new THREE.CylinderGeometry(0.36, 0.4, 0.07, 32), edgeStone);
    foot.position.set(x, 0.49, z);
  }
  for (let i = 0; i < 3; i++) {
    const step = addMesh(new THREE.CylinderGeometry(1.18 + i * 0.23, 1.18 + i * 0.23, 0.11, 64, 1, false, -Math.PI / 2, Math.PI), stone);
    step.scale.z = 0.53;
    step.rotation.y = Math.PI;
    step.position.set(0, 0.31 - i * 0.1, 3.08 + i * 0.2);
  }

  scene.userData.description = '当代学术承续 · 意象展陈，非真实场馆复原';
  return scene;
}
