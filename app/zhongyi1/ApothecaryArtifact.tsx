"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./artifact.module.css";

type HotspotId = "rim" | "glaze" | "foot";
type ViewerControls = {
  rotate: (direction: number) => void;
  zoom: (direction: number) => void;
  reset: () => void;
};

const HOTSPOTS: { id: HotspotId; number: string; title: string; subtitle: string; description: string }[] = [
  {
    id: "rim", number: "壹", title: "口沿", subtitle: "合盖，守一室清静",
    description: "观察盖沿与罐口相接的弧线。器物的开合、取放与收纳，构成了书坊之外另一种日常秩序。这件器物的造型由程序创作，并非特定年代的实物复原。",
  },
  {
    id: "glaze", number: "贰", title: "釉色", subtitle: "青色里，藏着草木意趣",
    description: "转一转，看看光如何掠过青釉。这里的草木纹样与细碎开片是为本次互动设计的视觉语言，用来邀请你慢下来观察材质，不代表某件馆藏的纹饰。",
  },
  {
    id: "foot", number: "叁", title: "器足", subtitle: "一圈留白，让器物立住",
    description: "罐身下方收起的圈足，让饱满轮廓有了轻重与停顿。试着左右旋转，比较器腹、器肩与器足的比例，体会日用器物中的造型之美。",
  },
];

/** A small, self-contained cultural specimen. Three.js is fetched only when mounted. */
export default function ApothecaryArtifact({ onComplete, initialComplete = false }: { onComplete?: () => void; initialComplete?: boolean }) {
  const titleId = useId();
  const helpId = useId();
  const canvasHost = useRef<HTMLDivElement>(null);
  const controls = useRef<ViewerControls | null>(null);
  const checkedHardware = useRef(false);
  const completionSent = useRef(initialComplete);
  const onCompleteRef = useRef(onComplete);
  const [staticMode, setStaticMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");
  const [selected, setSelected] = useState<HotspotId | null>(null);
  const [seen, setSeen] = useState<HotspotId[]>(() => initialComplete ? HOTSPOTS.map((spot) => spot.id) : []);
  const active = HOTSPOTS.find((spot) => spot.id === selected);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (seen.length === HOTSPOTS.length && !completionSent.current) {
      completionSent.current = true;
      onCompleteRef.current?.();
    }
  }, [seen]);

  useEffect(() => {
    if (staticMode || !canvasHost.current) return;
    const host = canvasHost.current;
    let cancelled = false;
    let disposeScene: (() => void) | undefined;
    async function buildScene() {
      // Defer the device probe until after mount, without loading the 3D bundle
      // on devices that should begin in the lightweight mode.
      await Promise.resolve();
      if (cancelled) return;
      if (!checkedHardware.current) {
        checkedHardware.current = true;
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
        if ((memory !== undefined && memory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) {
          setFallbackReason("已为这台设备启用轻量观赏模式，仍可探索全部观察点。");
          setStaticMode(true);
          return;
        }
      }
      try {
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
        ]);
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.98;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        const canvas = renderer.domElement;
        canvas.className = styles.canvas;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", "可旋转的青釉草木纹药罐三维示意；也可使用下方旋转和缩放按钮");
        canvas.setAttribute("aria-describedby", helpId);
        canvas.tabIndex = 0;
        host.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
        const target = new THREE.Vector3(0, -0.28, 0);
        const cameraDirection = new THREE.Vector3(0.85, 0.7, 5.7).normalize();
        let distance = 7.2;
        const environment = new RoomEnvironment();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environmentTarget = pmrem.fromScene(environment, 0.025);
        scene.environment = environmentTarget.texture;
        environment.dispose();
        pmrem.dispose();

        scene.add(new THREE.AmbientLight(0xd9e9d4, 0.45));
        const key = new THREE.DirectionalLight(0xffe6bd, 2.5);
        key.position.set(-3.5, 6, 4);
        key.castShadow = true;
        key.shadow.mapSize.set(512, 512);
        key.shadow.camera.left = -3;
        key.shadow.camera.right = 3;
        key.shadow.camera.top = 4;
        key.shadow.camera.bottom = -3;
        key.shadow.normalBias = 0.03;
        scene.add(key);
        const rimLight = new THREE.DirectionalLight(0xa7d8d0, 1.8);
        rimLight.position.set(3, 2, -3);
        scene.add(rimLight);
        const fill = new THREE.DirectionalLight(0xf5ebcf, 0.45);
        fill.position.set(4, 0, 3);
        scene.add(fill);

        // A hand-drawn canvas texture keeps the specimen completely self-contained.
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = 1024;
        textureCanvas.height = 1024;
        const ctx = textureCanvas.getContext("2d");
        if (!ctx) throw new Error("Canvas texture unavailable");
        ctx.fillStyle = "#b1c8ad";
        ctx.fillRect(0, 0, 1024, 1024);
        let seed = 5821;
        const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
        for (let i = 0; i < 18000; i++) {
          ctx.fillStyle = random() > 0.5 ? "rgba(246,246,208,.08)" : "rgba(38,82,65,.055)";
          ctx.fillRect(random() * 1024, random() * 1024, 1 + random() * 3, 1 + random() * 2);
        }
        ctx.strokeStyle = "rgba(73,104,78,.09)";
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 100; i++) {
          let x = random() * 1024;
          let y = random() * 1024;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let n = 0; n < 5; n++) { x += (random() - 0.5) * 65; y += 15 + random() * 36; ctx.lineTo(x, y); }
          ctx.stroke();
        }
        const paintBranch = (x: number, mirror: number) => {
          ctx.save();
          ctx.translate(x, 825);
          ctx.scale(mirror, 1);
          ctx.strokeStyle = "rgba(40,85,63,.55)";
          ctx.lineWidth = 3.4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-25, -110, 65, -225, 24, -430);
          ctx.stroke();
          for (let i = 0; i < 10; i++) {
            const t = (i + 1) / 11;
            const y = 3 * (1 - t) ** 2 * t * -110 + 3 * (1 - t) * t ** 2 * -225 + t ** 3 * -430;
            const bend = 3 * (1 - t) ** 2 * t * -25 + 3 * (1 - t) * t ** 2 * 65 + t ** 3 * 24;
            const side = i % 2 ? -1 : 1;
            ctx.save();
            ctx.translate(bend, y);
            ctx.rotate(side * 0.7);
            ctx.fillStyle = i % 3 ? "rgba(43,89,65,.47)" : "rgba(96,119,63,.52)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(side * 15, -24, side * 39, -21, side * 47, -30);
            ctx.bezierCurveTo(side * 39, -1, side * 12, 7, 0, 0);
            ctx.fill();
            ctx.strokeStyle = "rgba(234,231,184,.36)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * 47, -25); ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        };
        [100, 395, 625, 920].forEach((x, index) => paintBranch(x, index % 2 ? -1 : 1));
        [260, 770].forEach((x) => {
          ctx.strokeStyle = "rgba(61,100,73,.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 54, 410, 108, 216);
          ctx.strokeRect(x - 48, 416, 96, 204);
          ctx.fillStyle = "rgba(35,81,58,.8)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = '66px "Songti SC", "Noto Serif SC", serif';
          ctx.fillText("草", x, 466);
          ctx.fillText("木", x, 560);
          ctx.fillStyle = "rgba(139,77,45,.7)";
          ctx.fillRect(x - 12, 648, 24, 29);
        });
        ctx.strokeStyle = "rgba(66,104,78,.38)";
        ctx.lineWidth = 5;
        [147, 171, 871, 885].forEach((y) => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke(); });
        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

        const glaze = new THREE.MeshPhysicalMaterial({ color: 0xb1c6a3, map: texture, roughness: 0.31, metalness: 0.045, clearcoat: 0.72, clearcoatRoughness: 0.28, envMapIntensity: 0.65 });
        const plainGlaze = new THREE.MeshPhysicalMaterial({ color: 0x85a58d, roughness: 0.28, metalness: 0.035, clearcoat: 0.8, clearcoatRoughness: 0.24, envMapIntensity: 0.7 });
        const darkGlaze = new THREE.MeshPhysicalMaterial({ color: 0x55745e, roughness: 0.26, metalness: 0.12, clearcoat: 0.8 });
        const warmRim = new THREE.MeshStandardMaterial({ color: 0x9c8b53, roughness: 0.45, metalness: 0.48 });
        const unglazed = new THREE.MeshStandardMaterial({ color: 0xa9906d, roughness: 0.9 });
        const jar = new THREE.Group();
        jar.rotation.y = -1.42;
        scene.add(jar);

        const lathe = (profile: [number, number][], material: typeof glaze | typeof unglazed) => {
          const mesh = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 72), material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          jar.add(mesh);
          return mesh;
        };
        lathe([[0.52,-1.32],[0.67,-1.31],[0.72,-1.24],[0.75,-1.16],[0.84,-1.09],[0.95,-0.92],[1.035,-0.68],[1.08,-0.39],[1.085,-0.08],[1.06,0.23],[0.99,0.48],[0.9,0.67],[0.77,0.82],[0.65,0.91],[0.625,1.015],[0.64,1.06],[0.65,1.08]], glaze);
        lathe([[0.53,-1.36],[0.66,-1.36],[0.69,-1.32],[0.68,-1.24],[0.62,-1.22]], unglazed);
        lathe([[0.0,1.055],[0.59,1.055],[0.70,1.075],[0.72,1.11],[0.71,1.16],[0.64,1.18],[0.57,1.21],[0.48,1.29],[0.35,1.35],[0.16,1.38],[0.075,1.39],[0.0,1.40]], plainGlaze);
        lathe([[0,1.39],[0.07,1.39],[0.12,1.43],[0.13,1.49],[0.105,1.55],[0.045,1.58],[0,1.58]], darkGlaze);
        const addRing = (radius: number, y: number, width: number, material = warmRim) => {
          const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, width, 8, 72), material);
          mesh.rotation.x = Math.PI / 2;
          mesh.position.y = y;
          jar.add(mesh);
        };
        addRing(0.706, 1.105, 0.012);
        addRing(0.646, 1.067, 0.012);
        addRing(0.709, -1.24, 0.014);
        addRing(0.661, -1.315, 0.01);

        const plinthMaterial = new THREE.MeshStandardMaterial({ color: 0x252e24, roughness: 0.85, metalness: 0, envMapIntensity: 0.25 });
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.42, 0.18, 72), plinthMaterial);
        plinth.position.y = -1.46;
        plinth.receiveShadow = true;
        scene.add(plinth);
        const plinthLine = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.008, 6, 72), warmRim);
        plinthLine.rotation.x = Math.PI / 2;
        plinthLine.position.y = -1.47;
        scene.add(plinthLine);

        const render = () => {
          camera.position.copy(cameraDirection).multiplyScalar(distance).add(target);
          camera.lookAt(target);
          renderer.render(scene, camera);
        };
        const resize = () => {
          const width = host.clientWidth;
          const height = host.clientHeight;
          if (!width || !height) return;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          render();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        controls.current = {
          rotate: (direction) => { jar.rotation.y += direction * Math.PI / 6; render(); },
          zoom: (direction) => { distance = THREE.MathUtils.clamp(distance - direction * 0.65, 5, 9.2); render(); },
          reset: () => { jar.rotation.set(0, -1.42, 0); distance = 7.2; render(); },
        };

        let drag: { x: number; y: number; rotation: number; tilt: number; pointer: number } | null = null;
        const pointerDown = (event: PointerEvent) => {
          if (event.button !== 0 && event.pointerType === "mouse") return;
          drag = { x: event.clientX, y: event.clientY, rotation: jar.rotation.y, tilt: jar.rotation.x, pointer: event.pointerId };
          canvas.setPointerCapture(event.pointerId);
          canvas.style.cursor = "grabbing";
        };
        const pointerMove = (event: PointerEvent) => {
          if (!drag || drag.pointer !== event.pointerId) return;
          jar.rotation.y = drag.rotation + (event.clientX - drag.x) * 0.012;
          if (event.pointerType === "mouse") jar.rotation.x = THREE.MathUtils.clamp(drag.tilt + (event.clientY - drag.y) * 0.004, -0.23, 0.23);
          render();
        };
        const pointerUp = () => { drag = null; canvas.style.cursor = "grab"; };
        const keyDown = (event: KeyboardEvent) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); controls.current?.rotate(event.key === "ArrowLeft" ? -1 : 1); }
          if (event.key === "+" || event.key === "=") { event.preventDefault(); controls.current?.zoom(1); }
          if (event.key === "-") { event.preventDefault(); controls.current?.zoom(-1); }
          if (event.key === "Home") { event.preventDefault(); controls.current?.reset(); }
        };
        const contextLost = (event: Event) => {
          event.preventDefault();
          setFallbackReason("立体画面暂不可用，已切换为轻量观赏。观察点仍可继续探索。");
          setStaticMode(true);
        };
        canvas.addEventListener("pointerdown", pointerDown);
        canvas.addEventListener("pointermove", pointerMove);
        canvas.addEventListener("pointerup", pointerUp);
        canvas.addEventListener("pointercancel", pointerUp);
        canvas.addEventListener("keydown", keyDown);
        canvas.addEventListener("webglcontextlost", contextLost);
        resize();
        setReady(true);

        disposeScene = () => {
          controls.current = null;
          resizeObserver.disconnect();
          canvas.removeEventListener("pointerdown", pointerDown);
          canvas.removeEventListener("pointermove", pointerMove);
          canvas.removeEventListener("pointerup", pointerUp);
          canvas.removeEventListener("pointercancel", pointerUp);
          canvas.removeEventListener("keydown", keyDown);
          canvas.removeEventListener("webglcontextlost", contextLost);
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh) object.geometry.dispose();
          });
          [glaze, plainGlaze, darkGlaze, warmRim, unglazed, plinthMaterial].forEach((material) => material.dispose());
          texture.dispose();
          environmentTarget.dispose();
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        if (cancelled) return;
        setFallbackReason("这台设备未能开启立体画面，已为你准备静态观赏与完整观察点。");
        setStaticMode(true);
      }
    }
    void buildScene();
    return () => { cancelled = true; disposeScene?.(); };
  }, [staticMode, helpId]);

  function inspect(id: HotspotId) {
    setSelected(id);
    setSeen((current) => current.includes(id) ? current : [...current, id]);
  }

  return (
    <section className={styles.artifact} aria-labelledby={titleId}>
      <div className={styles.heading}>
        <div><span className={styles.eyebrow}>器物小展 · 观物知美</span><h3 id={titleId}>一抹青釉，盛住草木时光</h3></div>
        <span className={styles.seal} aria-hidden="true">观<br />物</span>
      </div>

      <div className={styles.stage}>
        <div className={styles.halo} aria-hidden="true" />
        <span className={styles.stageIndex} aria-hidden="true">物 记<br /><i>〇 一</i></span>
        <div className={styles.verticalCaption} aria-hidden="true">青釉草木纹罐<span>光过器表 · 纹有余韵</span></div>
        <div className={styles.viewer} ref={canvasHost} hidden={staticMode} />
        {staticMode || !ready ? <div className={styles.staticViewer} aria-hidden={!staticMode}><StaticJar id={titleId.replace(/:/g, "")} />{!staticMode ? <span className={styles.loading}>正在点亮展台…</span> : null}</div> : null}
        <div className={styles.modeRow}><span className={styles.modeBadge}><i />{staticMode ? "静态观赏" : ready ? "实时 3D" : "器物加载中"}</span><button className={styles.modeButton} onClick={() => { setReady(false); setStaticMode((value) => !value); setFallbackReason(""); }} aria-pressed={staticMode}>{staticMode ? "尝试立体模式" : "静态模式"}</button></div>
        <div className={styles.specimenNote}>程序化器物示意<span>非馆藏复原</span></div>
      </div>

      {!staticMode ? <div className={styles.controls} aria-label="器物视角控制"><div className={styles.controlGroup}><button onClick={() => controls.current?.rotate(-1)} disabled={!ready} aria-label="向左旋转药罐">↶</button><button onClick={() => controls.current?.rotate(1)} disabled={!ready} aria-label="向右旋转药罐">↷</button><span /></div><div className={styles.controlGroup}><button onClick={() => controls.current?.zoom(-1)} disabled={!ready} aria-label="缩小药罐">−</button><button onClick={() => controls.current?.zoom(1)} disabled={!ready} aria-label="放大药罐">＋</button><button className={styles.resetButton} onClick={() => controls.current?.reset()} disabled={!ready}>复位</button></div></div> : null}
      <p className={styles.help} id={helpId}>{staticMode ? (fallbackReason || "轻量画面也能细看器形。点选下方三处，收集你的观物笔记。") : "左右拖动旋转 · 按＋－缩放 · 也可点按按钮观赏"}</p>

      <div className={styles.hotspots} aria-label="三个器物观察点">
        {HOTSPOTS.map((spot) => <button key={spot.id} onClick={() => inspect(spot.id)} className={`${styles.hotspot} ${selected === spot.id ? styles.hotspotActive : ""}`} aria-pressed={selected === spot.id}><span className={styles.hotspotNumber}>{seen.includes(spot.id) ? "✓" : spot.number}</span><span>{spot.title}<small>{spot.id === "rim" ? "看弧线" : spot.id === "glaze" ? "看光泽" : "看比例"}</small></span><span className={styles.hotspotArrow} aria-hidden="true">↗</span></button>)}
      </div>
      <div className={styles.observation} aria-live="polite" aria-atomic="true"><span className={styles.observationLabel}>{active ? "观物笔记" : "请轻点一处"}<i>{seen.length} / 3</i></span><h4>{active?.subtitle || "从一处细节，走近一件器物"}</h4><p>{active?.description || "三个观察点，三种观看的角度。你不必记住术语，只需带着好奇，让目光沿着器物慢慢走一圈。"}</p></div>
    </section>
  );
}

function StaticJar({ id }: { id: string }) {
  const prefix = `zi-jar-${id}`;
  return <svg className={styles.staticJar} viewBox="0 0 520 520" role="img" aria-label="青釉草木纹罐静态示意图，展示罐盖、青釉纹饰与圈足">
    <defs>
      <linearGradient id={`${prefix}-body`} x1="0" x2="1"><stop stopColor="#718f77" /><stop offset=".22" stopColor="#c4d0aa" /><stop offset=".43" stopColor="#d9ddba" /><stop offset=".7" stopColor="#a5b99b" /><stop offset="1" stopColor="#4f705c" /></linearGradient>
      <linearGradient id={`${prefix}-lid`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#d5ddbc" /><stop offset=".52" stopColor="#91ad91" /><stop offset="1" stopColor="#54715e" /></linearGradient>
      <linearGradient id={`${prefix}-base`} x1="0" x2="1"><stop stopColor="#253930" /><stop offset=".5" stopColor="#506155" /><stop offset="1" stopColor="#273c33" /></linearGradient>
      <radialGradient id={`${prefix}-shine`}><stop stopColor="#f9f1ca" stopOpacity=".42" /><stop offset="1" stopColor="#e4ebcd" stopOpacity="0" /></radialGradient>
      <filter id={`${prefix}-shadow`}><feGaussianBlur stdDeviation="9" /></filter>
      <clipPath id={`${prefix}-clip`}><path d="M203 157C203 179 166 187 155 223C136 277 141 348 166 379C179 395 191 401 202 408H318C329 401 341 395 354 379C379 348 384 277 365 223C354 187 317 179 317 157Z" /></clipPath>
      <g id={`${prefix}-branch`} fill="none" stroke="#517153" strokeWidth="1.8"><path d="M0 0C-16-42 27-83 8-149" /><g fill="#5c7954" fillOpacity=".72" strokeWidth=".6"><path d="M-2-22C-34-22-41-44-34-47C-17-50-8-34-2-22Z" /><path d="M1-41C35-43 44-63 37-65C19-67 8-50 1-41Z" /><path d="M9-62C-19-66-24-84-18-87C-4-88 6-74 9-62Z" /><path d="M12-85C39-95 41-111 35-114C20-114 13-98 12-85Z" /><path d="M10-107C-12-114-15-131-10-132C2-131 10-117 10-107Z" /><path d="M10-128C24-139 24-154 19-154C10-150 9-138 10-128Z" /></g></g>
    </defs>
    <ellipse cx="260" cy="439" rx="134" ry="17" fill="#071c16" opacity=".35" filter={`url(#${prefix}-shadow)`} />
    <path d="M126 420V432C126 456 394 456 394 432V420Z" fill={`url(#${prefix}-base)`} /><ellipse cx="260" cy="420" rx="134" ry="24" fill="#4d5c4d" /><path d="M126 429C126 454 394 454 394 429" fill="none" stroke="#a99c66" strokeOpacity=".65" />
    <path d="M202 397V414C202 429 318 429 318 414V397" fill="#a58f6c" /><ellipse cx="260" cy="400" rx="59" ry="12" fill="#9bb093" />
    <path d="M203 157C203 179 166 187 155 223C136 277 141 348 166 379C179 395 191 401 202 408C221 419 299 419 318 408C329 401 341 395 354 379C379 348 384 277 365 223C354 187 317 179 317 157Z" fill={`url(#${prefix}-body)`} stroke="#87a087" strokeWidth="1" />
    <g clipPath={`url(#${prefix}-clip)`}><ellipse cx="210" cy="251" rx="95" ry="177" fill={`url(#${prefix}-shine)`} /><use href={`#${prefix}-branch`} x="191" y="374" /><use href={`#${prefix}-branch`} x="333" y="376" transform="rotate(4 333 376)" /><path d="M144 230Q260 259 376 230M144 236Q260 265 376 236M153 378Q260 405 367 378M157 384Q260 411 363 384" stroke="#61815c" strokeOpacity=".5" strokeWidth="2" fill="none" /><rect x="236" y="264" width="48" height="92" fill="none" stroke="#5b7a56" strokeWidth="1.5" /><rect x="239" y="267" width="42" height="86" fill="none" stroke="#5b7a56" strokeWidth=".5" /><text x="260" y="301" textAnchor="middle" fill="#3f6549" fontFamily="Songti SC, serif" fontSize="30">草</text><text x="260" y="339" textAnchor="middle" fill="#3f6549" fontFamily="Songti SC, serif" fontSize="30">木</text><rect x="255" y="364" width="10" height="13" fill="#a16d4e" opacity=".85" /><path d="M177 206L191 234L179 259L190 289M327 192L319 218L335 244L321 267M206 366L222 382L216 401" fill="none" stroke="#729372" strokeOpacity=".2" /></g>
    <ellipse cx="260" cy="157" rx="58" ry="12" fill="#54735c" /><path d="M193 151C213 142 224 120 251 119H269C296 120 307 142 327 151L327 161C327 178 193 178 193 161Z" fill={`url(#${prefix}-lid)`} /><ellipse cx="260" cy="151" rx="67" ry="16" fill={`url(#${prefix}-lid)`} /><path d="M193 157C193 174 327 174 327 157" fill="none" stroke="#b4ad70" strokeWidth="1.5" /><path d="M248 120C244 115 247 103 253 99C260 93 273 101 273 110C273 119 265 124 248 120Z" fill="#67836c" /><ellipse cx="257" cy="105" rx="9" ry="5" fill="#adbd9d" opacity=".7" /><path d="M170 256C162 284 165 331 178 353" fill="none" stroke="#e6ebc8" strokeOpacity=".3" strokeWidth="5" strokeLinecap="round" />
  </svg>;
}
