import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Activity,
  BadgeInfo,
  Bone,
  CircleDot,
  Crosshair,
  Database,
  Eye,
  EyeOff,
  Hand,
  Layers,
  MousePointer2,
  Move3d,
  Rotate3d,
  RotateCcw,
  Ruler,
  ScanSearch,
  Search,
  ShieldPlus,
  createIcons,
} from 'lucide';
import {
  layerColors,
  layerNames,
  regionData,
  structureTerms,
  techniques,
  type LayerKey,
  type RegionContent,
  type RegionId,
  type StructureTerm,
  type Technique,
  type Vec3,
} from './data';

type ViewMode = 'anatomy' | 'technique';

interface AnatomyObjectData {
  layer?: LayerKey;
  regions?: RegionId[];
  baseColor?: number;
  baseOpacity?: number;
  anatomicalName?: string;
  englishName?: string;
  structureTerm?: StructureTerm;
  sourceType?: string;
  selectable?: boolean;
  pulseOffset?: number;
}

type AnatomyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> & {
  userData: AnatomyObjectData;
};

interface CameraMove {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  startTarget: THREE.Vector3;
  endTarget: THREE.Vector3;
  startedAt: number;
  duration: number;
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"><i data-lucide="scan-search"></i></div>
        <div>
          <h1 class="brand-title">正骨三维解剖科普</h1>
          <p class="brand-subtitle">真实骨骼 · 肌肉 · 肌腱 · 韧带 · 手法力学</p>
        </div>
      </div>
      <div class="topbar-meta" aria-label="模型信息">
        <span class="meta-pill"><i data-lucide="database"></i><b id="modelStats">加载中</b></span>
        <span class="meta-pill"><i data-lucide="mouse-pointer-2"></i>单结构可点选</span>
        <span class="meta-pill"><i data-lucide="hand"></i>手法路径演示</span>
        <span class="meta-pill"><i data-lucide="shield-plus"></i>科普用途</span>
      </div>
    </header>

    <main class="workspace">
      <aside class="panel nav-panel">
        <div class="panel-inner">
          <div class="panel-heading">
            <h2>结构与部位检索</h2>
            <span id="resultCount"></span>
          </div>
          <div class="search-box">
            <input id="searchInput" type="search" autocomplete="off" placeholder="搜索：冈上肌、腰椎、跟腱..." />
            <button id="searchButton" class="search-button" type="button" aria-label="搜索"><i data-lucide="search"></i></button>
          </div>
          <section class="suggestions scrollbar-thin" id="suggestions" aria-label="搜索结果"></section>

          <section>
            <div class="panel-heading compact-heading">
              <h2>解剖层</h2>
              <span>按层观察</span>
            </div>
            <div class="layer-controls" id="layerControls"></div>
          </section>

          <section class="condition-list scrollbar-thin" id="conditionList" aria-label="典型正骨部位"></section>
        </div>
      </aside>

      <section class="stage" aria-label="三维人体解剖模型">
        <div class="viewport" id="viewport"></div>
        <div class="scan-lines"></div>

        <div class="model-loader" id="modelLoader" role="status">
          <div class="loader-symbol"><i data-lucide="bone"></i></div>
          <strong>正在载入真实人体解剖模型</strong>
          <span id="loaderProgress">准备 826 个独立结构</span>
          <div class="loader-track"><i id="loaderBar"></i></div>
        </div>

        <div class="stage-hud">
          <div class="readout">
            <p class="readout-label">当前聚焦</p>
            <h2 class="readout-title" id="readoutTitle"></h2>
            <div class="readout-tags" id="readoutTags"></div>
          </div>
          <div class="stage-actions">
            <div class="mode-switch" aria-label="查看模式">
              <button type="button" class="mode-button active" data-mode="anatomy"><i data-lucide="activity"></i>解剖</button>
              <button type="button" class="mode-button" data-mode="technique"><i data-lucide="hand"></i>手法</button>
            </div>
            <div class="stage-tools">
              <button id="resetView" class="icon-button" type="button" aria-label="重置视角" title="重置视角"><i data-lucide="rotate-ccw"></i></button>
              <button id="focusView" class="icon-button" type="button" aria-label="聚焦部位" title="聚焦部位"><i data-lucide="rotate-3d"></i></button>
            </div>
          </div>
        </div>

        <div class="hotspot-layer" id="hotspotLayer"></div>

        <div class="structure-readout" id="structureReadout" hidden>
          <span id="structureType"></span>
          <div><strong id="structureName"></strong><small id="structureEnglish"></small></div>
        </div>

        <div class="model-legend" aria-label="结构图例">
          ${(['bone', 'muscle', 'tendon', 'ligament'] as LayerKey[])
            .map((layer) => `<span class="legend-item"><span class="swatch" style="background:${layerColors[layer]}"></span>${layerNames[layer]}</span>`)
            .join('')}
        </div>
      </section>

      <aside class="panel detail-panel">
        <div class="panel-inner">
          <div class="panel-heading">
            <div>
              <h2 class="detail-title" id="detailTitle"></h2>
              <span class="detail-category" id="detailCategory"></span>
            </div>
            <span class="evidence-badge">解剖导向</span>
          </div>
          <div class="detail-tabs" role="tablist">
            <button type="button" class="detail-tab active" data-mode="anatomy">结构关系</button>
            <button type="button" class="detail-tab" data-mode="technique">手法演示</button>
          </div>
          <div class="detail-type" id="detailType"></div>
          <div class="detail-scroll scrollbar-thin" id="detailScroll"></div>
          <div class="warning">
            <i data-lucide="badge-info"></i>
            <span>仅用于专业科普与原理展示，不提供自行操作指引；急性损伤和神经症状应先就医。</span>
          </div>
          <a class="attribution" href="https://github.com/hpfrei/body-anatomy-3d-viewer" target="_blank" rel="noreferrer">模型源于 Z-Anatomy / BodyParts3D，CC BY-SA 4.0</a>
        </div>
      </aside>
    </main>
  </div>
`;

const iconSet = {
  Activity,
  BadgeInfo,
  Bone,
  CircleDot,
  Crosshair,
  Database,
  Eye,
  EyeOff,
  Hand,
  Layers,
  MousePointer2,
  Move3d,
  Rotate3d,
  RotateCcw,
  Ruler,
  ScanSearch,
  Search,
  ShieldPlus,
};

function refreshIcons(): void {
  createIcons({ icons: iconSet });
}

refreshIcons();

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required DOM element missing: ${selector}`);
  return element;
}

function vector(value: Vec3): THREE.Vector3 {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

const viewport = getElement<HTMLDivElement>('#viewport');
const modelLoader = getElement<HTMLDivElement>('#modelLoader');
const loaderProgress = getElement<HTMLSpanElement>('#loaderProgress');
const loaderBar = getElement<HTMLElement>('#loaderBar');
const modelStats = getElement<HTMLElement>('#modelStats');
const hotspotLayer = getElement<HTMLDivElement>('#hotspotLayer');
const suggestionsEl = getElement<HTMLDivElement>('#suggestions');
const conditionListEl = getElement<HTMLDivElement>('#conditionList');
const layerControlsEl = getElement<HTMLDivElement>('#layerControls');
const searchInput = getElement<HTMLInputElement>('#searchInput');
const searchButton = getElement<HTMLButtonElement>('#searchButton');
const readoutTitle = getElement<HTMLHeadingElement>('#readoutTitle');
const readoutTags = getElement<HTMLDivElement>('#readoutTags');
const detailTitle = getElement<HTMLHeadingElement>('#detailTitle');
const detailCategory = getElement<HTMLSpanElement>('#detailCategory');
const detailType = getElement<HTMLDivElement>('#detailType');
const detailScroll = getElement<HTMLDivElement>('#detailScroll');
const resultCount = getElement<HTMLSpanElement>('#resultCount');
const resetViewButton = getElement<HTMLButtonElement>('#resetView');
const focusViewButton = getElement<HTMLButtonElement>('#focusView');
const structureReadout = getElement<HTMLDivElement>('#structureReadout');
const structureType = getElement<HTMLSpanElement>('#structureType');
const structureName = getElement<HTMLElement>('#structureName');
const structureEnglish = getElement<HTMLElement>('#structureEnglish');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070b0c, 6.5, 11.5);

const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100);
camera.position.set(0.15, 0.5, 9.1);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.94;
viewport.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.45, 0);
controls.minDistance = 1.15;
controls.maxDistance = 10.5;
controls.maxPolarAngle = Math.PI * 0.94;

const bodyGroup = new THREE.Group();
const techniqueGroup = new THREE.Group();
techniqueGroup.name = 'Technique overlays';
bodyGroup.add(techniqueGroup);
scene.add(bodyGroup);

const anatomyMeshes: AnatomyMesh[] = [];
const activeLayers = new Set<LayerKey>(['bone', 'muscle', 'tendon', 'ligament', 'connection']);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();

let activeRegion: RegionContent = regionData.find((region) => region.id === 'shoulder') ?? regionData[0];
let activeMode: ViewMode = 'anatomy';
let activeTechnique: Technique | null = null;
let hoveredMesh: AnatomyMesh | null = null;
let selectedMesh: AnatomyMesh | null = null;
let cameraMove: CameraMove | null = null;
let pointerDownAt: THREE.Vector2 | null = null;
let modelReady = false;

function buildEnvironment(): void {
  scene.add(new THREE.HemisphereLight(0xf6efe0, 0x0a1818, 1.55));

  const key = new THREE.DirectionalLight(0xfff4e7, 2.15);
  key.position.set(3.5, 5, 4.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xa7d7d1, 0.9);
  fill.position.set(-4, 2.5, 1.5);
  scene.add(fill);

  const rim = new THREE.PointLight(0x34e1cf, 8, 7, 2);
  rim.position.set(-2.2, 1.3, -2.4);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.85, 96),
    new THREE.MeshStandardMaterial({ color: 0x0a1112, roughness: 0.9, metalness: 0.05, transparent: true, opacity: 0.88 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.23;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.12, 0.006, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0x36d7c8, transparent: true, opacity: 0.5 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.205;
  scene.add(ring);

  const grid = new THREE.GridHelper(5.4, 18, 0x245b56, 0x172724);
  grid.position.y = -2.21;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  scene.add(grid);
}

function inheritedMetadata(object: THREE.Object3D): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};
  let current: THREE.Object3D | null = object;
  while (current) {
    for (const [key, value] of Object.entries(current.userData)) {
      if (metadata[key] === undefined && value !== undefined) metadata[key] = value;
    }
    current = current.parent;
  }
  return metadata;
}

function hashValue(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
}

function resolveStructureTerm(name: string): StructureTerm | undefined {
  const normalized = name.toLowerCase();
  return structureTerms.find((term) => term.patterns.some((pattern) => normalized.includes(pattern)));
}

function classifyLayer(name: string, sourceType: string): LayerKey {
  const normalized = name.toLowerCase();
  if (normalized.includes('ligament')) return 'ligament';
  if (['tendon', 'aponeuros', 'retinaculum', 'tendinous'].some((token) => normalized.includes(token))) return 'tendon';
  return sourceType === 'bone' ? 'bone' : 'muscle';
}

function materialFor(layer: LayerKey, name: string): THREE.MeshStandardMaterial {
  let color = new THREE.Color(layerColors[layer]);
  if (layer === 'muscle') {
    const variation = (hashValue(name) % 17) / 100 - 0.08;
    color = new THREE.Color().setHSL(0.006 + variation * 0.06, 0.66, 0.25 + variation * 0.55);
  }
  if (layer === 'bone') {
    const variation = (hashValue(name) % 11) / 180;
    color.offsetHSL(0, -0.03, variation);
  }
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: layer === 'bone' ? 0.72 : 0.66,
    metalness: 0.01,
    transparent: true,
    opacity: layer === 'ligament' ? 0.86 : 1,
    depthWrite: true,
  });
  material.emissive.setHex(0x000000);
  material.emissiveIntensity = 0;
  return material;
}

function regionsForMesh(mesh: AnatomyMesh, term?: StructureTerm): RegionId[] {
  if (term) return term.region === 'knee' || term.region === 'achilles' ? [term.region, 'leg-length'] : [term.region];
  const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
  const name = (mesh.userData.englishName ?? mesh.name).toLowerCase();
  const regions = new Set<RegionId>();

  if (center.y > 2.25) regions.add('cervical');
  if ((center.y > 1.6 && center.y < 2.35 && Math.abs(center.x) > 0.28) || /shoulder|scapula|clavicle|humer|deltoid/.test(name)) regions.add('shoulder');
  if ((center.y > 1.05 && center.y < 2.15) || /thoracic|rib|sternum|trapezi|rhomboid|serratus/.test(name)) regions.add('thoracic-rib');
  if ((center.y > 0.55 && center.y < 1.18) || /lumbar|erector spinae|multifidus|quadratus lumborum/.test(name)) regions.add('lumbar-disc');
  if ((center.y > 0.02 && center.y < 0.68) || /pelvis|sacrum|ilium|glute|piriform/.test(name)) regions.add('pelvis');
  if (center.y < 0.3 || /femur|tibia|fibula|lower limb/.test(name)) regions.add('leg-length');
  if ((center.y > -1.15 && center.y < -0.4) || /patella|knee|menisc|cruciate/.test(name)) regions.add('knee');
  if (center.y < -1.45 || /calcane|achilles|gastrocnemius|soleus|ankle/.test(name)) regions.add('achilles');

  return regions.size ? [...regions] : ['thoracic-rib'];
}

function prepareModel(model: THREE.Object3D): void {
  const scale = 3.2;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  const initialBox = new THREE.Box3().setFromObject(model);
  const center = initialBox.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -2.2 - initialBox.min.y, -center.z);
  bodyGroup.add(model);
  model.updateMatrixWorld(true);

  const layerCounts: Record<LayerKey, number> = { bone: 0, muscle: 0, tendon: 0, ligament: 0, connection: 0 };
  model.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;
    const mesh = object as AnatomyMesh;
    const metadata = inheritedMetadata(mesh);
    const englishName = String(metadata.nameDetail ?? metadata.name ?? mesh.name ?? 'Anatomical structure');
    const sourceType = String(metadata.type ?? 'muscle');
    const term = resolveStructureTerm(englishName);
    const layer = term?.layer ?? classifyLayer(englishName, sourceType);

    mesh.material = materialFor(layer, englishName);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.layer = layer;
    mesh.userData.sourceType = sourceType;
    mesh.userData.englishName = englishName;
    mesh.userData.anatomicalName = term?.zh ?? String(metadata.name ?? englishName);
    mesh.userData.structureTerm = term;
    mesh.userData.baseColor = mesh.material.color.getHex();
    mesh.userData.baseOpacity = mesh.material.opacity;
    mesh.userData.selectable = true;
    mesh.userData.regions = regionsForMesh(mesh, term);
    anatomyMeshes.push(mesh);
    layerCounts[layer] += 1;
  });

  modelStats.textContent = `${anatomyMeshes.length} 个真实结构`;
  loaderProgress.textContent = `骨骼 ${layerCounts.bone} · 肌肉 ${layerCounts.muscle} · 肌腱/韧带 ${layerCounts.tendon + layerCounts.ligament}`;
  loaderBar.style.width = '100%';
  modelReady = true;
  window.setTimeout(() => modelLoader.classList.add('loaded'), 420);
  updateLayerVisibility();
  updateHighlights();
  renderSuggestions(searchInput.value);
}

function loadAnatomyModel(): void {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    `${import.meta.env.BASE_URL}models/body.glb`,
    (gltf) => {
      prepareModel(gltf.scene);
      dracoLoader.dispose();
    },
    (progress) => {
      if (!progress.total) return;
      const percent = Math.min(96, Math.round((progress.loaded / progress.total) * 100));
      loaderProgress.textContent = `正在解压模型 ${percent}%`;
      loaderBar.style.width = `${percent}%`;
    },
    (error) => {
      console.error('Failed to load anatomy model', error);
      modelLoader.classList.add('error');
      loaderProgress.textContent = '模型载入失败，请刷新页面重试';
    },
  );
}

function buildHotspots(): void {
  hotspotLayer.innerHTML = regionData.map((region) => `<button class="hotspot" type="button" data-hotspot="${region.id}">${region.shortTitle}</button>`).join('');
  hotspotLayer.querySelectorAll<HTMLButtonElement>('.hotspot').forEach((button) => {
    button.addEventListener('click', () => selectRegion(button.dataset.hotspot as RegionId, true));
  });
}

function renderLayerControls(): void {
  layerControlsEl.innerHTML = (Object.keys(layerNames) as LayerKey[])
    .map((layer) => `<button class="layer-toggle active" type="button" data-layer="${layer}" aria-pressed="true"><span><i class="layer-dot" style="background:${layerColors[layer]}"></i>${layerNames[layer]}</span><i data-lucide="eye"></i></button>`)
    .join('');
  refreshIcons();
  layerControlsEl.querySelectorAll<HTMLButtonElement>('.layer-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const layer = button.dataset.layer as LayerKey;
      activeLayers.has(layer) ? activeLayers.delete(layer) : activeLayers.add(layer);
      const active = activeLayers.has(layer);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active.toString());
      const icon = button.querySelector<HTMLElement>('[data-lucide]');
      if (icon) icon.outerHTML = `<i data-lucide="${active ? 'eye' : 'eye-off'}"></i>`;
      refreshIcons();
      updateLayerVisibility();
    });
  });
}

function renderConditionList(): void {
  conditionListEl.innerHTML = regionData.map((region) => `<button class="condition-button" type="button" data-region="${region.id}"><strong>${region.shortTitle}</strong><span>${region.summary}</span></button>`).join('');
  conditionListEl.querySelectorAll<HTMLButtonElement>('.condition-button').forEach((button) => {
    button.addEventListener('click', () => selectRegion(button.dataset.region as RegionId, true));
  });
}

function matchingStructures(query: string): { term: StructureTerm; index: number }[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return structureTerms
    .map((term, index) => ({ term, index }))
    .filter(({ term }) => [term.zh, ...term.aliases, ...term.patterns].some((value) => value.toLowerCase().includes(normalized)))
    .slice(0, 8);
}

function renderSuggestions(query = ''): void {
  const normalized = query.trim().toLowerCase();
  const regions = normalized
    ? regionData.filter((region) => [region.title, region.shortTitle, region.category, ...region.aliases].some((value) => value.toLowerCase().includes(normalized)))
    : regionData;
  const structures = matchingStructures(query);
  const total = regions.length + structures.length;
  resultCount.textContent = `${total} 项`;

  const regionMarkup = regions.map((region) => `<button class="suggestion ${region.id === activeRegion.id ? 'active' : ''}" type="button" data-kind="region" data-id="${region.id}"><i data-lucide="circle-dot"></i><span><strong>${region.shortTitle}</strong><small>${region.category}</small></span><em>部位</em></button>`).join('');
  const structureMarkup = structures.map(({ term, index }) => `<button class="suggestion structure-result" type="button" data-kind="structure" data-index="${index}"><i data-lucide="crosshair"></i><span><strong>${term.zh}</strong><small>${layerNames[term.layer]} · ${regionData.find((region) => region.id === term.region)?.shortTitle}</small></span><em>结构</em></button>`).join('');
  suggestionsEl.innerHTML = regionMarkup + structureMarkup || `<div class="empty-result">未找到匹配结构</div>`;
  refreshIcons();

  suggestionsEl.querySelectorAll<HTMLButtonElement>('.suggestion').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.kind === 'region') selectRegion(button.dataset.id as RegionId, true);
      else selectStructureTerm(Number(button.dataset.index));
    });
  });
}

function renderAnatomyDetail(region: RegionContent): void {
  detailScroll.innerHTML = `
    <div class="metric-strip">${region.metrics.map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
    <section class="detail-block"><h3>结构关系</h3><p>${region.anatomy}</p></section>
    <section class="detail-block"><h3>常见表现</h3><ul>${region.signals.map((item) => `<li>${item}</li>`).join('')}</ul></section>
    <section class="detail-block"><h3>专业评估重点</h3><ul>${region.assessment.map((item) => `<li>${item}</li>`).join('')}</ul></section>
    <section class="detail-block danger-block"><h3>需要及时就医的信号</h3><ul>${region.redFlags.map((item) => `<li>${item}</li>`).join('')}</ul></section>
  `;
}

function renderTechniqueDetail(region: RegionContent): void {
  const options = techniques.filter((technique) => technique.region === region.id);
  if (!activeTechnique || activeTechnique.region !== region.id) activeTechnique = options[0] ?? null;
  if (!activeTechnique) {
    detailScroll.innerHTML = `<div class="empty-technique"><i data-lucide="move-3d"></i><strong>该部位手法模型正在建立</strong><span>解剖结构仍可正常点选和观察。</span></div>`;
    refreshIcons();
    clearTechniqueOverlay();
    return;
  }

  detailScroll.innerHTML = `
    <div class="technique-list">${options.map((technique) => `<button class="technique-option ${technique.id === activeTechnique?.id ? 'active' : ''}" type="button" data-technique="${technique.id}"><span>${technique.category}</span><strong>${technique.name}</strong><small>${technique.master}</small></button>`).join('')}</div>
    <section class="technique-hero"><div><span>${activeTechnique.level}</span><h3>${activeTechnique.name}</h3></div><p>${activeTechnique.summary}</p></section>
    <section class="detail-block"><h3>力学原理</h3><p>${activeTechnique.principle}</p></section>
    <div class="technique-map">
      <div><span class="contact-key primary"></span><strong>${activeTechnique.contact}</strong></div>
      <div><span class="contact-key stable"></span><strong>${activeTechnique.stabilize}</strong></div>
      <div><i data-lucide="move-3d"></i><strong>${activeTechnique.direction}</strong></div>
    </div>
    <section class="detail-block danger-block"><h3>禁忌与停止信号</h3><ul>${activeTechnique.contraindications.map((item) => `<li>${item}</li>`).join('')}</ul></section>
  `;
  refreshIcons();
  detailScroll.querySelectorAll<HTMLButtonElement>('.technique-option').forEach((button) => {
    button.addEventListener('click', () => {
      const technique = techniques.find((item) => item.id === button.dataset.technique);
      if (technique) showTechnique(technique, true);
    });
  });
  buildTechniqueOverlay(activeTechnique);
}

function renderDetail(region: RegionContent): void {
  detailTitle.textContent = region.title;
  detailCategory.textContent = region.category;
  readoutTitle.textContent = activeMode === 'technique' && activeTechnique?.region === region.id ? activeTechnique.name : region.shortTitle;
  const readoutLayers: LayerKey[] = activeMode === 'technique' ? ['connection', ...region.layers] : region.layers;
  readoutTags.innerHTML = readoutLayers
    .filter((layer, index, list) => list.indexOf(layer) === index)
    .map((layer) => `<span class="tag">${layerNames[layer]}</span>`)
    .join('');
  detailType.innerHTML = region.layers.map((layer) => `<span class="type-pill" style="border-color:${layerColors[layer]}55"><span class="swatch" style="background:${layerColors[layer]}"></span>${layerNames[layer]}</span>`).join('');
  activeMode === 'anatomy' ? renderAnatomyDetail(region) : renderTechniqueDetail(region);
}

function setMode(mode: ViewMode): void {
  activeMode = mode;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  techniqueGroup.visible = mode === 'technique' && activeLayers.has('connection');
  if (mode === 'technique') {
    const first = techniques.find((technique) => technique.region === activeRegion.id);
    if (first) activeTechnique = first;
  } else {
    activeTechnique = null;
    clearTechniqueOverlay();
  }
  renderDetail(activeRegion);
  if (mode === 'technique' && activeTechnique) moveCamera(vector(activeTechnique.camera), vector(activeTechnique.target));
  if (mode === 'anatomy') focusCamera(activeRegion);
  updateHighlights();
}

function selectRegion(regionId: RegionId, shouldFocus = false): void {
  const region = regionData.find((item) => item.id === regionId);
  if (!region) return;
  activeRegion = region;
  selectedMesh = null;
  structureReadout.hidden = true;
  if (activeTechnique?.region !== regionId) activeTechnique = null;
  renderDetail(region);
  renderSuggestions(searchInput.value);
  document.querySelectorAll<HTMLElement>('[data-region], [data-hotspot]').forEach((element) => element.classList.toggle('active', element.dataset.region === regionId || element.dataset.hotspot === regionId));
  updateHighlights();
  if (shouldFocus) focusCamera(region);
}

function moveCamera(position: THREE.Vector3, target: THREE.Vector3, duration = 720): void {
  cameraMove = {
    startPosition: camera.position.clone(),
    endPosition: position,
    startTarget: controls.target.clone(),
    endTarget: target,
    startedAt: performance.now(),
    duration,
  };
}

function focusCamera(region: RegionContent): void {
  moveCamera(vector(region.camera), vector(region.focus));
}

function resetCamera(): void {
  moveCamera(new THREE.Vector3(0.15, 0.5, 9.1), new THREE.Vector3(0, 0.48, 0));
}

function clearTechniqueOverlay(): void {
  while (techniqueGroup.children.length) {
    const child = techniqueGroup.children.pop();
    child?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
      else mesh.material?.dispose();
    });
  }
}

function addContactMarker(point: Vec3, role: 'contact' | 'stabilize', index: number): void {
  const color = role === 'contact' ? 0xffb45d : 0x52e0d0;
  const group = new THREE.Group();
  group.position.copy(vector(point));
  group.userData.pulseOffset = index * 0.9;

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 18), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.35 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 8, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.76, depthTest: false }));
  ring.rotation.x = Math.PI / 2;
  ring.userData.pulseOffset = index * 0.9;
  group.add(core, ring);
  techniqueGroup.add(group);
}

function buildTechniqueOverlay(technique: Technique): void {
  clearTechniqueOverlay();
  technique.contacts.forEach((contact, index) => addContactMarker(contact.point, contact.role, index));
  technique.vectors.forEach((item) => {
    const from = vector(item.from);
    const to = vector(item.to);
    const direction = to.clone().sub(from);
    const length = direction.length();
    const arrow = new THREE.ArrowHelper(direction.normalize(), from, length, 0x56e3c6, 0.13, 0.075);
    const lineMaterial = arrow.line.material as THREE.LineBasicMaterial;
    lineMaterial.transparent = true;
    lineMaterial.opacity = 0.92;
    arrow.userData.pulseOffset = 0.4;
    techniqueGroup.add(arrow);
  });
  techniqueGroup.visible = activeMode === 'technique' && activeLayers.has('connection');
}

function showTechnique(technique: Technique, focus: boolean): void {
  activeTechnique = technique;
  activeMode = 'technique';
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === 'technique'));
  renderDetail(activeRegion);
  if (focus) moveCamera(vector(technique.camera), vector(technique.target));
}

function updateLayerVisibility(): void {
  anatomyMeshes.forEach((mesh) => {
    const layer = mesh.userData.layer;
    mesh.visible = Boolean(layer && activeLayers.has(layer));
  });
  techniqueGroup.visible = activeMode === 'technique' && activeLayers.has('connection');
}

function updateHighlights(): void {
  anatomyMeshes.forEach((mesh) => {
    const material = mesh.material;
    const baseColor = mesh.userData.baseColor ?? 0xffffff;
    material.color.setHex(baseColor);
    material.opacity = mesh.userData.baseOpacity ?? 1;
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;

    const belongs = mesh.userData.regions?.includes(activeRegion.id);
    if (belongs) {
      material.emissive.setHex(activeMode === 'technique' ? 0x12352f : 0x0d2825);
      material.emissiveIntensity = activeMode === 'technique' ? 0.22 : 0.13;
    }
    if (mesh === hoveredMesh) {
      material.emissive.setHex(0x1c6b63);
      material.emissiveIntensity = 0.32;
    }
    if (mesh === selectedMesh) {
      material.color.lerp(new THREE.Color(0xffd38a), 0.38);
      material.emissive.setHex(0xff9d45);
      material.emissiveIntensity = 0.48;
      material.depthTest = false;
      mesh.renderOrder = 20;
    } else {
      material.depthTest = true;
      mesh.renderOrder = 0;
    }
  });
}

function selectStructureTerm(index: number): void {
  const term = structureTerms[index];
  if (!term) return;
  const mesh = anatomyMeshes.find((item) => term.patterns.some((pattern) => (item.userData.englishName ?? '').toLowerCase().includes(pattern)));
  if (activeMode !== 'anatomy') setMode('anatomy');
  selectRegion(term.region, false);
  activeLayers.add(term.layer);
  syncLayerButtons();
  updateLayerVisibility();
  if (mesh) selectMesh(mesh, true);
}

function syncLayerButtons(): void {
  layerControlsEl.querySelectorAll<HTMLButtonElement>('.layer-toggle').forEach((button) => {
    const active = activeLayers.has(button.dataset.layer as LayerKey);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active.toString());
  });
}

function selectMesh(mesh: AnatomyMesh, focus: boolean): void {
  selectedMesh = mesh;
  const term = mesh.userData.structureTerm;
  structureType.textContent = layerNames[mesh.userData.layer ?? 'muscle'];
  structureName.textContent = term?.zh ?? mesh.userData.anatomicalName ?? '解剖结构';
  structureEnglish.textContent = mesh.userData.englishName ?? mesh.name;
  structureReadout.hidden = false;
  updateHighlights();

  if (focus) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = THREE.MathUtils.clamp(Math.max(size.x, size.y, size.z) * 5.5, 1.45, 3.4);
    const direction = camera.position.clone().sub(controls.target).normalize();
    moveCamera(center.clone().add(direction.multiplyScalar(distance)), center);
  }
}

function resizeRenderer(): void {
  const rect = viewport.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function updateHotspotPositions(): void {
  const rect = viewport.getBoundingClientRect();
  hotspotLayer.querySelectorAll<HTMLButtonElement>('.hotspot').forEach((button) => {
    const region = regionData.find((item) => item.id === button.dataset.hotspot);
    if (!region) return;
    const point = vector(region.hotspot).applyQuaternion(bodyGroup.quaternion).project(camera);
    const x = (point.x * 0.5 + 0.5) * rect.width;
    const y = (-point.y * 0.5 + 0.5) * rect.height;
    const isOutside = point.z > 1 || x < 0 || x > rect.width || y < 0 || y > rect.height;
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    const isActive = button.dataset.hotspot === activeRegion.id;
    button.style.opacity = isOutside || activeMode === 'technique' ? '0' : isActive ? '1' : '0.62';
    button.style.pointerEvents = isOutside || activeMode === 'technique' ? 'none' : 'auto';
  });
}

function updatePointer(event: PointerEvent): void {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function intersectAnatomy(): AnatomyMesh | null {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(anatomyMeshes, false).find((item) => (item.object as AnatomyMesh).visible);
  return (hit?.object as AnatomyMesh | undefined) ?? null;
}

function handlePointerMove(event: PointerEvent): void {
  if (!modelReady) return;
  updatePointer(event);
  const mesh = intersectAnatomy();
  if (hoveredMesh === mesh) return;
  hoveredMesh = mesh;
  renderer.domElement.style.cursor = mesh ? 'pointer' : 'grab';
  updateHighlights();
}

function handlePointerDown(event: PointerEvent): void {
  pointerDownAt = new THREE.Vector2(event.clientX, event.clientY);
}

function handlePointerUp(event: PointerEvent): void {
  if (!pointerDownAt || pointerDownAt.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 6) return;
  updatePointer(event);
  const mesh = intersectAnatomy();
  if (!mesh) return;
  const region = mesh.userData.structureTerm?.region ?? mesh.userData.regions?.[0];
  if (region) selectRegion(region, false);
  selectMesh(mesh, true);
}

function animateCamera(now: number): void {
  if (!cameraMove) return;
  const raw = THREE.MathUtils.clamp((now - cameraMove.startedAt) / cameraMove.duration, 0, 1);
  const eased = raw * raw * (3 - 2 * raw);
  camera.position.lerpVectors(cameraMove.startPosition, cameraMove.endPosition, eased);
  controls.target.lerpVectors(cameraMove.startTarget, cameraMove.endTarget, eased);
  if (raw >= 1) cameraMove = null;
}

function animateTechnique(elapsed: number): void {
  techniqueGroup.children.forEach((child, index) => {
    if (!(child instanceof THREE.Group)) return;
    const ring = child.children[1] as THREE.Mesh | undefined;
    if (!ring) return;
    const pulse = 1 + Math.sin(elapsed * 3.2 + index * 0.9) * 0.18;
    ring.scale.setScalar(pulse);
    const material = ring.material as THREE.MeshBasicMaterial;
    material.opacity = 0.55 + Math.sin(elapsed * 3.2 + index * 0.9) * 0.2;
  });
}

function animate(now = performance.now()): void {
  const elapsed = clock.getElapsedTime();
  animateCamera(now);
  animateTechnique(elapsed);
  bodyGroup.rotation.y = Math.sin(elapsed * 0.15) * (activeMode === 'anatomy' ? 0.025 : 0.008);
  controls.update();
  updateHotspotPositions();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function activateFirstSuggestion(): void {
  suggestionsEl.querySelector<HTMLButtonElement>('.suggestion')?.click();
}

function setupEvents(): void {
  searchInput.addEventListener('input', () => renderSuggestions(searchInput.value));
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') activateFirstSuggestion();
  });
  searchButton.addEventListener('click', activateFirstSuggestion);
  resetViewButton.addEventListener('click', resetCamera);
  focusViewButton.addEventListener('click', () => {
    if (activeMode === 'technique' && activeTechnique) moveCamera(vector(activeTechnique.camera), vector(activeTechnique.target));
    else focusCamera(activeRegion);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode as ViewMode)));
  renderer.domElement.addEventListener('pointermove', handlePointerMove);
  renderer.domElement.addEventListener('pointerdown', handlePointerDown);
  renderer.domElement.addEventListener('pointerup', handlePointerUp);
  renderer.domElement.addEventListener('pointerleave', () => {
    hoveredMesh = null;
    updateHighlights();
  });
  window.addEventListener('resize', resizeRenderer);
}

buildEnvironment();
buildHotspots();
renderLayerControls();
renderConditionList();
renderSuggestions();
renderDetail(activeRegion);
selectRegion(activeRegion.id, false);
resizeRenderer();
setupEvents();
loadAnatomyModel();
animate();
