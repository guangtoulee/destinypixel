"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DestinyCycle, DestinyProfile } from "../../types";
import {
  flowParticleFragment,
  flowParticleVertex,
} from "../../shaders/particle-shaders";

type DestinyCoreProps = {
  profile: DestinyProfile;
  transition: React.MutableRefObject<number>;
  selectedCycleId: string;
  onSelectCycle: (cycle: DestinyCycle) => void;
  compact: boolean;
};

function smoothstep(min: number, max: number, value: number) {
  const x = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

function buildTimelineCurve(profile: DestinyProfile) {
  const points = profile.cycles.map((cycle, index) => {
    if (
      cycle.position?.length === 3 &&
      cycle.position.every((coordinate) => Number.isFinite(coordinate))
    ) {
      return new THREE.Vector3(...cycle.position);
    }

    const x = THREE.MathUtils.lerp(-3.25, 3.25, index / (profile.cycles.length - 1));
    const y = cycle.valence * 0.9 + Math.sin(index * 1.7) * 0.18;
    const z = (cycle.intensity - 0.56) * 0.78 + Math.cos(index * 1.3) * 0.12;
    return new THREE.Vector3(x, y, z);
  });
  return new THREE.CatmullRomCurve3(points, false, "centripetal", 0.34);
}

function TimelineParticleFlow({
  profile,
  curve,
  transition,
  count,
}: {
  profile: DestinyProfile;
  curve: THREE.CatmullRomCurve3;
  transition: React.MutableRefObject<number>;
  count: number;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const next = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const energies = new Float32Array(count);
    let seed = Number.parseInt(profile.id.replace("DP-", ""), 16) || 93;
    const random = () => {
      seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
      seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
      return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
    };

    for (let index = 0; index < count; index += 1) {
      const t = random();
      const nextT = Math.min(1, t + 0.012 + random() * 0.035);
      const point = curve.getPointAt(t);
      const nextPoint = curve.getPointAt(nextT);
      const tangent = curve.getTangentAt(t).normalize();
      const reference = Math.abs(tangent.y) > 0.9
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, reference).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      const angle = random() * Math.PI * 2;
      const radius = Math.pow(random(), 1.8) * 0.2;
      const offset = normal.multiplyScalar(Math.cos(angle) * radius)
        .add(binormal.multiplyScalar(Math.sin(angle) * radius));
      point.add(offset);
      nextPoint.add(offset);
      point.toArray(positions, index * 3);
      nextPoint.toArray(next, index * 3);
      seeds[index] = random();
      energies[index] = 0.18 + random() * 0.82;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("aNext", new THREE.BufferAttribute(next, 3));
    buffer.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    buffer.setAttribute("aEnergy", new THREE.BufferAttribute(energies, 1));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
    return buffer;
  }, [count, curve, profile.id]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.75) },
      uBlue: { value: new THREE.Color(profile.palette.blue) },
      uGold: { value: new THREE.Color(profile.palette.gold) },
      uEmber: { value: new THREE.Color(profile.palette.ember) },
    }),
    [gl, profile.palette.blue, profile.palette.ember, profile.palette.gold],
  );

  useEffect(() => {
    uniforms.uBlue.value.set(profile.palette.blue);
    uniforms.uGold.value.set(profile.palette.gold);
    uniforms.uEmber.value.set(profile.palette.ember);
  }, [profile.palette, uniforms]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    material.current.uniforms.uReveal.value = smoothstep(0.66, 0.96, transition.current);
    material.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.75);
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={5}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={flowParticleVertex}
        fragmentShader={flowParticleFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function DataCoordinateMarkers({
  profile,
  transition,
  compact,
}: Pick<DestinyCoreProps, "profile" | "transition" | "compact">) {
  const root = useRef<THREE.Group>(null);
  const annualMaterial = useRef<THREE.PointsMaterial>(null);
  const zodiacMaterial = useRef<THREE.PointsMaterial>(null);
  const annualGeometry = useMemo(() => {
    const coordinates = profile.cycles.flatMap((cycle) =>
      (cycle.annualCoordinates ?? []).map((coordinate) => ({ cycle, coordinate })),
    );
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(coordinates.length * 3);
    const colors = new Float32Array(coordinates.length * 3);
    const blue = new THREE.Color(profile.palette.blue);
    const gold = new THREE.Color(profile.palette.gold);
    const ember = new THREE.Color(profile.palette.ember);

    coordinates.forEach(({ cycle, coordinate }, index) => {
      coordinate.position.forEach((value, axis) => {
        positions[index * 3 + axis] = value;
      });
      const color = cycle.isCurrent
        ? ember
        : blue.clone().lerp(gold, (index % 10) / 12 + 0.12);
      color.toArray(colors, index * 3);
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
    return geometry;
  }, [profile.cycles, profile.palette.blue, profile.palette.ember, profile.palette.gold]);
  const zodiacGeometry = useMemo(() => {
    const cycles = profile.cycles.filter((cycle) => Number.isFinite(cycle.zodiacAngle));
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(cycles.length * 3);
    const colors = new Float32Array(cycles.length * 3);
    const gold = new THREE.Color(profile.palette.gold);
    const ember = new THREE.Color(profile.palette.ember);

    cycles.forEach((cycle, index) => {
      const angle = ((cycle.zodiacAngle ?? 0) * Math.PI) / 180;
      positions[index * 3] = Math.cos(angle) * 3;
      positions[index * 3 + 1] = Math.sin(angle) * 3;
      positions[index * 3 + 2] = 0;
      (cycle.isCurrent ? ember : gold).toArray(colors, index * 3);
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return geometry;
  }, [profile.cycles, profile.palette.ember, profile.palette.gold]);

  useEffect(() => () => {
    annualGeometry.dispose();
    zodiacGeometry.dispose();
  }, [annualGeometry, zodiacGeometry]);

  useFrame(() => {
    const reveal = smoothstep(0.72, 1, transition.current);
    if (root.current) root.current.visible = reveal > 0;
    if (annualMaterial.current) annualMaterial.current.opacity = reveal * 0.74;
    if (zodiacMaterial.current) zodiacMaterial.current.opacity = reveal * 0.92;
  });

  if (
    annualGeometry.getAttribute("position").count === 0
    && zodiacGeometry.getAttribute("position").count === 0
  ) return null;

  return (
    <group ref={root} visible={false}>
      <points geometry={annualGeometry} frustumCulled={false} renderOrder={6}>
        <pointsMaterial
          ref={annualMaterial}
          vertexColors
          size={compact ? 0.032 : 0.042}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <group rotation={[0.24, 0.42, 0.16]}>
        <points geometry={zodiacGeometry} frustumCulled={false} renderOrder={7}>
          <pointsMaterial
            ref={zodiacMaterial}
            vertexColors
            size={compact ? 0.075 : 0.105}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      </group>
    </group>
  );
}

function createGlyphTexture(glyph: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  context.clearRect(0, 0, 160, 160);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = '500 80px "Times New Roman", serif';
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.fillStyle = color;
  context.fillText(glyph, 80, 83);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function ZodiacGlyph({
  glyph,
  color,
  position,
  reveal,
}: {
  glyph: string;
  color: string;
  position: [number, number, number];
  reveal: React.MutableRefObject<number>;
}) {
  const material = useRef<THREE.SpriteMaterial>(null);
  const texture = useMemo(() => createGlyphTexture(glyph, color), [color, glyph]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (material.current) {
      material.current.opacity = smoothstep(0.7, 1, reveal.current) * 0.84;
    }
  });

  return (
    <sprite position={position} scale={[0.36, 0.36, 0.36]}>
      <spriteMaterial
        ref={material}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

function CelestialRings({
  profile,
  transition,
}: Pick<DestinyCoreProps, "profile" | "transition">) {
  const root = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const middle = useRef<THREE.Group>(null);
  const inner = useRef<THREE.InstancedMesh>(null);
  const outerMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const middleMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const innerMaterial = useRef<THREE.MeshBasicMaterial>(null);

  const glyphs = useMemo(
    () => profile.zodiac.map((item, index) => {
      const angle = (index / profile.zodiac.length) * Math.PI * 2 + Math.PI / 2;
      return {
        ...item,
        position: [Math.cos(angle) * 3.72, Math.sin(angle) * 3.72, 0] as [number, number, number],
      };
    }),
    [profile.zodiac],
  );

  useLayoutEffect(() => {
    if (!inner.current) return;
    const dummy = new THREE.Object3D();
    const colors = [
      new THREE.Color(profile.palette.blue),
      new THREE.Color(profile.palette.ember),
      new THREE.Color(profile.palette.gold),
      new THREE.Color("#d7e4ff"),
      new THREE.Color("#38c4ff"),
    ];
    const weights = Object.values(profile.elements);
    let weightCursor = 0;
    let weightLimit = weights[0];

    profile.jiazi.forEach((_, index) => {
      const angle = (index / profile.jiazi.length) * Math.PI * 2;
      const radius = 2.58 + Math.sin(index * 2.17) * 0.055;
      dummy.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.sin(index * 1.73) * 0.16,
      );
      dummy.rotation.set(angle * 0.3, angle, angle + Math.PI / 4);
      const scale = index % 10 === 0 ? 1.75 : 0.7 + (index % 5) * 0.08;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      inner.current?.setMatrixAt(index, dummy.matrix);
      const percentile = (index / profile.jiazi.length) * 100;
      while (percentile > weightLimit && weightCursor < weights.length - 1) {
        weightCursor += 1;
        weightLimit += weights[weightCursor];
      }
      inner.current?.setColorAt(index, colors[weightCursor]);
    });
    inner.current.instanceMatrix.needsUpdate = true;
    if (inner.current.instanceColor) inner.current.instanceColor.needsUpdate = true;
  }, [profile]);

  useFrame((_, delta) => {
    if (!root.current || !outer.current || !middle.current || !inner.current) return;
    const reveal = smoothstep(0.68, 1, transition.current);
    root.current.scale.setScalar(0.72 + reveal * 0.28);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, 0.12, 2.5, delta);
    outer.current.rotation.z += delta * 0.038;
    middle.current.rotation.z -= delta * 0.058;
    inner.current.rotation.z += delta * 0.021;
    if (outerMaterial.current) outerMaterial.current.opacity = reveal * 0.32;
    if (middleMaterial.current) middleMaterial.current.opacity = reveal * 0.2;
    if (innerMaterial.current) innerMaterial.current.opacity = reveal * 0.78;
  });

  return (
    <group ref={root}>
      <group ref={outer} rotation={[0.08, -0.16, 0]}>
        <mesh>
          <torusGeometry args={[3.42, 0.012, 8, 260]} />
          <meshBasicMaterial
            ref={outerMaterial}
            color={profile.palette.gold}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        {glyphs.map((item) => (
          <ZodiacGlyph
            key={item.name}
            glyph={item.glyph}
            color={profile.palette.gold}
            position={item.position}
            reveal={transition}
          />
        ))}
      </group>

      <group ref={middle} rotation={[0.24, 0.42, 0.16]}>
        <mesh>
          <torusGeometry args={[3.0, 0.008, 8, 220]} />
          <meshBasicMaterial
            ref={middleMaterial}
            color={profile.palette.blue}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[0.2, 0.35, 0]}>
          <torusGeometry args={[3.12, 0.004, 6, 220]} />
          <meshBasicMaterial
            color={profile.palette.gold}
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      <instancedMesh ref={inner} args={[undefined, undefined, profile.jiazi.length]} frustumCulled={false}>
        <tetrahedronGeometry args={[0.018, 0]} />
        <meshBasicMaterial
          ref={innerMaterial}
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

function TimelineNodes({
  profile,
  curve,
  transition,
  selectedCycleId,
  onSelectCycle,
}: Omit<DestinyCoreProps, "compact"> & { curve: THREE.CatmullRomCurve3 }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const root = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () => profile.cycles.map((cycle, index) => ({
      cycle,
      position: cycle.position?.length === 3
        && cycle.position.every((coordinate) => Number.isFinite(coordinate))
        ? new THREE.Vector3(...cycle.position)
        : curve.getPointAt(index / Math.max(1, profile.cycles.length - 1)),
    })),
    [curve, profile.cycles],
  );

  useFrame(() => {
    if (root.current) root.current.visible = transition.current > 0.68;
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "crosshair" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  return (
    <group ref={root} visible={false}>
      {nodes.map(({ cycle, position }, index) => {
        const active = cycle.id === selectedCycleId;
        const isHovered = cycle.id === hovered;
        const color = active || isHovered ? profile.palette.ember : profile.palette.gold;
        return (
          <group key={cycle.id} position={position}>
            <mesh
              scale={active ? 1.35 : isHovered ? 1.18 : 1}
              onClick={(event) => {
                event.stopPropagation();
                onSelectCycle(cycle);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(cycle.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.082, 20, 20]} />
              <meshBasicMaterial
                color={color}
                toneMapped={false}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[active ? 0.24 : 0.17, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={active ? 0.11 : 0.055}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onSelectCycle(cycle);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(cycle.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.28, 8, 8]} />
              <meshBasicMaterial
                transparent
                opacity={0}
                colorWrite={false}
                depthWrite={false}
              />
            </mesh>
            {index === 0 || index === nodes.length - 1 ? (
              <mesh position={[0, -0.34, 0]}>
                <planeGeometry args={[0.004, 0.42]} />
                <meshBasicMaterial color={profile.palette.gold} transparent opacity={0.2} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export function DestinyCore({
  profile,
  transition,
  selectedCycleId,
  onSelectCycle,
  compact,
}: DestinyCoreProps) {
  const root = useRef<THREE.Group>(null);
  const tubeMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const shellMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const curve = useMemo(() => buildTimelineCurve(profile), [profile]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const reveal = smoothstep(0.64, 1, transition.current);
    root.current.visible = transition.current > 0.56;
    root.current.scale.setScalar(0.6 + reveal * 0.4);
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      Math.sin(state.clock.elapsedTime * 0.13) * 0.045,
      2,
      delta,
    );
    if (tubeMaterial.current) tubeMaterial.current.opacity = reveal * 0.74;
    if (shellMaterial.current) shellMaterial.current.opacity = reveal * 0.09;
  });

  return (
    <group ref={root} visible={false} position={[0, compact ? 0.45 : 0.1, 0]} scale={0.6}>
      <CelestialRings profile={profile} transition={transition} />

      <mesh>
        <tubeGeometry args={[curve, 260, 0.018, 7, false]} />
        <meshBasicMaterial
          ref={tubeMaterial}
          color={profile.palette.gold}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <TimelineParticleFlow
        profile={profile}
        curve={curve}
        transition={transition}
        count={compact ? 2400 : 5200}
      />

      <DataCoordinateMarkers
        profile={profile}
        transition={transition}
        compact={compact}
      />

      <TimelineNodes
        profile={profile}
        curve={curve}
        transition={transition}
        selectedCycleId={selectedCycleId}
        onSelectCycle={onSelectCycle}
      />

      <mesh rotation={[0.35, 0.6, 0.2]}>
        <icosahedronGeometry args={[0.52, 2]} />
        <meshBasicMaterial
          ref={shellMaterial}
          color={profile.palette.blue}
          wireframe
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
