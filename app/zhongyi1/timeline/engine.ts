import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildFuxiScene } from "./fuxiScene";
import { buildTaixiScene } from "./taixiScene";
import { buildScholarScene } from "./scholarScene";
import { buildModernScene } from "./modernScene";

export type TimelineMode = "overview" | "journey" | "inspect";
export type ProjectedMarker = { id: string; x: number; y: number; visible: boolean };
export type TimelineCallbacks = {
  onReady: () => void;
  onFallback: (reason: string) => void;
  onNode: (index: number) => void;
  onMode: (mode: TimelineMode, artifactId?: string) => void;
  onProgress: (progress: number) => void;
  onMarkers: (markers: ProjectedMarker[]) => void;
};
export type TimelineEngine = {
  selectNode: (index: number) => void;
  setProgress: (progress: number) => void;
  overview: () => void;
  focus: (id: string) => void;
  returnToTimeline: () => void;
  rotate: (direction: number) => void;
  zoom: (direction: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  dispose: () => void;
};

const locations = [
  new THREE.Vector3(-7, 0, 10), new THREE.Vector3(7, 0, -7),
  new THREE.Vector3(-7, 0, -24), new THREE.Vector3(7, 0, -41),
  new THREE.Vector3(-7, 0, -58), new THREE.Vector3(7, 0, -75),
];
const names = ["伏羲台", "台西遗址", "张元素", "李东垣", "罗天益", "路志正"];
const eras = ["上古传说", "商代中期", "金代", "13 世纪", "13 世纪", "1920—2023"];

export function createTimelineEngine(host: HTMLElement, callbacks: TimelineCallbacks, initialReduced = false): TimelineEngine {
  const mobile = host.clientWidth < 720;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.4 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // The dioramas and lights are static; camera motion does not require another
  // shadow pass over all six worlds on every frame.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "燕赵医脉实时三维时间长卷。滚动或拖动穿行六个年代，点击发光观察点聚焦器物；可使用屏幕下方的年代和前后按钮。");
  canvas.setAttribute("data-testid", "timeline-canvas");
  canvas.tabIndex = 0;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none;outline-offset:-5px;";
  host.appendChild(canvas);

  const world = new THREE.Scene();
  world.background = new THREE.Color(0x0a201e);
  world.fog = new THREE.FogExp2(0x0a201e, .0055);
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 220);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmrem.fromScene(environment, .025);
  world.environment = environmentTexture.texture;
  environment.dispose(); pmrem.dispose();
  world.add(new THREE.AmbientLight(0xc1d8c5, 1));
  const sun = new THREE.DirectionalLight(0xffe0ac, 2.5);
  sun.position.set(-20, 42, 24); sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 60, bottom: -60, far: 150 });
  sun.shadow.normalBias = .035;
  sun.target.position.set(0, 0, -32); world.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x83bcba, 1.05); fill.position.set(18, 14, -42); world.add(fill);
  const rim = new THREE.DirectionalLight(0xf6b872, .7); rim.position.set(0, 7, -85); world.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x041410, roughness: .98, metalness: .02, envMapIntensity: .15 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -1.12, -32); ground.receiveShadow = true; world.add(ground);

  const stages = [buildFuxiScene(), buildTaixiScene(), buildScholarScene(0), buildScholarScene(1), buildScholarScene(2), buildModernScene()];
  const focusObjects = new Map<string, { object: THREE.Object3D; node: number }>();
  const labelSprites: THREE.Sprite[] = [];
  const stageRings: THREE.Mesh[] = [];
  stages.forEach((group, index) => {
    group.position.copy(locations[index]); group.userData.nodeIndex = index; world.add(group);
    group.traverse(object => {
      if (typeof object.userData.focusId === "string" && !focusObjects.has(object.userData.focusId)) focusObjects.set(object.userData.focusId, { object, node: index });
      if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; }
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5.5, .025, 6, 96), new THREE.MeshStandardMaterial({ color: 0xb89358, metalness: .75, roughness: .4, emissive: 0x795022, emissiveIntensity: .3 }));
    ring.rotation.x = -Math.PI / 2; ring.position.copy(locations[index]).add(new THREE.Vector3(0, -.35, 0)); world.add(ring); stageRings.push(ring);
    const label = document.createElement("canvas"); label.width = 768; label.height = 180;
    const ctx = label.getContext("2d")!;
    ctx.textAlign = "center"; ctx.fillStyle = "#d9b97b"; ctx.font = '23px "Songti SC", serif'; ctx.fillText(eras[index], 384, 45);
    ctx.font = '44px "Songti SC", serif'; ctx.fillStyle = "#f0ead8"; ctx.fillText(names[index], 384, 108);
    ctx.fillStyle = "#b39662"; ctx.fillRect(348, 142, 72, 1);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(label), transparent: true, depthWrite: false, opacity: .9 }));
    sprite.position.copy(locations[index]).add(new THREE.Vector3(0, 6.3, 0)); sprite.scale.set(5.4, 1.27, 1); world.add(sprite); labelSprites.push(sprite);
  });

  // A continuous copper current weaves between the miniature worlds. The spacing
  // is narrative, deliberately not a proportional historical scale.
  const pathPoints = [new THREE.Vector3(-1.6, -.25, 20), ...locations.map((p, i) => new THREE.Vector3(i % 2 ? 1.9 : -1.9, -.25, p.z)), new THREE.Vector3(1.6, -.25, -85)];
  const path = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", .6);
  const pathTube = new THREE.Mesh(new THREE.TubeGeometry(path, 340, .085, 8, false), new THREE.MeshStandardMaterial({ color: 0xc79a50, metalness: .8, roughness: .3, emissive: 0xb68232, emissiveIntensity: .55 })); world.add(pathTube);
  const lightTube = new THREE.Mesh(new THREE.TubeGeometry(path, 340, .017, 5, false), new THREE.MeshBasicMaterial({ color: 0xffe2a0 })); lightTube.position.y = .079; world.add(lightTube);
  const knotGeometry = new THREE.SphereGeometry(.16, 12, 8);
  const knotMaterial = new THREE.MeshStandardMaterial({ color: 0xf5dca4, emissive: 0xcf9a41, emissiveIntensity: .9, metalness: .65, roughness: .2 });
  for (let n = 0; n < 61; n++) { const knot = new THREE.Mesh(knotGeometry, knotMaterial); knot.position.copy(path.getPoint(n / 60)); knot.position.y += .13; knot.scale.setScalar(n % 10 === 0 ? 1 : .35); world.add(knot); }
  const sparkGeometry = new THREE.BufferGeometry(); const sparks = new Float32Array(210 * 3);
  let seed = 41; const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 210; i++) { sparks[i * 3] = (random() - .5) * 58; sparks[i * 3 + 1] = random() * 18; sparks[i * 3 + 2] = 22 - random() * 110; }
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparks, 3));
  world.add(new THREE.Points(sparkGeometry, new THREE.PointsMaterial({ size: .06, color: 0xc9b37a, transparent: true, opacity: .65, sizeAttenuation: true })));
  const focusRing = new THREE.Mesh(new THREE.TorusGeometry(1, .016, 6, 72), new THREE.MeshBasicMaterial({ color: 0xffcf7d, transparent: true, opacity: .7 }));
  focusRing.visible = false; world.add(focusRing);

  let mode: TimelineMode = "journey";
  let selected = 0;
  let progress = 0;
  let targetProgress = 0;
  let reduced = initialReduced;
  let disposed = false;
  let frame = 0;
  let lastFrame = 0;
  let lastProgressEmission = 0;
  let focusedId = "";
  let focusYaw = .15, focusPitch = .62, focusDistance = 5;
  const focusCenter = new THREE.Vector3();
  const eye = new THREE.Vector3(28, 46, 37);
  const look = new THREE.Vector3(0, 0, -29);
  const desiredEye = new THREE.Vector3(); const desiredLook = new THREE.Vector3();
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  let drag: { x: number; y: number; startX: number; startY: number; moved: boolean; pointer: number } | null = null;

  function emitNode(index: number) {
    if (selected !== index) { selected = index; callbacks.onNode(index); }
    stageRings.forEach((ring, i) => { const material = ring.material as THREE.MeshStandardMaterial; material.emissiveIntensity = i === selected ? 1.3 : .15; });
  }
  function markMode(next: TimelineMode, id?: string) { mode = next; canvas.dataset.viewMode = mode; canvas.dataset.focusId = id || ""; callbacks.onMode(mode, id); }
  function schedule() { if (!disposed && !frame) { canvas.dataset.cameraSettled = "false"; frame = requestAnimationFrame(render); } }
  const journeyCurve = new THREE.CatmullRomCurve3(locations, false, "catmullrom", .45);
  function pointOnJourney(t: number) {
    return journeyCurve.getPoint(THREE.MathUtils.clamp(t, 0, 1));
  }
  function render(now: number) {
    frame = 0; if (disposed) return;
    const dt = Math.min((now - (lastFrame || now - 16)) / 1000, .05); lastFrame = now;
    const damping = reduced ? 1 : 1 - Math.exp(-dt * 5.6);
    progress = THREE.MathUtils.lerp(progress, targetProgress, damping);
    const aspect = host.clientWidth / Math.max(host.clientHeight, 1);
    if (mode === "overview") {
      desiredEye.set(34, 55, 50);
      desiredLook.set(0, 0, -27);
      // The overview deliberately opens the whole route. Portrait devices use a
      // closer three-quarter composition instead of shrinking six scenes to dots.
      if (aspect < .85) { desiredEye.set(-24, 36, 43); desiredLook.set(-1, 0, -5); }
    } else if (mode === "inspect") {
      desiredLook.copy(focusCenter);
      desiredEye.set(Math.sin(focusYaw) * Math.cos(focusPitch), Math.sin(focusPitch), Math.cos(focusYaw) * Math.cos(focusPitch)).multiplyScalar(focusDistance).add(focusCenter);
    } else {
      desiredLook.copy(pointOnJourney(progress)).add(new THREE.Vector3(0, 1.2, 0));
      desiredEye.copy(desiredLook).add(new THREE.Vector3(aspect < .85 ? 9 : 11.3, aspect < .85 ? 12 : 10.8, aspect < .85 ? 18.8 : 15.7));
      // Leave breathing room for the quiet caption in the left side of wide views.
      if (aspect > 1.2) desiredLook.x -= 2.1;
    }
    eye.lerp(desiredEye, damping); look.lerp(desiredLook, damping);
    if (aspect < .85) camera.setViewOffset(host.clientWidth, host.clientHeight, 0, host.clientHeight * (mode === "overview" ? .2 : .18), host.clientWidth, host.clientHeight);
    else camera.clearViewOffset();
    camera.position.copy(eye); camera.lookAt(look);
    labelSprites.forEach((sprite, i) => {
      const projected = sprite.position.clone().project(camera);
      const screenY = (-projected.y * .5 + .5) * host.clientHeight;
      // Portrait already presents the era and name in its caption. Keeping the
      // duplicate world title would let it drift into the header during travel.
      sprite.visible = aspect >= .85 && host.clientHeight > 540 && mode !== "inspect" && screenY > 126 && screenY < host.clientHeight - 205 && Math.abs(projected.x) < .94;
      (sprite.material as THREE.SpriteMaterial).opacity = mode === "overview" ? .9 : i === selected ? 1 : .35;
    });
    canvas.dataset.cameraProgress = progress.toFixed(4); canvas.dataset.currentNode = String(selected);
    renderer.render(world, camera);
    const markers: ProjectedMarker[] = [];
    focusObjects.forEach(({ object, node }, id) => {
      const box = new THREE.Box3().setFromObject(object); const center = box.getCenter(new THREE.Vector3());
      const dimension = box.getSize(new THREE.Vector3()); center.y += dimension.y * .65 + .3;
      const projected = center.project(camera);
      const x = (projected.x * .5 + .5) * host.clientWidth, y = (-projected.y * .5 + .5) * host.clientHeight;
      markers.push({ id, x, y, visible: mode === "journey" && node === selected && projected.z > -1 && projected.z < 1 && x > 45 && x < host.clientWidth - 45 && y > (host.clientHeight < 540 ? 86 : 126) && y < host.clientHeight - (host.clientHeight < 540 ? 106 : 220) });
    }); callbacks.onMarkers(markers);
    if (now - lastProgressEmission > 70 || Math.abs(progress - targetProgress) < .0001) { callbacks.onProgress(progress); lastProgressEmission = now; }
    const changing = eye.distanceToSquared(desiredEye) > .00002 || look.distanceToSquared(desiredLook) > .00002 || Math.abs(progress - targetProgress) > .00005;
    canvas.dataset.cameraSettled = changing ? "false" : "true";
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    if (changing) schedule();
  }
  function setProgress(value: number) { targetProgress = THREE.MathUtils.clamp(value, 0, 1); emitNode(Math.round(targetProgress * 5)); if (mode !== "journey") markMode("journey"); focusRing.visible = false; schedule(); }
  function selectNode(index: number) { setProgress(THREE.MathUtils.clamp(index, 0, 5) / 5); }
  function focus(id: string) {
    const item = focusObjects.get(id); if (!item) return;
    emitNode(item.node); targetProgress = item.node / 5;
    const box = new THREE.Box3().setFromObject(item.object); box.getCenter(focusCenter);
    const dimensions = box.getSize(new THREE.Vector3());
    focusDistance = THREE.MathUtils.clamp(Math.max(dimensions.x, dimensions.y, dimensions.z) * 2.2, 3.8, 10);
    focusYaw = .12; focusPitch = .65; focusedId = id;
    focusRing.position.copy(focusCenter); focusRing.scale.setScalar(Math.max(dimensions.x, dimensions.y, dimensions.z) * .7); focusRing.visible = true;
    markMode("inspect", id); schedule();
  }
  function returnToTimeline() { focusRing.visible = false; focusedId = ""; markMode("journey"); targetProgress = selected / 5; schedule(); }
  function overview() { focusRing.visible = false; markMode("overview"); schedule(); }
  function pick(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(stages, true);
    if (!hits.length) return;
    let object: THREE.Object3D | null = hits[0].object; let nodeIndex: number | undefined;
    while (object) { if (typeof object.userData.focusId === "string") { focus(object.userData.focusId); return; } if (typeof object.userData.nodeIndex === "number") nodeIndex = object.userData.nodeIndex; object = object.parent; }
    if (nodeIndex !== undefined) selectNode(nodeIndex);
  }
  const down = (event: PointerEvent) => { if (event.pointerType === "mouse" && event.button !== 0) return; drag = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false, pointer: event.pointerId }; canvas.setPointerCapture(event.pointerId); canvas.style.cursor = "grabbing"; };
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6) drag.moved = true;
    if (mode === "inspect") { focusYaw -= dx * .008; focusPitch = THREE.MathUtils.clamp(focusPitch + dy * .006, .12, 1.3); schedule(); }
    else if (drag.moved) setProgress((mode === "overview" ? selected / 5 : targetProgress) + (-dx + dy) * .0008);
    drag.x = event.clientX; drag.y = event.clientY;
  };
  const up = (event: PointerEvent) => { if (drag && !drag.moved) pick(event); drag = null; canvas.style.cursor = "grab"; };
  const cancel = () => { drag = null; canvas.style.cursor = "grab"; };
  const wheel = (event: WheelEvent) => { event.preventDefault(); if (mode === "inspect") { focusDistance = THREE.MathUtils.clamp(focusDistance + event.deltaY * .005, 2, 18); schedule(); } else setProgress((mode === "overview" ? selected / 5 : targetProgress) + event.deltaY * .00035); };
  const key = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); selectNode(selected + 1); }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); selectNode(selected - 1); }
    if (event.key === "Escape") { event.preventDefault(); returnToTimeline(); }
    if (event.key === "Home") { event.preventDefault(); overview(); }
  };
  const lost = (event: Event) => { event.preventDefault(); callbacks.onFallback("立体画面已中断，已切换为轻量时间长卷。所有年代、来源与书坊游戏仍可使用。"); };
  canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", cancel); canvas.addEventListener("wheel", wheel, { passive: false }); canvas.addEventListener("keydown", key); canvas.addEventListener("webglcontextlost", lost);
  canvas.style.cursor = "grab";
  const resize = () => { if (!host.clientWidth || !host.clientHeight || disposed) return; renderer.setSize(host.clientWidth, host.clientHeight, false); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); schedule(); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  markMode("journey"); emitNode(0); callbacks.onNode(0); callbacks.onProgress(0); callbacks.onReady(); schedule();

  return {
    selectNode, setProgress, overview, focus, returnToTimeline,
    rotate: direction => { if (mode !== "inspect") return; focusYaw += direction * Math.PI / 6; schedule(); },
    zoom: direction => { if (mode !== "inspect") return; focusDistance = THREE.MathUtils.clamp(focusDistance - direction * .65, 2, 18); schedule(); },
    setReducedMotion: enabled => { reduced = enabled; schedule(); },
    dispose: () => {
      if (disposed) return;
      disposed = true; if (frame) cancelAnimationFrame(frame); observer.disconnect();
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", cancel); canvas.removeEventListener("wheel", wheel); canvas.removeEventListener("keydown", key); canvas.removeEventListener("webglcontextlost", lost);
      const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>();
      world.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Sprite) { if ("geometry" in object && object.geometry) geometries.add(object.geometry as THREE.BufferGeometry); const list = Array.isArray(object.material) ? object.material : [object.material]; list.forEach(material => { materials.add(material); for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value); }); } });
      geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose()); environmentTexture.dispose(); renderer.dispose(); canvas.remove();
      void focusedId;
    },
  };
}
