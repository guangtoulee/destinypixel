"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import type { DestinyCycle, DestinyProfile, ScenePhase } from "../types";
import { DestinyCore } from "./three/DestinyCore";
import { CyberPostEffects, WarpFlash } from "./three/PostEffects";
import {
  VoidDustPoints,
  VoidParticleField,
  WarpFilaments,
} from "./three/VoidParticleField";

type DestinyCanvasProps = {
  phase: ScenePhase;
  profile: DestinyProfile;
  pointer: React.MutableRefObject<THREE.Vector2>;
  transition: React.MutableRefObject<number>;
  selectedCycleId: string;
  onSelectCycle: (cycle: DestinyCycle) => void;
  onCoreEntered: () => void;
  compact: boolean;
  reducedMotion: boolean;
};

function SceneDirector({
  phase,
  pointer,
  transition,
  compact,
  reducedMotion,
  onCoreEntered,
}: Pick<
  DestinyCanvasProps,
  "phase" | "pointer" | "transition" | "compact" | "reducedMotion" | "onCoreEntered"
>) {
  const { camera } = useThree();
  const timeline = useRef<gsap.core.Tween | null>(null);
  const completed = useRef(false);

  useEffect(() => {
    timeline.current?.kill();

    if (phase === "void") {
      completed.current = false;
      transition.current = 0;
      camera.position.set(0, 0, compact ? 8.4 : 7.6);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = compact ? 48 : 42;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0, 0);
      return;
    }

    if (phase !== "warp") return;

    if (reducedMotion) {
      transition.current = 1;
      camera.position.set(0, 0, compact ? 8.9 : 7.8);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 48;
        camera.updateProjectionMatrix();
      }
      const frame = requestAnimationFrame(onCoreEntered);
      return () => cancelAnimationFrame(frame);
    }

    const proxy = { progress: 0 };
    timeline.current = gsap.to(proxy, {
      progress: 1,
      duration: 3.05,
      ease: "none",
      overwrite: true,
      onUpdate: () => {
        const progress = THREE.MathUtils.clamp(proxy.progress, 0, 1);
        transition.current = progress;
        if (progress < 0.69) {
          const local = THREE.MathUtils.clamp(progress / 0.69, 0, 1);
          const eased = Math.pow(local, 3.5);
          camera.position.z = THREE.MathUtils.lerp(compact ? 8.4 : 7.6, 0.16, eased);
        } else {
          const local = THREE.MathUtils.clamp((progress - 0.69) / 0.31, 0, 1);
          const eased = 1 - Math.pow(1 - local, 3);
          camera.position.z = THREE.MathUtils.lerp(10.8, compact ? 8.9 : 7.8, eased);
        }

        if (camera instanceof THREE.PerspectiveCamera) {
          const fov = progress < 0.69
            ? THREE.MathUtils.lerp(compact ? 48 : 42, 96, Math.pow(progress / 0.69, 2.4))
            : THREE.MathUtils.lerp(
                96,
                48,
                1 - Math.pow(1 - THREE.MathUtils.clamp((progress - 0.69) / 0.31, 0, 1), 2.2),
              );
          camera.fov = fov;
          camera.updateProjectionMatrix();
        }
        camera.lookAt(0, 0, 0);
      },
      onComplete: () => {
        transition.current = 1;
        completed.current = true;
        onCoreEntered();
      },
    });

    return () => timeline.current?.kill();
  }, [camera, compact, onCoreEntered, phase, reducedMotion, transition]);

  useFrame((_, delta) => {
    if (phase === "warp" && !completed.current) return;
    const targetX = pointer.current.x * (phase === "core" ? 0.11 : 0.2);
    const targetY = pointer.current.y * (phase === "core" ? 0.08 : 0.13);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.8, delta);
    camera.lookAt(0, phase === "core" && compact ? 0.25 : 0, 0);
  });

  return null;
}

function WebGLFallback() {
  return (
    <div className="xp-webgl-fallback" role="status">
      <span>GPU SIGNAL LOST</span>
      <p>当前设备无法启动 3D 命运场。请开启浏览器硬件加速后重试。</p>
    </div>
  );
}

export function DestinyCanvas(props: DestinyCanvasProps) {
  const {
    profile,
    compact,
    transition,
    pointer,
    selectedCycleId,
    onSelectCycle,
    reducedMotion,
  } = props;

  return (
    <Canvas
      className="xp-canvas"
      dpr={[1, compact ? 1.25 : 1.6]}
      camera={{
        position: [0, 0, compact ? 8.4 : 7.6],
        fov: compact ? 48 : 42,
        near: 0.03,
        far: 120,
      }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        toneMapping: THREE.NoToneMapping,
      }}
      performance={{ min: 0.55, debounce: 220 }}
      fallback={<WebGLFallback />}
    >
      <color attach="background" args={[profile.palette.void]} />
      <fog attach="fog" args={[profile.palette.void, 10, 62]} />
      <AdaptiveDpr pixelated />

      <Suspense fallback={null}>
        <SceneDirector {...props} />
        <VoidParticleField
          count={compact ? 12000 : 30000}
          profile={profile}
          pointer={pointer}
          transition={transition}
        />
        <VoidDustPoints profile={profile} transition={transition} compact={compact} />
        <WarpFilaments profile={profile} transition={transition} />
        <DestinyCore
          profile={profile}
          transition={transition}
          selectedCycleId={selectedCycleId}
          onSelectCycle={onSelectCycle}
          compact={compact}
        />
        <WarpFlash transition={transition} />
        <CyberPostEffects
          transition={transition}
          compact={compact}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    </Canvas>
  );
}
