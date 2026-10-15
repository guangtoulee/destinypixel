import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

/** A small, fully modelled study. All artwork and materials are made locally. */
export function initScene({ canvas, onSelect = () => {}, onReady = () => {} }) {
  if (!canvas) throw new Error('A canvas is required for the study.');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-7, 7, 4.5, -4.5, 0.1, 70);
  const homePosition = new THREE.Vector3(8, 7, 9);
  const homeTarget = new THREE.Vector3(0, 1.48, 0);
  camera.position.copy(homePosition);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(homeTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI * 0.17;
  controls.maxPolarAngle = Math.PI * 0.44;
  controls.minAzimuthAngle = -Math.PI * 0.4;
  controls.maxAzimuthAngle = Math.PI * 0.57;
  controls.minZoom = 0.7;
  controls.maxZoom = 2.4;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.65;
  controls.update();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const hotGroups = [];
  let disposed = false;
  let quality = 'high';
  let frame = 0;
  let focusTween = null;

  const color = {
    wood: '#79503b', dark: '#49372c', light: '#a67a51', edge: '#5d3e2b',
    paper: '#f1ddb0', brass: '#b79955', green: '#31574c', red: '#8e3e35',
    blue: '#3e645e', ivory: '#e5d4ae', ink: '#4b473b', ceramic: '#d9d6bd',
  };

  function ownGeometry(g) { geometries.add(g); return g; }
  function ownMaterial(m) { materials.add(m); return m; }
  function textureFrom(draw, width = 512, height = 512) {
    const c = document.createElement('canvas'); c.width = width; c.height = height;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('The study textures could not be created.');
    draw(ctx, width, height);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.add(t); return t;
  }
  let seed = 407;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  const woodTexture = textureFrom((ctx, w, h) => {
    ctx.fillStyle = '#c49c70'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 170; i++) {
      const x = random() * w;
      ctx.strokeStyle = `rgba(68,34,20,${0.025 + random() * 0.075})`;
      ctx.lineWidth = 0.4 + random() * 1.3;
      ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x - 14 + random() * 28, h * 0.3, x - 17 + random() * 34, h * 0.7, x + random() * 8, h);
      ctx.stroke();
    }
  });
  const wood = ownMaterial(new THREE.MeshStandardMaterial({ color: color.wood, map: woodTexture, roughness: 0.64 }));
  const paleWood = ownMaterial(new THREE.MeshStandardMaterial({ color: '#c7a775', map: woodTexture, roughness: 0.7 }));
  const darkWood = ownMaterial(new THREE.MeshStandardMaterial({ color: color.dark, map: woodTexture, roughness: 0.65 }));
  const edgeWood = ownMaterial(new THREE.MeshStandardMaterial({ color: color.edge, map: woodTexture, roughness: 0.65 }));
  const drawerWood = ownMaterial(new THREE.MeshStandardMaterial({ color: '#ac7850', map: woodTexture, roughness: 0.65 }));
  const brass = ownMaterial(new THREE.MeshStandardMaterial({ color: color.brass, metalness: 0.67, roughness: 0.34 }));
  const paper = ownMaterial(new THREE.MeshStandardMaterial({ color: color.paper, roughness: 1 }));
  const cream = ownMaterial(new THREE.MeshStandardMaterial({ color: color.ivory, roughness: 0.9 }));
  const green = ownMaterial(new THREE.MeshStandardMaterial({ color: color.green, roughness: 0.8 }));
  const red = ownMaterial(new THREE.MeshStandardMaterial({ color: color.red, roughness: 0.82 }));
  const ink = ownMaterial(new THREE.MeshStandardMaterial({ color: color.ink, roughness: 0.9 }));
  const porcelain = ownMaterial(new THREE.MeshStandardMaterial({ color: color.ceramic, roughness: 0.32, metalness: 0.02 }));
  const bluePorcelain = ownMaterial(new THREE.MeshStandardMaterial({ color: color.blue, roughness: 0.3, metalness: 0.05 }));
  const soil = ownMaterial(new THREE.MeshStandardMaterial({ color: '#493f30', roughness: 1 }));
  const leaf = ownMaterial(new THREE.MeshStandardMaterial({ color: '#52694a', roughness: 0.85 }));
  const leafLight = ownMaterial(new THREE.MeshStandardMaterial({ color: '#6f8050', roughness: 0.86 }));
  const boxGeometry = ownGeometry(new THREE.BoxGeometry(1, 1, 1));
  const sphereGeometry = ownGeometry(new THREE.SphereGeometry(1, 12, 9));

  function group(parent = scene, id) {
    const g = new THREE.Group(); parent.add(g);
    if (id) { g.userData.hotspot = id; hotGroups.push(g); }
    return g;
  }
  function box(parent, w, h, d, x, y, z, mat = wood, shadow = true) {
    const mesh = new THREE.Mesh(boxGeometry, mat); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = shadow; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function sphere(parent, radius, x, y, z, mat, scale = [1, 1, 1]) {
    const mesh = new THREE.Mesh(sphereGeometry, mat); mesh.position.set(x, y, z);
    mesh.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function cylinder(parent, rt, rb, height, x, y, z, mat = wood, segments = 16) {
    const mesh = new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(rt, rb, height, segments)), mat);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function ring(parent, radius, tube, x, y, z, mat = brass, rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(ownGeometry(new THREE.TorusGeometry(radius, tube, 5, 16)), mat);
    mesh.position.set(x, y, z); mesh.rotation.set(...rotation); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function roundedSlab(parent, w, h, d, r, x, y, z, mat) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2);
    s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r);
    s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2);
    s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r);
    s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
    const mesh = new THREE.Mesh(ownGeometry(new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 })), mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y - h / 2, z);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function beam(parent, a, b, radius, mat = wood) {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = cylinder(parent, radius * 0.75, radius, direction.length(), 0, 0, 0, mat, 8);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }
  function labelTexture(text, opts = {}) {
    return textureFrom((ctx, w, h) => {
      ctx.fillStyle = opts.background || '#e8d5a6'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = opts.border || '#9b7046'; ctx.lineWidth = 3; ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = opts.color || '#463f31'; ctx.font = `${opts.size || 52}px "Songti SC", "Noto Serif CJK SC", serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2 + 2);
    }, opts.width || 256, opts.height || 100);
  }
  function label(parent, text, w, h, x, y, z, opts = {}) {
    const mat = ownMaterial(new THREE.MeshStandardMaterial({ map: labelTexture(text, opts), roughness: 0.95, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(w, h)), mat);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  const root = group();

  // Broad bevelled presentation base, with individually laid oak floorboards.
  roundedSlab(root, 10.7, 0.24, 7.25, 0.38, 0, -0.2, 0, cream);
  roundedSlab(root, 10.28, 0.12, 6.85, 0.16, 0, -0.025, 0, edgeWood);
  const floorCount = 17;
  const floor = new THREE.InstancedMesh(boxGeometry, paleWood, floorCount);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < floorCount; i++) {
    matrix.compose(new THREE.Vector3(-4.82 + i * 0.603, 0.065, 0), new THREE.Quaternion(), new THREE.Vector3(0.59, 0.08, 6.63));
    floor.setMatrixAt(i, matrix);
    floor.setColorAt(i, new THREE.Color().setHSL(0.105, 0.19, 0.76 + random() * 0.1));
  }
  floor.receiveShadow = true; root.add(floor);
  box(root, 10.23, 0.09, 0.11, 0, 0.11, 3.32, edgeWood);
  box(root, 10.23, 0.09, 0.11, 0, 0.11, -3.32, edgeWood);

  // Open lattice window: a thin architectural hint keeps the room legible at every angle.
  const windowGroup = group(root); windowGroup.position.set(-1.23, 0, -3.14);
  const windowGlow = ownMaterial(new THREE.MeshStandardMaterial({ color: '#e8d5a7', transparent: true, opacity: 0.56, roughness: 1, side: THREE.DoubleSide }));
  box(windowGroup, 3.5, 0.2, 0.24, 0, 0.22, 0, darkWood);
  for (const x of [-1.69, 1.69]) box(windowGroup, 0.15, 3.56, 0.17, x, 1.99, 0, darkWood);
  box(windowGroup, 3.53, 0.16, 0.2, 0, 3.77, 0, darkWood);
  box(windowGroup, 3.66, 0.12, 0.26, 0, 3.88, 0, wood);
  box(windowGroup, 3.25, 2.91, 0.025, 0, 2.01, -0.05, windowGlow, false);
  for (const x of [-1.08, -0.54, 0, 0.54, 1.08]) box(windowGroup, 0.045, 3.17, 0.08, x, 2.02, 0.015, wood);
  for (const y of [0.65, 1.15, 2.98, 3.48]) box(windowGroup, 3.3, 0.045, 0.08, 0, y, 0.035, wood);
  for (const x of [-1.36, -0.81, -0.27, 0.27, 0.81, 1.36]) {
    const ornament = box(windowGroup, 0.25, 0.25, 0.06, x, 3.24, 0.04, wood);
    ornament.rotation.z = Math.PI / 4;
  }
  box(windowGroup, 3.72, 0.14, 0.48, 0, 0.48, 0.11, wood);

  // Apoth­ecary cabinet: thirty inset drawers, tiny paper captions and brass ring pulls.
  const cabinet = group(root, 'cabinet'); cabinet.position.set(2.46, 0, -2.64);
  box(cabinet, 4.25, 3.35, 0.74, 0, 1.98, 0, darkWood);
  box(cabinet, 4.5, 0.16, 0.94, 0, 3.72, 0.03, wood);
  box(cabinet, 4.38, 0.1, 0.85, 0, 3.6, 0.03, brass);
  box(cabinet, 4.48, 0.17, 0.92, 0, 0.35, 0.03, wood);
  for (const x of [-1.85, 1.85]) box(cabinet, 0.18, 0.33, 0.56, x, 0.2, 0, darkWood);
  const herbNames = ['當歸', '黃芪', '白芷', '陳皮', '山楂', '茯苓', '菊花', '枸杞', '薄荷', '蓮子', '山藥', '木瓜', '紫蘇', '杜仲', '百合', '烏梅', '桔梗', '甘草', '桑葉', '砂仁', '薏苡', '麥冬', '金銀花', '五味子', '黨參', '丹參', '連翹', '桂枝', '丁香', '石斛'];
  // A single atlas avoids creating a texture for each drawer.
  const drawerAtlas = textureFrom((ctx, w, h) => {
    ctx.fillStyle = '#dfcda3'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#544531'; ctx.font = '35px "Songti SC", serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    herbNames.forEach((name, i) => ctx.fillText(name, (i % 6) * w / 6 + w / 12, Math.floor(i / 6) * h / 5 + h / 10));
  }, 768, 500);
  const drawerLabelMat = ownMaterial(new THREE.MeshStandardMaterial({ map: drawerAtlas, roughness: 1 }));
  const drawerLabelGeo = ownGeometry(new THREE.PlaneGeometry(0.27, 0.12));
  const pullGeo = ownGeometry(new THREE.TorusGeometry(0.048, 0.011, 5, 12));
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const x = -1.75 + col * 0.7; const y = 3.27 - row * 0.57; const z = 0.414;
      box(cabinet, 0.637, 0.505, 0.095, x, y, z, drawerWood);
      box(cabinet, 0.57, 0.025, 0.012, x, y + 0.2, z + 0.053, paleWood, false);
      const geo = drawerLabelGeo.clone(); geometries.add(geo);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (col + uv.getX(i)) / 6, (4 - row + uv.getY(i)) / 5);
      const tag = new THREE.Mesh(geo, drawerLabelMat); tag.position.set(x, y + 0.07, z + 0.052); cabinet.add(tag);
      const pull = new THREE.Mesh(pullGeo, brass); pull.position.set(x, y - 0.09, z + 0.071); cabinet.add(pull);
      sphere(cabinet, 0.024, x, y - 0.046, z + 0.066, brass);
    }
  }
  label(cabinet, '本 草 有 序', 1.63, 0.32, 0, 4.0, 0.03, { background: '#344f43', color: '#ead7a2', border: '#b79955', size: 38, width: 512, height: 110 });
  box(cabinet, 1.76, 0.4, 0.09, 0, 4, -0.026, darkWood);

  // Side shelf. Bound volumes have coloured cloth covers and paper spines.
  const shelf = group(root); shelf.position.set(-3.85, 0, -1.72);
  box(shelf, 2.1, 3.6, 0.08, 0, 1.98, -0.39, darkWood);
  for (const x of [-1.08, 1.08]) box(shelf, 0.13, 3.82, 0.9, x, 1.98, 0, wood);
  for (const y of [0.25, 1.23, 2.28, 3.56]) box(shelf, 2.22, 0.11, 0.9, 0, y, 0, wood);
  box(shelf, 2.38, 0.13, 1.03, 0, 3.94, 0, darkWood);
  for (const x of [-0.83, 0.83]) box(shelf, 0.15, 0.23, 0.67, x, 0.15, 0, darkWood);
  const bookColors = [green, red, wood, bluePorcelain, darkWood];
  function closedBook(parent, w, h, d, x, y, z, cover = green, tilt = 0) {
    const b = group(parent); b.position.set(x, y, z); b.rotation.z = tilt;
    box(b, w * 0.94, h * 0.87, d * 0.93, 0, 0, 0, paper);
    box(b, w, 0.025, d, 0, h / 2, 0, cover);
    box(b, w, 0.025, d, 0, -h / 2, 0, cover);
    box(b, 0.027, h, d, -w / 2, 0, 0, cover);
    return b;
  }
  // Upright bindings assembled as a compact unit per volume.
  for (let level = 0; level < 2; level++) {
    for (let i = 0; i < 9; i++) {
      const height = 0.64 + random() * 0.22;
      const b = group(shelf); b.position.set(-0.89 + i * 0.186, [1.3, 2.35][level] + height / 2, 0.05);
      b.rotation.z = (i === 0 ? 0.08 : i === 8 ? -0.08 : 0);
      const material = bookColors[(i + level * 2) % bookColors.length];
      box(b, 0.155, height, 0.54, 0, 0, 0, material);
      box(b, 0.08, height * 0.52, 0.012, 0, 0.05, 0.277, paper, false);
      for (const yy of [-0.22, 0.21]) box(b, 0.16, 0.025, 0.012, 0, yy, 0.28, brass, false);
    }
  }
  for (let i = 0; i < 4; i++) closedBook(shelf, 0.91, 0.1, 0.57, -0.48 + i * 0.025, 0.38 + i * 0.12, 0.01, bookColors[i]);
  for (let i = 0; i < 3; i++) {
    const scroll = cylinder(shelf, 0.105, 0.105, 0.7, 0.49 + i * 0.17, 0.59, 0.02, paper, 12);
    scroll.rotation.x = Math.PI / 2;
    cylinder(shelf, 0.045, 0.045, 0.78, 0.49 + i * 0.17, 0.59, 0.02, darkWood, 10).rotation.x = Math.PI / 2;
  }
  label(shelf, '燕 趙 文 庫', 1.28, 0.26, 0, 3.74, 0.46, { background: '#654531', color: '#eddbad', border: '#a78a53', size: 38 });

  // Low woven rug beneath the desk, with a deliberately restrained geometric edge.
  const rugTexture = textureFrom((ctx, w, h) => {
    ctx.fillStyle = '#64776a'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#cfb783'; ctx.lineWidth = 8; ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.lineWidth = 2; ctx.strokeRect(36, 36, w - 72, h - 72);
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = random() > 0.5 ? '#ffffff08' : '#00000008';
      ctx.fillRect(random() * w, random() * h, 1, 8);
    }
    ctx.strokeStyle = '#d6bc882e';
    for (let x = 80; x < w; x += 62) for (let y = 70; y < h; y += 64) {
      ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 12); ctx.lineTo(x - 12, y); ctx.closePath(); ctx.stroke();
    }
  }, 768, 512);
  const rugMat = ownMaterial(new THREE.MeshStandardMaterial({ map: rugTexture, roughness: 1 }));
  box(root, 4.9, 0.018, 3.25, -0.14, 0.122, 0.63, rugMat, false);

  // Scholar's table, with recessed apron and narrow stretchers.
  const desk = group(root); desk.position.set(-0.35, 0, 0.47);
  roundedSlab(desk, 4.3, 0.15, 1.98, 0.075, 0, 1.66, 0, wood);
  box(desk, 4.04, 0.1, 1.75, 0, 1.54, 0, darkWood);
  for (const z of [-0.78, 0.78]) {
    box(desk, 3.77, 0.29, 0.08, 0, 1.36, z, wood);
    box(desk, 3.52, 0.055, 0.09, 0, 1.26, z, paleWood);
    for (const x of [-1.69, 1.69]) {
      const brace = box(desk, 0.12, 0.4, 0.07, x, 1.17, z, wood); brace.rotation.z = x < 0 ? -0.48 : 0.48;
    }
  }
  for (const x of [-1.83, 1.83]) {
    box(desk, 0.1, 0.29, 1.56, x, 1.36, 0, wood);
    for (const z of [-0.76, 0.76]) {
      const leg = box(desk, 0.15, 1.26, 0.15, x, 0.78, z, darkWood);
      leg.rotation.z = x > 0 ? -0.035 : 0.035;
      box(desk, 0.2, 0.08, 0.2, x, 0.2, z, brass);
    }
    box(desk, 0.09, 0.1, 1.55, x, 0.53, 0, wood);
  }
  box(desk, 3.68, 0.1, 0.08, 0, 0.53, -0.02, darkWood);

  // The open volume is the visual anchor. Its sheets are curved geometry, not a flat sprite.
  const book = group(desk, 'book'); book.position.set(0.1, 1.766, 0.17); book.rotation.y = -0.1;
  for (const side of [-1, 1]) {
    const cover = box(book, 0.94, 0.045, 1.39, side * 0.48, 0.012, 0, green);
    cover.rotation.z = side * 0.045;
    const stack = box(book, 0.88, 0.08, 1.31, side * 0.47, 0.061, 0, paper);
    stack.rotation.z = side * 0.045;
    for (let j = 0; j < 4; j++) box(book, 0.89, 0.004, 1.315, side * 0.47, 0.045 + j * 0.018, 0, cream, false);
  }
  const pageTexts = [
    ['薪火相傳', '一部書的旅行', '讀前人之書', '尋燕趙醫脈', '校一字以存真', '傳一卷而致遠'],
    ['燕趙醫脈', '金元之際', '學術相承', '典籍留芳', '李杲 羅天益', '觀古籍 知傳承'],
  ];
  function pageTexture(side) {
    return textureFrom((ctx, w, h) => {
      ctx.fillStyle = '#efe0b8'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 4500; i++) { ctx.fillStyle = `rgba(91,57,23,${random() * 0.035})`; ctx.fillRect(random() * w, random() * h, 1 + random() * 2, 1); }
      ctx.strokeStyle = '#9a5c407d'; ctx.lineWidth = 3; ctx.strokeRect(46, 45, w - 92, h - 90);
      ctx.strokeStyle = '#9a5c403b'; ctx.lineWidth = 1;
      for (let i = 1; i < 7; i++) { const x = 46 + i * (w - 92) / 7; ctx.beginPath(); ctx.moveTo(x, 45); ctx.lineTo(x, h - 45); ctx.stroke(); }
      pageTexts[side].forEach((line, column) => {
        const x = w - 90 - column * 64;
        ctx.fillStyle = column === 0 ? '#754b35' : '#504335';
        ctx.font = `${column === 0 ? 42 : 32}px "Songti SC", "Noto Serif CJK SC", serif`;
        ctx.textAlign = 'center';
        [...line].forEach((char, i) => ctx.fillText(char, x, 101 + i * (column === 0 ? 55 : 48)));
      });
      ctx.strokeStyle = '#a04e3b'; ctx.lineWidth = 4; ctx.strokeRect(64, h - 147, 75, 75);
      ctx.fillStyle = '#a04e3b'; ctx.font = '24px "Songti SC", serif'; ctx.textAlign = 'center';
      ctx.fillText('傳', 102, h - 111); ctx.fillText('習', 102, h - 84);
    }, 512, 768);
  }
  [-1, 1].forEach((side, index) => {
    const positions = []; const uvs = []; const indices = []; const cols = 24; const rows = 3;
    for (let iz = 0; iz <= rows; iz++) for (let ix = 0; ix <= cols; ix++) {
      const u = ix / cols; const x = side < 0 ? -0.91 + u * 0.9 : 0.01 + u * 0.9;
      const d = Math.abs(x) / 0.91;
      positions.push(x, 0.103 + 0.067 * Math.sin(d * Math.PI * 0.72) + 0.012 * d, -0.655 + iz / rows * 1.31);
      uvs.push(u, 1 - iz / rows);
      if (ix < cols && iz < rows) {
        const n = iz * (cols + 1) + ix;
        indices.push(n, n + cols + 1, n + 1, n + 1, n + cols + 1, n + cols + 2);
      }
    }
    const geo = ownGeometry(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeVertexNormals();
    const mat = ownMaterial(new THREE.MeshStandardMaterial({ map: pageTexture(index), roughness: 1, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; book.add(mesh);
  });
  const ribbon = box(book, 0.055, 0.008, 0.75, 0.08, 0.132, 0.64, red, false); ribbon.rotation.y = -0.08;

  // A warm paper lantern, with subtle framework and tassel.
  const lamp = group(desk, 'lamp'); lamp.position.set(-1.48, 1.75, -0.4);
  roundedSlab(lamp, 0.51, 0.06, 0.43, 0.04, 0, 0.035, 0, darkWood);
  cylinder(lamp, 0.04, 0.055, 0.53, 0, 0.31, 0, brass, 12);
  const lanternMaterial = ownMaterial(new THREE.MeshStandardMaterial({ color: '#f0d3a0', emissive: '#e9aa4c', emissiveIntensity: 0.23, roughness: 0.9, transparent: true, opacity: 0.94 }));
  cylinder(lamp, 0.26, 0.29, 0.57, 0, 0.81, 0, lanternMaterial, 12);
  cylinder(lamp, 0.28, 0.31, 0.055, 0, 0.5, 0, darkWood, 12);
  cylinder(lamp, 0.28, 0.28, 0.055, 0, 1.12, 0, darkWood, 12);
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    cylinder(lamp, 0.009, 0.009, 0.59, Math.sin(angle) * 0.275, 0.81, Math.cos(angle) * 0.275, brass, 5);
  }
  sphere(lamp, 0.06, 0, 1.2, 0, brass, [1, 0.72, 1]);
  const lampLight = new THREE.PointLight('#ffca75', 2.3, 3.5, 2); lampLight.position.set(0, 0.85, 0); lamp.add(lampLight);

  // Desk objects: inkstone, brushes, tied volumes and a porcelain tea bowl.
  closedBook(desk, 0.67, 0.1, 0.93, 1.46, 1.83, -0.25, red).rotation.y = 0.06;
  closedBook(desk, 0.63, 0.085, 0.89, 1.44, 1.93, -0.25, green).rotation.y = 0.04;
  const inkstone = roundedSlab(desk, 0.48, 0.06, 0.31, 0.07, 1.41, 1.79, 0.53, ink);
  sphere(desk, 0.11, 1.41, 1.829, 0.53, darkWood, [1.3, 0.09, 0.7]);
  const brush = cylinder(desk, 0.012, 0.019, 0.61, 1.02, 1.81, 0.6, paleWood, 8); brush.rotation.z = 1.38; brush.rotation.x = 0.2;
  const brushTip = cylinder(desk, 0.005, 0.022, 0.11, 0.71, 1.81, 0.59, ink, 8); brushTip.rotation.z = 1.38;
  cylinder(desk, 0.09, 0.065, 0.105, -1.42, 1.79, 0.53, porcelain, 16);
  cylinder(desk, 0.07, 0.07, 0.007, -1.42, 1.848, 0.53, darkWood, 16);
  ring(desk, 0.085, 0.009, -1.42, 1.852, 0.53, brass, [Math.PI / 2, 0, 0]);

  // A real second activity station: carved woodblock, paper and the printing brush.
  const print = group(root, 'print'); print.position.set(3.5, 0, 1.42); print.rotation.y = -0.16;
  roundedSlab(print, 1.72, 0.13, 1.63, 0.04, 0, 0.98, 0, wood);
  for (const x of [-0.63, 0.63]) for (const z of [-0.57, 0.57]) box(print, 0.12, 0.8, 0.12, x, 0.53, z, darkWood);
  box(print, 1.35, 0.1, 0.1, 0, 0.35, -0.57, wood);
  const block = box(print, 1.05, 0.07, 0.85, -0.1, 1.092, -0.1, darkWood);
  const blockTexture = textureFrom((ctx, w, h) => {
    ctx.fillStyle = '#4e3826'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#b28c5d'; ctx.font = '34px "Songti SC", serif'; ctx.textAlign = 'center';
    const lines = ['燕趙醫脈', '典籍流芳', '校勘成卷', '薪火相傳'];
    lines.forEach((line, c) => [...line].forEach((char, r) => ctx.fillText(char, 62 + c * 120, 72 + r * 103)));
    ctx.strokeStyle = '#b28c5d'; ctx.lineWidth = 4; ctx.strokeRect(22, 18, w - 44, h - 36);
  }, 512, 512);
  const blockMat = ownMaterial(new THREE.MeshStandardMaterial({ map: blockTexture, roughness: 0.9 }));
  const relief = new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(0.96, 0.76)), blockMat); relief.rotation.x = -Math.PI / 2; relief.rotation.z = Math.PI; relief.position.set(-0.1, 1.13, -0.1); print.add(relief);
  box(print, 0.63, 0.013, 0.43, 0.19, 1.064, 0.47, paper);
  const printBrush = cylinder(print, 0.1, 0.1, 0.3, 0.58, 1.15, -0.18, darkWood, 10); printBrush.rotation.z = Math.PI / 2;
  cylinder(print, 0.025, 0.025, 0.43, 0.58, 1.23, -0.18, paleWood, 8).rotation.z = Math.PI / 2;
  label(print, '刊 印', 0.47, 0.18, 0, 0.83, 0.826, { size: 50 });

  // Ceramic mortar and herb jars occupy a modest side stand.
  const side = group(root); side.position.set(-3.8, 0, 1.35);
  roundedSlab(side, 1.33, 0.1, 1.19, 0.035, 0, 1.08, 0, wood);
  for (const x of [-0.48, 0.48]) for (const z of [-0.4, 0.4]) box(side, 0.1, 0.95, 0.1, x, 0.58, z, darkWood);
  box(side, 1.1, 0.08, 0.85, 0, 0.34, 0, wood);
  const mortarGeo = ownGeometry(new THREE.LatheGeometry([
    new THREE.Vector2(0.06, 0), new THREE.Vector2(0.2, 0.02), new THREE.Vector2(0.27, 0.12),
    new THREE.Vector2(0.31, 0.27), new THREE.Vector2(0.285, 0.29), new THREE.Vector2(0.245, 0.22),
    new THREE.Vector2(0.17, 0.1), new THREE.Vector2(0, 0.08),
  ], 20));
  const mortar = new THREE.Mesh(mortarGeo, porcelain); mortar.position.set(-0.12, 1.13, 0.16); mortar.castShadow = true; side.add(mortar);
  const pestle = cylinder(side, 0.055, 0.075, 0.49, -0.035, 1.42, 0.16, paleWood, 12); pestle.rotation.z = -0.56;
  for (let i = 0; i < 2; i++) {
    const jar = group(side); jar.position.set(0.32 - i * 0.56, 1.13, -0.26);
    cylinder(jar, 0.1, 0.13, 0.27 + i * 0.07, 0, 0.15 + i * 0.035, 0, i ? bluePorcelain : porcelain);
    cylinder(jar, 0.1, 0.1, 0.05, 0, 0.315 + i * 0.07, 0, darkWood);
    label(jar, i ? '本草' : '香', 0.12, 0.12, 0, 0.17, 0.126, { size: 43 });
  }

  // Bonsai in front of the window, with a gently leaning, branched trunk.
  const bonsai = group(root); bonsai.position.set(-2.08, 0, -2.3);
  cylinder(bonsai, 0.32, 0.25, 0.32, 0, 0.32, 0, bluePorcelain, 16);
  cylinder(bonsai, 0.29, 0.29, 0.02, 0, 0.49, 0, soil, 16);
  ring(bonsai, 0.315, 0.025, 0, 0.49, 0, brass, [Math.PI / 2, 0, 0]);
  beam(bonsai, new THREE.Vector3(0, 0.49, 0), new THREE.Vector3(0.09, 1.2, 0), 0.065, darkWood);
  beam(bonsai, new THREE.Vector3(0.07, 1.03, 0), new THREE.Vector3(-0.31, 1.47, 0.05), 0.037, darkWood);
  beam(bonsai, new THREE.Vector3(0.05, 0.9, 0), new THREE.Vector3(0.4, 1.28, -0.06), 0.038, darkWood);
  for (let i = 0; i < 20; i++) {
    const a = i * 2.39996; const r = 0.18 + random() * 0.31;
    const x = Math.cos(a) * r; const z = Math.sin(a) * r * 0.7;
    sphere(bonsai, 0.21 + random() * 0.09, x, 1.28 + Math.cos(a) * 0.17 + random() * 0.21, z, i % 3 === 0 ? leafLight : leaf, [1, 0.7, 1]);
  }

  // Round stool and rolled mat make the front edge feel inhabited without figures.
  const stool = group(root); stool.position.set(-0.23, 0, 2.17);
  cylinder(stool, 0.46, 0.46, 0.12, 0, 0.69, 0, darkWood, 24);
  cylinder(stool, 0.39, 0.39, 0.018, 0, 0.759, 0, paleWood, 24);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    const x = Math.cos(a) * 0.28; const z = Math.sin(a) * 0.28;
    cylinder(stool, 0.045, 0.06, 0.57, x, 0.39, z, wood, 8);
  }
  ring(stool, 0.28, 0.026, 0, 0.34, 0, wood, [Math.PI / 2, 0, 0]);

  // Light through the window, broad enough to show the miniature's joinery.
  scene.add(new THREE.HemisphereLight('#fff0cf', '#9a8a6b', 2.55));
  const sun = new THREE.DirectionalLight('#fff1d0', 4.2);
  sun.position.set(-3, 9, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -7; sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 24;
  sun.shadow.normalBias = 0.035; sun.shadow.bias = -0.0003; sun.shadow.radius = 3;
  sun.target.position.set(0, 0, 0); scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#c6dad0', 1.05); fill.position.set(4, 4, -4); scene.add(fill);

  // Invisible, generous click targets are still attached to their real model groups.
  const hitMat = ownMaterial(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
  box(book, 1.95, 0.35, 1.48, 0, 0.14, 0, hitMat, false);
  box(lamp, 0.7, 1.3, 0.7, 0, 0.65, 0, hitMat, false);
  box(print, 1.75, 0.6, 1.65, 0, 1.05, 0, hitMat, false);

  const focusPoints = {
    book: { target: new THREE.Vector3(-0.19, 1.75, 0.58), zoom: 1.65, position: new THREE.Vector3(5.9, 7.9, 8.7) },
    cabinet: { target: new THREE.Vector3(2.34, 2.05, -2.12), zoom: 1.35, position: new THREE.Vector3(7.5, 5.7, 8.2) },
    print: { target: new THREE.Vector3(3.4, 1.04, 1.4), zoom: 1.7, position: new THREE.Vector3(9.5, 7.8, 9.5) },
    lamp: { target: new THREE.Vector3(-1.8, 2.38, 0.07), zoom: 1.75, position: new THREE.Vector3(5.2, 6.8, 8.2) },
  };
  function tweenCamera(target, position, zoom) {
    focusTween = {
      start: performance.now(), duration: reducedMotion ? 0 : 850,
      fromTarget: controls.target.clone(), toTarget: target.clone(),
      fromPosition: camera.position.clone(), toPosition: position.clone(),
      fromZoom: camera.zoom, toZoom: zoom,
    };
  }
  function focus(id) {
    const destination = focusPoints[id];
    if (destination) tweenCamera(destination.target, destination.position, destination.zoom);
  }
  function reset() { tweenCamera(homeTarget, homePosition, 1); }
  function cancelTween() { focusTween = null; }
  controls.addEventListener('start', cancelTween);

  let width = 0; let height = 0;
  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(bounds.width || canvas.parentElement?.clientWidth || 800));
    const h = Math.max(1, Math.round(bounds.height || canvas.parentElement?.clientHeight || 560));
    if (w === width && h === height) return;
    width = w; height = h;
    const aspect = w / h; const frustumHeight = Math.max(9.4, 13.5 / aspect);
    camera.left = -frustumHeight * aspect / 2; camera.right = frustumHeight * aspect / 2;
    camera.top = frustumHeight / 2; camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'low' ? 1 : 1.65));
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
  window.addEventListener('resize', resize); resize();

  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  let pointerStart = null;
  function hit(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(hotGroups, true);
    if (!intersections.length) return null;
    let object = intersections[0].object;
    while (object) { if (object.userData.hotspot) return object.userData.hotspot; object = object.parent; }
    return null;
  }
  function pointerDown(event) { pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; }
  function pointerUp(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y); pointerStart = null;
    if (distance > 7) return;
    const id = hit(event); if (id) onSelect(id);
  }
  function pointerMove(event) {
    if (event.pointerType === 'touch' || pointerStart) return;
    canvas.style.cursor = hit(event) ? 'pointer' : 'grab';
  }
  function pointerLeave() { canvas.style.cursor = 'grab'; }
  function pointerCancel() { pointerStart = null; }
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('pointercancel', pointerCancel);
  canvas.style.cursor = 'grab';

  let ready = false;
  function render(now) {
    if (disposed) return;
    if (focusTween) {
      const t = focusTween.duration === 0 ? 1 : Math.min(1, (now - focusTween.start) / focusTween.duration);
      const ease = t * t * (3 - 2 * t);
      controls.target.lerpVectors(focusTween.fromTarget, focusTween.toTarget, ease);
      camera.position.lerpVectors(focusTween.fromPosition, focusTween.toPosition, ease);
      camera.zoom = THREE.MathUtils.lerp(focusTween.fromZoom, focusTween.toZoom, ease); camera.updateProjectionMatrix();
      if (t === 1) focusTween = null;
    }
    controls.update(); renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      // The exhibit is static, so its shadow map only needs to be drawn once.
      renderer.shadowMap.autoUpdate = false;
      onReady();
    }
    frame = requestAnimationFrame(render);
  }
  frame = requestAnimationFrame(render);

  function setQuality(value) {
    quality = value === 'low' ? 'low' : 'high';
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.needsUpdate = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'low' ? 1 : 1.65));
  }
  function dispose() {
    if (disposed) return; disposed = true;
    cancelAnimationFrame(frame); resizeObserver.disconnect(); window.removeEventListener('resize', resize);
    controls.removeEventListener('start', cancelTween); controls.dispose();
    canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointerup', pointerUp);
    canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerleave', pointerLeave);
    canvas.removeEventListener('pointercancel', pointerCancel);
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    renderer.dispose();
  }
  return { focus, reset, setQuality, dispose };
}
