import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { DRACOLoader } from './vendor/loaders/DRACOLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

/** The time river is real space. HTML owns reading; this module owns travelling. */
export async function initHistoryScene({ canvas, events, onChange = () => {}, onReady = () => {}, onInspectChange = () => {}, onPerson = () => {}, onLoadProgress = () => {} }) {
  if (!canvas || !events?.length) throw new Error('历史场景缺少画布或年代资料。');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mobile = innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x061b18, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x061b18);
  scene.fog = new THREE.FogExp2(0x061b18, 0.0105);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.035, 450);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.075;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.85;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * 0.83;

  const geometryResources = new Set();
  const materialResources = new Set();
  const textureResources = new Set();
  const geometry = g => (geometryResources.add(g), g);
  const material = m => (materialResources.add(m), m);
  const texture = t => (textureResources.add(t), t);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentRoom = new RoomEnvironment();
  const environmentTarget = pmrem.fromScene(environmentRoom, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.72;
  environmentRoom.dispose?.();
  pmrem.dispose();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(new URL('./vendor/draco/', import.meta.url).href);
  dracoLoader.setWorkerLimit(mobile ? 1 : 2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gold = new THREE.Color(0xd3ac63);
  const paleGold = new THREE.Color(0xf4deb0);
  const stations = [];
  const positions = events.map((_, i) => new THREE.Vector3((i - (events.length - 1) / 2) * 10.7, 0, Math.sin(i * 0.87) * 4.2));
  const journeyCurve = new THREE.CatmullRomCurve3(positions, false, 'catmullrom', 0.24);
  const maxProgress = events.length - 1;
  let progress = Math.min(1, maxProgress);
  let targetProgress = progress;
  let activeIndex = Math.round(progress);
  let mode = 'journey';
  let disposed = false;
  let animationFrame = 0;
  let excavation = 0;
  let targetExcavation = 0;
  let lineageSelection = 'all';
  let inspection = null;
  let inspectTransition = null;
  let lastNotification = 0;
  let lastNotifiedIndex = -1;
  let lastNotifiedProgress = -1;
  let lastNotifiedMode = '';
  let lastFrameTime = performance.now();
  let pointer = null;
  let suppressClickUntil = 0;
  const pointerNDC = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const desiredPosition = new THREE.Vector3();
  const desiredTarget = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const desiredUp = new THREE.Vector3(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xc3d4bd, 0x16362c, 1.5));
  const sun = new THREE.DirectionalLight(0xffe3b4, 2.5);
  sun.position.set(-16, 16, 13);
  sun.castShadow = !mobile;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.1, far: 48 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0x97ccbf, 1.75);
  rim.position.set(0, 9, -9);
  scene.add(rim);
  const focusLight = new THREE.PointLight(0xffd9a2, 10, 16, 2);
  scene.add(focusLight);

  function makeTexture(draw, width = 768, height = 192) {
    const bitmap = document.createElement('canvas');
    bitmap.width = width; bitmap.height = height;
    const ctx = bitmap.getContext('2d');
    if (!ctx) throw new Error('浏览器无法建立历史场景文字纹理。');
    draw(ctx, width, height);
    const map = texture(new THREE.CanvasTexture(bitmap));
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return map;
  }

  function makeLabel(main, secondary, { width = 3.65, height = 0.91, transparent = false, fontScale = 1 } = {}) {
    const map = makeTexture((ctx, w, h) => {
      if (!transparent) {
        ctx.fillStyle = 'rgba(5,27,22,.94)';
        ctx.beginPath(); ctx.roundRect(9, 9, w - 18, h - 18, 17); ctx.fill();
        ctx.strokeStyle = 'rgba(210,172,99,.67)'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f0dab0';
      ctx.font = `500 ${(secondary ? 51 : 59) * fontScale}px "Songti SC", "Noto Serif SC", serif`;
      ctx.fillText(main, w / 2, secondary ? h * 0.38 : h / 2, w - 48);
      if (secondary) {
        ctx.fillStyle = '#b7c5b3'; ctx.font = `${30 * fontScale}px "PingFang SC", sans-serif`;
        ctx.fillText(secondary, w / 2, h * 0.75, w - 50);
      }
    });
    const label = new THREE.Sprite(material(new THREE.SpriteMaterial({ map, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })));
    label.scale.set(width, height, 1);
    label.renderOrder = 10;
    return label;
  }

  const glowMap = makeTexture((ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
    gradient.addColorStop(0, 'rgba(243,200,119,.9)');
    gradient.addColorStop(0.2, 'rgba(207,159,73,.3)');
    gradient.addColorStop(1, 'rgba(207,159,73,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  }, 128, 128);
  const pedestalMaterial = material(new THREE.MeshStandardMaterial({ color: 0x122c25, roughness: 0.76, metalness: 0.18 }));
  const brassMaterial = material(new THREE.MeshStandardMaterial({ color: 0x9c7b42, metalness: 0.66, roughness: 0.35, emissive: 0x5a3e0d, emissiveIntensity: 0.17 }));
  const cylinderGeometry = geometry(new THREE.CylinderGeometry(3.32, 3.48, 0.28, 64));
  const ringGeometry = geometry(new THREE.TorusGeometry(3.28, 0.023, 5, 96));

  events.forEach((event, index) => {
    const group = new THREE.Group();
    group.position.copy(positions[index]);
    group.userData.stationIndex = index;
    scene.add(group);
    const pedestal = new THREE.Mesh(cylinderGeometry, pedestalMaterial);
    pedestal.position.y = 0.06; pedestal.receiveShadow = true;
    group.add(pedestal);
    const trim = new THREE.Mesh(ringGeometry, brassMaterial);
    trim.rotation.x = Math.PI / 2; trim.position.y = 0.212;
    group.add(trim);
    const halo = new THREE.Mesh(ringGeometry, material(new THREE.MeshBasicMaterial({ color: 0xe6bd75, transparent: true, opacity: 0.5, depthWrite: false })));
    halo.rotation.x = Math.PI / 2; halo.position.y = 0.23; halo.scale.setScalar(1.045);
    group.add(halo);
    const nameplate = makeLabel(event.yearLabel || event.era, event.title, { width: 3.9, height: 0.98 });
    nameplate.position.set(0, 0.9, 3.55); nameplate.userData.stationIndex = index;
    group.add(nameplate);
    const pin = new THREE.Mesh(geometry(new THREE.OctahedronGeometry(0.115)), material(new THREE.MeshBasicMaterial({ color: 0xe4c487 })));
    pin.position.set(0, 0.45, 3.6); group.add(pin);
    const holder = new THREE.Group(); holder.position.y = 0.23; group.add(holder);
    stations.push({ group, holder, halo, nameplate, pin, model: null, normalization: 1, layers: [] });
  });

  // Two fine banks and a luminous central current make the route legible in space.
  const riverPoints = positions.map(p => p.clone().add(new THREE.Vector3(0, 0.29, 4.35)));
  riverPoints.unshift(riverPoints[0].clone().add(new THREE.Vector3(-5, -0.03, 0.3)));
  riverPoints.push(riverPoints[riverPoints.length - 1].clone().add(new THREE.Vector3(5, -0.03, -0.3)));
  const riverCurve = new THREE.CatmullRomCurve3(riverPoints, false, 'catmullrom', 0.35);
  const currentMaterial = material(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'varying vec2 vUv; uniform float uTime; void main(){float pulse=pow(.5+.5*sin(vUv.x*100.0-uTime*1.3),9.0);vec3 c=mix(vec3(.53,.31,.10),vec3(1.0,.82,.46),.58+pulse*.42);gl_FragColor=vec4(c,.94);}',
    transparent: true, depthWrite: false,
  }));
  scene.add(new THREE.Mesh(geometry(new THREE.TubeGeometry(riverCurve, 320, 0.065, 8, false)), currentMaterial));
  for (const offset of [-0.31, 0.31]) {
    const bank = new THREE.CatmullRomCurve3(riverPoints.map(p => p.clone().add(new THREE.Vector3(0, -0.01, offset))), false, 'catmullrom', 0.35);
    scene.add(new THREE.Mesh(geometry(new THREE.TubeGeometry(bank, 260, 0.013, 5, false)), material(new THREE.MeshBasicMaterial({ color: 0x8e7548, transparent: true, opacity: 0.6 }))));
  }
  const currentGlows = [];
  for (let i = 0; i < 13; i++) {
    const mote = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: glowMap, color: 0xffdba2, transparent: true, opacity: 0.66, blending: THREE.AdditiveBlending, depthWrite: false })));
    mote.scale.setScalar(0.62); scene.add(mote); currentGlows.push(mote);
  }

  // Mountains remain behind the artefacts; no foreground plane covers the models.
  let randomSeed = 4217;
  const random = () => ((randomSeed = (randomSeed * 16807) % 2147483647) - 1) / 2147483646;
  const mountainMat = material(new THREE.MeshBasicMaterial({ color: 0x071d18, transparent: true, opacity: 0.25, depthWrite: false }));
  for (let i = 0; i < 14; i++) {
    const height = 1.8 + random() * 2.7;
    const mountain = new THREE.Mesh(geometry(new THREE.ConeGeometry(3.3 + random() * 4.5, height, 6 + Math.floor(random() * 3))), mountainMat);
    mountain.position.set(-56 + i * 8 + random() * 3, height / 2 - 1.8, -29 - random() * 15);
    mountain.scale.z = 0.4 + random() * 0.3;
    mountain.rotation.y = random() * Math.PI;
    scene.add(mountain);
  }
  const particlePositions = new Float32Array(240 * 3);
  for (let i = 0; i < 240; i++) {
    particlePositions[i * 3] = (random() - 0.5) * 94;
    particlePositions[i * 3 + 1] = random() * 8 + 0.2;
    particlePositions[i * 3 + 2] = (random() - 0.5) * 17;
  }
  const particleGeometry = geometry(new THREE.BufferGeometry());
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particleGeometry, material(new THREE.PointsMaterial({ color: 0xc7af7c, size: 0.027, transparent: true, opacity: 0.5, depthWrite: false })));
  scene.add(particles);

  // A relational graph is part of the Yishui scene, rather than an HTML illustration.
  const lineage = new THREE.Group();
  lineage.position.copy(positions[4] || positions[0]);
  scene.add(lineage);
  const people = {
    zhang: { name: '张元素', point: new THREE.Vector3(-2.5, 5.1, 0.7) },
    li: { name: '李杲', point: new THREE.Vector3(-0.1, 4.25, 2.4), book: '《脾胃论》' },
    wang: { name: '王好古', point: new THREE.Vector3(3.1, 3.05, 1.6), book: '《汤液本草》' },
    luo: { name: '罗天益', point: new THREE.Vector3(-0.4, 2.8, 4.0), book: '《卫生宝鉴》' },
  };
  const lineageNodes = [];
  const lineageEdges = [];
  Object.entries(people).forEach(([id, person]) => {
    const node = new THREE.Group(); node.position.copy(person.point); node.userData.personId = id;
    const orb = new THREE.Mesh(geometry(new THREE.IcosahedronGeometry(0.105, 1)), material(new THREE.MeshBasicMaterial({ color: 0xe5c28a })));
    node.add(orb);
    const label = makeLabel(person.name, person.book, { width: 1.75, height: person.book ? 0.63 : 0.5, fontScale: 1.6 });
    label.position.y = 0.45; node.add(label);
    const glow = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: glowMap, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })));
    glow.scale.setScalar(0.65); node.add(glow);
    lineage.add(node); lineageNodes.push({ id, node, label, glow, orb });
  });
  for (const [from, to] of [['zhang', 'li'], ['zhang', 'wang'], ['li', 'luo'], ['li', 'wang']]) {
    const a = people[from].point, b = people[to].point;
    const middle = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.28, -0.18));
    const edgeCurve = new THREE.QuadraticBezierCurve3(a, middle, b);
    const edgeMaterial = material(new THREE.MeshBasicMaterial({ color: 0xd6ad66, transparent: true, opacity: 0.85, depthWrite: false }));
    const edge = new THREE.Mesh(geometry(new THREE.TubeGeometry(edgeCurve, 36, 0.025, 5, false)), edgeMaterial);
    lineage.add(edge);
    const arrow = new THREE.Mesh(geometry(new THREE.ConeGeometry(0.075, 0.2, 6)), edgeMaterial);
    arrow.position.copy(edgeCurve.getPoint(0.77));
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), edgeCurve.getTangent(0.77).normalize());
    lineage.add(arrow);
    lineageEdges.push({ from, to, edge, arrow, material: edgeMaterial });
  }

  function notify(force = false) {
    const now = performance.now();
    const index = Math.round(progress);
    if (force || index !== lastNotifiedIndex || mode !== lastNotifiedMode || (Math.abs(progress - lastNotifiedProgress) > 0.0005 && now - lastNotification > 90)) {
      activeIndex = index;
      lastNotification = now; lastNotifiedIndex = index; lastNotifiedProgress = progress; lastNotifiedMode = mode;
      onChange(index, progress, mode);
    }
  }

  function journeyView(p) {
    const point = journeyCurve.getPoint(clamp(p / maxProgress, 0, 1));
    desiredTarget.copy(point).add(new THREE.Vector3(mobile ? 0 : -2.75, mobile ? 1.9 : 0.5, 0));
    desiredPosition.copy(desiredTarget).add(mobile ? new THREE.Vector3(7.1, 7.25, 13.8) : new THREE.Vector3(6.7, 6.55, 12.7));
    desiredUp.set(0, 1, 0);
  }

  function overviewView() {
    const middle = positions[0].clone().add(positions[maxProgress]).multiplyScalar(0.5);
    desiredTarget.copy(middle).add(new THREE.Vector3(0, 1.2, 0));
    if (mobile) {
      desiredPosition.copy(desiredTarget).add(new THREE.Vector3(8, 80, 50));
      desiredUp.set(1, 0, 0);
    } else {
      const width = Math.max(83, positions[maxProgress].x - positions[0].x + 12);
      const distance = Math.max(45, width * 1.08 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
      desiredPosition.copy(desiredTarget).add(new THREE.Vector3(8, distance * 0.65, distance * 0.82));
      desiredUp.set(0, 1, 0);
    }
  }

  function leaveInspect({ quiet = false } = {}) {
    if (!inspection) return;
    const { object, parent, position, quaternion, scale } = inspection;
    parent.add(object); object.position.copy(position); object.quaternion.copy(quaternion); object.scale.copy(scale);
    inspection = null; inspectTransition = null;
    controls.enabled = false;
    stations.forEach(station => { station.group.visible = true; });
    mode = 'journey'; targetProgress = progress;
    if (!quiet) { onInspectChange(false, ''); notify(true); }
  }

  function goTo(index, { immediate = false } = {}) {
    if (disposed) return;
    leaveInspect();
    mode = 'journey'; controls.enabled = false;
    targetProgress = clamp(Number(index) || 0, 0, maxProgress);
    if (immediate || reduceMotion) {
      progress = targetProgress; journeyView(progress);
      camera.position.copy(desiredPosition); cameraTarget.copy(desiredTarget); camera.up.copy(desiredUp); camera.lookAt(cameraTarget);
    }
    notify(true);
  }

  function setProgress(value) {
    if (disposed) return;
    leaveInspect();
    mode = 'journey'; controls.enabled = false;
    targetProgress = clamp(Number(value) || 0, 0, maxProgress);
    if (reduceMotion) progress = targetProgress;
  }

  function overview() {
    leaveInspect(); mode = 'overview'; controls.enabled = false;
    overviewView();
    if (reduceMotion) { camera.position.copy(desiredPosition); cameraTarget.copy(desiredTarget); camera.up.copy(desiredUp); camera.lookAt(cameraTarget); }
    notify(true);
  }

  function setLineage(person = 'all') {
    lineageSelection = ['all', 'off', ...Object.keys(people)].includes(person) ? person : 'all';
    lineageEdges.forEach(edge => {
      const related = lineageSelection === 'all' || edge.from === lineageSelection || edge.to === lineageSelection;
      edge.material.opacity = related ? 0.98 : 0.12;
      edge.material.color.copy(related ? paleGold : gold);
      edge.edge.scale.setScalar(1);
    });
    lineageNodes.forEach(item => {
      const related = lineageSelection === 'all' || item.id === lineageSelection || lineageEdges.some(edge => (edge.from === lineageSelection && edge.to === item.id) || (edge.to === lineageSelection && edge.from === item.id));
      item.label.material.opacity = related ? 1 : 0.3;
      item.glow.material.opacity = item.id === lineageSelection ? 0.95 : related ? 0.45 : 0.08;
      item.orb.scale.setScalar(item.id === lineageSelection ? 1.6 : 1);
    });
  }

  function setExcavation(value) {
    targetExcavation = clamp(Number(value) || 0, 0, 1);
    if (reduceMotion) excavation = targetExcavation;
  }

  function inspect(name) {
    if (disposed) return false;
    leaveInspect();
    const index = Math.round(progress);
    progress = targetProgress = index;
    const station = stations[index];
    if (!station.model) return false;
    const aliases = { blade: 'artifact_blade', pot: 'artifact_pot', seeds: 'artifact_seeds' };
    const requested = aliases[name] || name;
    let object = station.model;
    if (requested) {
      object = null;
      station.model.traverse(candidate => { if (!object && candidate.name.startsWith(requested)) object = candidate; });
      if (!object) return false;
    }
    scene.updateMatrixWorld(true);
    const before = { object, parent: object.parent, position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() };
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    if (box.isEmpty() || size.length() < 0.001) return false;
    scene.attach(object);
    const startPosition = object.position.clone();
    const liftedPosition = startPosition.clone().add(new THREE.Vector3(0, requested ? 1.2 : 0.4, 0.8));
    object.position.copy(liftedPosition);
    scene.updateMatrixWorld(true);
    const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    const distance = Math.max(1.2, radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * (mobile ? 1.75 : 1.5));
    const destination = center.clone().add(new THREE.Vector3(0.8, 0.52, 1.2).normalize().multiplyScalar(distance));
    controls.target.copy(center);
    controls.minDistance = Math.max(0.16, radius * 0.7);
    controls.maxDistance = Math.max(4, radius * 7.5);
    controls.maxPolarAngle = Math.PI * 0.88;
    camera.up.set(0, 1, 0);
    inspection = before;
    mode = 'inspect';
    stations.forEach((item, i) => { item.group.visible = i === index; });
    const label = requested?.startsWith('artifact_blade') ? '台西砭镰 · 艺术化示意' : requested?.startsWith('artifact_pot') ? '陶器 · 艺术化示意' : requested?.startsWith('artifact_seeds') ? '药用植物实物 · 艺术化示意' : events[index].title;
    if (reduceMotion) {
      camera.position.copy(destination); cameraTarget.copy(center); camera.lookAt(center); controls.enabled = true; controls.update();
    } else {
      object.position.copy(startPosition);
      inspectTransition = { started: performance.now(), from: camera.position.clone(), to: destination, fromTarget: cameraTarget.clone(), toTarget: center, fromObject: startPosition, toObject: liftedPosition };
      controls.enabled = false;
    }
    onInspectChange(true, label); notify(true);
    return true;
  }

  function findHit(event) {
    const rect = canvas.getBoundingClientRect();
    pointerNDC.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNDC, camera);
    const roots = stations.filter(station => station.group.visible).map(station => station.group);
    if (lineage.visible) roots.unshift(lineage);
    const hit = raycaster.intersectObjects(roots, true)[0];
    if (!hit) return null;
    let node = hit.object, personId, stationIndex, artifactName;
    while (node && node !== scene) {
      if (node.userData.personId) personId = node.userData.personId;
      if (node.userData.stationIndex !== undefined) stationIndex = node.userData.stationIndex;
      // Blender's joined material meshes also carry this prefix. Prefer their
      // outer semantic group so a click lifts the complete object and its patina.
      if (node.name.startsWith('artifact_')) artifactName = node.name;
      node = node.parent;
    }
    return { personId, stationIndex, artifactName };
  }

  function pointerDown(event) {
    if (mode === 'inspect' || event.button > 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, from: targetProgress, moved: false };
    canvas.setPointerCapture?.(event.pointerId);
  }
  function pointerMove(event) {
    if (mode === 'inspect') return;
    if (pointer && event.pointerId === pointer.id) {
      const dx = event.clientX - pointer.x;
      if (Math.abs(dx) + Math.abs(event.clientY - pointer.y) > 7) pointer.moved = true;
      if (pointer.moved) {
        mode = 'journey';
        targetProgress = clamp(pointer.from - dx / (mobile ? 200 : 280), 0, maxProgress);
        if (reduceMotion) progress = targetProgress;
        canvas.style.cursor = 'grabbing';
      }
    } else {
      const hit = findHit(event);
      canvas.style.cursor = hit && (hit.personId || hit.stationIndex !== undefined) ? 'pointer' : 'grab';
    }
  }
  function pointerUp(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const moved = pointer.moved;
    pointer = null;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = 'grab';
    if (moved) {
      targetProgress = Math.round(targetProgress); suppressClickUntil = performance.now() + 220;
      return;
    }
    if (performance.now() < suppressClickUntil) return;
    const hit = findHit(event);
    if (hit?.personId) { setLineage(hit.personId); onPerson(hit.personId); }
    else if (hit?.artifactName && hit.stationIndex === activeIndex) inspect(hit.artifactName);
    else if (hit?.stationIndex !== undefined) goTo(hit.stationIndex);
  }
  function pointerCancel() { pointer = null; canvas.style.cursor = mode === 'inspect' ? 'grab' : 'grab'; }
  function wheel(event) {
    if (mode === 'inspect') return;
    event.preventDefault();
    mode = 'journey';
    const delta = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
    targetProgress = clamp(targetProgress + clamp(delta, -220, 220) * 0.0024, 0, maxProgress);
    if (reduceMotion) progress = targetProgress;
  }

  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
    mobile = width < 760;
    lineage.scale.setScalar(mobile ? 0.65 : 0.9);
    lineage.position.y = -0.5;
    camera.fov = mobile ? 44 : 42;
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    if (mode === 'overview') overviewView();
  }

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvas);
  addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerCancel);
  canvas.addEventListener('wheel', wheel, { passive: false });
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';
  resize(); journeyView(progress);
  camera.position.copy(desiredPosition); cameraTarget.copy(desiredTarget); camera.lookAt(cameraTarget);

  function animate(now) {
    if (disposed) return;
    animationFrame = requestAnimationFrame(animate);
    const dt = Math.min((now - lastFrameTime) / 1000, 0.05); lastFrameTime = now;
    const smooth = reduceMotion ? 1 : 1 - Math.exp(-dt * 6.5);
    if (mode === 'journey') {
      progress += (targetProgress - progress) * smooth;
      if (Math.abs(progress - targetProgress) < 0.0002) progress = targetProgress;
      journeyView(progress);
      camera.position.lerp(desiredPosition, smooth);
      cameraTarget.lerp(desiredTarget, smooth);
      camera.up.lerp(desiredUp, smooth).normalize();
      camera.lookAt(cameraTarget);
    } else if (mode === 'overview') {
      camera.position.lerp(desiredPosition, smooth);
      cameraTarget.lerp(desiredTarget, smooth);
      camera.up.lerp(desiredUp, smooth).normalize();
      camera.lookAt(cameraTarget);
    } else if (inspectTransition) {
      const t = clamp((now - inspectTransition.started) / 780, 0, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(inspectTransition.from, inspectTransition.to, eased);
      cameraTarget.lerpVectors(inspectTransition.fromTarget, inspectTransition.toTarget, eased);
      inspection.object.position.lerpVectors(inspectTransition.fromObject, inspectTransition.toObject, eased);
      camera.lookAt(cameraTarget);
      if (t === 1) { controls.target.copy(inspectTransition.toTarget); controls.enabled = true; inspectTransition = null; controls.update(); }
    } else {
      controls.update(); cameraTarget.copy(controls.target);
    }
    excavation += (targetExcavation - excavation) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 7));
    const taixi = stations[1];
    taixi?.layers.forEach(layer => {
      layer.object.position.copy(layer.position).addScaledVector(layer.offset, excavation);
    });
    const focal = positions[Math.round(progress)];
    sun.position.x += (focal.x + 3 - sun.position.x) * smooth;
    sun.position.z += (focal.z + 9 - sun.position.z) * smooth;
    sun.target.position.copy(focal);
    focusLight.position.copy(focal).add(new THREE.Vector3(0, 5.8, 2));
    stations.forEach((station, index) => {
      const weight = Math.max(0, 1 - Math.abs(index - progress));
      station.halo.material.opacity = 0.14 + weight * 0.72;
      station.nameplate.visible = mode === 'overview' || (mode === 'journey' && index !== Math.round(progress));
      station.nameplate.material.opacity = mode === 'overview' ? 1 : 0.1 + weight * 0.2;
      station.pin.rotation.y = reduceMotion ? 0 : now * 0.0006;
    });
    lineage.visible = mode !== 'inspect' && lineageSelection !== 'off' && Math.abs(progress - 4) < 0.67;
    currentMaterial.uniforms.uTime.value = reduceMotion ? 0 : now * 0.001;
    currentGlows.forEach((mote, index) => {
      mote.position.copy(riverCurve.getPoint(((index / currentGlows.length) + (reduceMotion ? 0 : now * 0.000009)) % 1));
      mote.position.y += 0.03;
    });
    if (!reduceMotion) particles.position.y = Math.sin(now * 0.00012) * 0.12;
    scene.fog.density = mode === 'overview' ? 0.0025 : 0.0105;
    notify();
    renderer.render(scene, camera);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect(); removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', pointerDown);
    canvas.removeEventListener('pointermove', pointerMove);
    canvas.removeEventListener('pointerup', pointerUp);
    canvas.removeEventListener('pointercancel', pointerCancel);
    canvas.removeEventListener('wheel', wheel);
    controls.dispose();
    scene.traverse(object => {
      if (object.geometry) geometryResources.add(object.geometry);
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      materials.forEach(m => {
        materialResources.add(m);
        Object.values(m).forEach(value => { if (value?.isTexture) textureResources.add(value); });
      });
    });
    geometryResources.forEach(g => g.dispose()); materialResources.forEach(m => m.dispose()); textureResources.forEach(t => t.dispose());
    dracoLoader.dispose(); environmentTarget.dispose(); renderer.dispose();
  }

  const api = { goTo, setProgress, overview, resetView: () => goTo(Math.round(targetProgress)), inspect, leaveInspect, setExcavation, setLineage, resize, dispose,
    get progress() { return progress; }, get mode() { return mode; }, get currentIndex() { return Math.round(progress); } };
  animationFrame = requestAnimationFrame(animate);
  notify(true);

  // Each Blender asset is fetched once. The duplicated scroll is an explicit reuse.
  const assetNames = ['origin', 'taixi', 'wang', 'acupuncture', 'yishui', 'wang', 'bencao', 'lu'];
  const uniqueNames = [...new Set(assetNames)];
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  const loadedAssets = new Map();
  let loaded = 0;
  onLoadProgress({ loaded, total: uniqueNames.length, progress: 0, label: '正在载入 Blender 历史场景', status: 'loading' });
  try {
    await Promise.all(uniqueNames.map(async name => {
      const url = new URL(`./assets/history/${name}.glb`, import.meta.url).href;
      const gltf = await loader.loadAsync(url);
      if (!gltf.scene || new THREE.Box3().setFromObject(gltf.scene).isEmpty()) throw new Error(`${name}.glb 没有可显示的模型。`);
      loadedAssets.set(name, gltf.scene);
      loaded += 1;
      onLoadProgress({ loaded, total: uniqueNames.length, progress: loaded / uniqueNames.length, label: `已载入 ${loaded} / ${uniqueNames.length} 组历史场景`, status: 'loading' });
    }));
    if (disposed) return api;
    stations.forEach((station, index) => {
      const model = loadedAssets.get(assetNames[index]).clone(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = Math.min(4.9 / Math.max(size.x, size.z * 0.88, 0.001), 4.15 / Math.max(size.y, 0.001));
      model.scale.multiplyScalar(scale);
      model.position.add(new THREE.Vector3(-center.x * scale, -bounds.min.y * scale, -center.z * scale));
      model.updateMatrixWorld(true);
      station.normalization = scale;
      model.traverse(object => {
        if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        if (index === 1) {
          const offsets = { soil_lower: [-0.6, -0.05, 0], soil_middle: [1.75, 0.3, 0.15], soil_upper: [-1.9, 0.75, -0.15] };
          // Apply separation once to each named layer group, never to its meshes.
          const prefix = Object.keys(offsets).find(key => object.name === key);
          if (prefix) station.layers.push({ object, position: object.position.clone(), offset: new THREE.Vector3(...offsets[prefix]).divideScalar(scale) });
        }
      });
      station.holder.add(model); station.model = model;
    });
    setLineage('all');
    onLoadProgress({ loaded, total: uniqueNames.length, progress: 1, label: '历史长卷已就绪', status: 'ready' });
    onReady(api);
    return api;
  } catch (error) {
    onLoadProgress({ loaded, total: uniqueNames.length, progress: loaded / uniqueNames.length, label: 'Blender 场景载入失败', status: 'error', error: error.message });
    dispose();
    throw new Error(`历史场景未能载入：${error.message}`, { cause: error });
  }
}
