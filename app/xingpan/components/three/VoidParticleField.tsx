"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DestinyProfile } from "../../types";
import {
  voidParticleFragment,
  voidParticleVertex,
} from "../../shaders/particle-shaders";

type VoidParticleFieldProps = {
  count: number;
  profile: DestinyProfile;
  pointer: React.MutableRefObject<THREE.Vector2>;
  transition: React.MutableRefObject<number>;
};

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function profileSeed(profile: DestinyProfile) {
  return Number.parseInt(profile.id.replace("DP-", ""), 16) || 314159;
}

export function VoidParticleField({
  count,
  profile,
  pointer,
  transition,
}: VoidParticleFieldProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { gl, size } = useThree();

  const particles = useMemo(() => {
    const random = mulberry32(profileSeed(profile));
    const matrices = new Float32Array(count * 16);
    const randoms = new Float32Array(count);
    const colorMix = new Float32Array(count);
    const dummy = new THREE.Object3D();

    for (let index = 0; index < count; index += 1) {
      const radius = Math.pow(random(), 0.62) * 4.45;
      const branch = index % 5;
      const armAngle = (branch / 5) * Math.PI * 2;
      const spin = radius * 1.32;
      const scatter = (random() - 0.5) * (0.22 + radius * 0.17);
      const angle = armAngle + spin + scatter;
      const halo = random() > 0.82;
      const vertical = halo
        ? (random() - 0.5) * 3.4 * (1 - radius / 6)
        : (random() - 0.5) * (0.12 + radius * 0.055);

      dummy.position.set(
        Math.cos(angle) * radius + (random() - 0.5) * 0.08,
        Math.sin(angle) * radius * (halo ? 0.82 : 0.58) + (random() - 0.5) * 0.08,
        vertical,
      );
      dummy.updateMatrix();
      dummy.matrix.toArray(matrices, index * 16);
      randoms[index] = random();
      colorMix[index] = Math.min(1, Math.pow(radius / 4.45, 1.5) * 0.72 + random() * 0.3);
    }

    return { matrices, randoms, colorMix };
  }, [count, profile.id]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWarp: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.75) },
      uBlue: { value: new THREE.Color(profile.palette.blue) },
      uGold: { value: new THREE.Color(profile.palette.gold) },
      uEmber: { value: new THREE.Color(profile.palette.ember) },
    }),
    [gl, profile.palette.blue, profile.palette.ember, profile.palette.gold, size.height, size.width],
  );

  useLayoutEffect(() => {
    if (!mesh.current) return;
    mesh.current.instanceMatrix.array.set(particles.matrices);
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.geometry.setAttribute(
      "aRandom",
      new THREE.InstancedBufferAttribute(particles.randoms, 1),
    );
    mesh.current.geometry.setAttribute(
      "aColorMix",
      new THREE.InstancedBufferAttribute(particles.colorMix, 1),
    );
    mesh.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 24);
  }, [particles]);

  useEffect(() => {
    uniforms.uBlue.value.set(profile.palette.blue);
    uniforms.uGold.value.set(profile.palette.gold);
    uniforms.uEmber.value.set(profile.palette.ember);
  }, [profile.palette, uniforms]);

  useFrame((state, delta) => {
    if (!mesh.current || !material.current) return;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    material.current.uniforms.uWarp.value = transition.current;
    material.current.uniforms.uResolution.value.set(size.width, size.height);
    material.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.75);
    material.current.uniforms.uMouse.value.x = THREE.MathUtils.damp(
      material.current.uniforms.uMouse.value.x,
      pointer.current.x,
      5.5,
      delta,
    );
    material.current.uniforms.uMouse.value.y = THREE.MathUtils.damp(
      material.current.uniforms.uMouse.value.y,
      pointer.current.y,
      5.5,
      delta,
    );
    const parallax = 1 - Math.min(1, transition.current * 1.5);
    mesh.current.rotation.x = THREE.MathUtils.damp(
      mesh.current.rotation.x,
      pointer.current.y * 0.055 * parallax,
      2.4,
      delta,
    );
    mesh.current.rotation.y += delta * 0.018 * parallax;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={voidParticleVertex}
        fragmentShader={voidParticleFragment}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export function VoidDustPoints({
  profile,
  transition,
  compact,
}: Pick<VoidParticleFieldProps, "profile" | "transition"> & { compact: boolean }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const count = compact ? 9000 : 22000;

  const geometry = useMemo(() => {
    const random = mulberry32(profileSeed(profile) ^ 0x1f2e3d4c);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const blue = new THREE.Color(profile.palette.blue).multiplyScalar(2.4);
    const gold = new THREE.Color(profile.palette.gold).multiplyScalar(2.8);
    const ember = new THREE.Color(profile.palette.ember).multiplyScalar(3.2);

    for (let index = 0; index < count; index += 1) {
      const radius = Math.pow(random(), 0.64) * 4.7;
      const branch = index % 5;
      const angle = (branch / 5) * Math.PI * 2 + radius * 1.34 + (random() - 0.5) * (0.26 + radius * 0.14);
      const halo = random() > 0.86;
      positions.set([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * (halo ? 0.86 : 0.59),
        halo ? (random() - 0.5) * 2.8 : (random() - 0.5) * (0.08 + radius * 0.06),
      ], index * 3);

      const heat = Math.pow(radius / 4.7, 1.5) * 0.72 + random() * 0.28;
      const color = heat > 0.9 ? ember : blue.clone().lerp(gold, heat);
      const luminance = 0.48 + random() * 0.72;
      colors.set([color.r * luminance, color.g * luminance, color.b * luminance], index * 3);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
    return buffer;
  }, [count, profile.id, profile.palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!points.current || !material.current) return;
    const fade = 1 - smoothstepNumber(0.42, 0.84, transition.current);
    material.current.opacity = fade * 0.92;
    points.current.rotation.z += delta * 0.012 * fade;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={0}>
      <pointsMaterial
        ref={material}
        size={compact ? 0.018 : 0.014}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function smoothstepNumber(min: number, max: number, value: number) {
  const x = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

export function WarpFilaments({
  profile,
  transition,
}: Pick<VoidParticleFieldProps, "profile" | "transition">) {
  const lines = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const random = mulberry32(profileSeed(profile) ^ 0xa5a5a5a5);
    const count = 1400;
    const positions = new Float32Array(count * 2 * 3);
    const colors = new Float32Array(count * 2 * 3);
    const blue = new THREE.Color(profile.palette.blue).multiplyScalar(2.4);
    const gold = new THREE.Color(profile.palette.gold).multiplyScalar(2.8);
    const ember = new THREE.Color(profile.palette.ember).multiplyScalar(3.4);

    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 0.25 + Math.pow(random(), 0.58) * 6.2;
      const z = -34 + random() * 44;
      const length = 0.8 + random() * 7.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.62;
      const offset = index * 6;
      positions.set([x, y, z, x, y, z + length], offset);
      const mix = random();
      const color = mix > 0.86 ? ember : blue.clone().lerp(gold, mix);
      colors.set([color.r, color.g, color.b, color.r, color.g, color.b], offset);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -10), 50);
    return buffer;
  }, [profile.id, profile.palette]);

  useFrame((state) => {
    if (!lines.current || !material.current) return;
    const envelope = Math.sin(Math.min(1, transition.current) * Math.PI);
    material.current.opacity = Math.pow(Math.max(0, envelope), 1.4) * 0.58;
    lines.current.position.z = (state.clock.elapsedTime * 18) % 5;
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments ref={lines} geometry={geometry} frustumCulled={false} renderOrder={3}>
      <lineBasicMaterial
        ref={material}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}
