import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const panels = [], initialRotations = new Map(), angleOffsets = new Map();
let renderer, scene, camera, controls, configuration, model, bounds, activeView;
function render() { renderer?.render(scene, camera); }
function media(filename) { return '/ocean/deepsea/media/' + encodeURI(filename); }
function resize() {
  if (!renderer || !camera) return;
  const width = Math.max($('slice-stage').clientWidth, 1), height = Math.max($('slice-stage').clientHeight, 1);
  renderer.setSize(width, height, false);
  if (camera.isPerspectiveCamera) camera.aspect = width / height;
  else { const half = (activeView?.ortho || 6) / 2; camera.left = -half * width / height; camera.right = half * width / height; }
  if (camera.isPerspectiveCamera && activeView?.lens && !activeView.fov) camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(36 / (2 * activeView.lens * (width / height))));
  camera.updateProjectionMatrix(); render();
}
function chooseView(view) {
  activeView = view;
  const aspect = Math.max($('slice-stage').clientWidth, 1) / Math.max($('slice-stage').clientHeight, 1);
  camera = view.ortho
    ? new THREE.OrthographicCamera(-view.ortho * aspect / 2, view.ortho * aspect / 2, view.ortho / 2, -view.ortho / 2, .01, 200)
    : new THREE.PerspectiveCamera(view.fov || THREE.MathUtils.radToDeg(2 * Math.atan(36 / (2 * (view.lens || 35) * aspect))), aspect, .01, 200);
  camera.position.fromArray(view.position); camera.up.set(0, 1, 0); camera.lookAt(new THREE.Vector3(...view.target));
  controls?.dispose(); controls = new OrbitControls(camera, $('slice-canvas'));
  controls.target.fromArray(view.target); controls.minDistance = .5; controls.maxDistance = 45; controls.minZoom = .3; controls.maxZoom = 10;
  controls.addEventListener('change', render); controls.update();
  $('slice-caption').textContent = view.label || view.title;
  document.querySelectorAll('[data-slice-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sliceView === view.id)));
  window.DeepseaSliceDiagnostics.activeView = view.id; render();
}
function selectedPanel() { return panels[Number($('slice-panel').value)]; }
function refreshAngle() {
  const panel = selectedPanel(), degrees = angleOffsets.get(panel) || 0;
  $('slice-angle').value = String(degrees); $('slice-angle-value').textContent = degrees + '°';
}
function rotatePanel(degrees) {
  const panel = selectedPanel(); if (!panel) return;
  const sourceAxis = String(panel.userData.rotationAxis || configuration.rotationAxis || 'y').toLowerCase();
  const axis = sourceAxis === 'x' ? new THREE.Vector3(1, 0, 0) : sourceAxis === 'z' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  panel.quaternion.copy(initialRotations.get(panel)).multiply(new THREE.Quaternion().setFromAxisAngle(axis, THREE.MathUtils.degToRad(degrees)));
  angleOffsets.set(panel, degrees); refreshAngle();
  window.DeepseaSliceDiagnostics.changedPanels = [...angleOffsets.values()].filter(angle => angle !== 0).length; render();
}
async function start() {
  try {
    const response = await fetch(media('manifest.json'), { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error('manifest');
    const manifest = await response.json(); configuration = manifest.independentNodes?.find(node => node.id === 'transparent-slice-ship');
    if (!configuration) throw new Error('node');
    renderer = new THREE.WebGLRenderer({ canvas: $('slice-canvas'), antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
    scene = new THREE.Scene(); scene.background = new THREE.Color('#172633');
    scene.add(new THREE.HemisphereLight(0xeef8ff, 0x536779, 3));
    const key = new THREE.DirectionalLight(0xffe4ba, 4); key.position.set(7, 10, 10); scene.add(key);
    const fill = new THREE.DirectionalLight(0xaddaff, 2); fill.position.set(-8, 5, -6); scene.add(fill);
    const gltf = await new GLTFLoader().loadAsync(media(configuration.path)); model = gltf.scene; scene.add(model);
    bounds = new THREE.Box3().setFromObject(model);
    model.traverse(object => {
      if (object.userData.slicePanelPivot === true || object.userData.slicePanelPivot === 1) {
        panels.push(object); initialRotations.set(object, object.quaternion.clone()); angleOffsets.set(object, 0);
      }
    });
    panels.sort((a, b) => Number(a.userData.sliceIndex) - Number(b.userData.sliceIndex));
    window.DeepseaSliceDiagnostics = { ready: true, panelCount: panels.length, changedPanels: 0, activeView: null, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() } };
    $('slice-views').replaceChildren(...configuration.views.map(view => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = view.label || view.title;
      button.dataset.sliceView = view.id; button.onclick = () => chooseView(view); return button;
    }));
    $('slice-panel').replaceChildren(...panels.map((panel, index) => {
      const option = document.createElement('option'); option.value = String(index); option.textContent = `第 ${index + 1} 片`; return option;
    }));
    $('slice-panel').onchange = refreshAngle;
    $('slice-angle').oninput = () => rotatePanel(Number($('slice-angle').value));
    $('slice-reset').onclick = () => {
      for (const panel of panels) { panel.quaternion.copy(initialRotations.get(panel)); angleOffsets.set(panel, 0); }
      window.DeepseaSliceDiagnostics.changedPanels = 0; refreshAngle(); chooseView(configuration.views[0]);
    };
    if (!panels.length) { $('slice-panel').disabled = true; $('slice-angle').disabled = true; }
    $('slice-principle').textContent = configuration.principle || '面板上的图像逐片对应不同截面，在固定观察点进行投影校准。旋角调整后，需重新校准画面。';
    chooseView(configuration.views[0]); new ResizeObserver(resize).observe($('slice-stage')); resize();
    $('slice-status').hidden = true;
  } catch {
    $('slice-status').textContent = '切片模型暂时未能打开，请刷新重试。';
    window.DeepseaSliceDiagnostics = { ready: false };
  }
}
start();
