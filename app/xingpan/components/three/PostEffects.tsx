"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import {
  BloomEffect,
  ToneMappingMode,
} from "postprocessing";
import * as THREE from "three";

type EffectsProps = {
  transition: React.MutableRefObject<number>;
  compact: boolean;
  reducedMotion: boolean;
};

export function WarpFlash({ transition }: Pick<EffectsProps, "transition">) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const direction = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!mesh.current || !material.current) return;
    const progress = transition.current;
    const flash = Math.exp(-Math.pow((progress - 0.69) / 0.055, 2));
    camera.getWorldDirection(direction);
    mesh.current.position.copy(camera.position).addScaledVector(direction, 0.34);
    mesh.current.quaternion.copy(camera.quaternion);
    material.current.opacity = flash * 0.86;
    mesh.current.visible = flash > 0.004;
  });

  return (
    <mesh ref={mesh} visible={false} frustumCulled={false} renderOrder={999}>
      <planeGeometry args={[3.2, 2.2]} />
      <meshBasicMaterial
        ref={material}
        color="#fff7e5"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

export function CyberPostEffects({
  transition,
  compact,
  reducedMotion,
}: EffectsProps) {
  const bloom = useRef<BloomEffect>(null);
  const chromaOffset = useMemo(() => new THREE.Vector2(0.00028, 0.00012), []);

  useFrame(() => {
    const progress = transition.current;
    const warp = reducedMotion ? 0 : Math.sin(Math.min(1, progress) * Math.PI);
    const flash = reducedMotion ? 0 : Math.exp(-Math.pow((progress - 0.69) / 0.06, 2));
    if (bloom.current) bloom.current.intensity = 1.35 + warp * 0.95 + flash * 4.5;
    chromaOffset.set(
      0.00028 + warp * 0.0044,
      0.00012 + warp * 0.0014,
    );
  });

  return (
    <EffectComposer
      multisampling={compact ? 0 : 2}
      frameBufferType={THREE.HalfFloatType}
      enableNormalPass={false}
      depthBuffer={false}
    >
      <Bloom
        ref={bloom}
        mipmapBlur
        intensity={1.35}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.22}
        radius={0.78}
      />
      <ChromaticAberration
        offset={chromaOffset}
      />
      <Vignette eskil={false} offset={0.14} darkness={0.78} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
