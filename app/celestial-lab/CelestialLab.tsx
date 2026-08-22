"use client";

/* eslint-disable react/no-unknown-property -- React Three Fiber JSX maps directly to Three.js objects. */

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, Sphere } from "@react-three/drei";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PostFx = lazy(() => import("./PostFx").then((module) => ({ default: module.PostFx })));

type BodyDatum = {
  id: string;
  glyph: string;
  name: string;
  stem: string;
  stemElement: string;
  azimuth: number;
  altitude: number;
  radius: number;
  color: string;
  size: number;
  note: string;
};

type ViewMode = "fusion" | "natal" | "time";

type AnnualDatum = {
  id: string;
  decadeIndex: number;
  yearIndex: number;
  year: number;
  age: number;
  stemBranch: string;
  element: keyof typeof ELEMENT_COLORS;
  intensity: number;
  theme: string;
  insight: string;
  choice: string;
};

type DecadeDatum = {
  index: number;
  stemBranch: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  phase: string;
  prompt: string;
};

const ELEMENT_COLORS = {
  木: "#65e7bb",
  火: "#ff7145",
  土: "#d9aa62",
  金: "#d4e8ef",
  水: "#688fff",
} as const;

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const STEM_ELEMENTS = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"] as const;
const ANNUAL_THEMES = ["身份重写", "关系校准", "边界建立", "表达回归", "结构升级", "选择收束", "资源重组", "视野打开", "节奏复位", "内核沉淀"] as const;
const ANNUAL_INSIGHTS = [
  "真正的变化不是加速，而是停止替旧身份辩护。",
  "关系不再靠猜测维持，清晰本身会成为温柔。",
  "你开始分辨责任与消耗，并为二者划出边界。",
  "曾经被效率压低的声音，会以更准确的方式回来。",
  "把野心装进结构，力量才不会在途中蒸发。",
  "少做一个正确的决定，也胜过十次惯性反应。",
  "旧资源需要重新命名，价值才会重新流动。",
  "陌生不是风险，它只是尚未形成语言的可能。",
  "恢复节奏不是退后，而是把生命拿回自己手里。",
  "答案不再来自外部确认，而来自你能承担的选择。",
] as const;
const ANNUAL_CHOICES = ["保留空白，再决定", "说出未被说出的条件", "先完成边界，再追求效率", "让作品替你发声", "把冲动写成可执行的结构"] as const;

const DECADES: DecadeDatum[] = [
  ["丁丑", "感知萌芽", "从环境的规则里辨认自己的声音"],
  ["戊寅", "身份试炼", "把被期待的样子与真实欲望拆开"],
  ["己卯", "表达成形", "不再用过度准备交换安全感"],
  ["庚辰", "结构扩张", "让能力从个人技巧变成可持续系统"],
  ["辛巳", "关系重构", "在亲密与自主之间建立新协议"],
  ["壬午", "影响外溢", "让经验成为他人可以借用的光"],
  ["癸未", "价值沉淀", "从拥有更多转向留下更准确的东西"],
  ["甲申", "边界松动", "把控制转换成信任与传承"],
  ["乙酉", "意义回望", "允许生命以非线性的方式完整"],
  ["丙戌", "精神归航", "不再证明存在，而是安静地存在"],
].map(([stemBranch, phase, prompt], index) => ({
  index,
  stemBranch,
  startAge: 6 + index * 10,
  endAge: 15 + index * 10,
  startYear: 1997 + index * 10,
  endYear: 2006 + index * 10,
  phase,
  prompt,
}));

function sexagenaryYear(year: number) {
  const index = ((year - 1984) % 60 + 60) % 60;
  return `${STEMS[index % 10]}${BRANCHES[index % 12]}`;
}

const ANNUAL_DATA: AnnualDatum[] = DECADES.flatMap((decade) => Array.from({ length: 10 }, (_, yearIndex) => {
  const year = decade.startYear + yearIndex;
  const stemIndex = ((year - 1984) % 10 + 10) % 10;
  return {
    id: `annual-${decade.index}-${yearIndex}`,
    decadeIndex: decade.index,
    yearIndex,
    year,
    age: decade.startAge + yearIndex,
    stemBranch: sexagenaryYear(year),
    element: STEM_ELEMENTS[stemIndex],
    intensity: 42 + ((decade.index * 29 + yearIndex * 17) % 54),
    theme: ANNUAL_THEMES[(decade.index * 3 + yearIndex) % ANNUAL_THEMES.length],
    insight: ANNUAL_INSIGHTS[(decade.index * 7 + yearIndex) % ANNUAL_INSIGHTS.length],
    choice: ANNUAL_CHOICES[(decade.index + yearIndex * 2) % ANNUAL_CHOICES.length],
  };
}));

const WESTERN_SIGNS = [
  ["♈", "ARIES"], ["♉", "TAURUS"], ["♊", "GEMINI"], ["♋", "CANCER"],
  ["♌", "LEO"], ["♍", "VIRGO"], ["♎", "LIBRA"], ["♏", "SCORPIO"],
  ["♐", "SAGITTARIUS"], ["♑", "CAPRICORN"], ["♒", "AQUARIUS"], ["♓", "PISCES"],
] as const;

const EARTHLY_BRANCHES = [
  ["卯", "兔"], ["辰", "龙"], ["巳", "蛇"], ["午", "马"],
  ["未", "羊"], ["申", "猴"], ["酉", "鸡"], ["戌", "狗"],
  ["亥", "猪"], ["子", "鼠"], ["丑", "牛"], ["寅", "虎"],
] as const;

const BODIES: BodyDatum[] = [
  { id: "sun", glyph: "☉", name: "太阳", stem: "丙", stemElement: "阳火", azimuth: 22, altitude: 28, radius: 3.55, color: "#ffb34e", size: 0.19, note: "意志 · 可见的核心" },
  { id: "moon", glyph: "☽", name: "月亮", stem: "乙", stemElement: "阴木", azimuth: 70, altitude: -21, radius: 3.18, color: "#d7edff", size: 0.15, note: "感受 · 内在的容器" },
  { id: "mercury", glyph: "☿", name: "水星", stem: "辛", stemElement: "阴金", azimuth: 112, altitude: 12, radius: 3.72, color: "#8ad8ff", size: 0.1, note: "思维 · 信息的流向" },
  { id: "venus", glyph: "♀", name: "金星", stem: "己", stemElement: "阴土", azimuth: 151, altitude: 37, radius: 3.3, color: "#ffe1aa", size: 0.12, note: "关系 · 价值的吸引" },
  { id: "mars", glyph: "♂", name: "火星", stem: "丁", stemElement: "阴火", azimuth: 188, altitude: -32, radius: 3.58, color: "#ff5c37", size: 0.12, note: "行动 · 边界的温度" },
  { id: "jupiter", glyph: "♃", name: "木星", stem: "甲", stemElement: "阳木", azimuth: 222, altitude: 18, radius: 3.5, color: "#dbb871", size: 0.15, note: "扩张 · 生长的尺度" },
  { id: "saturn", glyph: "♄", name: "土星", stem: "戊", stemElement: "阳土", azimuth: 253, altitude: -13, radius: 3.82, color: "#c7a977", size: 0.14, note: "结构 · 时间的边界" },
  { id: "uranus", glyph: "♅", name: "天王星", stem: "庚", stemElement: "阳金", azimuth: 286, altitude: 43, radius: 3.34, color: "#82fff1", size: 0.11, note: "突变 · 系统的断点" },
  { id: "neptune", glyph: "♆", name: "海王星", stem: "壬", stemElement: "阳水", azimuth: 319, altitude: -39, radius: 3.6, color: "#6d8cff", size: 0.12, note: "想象 · 边界的溶解" },
  { id: "pluto", glyph: "♇", name: "冥王星", stem: "癸", stemElement: "阴水", azimuth: 346, altitude: 8, radius: 3.26, color: "#bd76ff", size: 0.1, note: "蜕变 · 深层的重写" },
];

function toPosition(body: BodyDatum): [number, number, number] {
  const azimuth = THREE.MathUtils.degToRad(body.azimuth);
  const altitude = THREE.MathUtils.degToRad(body.altitude);
  return [
    Math.cos(altitude) * Math.cos(azimuth) * body.radius,
    Math.sin(altitude) * body.radius,
    Math.cos(altitude) * Math.sin(azimuth) * body.radius,
  ];
}

function eclipticPosition(index: number, radius: number, yLift = 0): [number, number, number] {
  const angle = (index / 12) * Math.PI * 2;
  const tilt = THREE.MathUtils.degToRad(23.4);
  const x = Math.cos(angle) * radius;
  const baseZ = Math.sin(angle) * radius;
  return [x, baseZ * Math.sin(tilt) + yLift, baseZ * Math.cos(tilt)];
}

function StarDust({ count }: { count: number }) {
  const points = useMemo(() => {
    let seed = 94137;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const distance = 7 + random() * 11;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      data[index * 3] = distance * Math.sin(phi) * Math.cos(theta);
      data[index * 3 + 1] = distance * Math.cos(phi);
      data[index * 3 + 2] = distance * Math.sin(phi) * Math.sin(theta);
    }
    return data;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#88aef0" size={0.018} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function LatitudeGrid() {
  const rings = useMemo(() => [-55, -30, 0, 30, 55].map((latitude) => {
    const lat = THREE.MathUtils.degToRad(latitude);
    const radius = Math.cos(lat) * 4.45;
    const y = Math.sin(lat) * 4.45;
    return Array.from({ length: 97 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    });
  }), []);

  return <>{rings.map((points, index) => <Line key={index} points={points} color="#396078" transparent opacity={index === 2 ? 0.28 : 0.12} lineWidth={0.55} />)}</>;
}

function HorizonPlane() {
  const cardinal = [["N", 0, -5.05], ["E", 5.05, 0], ["S", 0, 5.05], ["W", -5.05, 0]] as const;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 5, 128]} />
        <meshBasicMaterial color="#112939" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[1.4, 2.5, 3.6, 5].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.007, radius + 0.007, 128]} />
          <meshBasicMaterial color="#5c9ab4" transparent opacity={radius === 5 ? 0.48 : 0.2} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2;
        return <Line key={index} points={[[0.85 * Math.cos(angle), 0, 0.85 * Math.sin(angle)], [5 * Math.cos(angle), 0, 5 * Math.sin(angle)]]} color="#40738a" transparent opacity={index % 2 === 0 ? 0.22 : 0.1} lineWidth={0.45} />;
      })}
      {cardinal.map(([label, x, z]) => (
        <Html key={label} position={[x, 0.02, z]} center distanceFactor={10} transform>
          <span className="cardinal-label">{label}</span>
        </Html>
      ))}
      <Html position={[0, 0.02, -1.05]} center distanceFactor={10} transform rotation={[-Math.PI / 2, 0, 0]}>
        <span className="plane-label">HORIZON · 出生地平面</span>
      </Html>
    </group>
  );
}

function ZodiacSystem() {
  const ecliptic = useMemo(() => Array.from({ length: 129 }, (_, index) => {
    const p = eclipticPosition((index / 128) * 12, 4.02);
    return new THREE.Vector3(...p);
  }), []);
  const planeRotation = Math.PI / 2 - THREE.MathUtils.degToRad(23.4);

  return (
    <group>
      <group rotation={[planeRotation, 0, 0]}>
        {Array.from({ length: 12 }, (_, index) => {
          const segment = (Math.PI * 2) / 12;
          return (
            <mesh key={`house-sector-${index}`}>
              <ringGeometry args={[2.12, 4.01, 28, 1, index * segment + 0.012, segment - 0.024]} />
              <meshBasicMaterial color={index % 2 === 0 ? "#7c4c2e" : "#173d4c"} transparent opacity={index % 2 === 0 ? 0.045 : 0.032} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
      <Line points={ecliptic} color="#f0a846" lineWidth={1.2} transparent opacity={0.85} />
      <Line points={ecliptic.map((p) => p.clone().multiplyScalar(0.81))} color="#4ed9df" lineWidth={0.75} transparent opacity={0.55} />
      {WESTERN_SIGNS.map(([glyph, sign], index) => {
        const position = eclipticPosition(index + 0.5, 4.08, 0.04);
        // The month-branch ring is seasonally aligned: its centers sit about 15°
        // before the centers of the tropical signs. It is not a canonical pairing.
        const branchPosition = eclipticPosition(index, 3.28, -0.02);
        const next = eclipticPosition(index, 4.16);
        return (
          <group key={sign}>
            <Line points={[[0, 0, 0], next]} color="#ca8b3a" transparent opacity={0.12} lineWidth={0.45} />
            <Line points={[branchPosition, position]} color="#76d8d6" transparent opacity={0.14} lineWidth={0.45} dashed dashSize={0.045} gapSize={0.035} />
            <Html position={position} center distanceFactor={9.5} transform sprite>
              <div className="zodiac-label"><b>{glyph}</b><span>{sign}</span></div>
            </Html>
            <Html position={branchPosition} center distanceFactor={9.5} transform sprite>
              <div className="branch-label"><b>{EARTHLY_BRANCHES[index][0]}</b><span>{EARTHLY_BRANCHES[index][1]}</span></div>
            </Html>
            <Html position={eclipticPosition(index + 0.5, 2.28)} center distanceFactor={9.5} transform sprite>
              <span className="house-label">{String(index + 1).padStart(2, "0")}</span>
            </Html>
          </group>
        );
      })}
      <Line points={[[-4.5, 0, 0], [4.5, 0, 0]]} color="#ffb65a" transparent opacity={0.62} lineWidth={1.1} />
      <Line points={[[0, -4.48, 0], [0, 4.48, 0]]} color="#71d9dc" transparent opacity={0.4} lineWidth={0.8} />
      <Html position={[-4.72, 0, 0]} center distanceFactor={9} transform sprite><span className="axis-label axis-gold">ASC</span></Html>
      <Html position={[4.72, 0, 0]} center distanceFactor={9} transform sprite><span className="axis-label axis-gold">DSC</span></Html>
      <Html position={[0, 4.7, 0]} center distanceFactor={9} transform sprite><span className="axis-label">MC</span></Html>
      <Html position={[0, -4.7, 0]} center distanceFactor={9} transform sprite><span className="axis-label">IC</span></Html>
      <Html position={eclipticPosition(9.1, 4.8)} center distanceFactor={10} transform sprite>
        <span className="ecliptic-label">ECLIPTIC · 黄道 23.4°</span>
      </Html>
    </group>
  );
}

const PILLARS = [
  { role: "YEAR", label: "年柱", ganZhi: "辛未", color: "#d8e8ed", position: [-0.78, 0, 0] as [number, number, number] },
  { role: "MONTH", label: "月柱", ganZhi: "丁酉", color: "#ff744a", position: [0, 0, 0.78] as [number, number, number] },
  { role: "DAY", label: "日柱", ganZhi: "戊辰", color: "#e0ad5c", position: [0.78, 0, 0] as [number, number, number] },
  { role: "HOUR", label: "时柱", ganZhi: "癸亥", color: "#7196ff", position: [0, 0, -0.78] as [number, number, number] },
] as const;

function ElementField() {
  const { positions, colors } = useMemo(() => {
    let seed = 314159;
    const random = () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const weights = [48, 34, 61, 29, 44];
    const palette = Object.values(ELEMENT_COLORS).map((hex) => new THREE.Color(hex));
    const total = weights.reduce((sum, count) => sum + count, 0);
    const pointPositions = new Float32Array(total * 3);
    const pointColors = new Float32Array(total * 3);
    let cursor = 0;
    weights.forEach((count, elementIndex) => {
      for (let index = 0; index < count; index += 1) {
        const angle = random() * Math.PI * 2 + elementIndex * 1.18;
        const radius = 0.52 + random() * 0.92;
        const y = (random() - 0.5) * 1.75;
        pointPositions[cursor * 3] = Math.cos(angle) * radius;
        pointPositions[cursor * 3 + 1] = y;
        pointPositions[cursor * 3 + 2] = Math.sin(angle) * radius;
        pointColors[cursor * 3] = palette[elementIndex].r;
        pointColors[cursor * 3 + 1] = palette[elementIndex].g;
        pointColors[cursor * 3 + 2] = palette[elementIndex].b;
        cursor += 1;
      }
    });
    return { positions: pointPositions, colors: pointColors };
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.025} transparent opacity={0.62} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function FourPillarCore({ motionEnabled, compact = false }: { motionEnabled: boolean; compact?: boolean }) {
  const shell = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (shell.current && motionEnabled) shell.current.rotation.y += delta * 0.055;
  });
  return (
    <group scale={compact ? 0.72 : 1}>
      <group ref={shell}>
        <ElementField />
        {PILLARS.map((pillar, index) => (
          <group key={pillar.role} position={pillar.position}>
            <Line points={[[0, -0.92, 0], [0, 0.92, 0]]} color={pillar.color} transparent opacity={0.55} lineWidth={index === 2 ? 1.3 : 0.75} />
            <mesh position={[0, 0.2, 0]} rotation={[0, index * Math.PI * 0.25, 0]}>
              <octahedronGeometry args={[index === 2 ? 0.25 : 0.17, 0]} />
              <meshBasicMaterial color={pillar.color} wireframe={index !== 2} transparent opacity={index === 2 ? 0.95 : 0.55} toneMapped={false} />
            </mesh>
            {!compact && (
              <Html position={[0, 1.08, 0]} center distanceFactor={8.4} transform sprite>
                <div className={`pillar-label ${index === 2 ? "is-day" : ""}`}><span>{pillar.role}</span><b>{pillar.ganZhi}</b><i>{pillar.label}</i></div>
              </Html>
            )}
          </group>
        ))}
        <mesh rotation={[0.4, 0.2, 0.72]}>
          <icosahedronGeometry args={[0.34, 1]} />
          <meshBasicMaterial color="#f1b45d" wireframe transparent opacity={0.75} toneMapped={false} />
        </mesh>
        <Sphere args={[0.11, 20, 20]}><meshBasicMaterial color="#fff3d8" toneMapped={false} /></Sphere>
      </group>
      <Html position={[0, -1.28, 0]} center distanceFactor={8.8} transform sprite>
        <div className="observer-label"><span>FOUR PILLAR CORE</span><b>日主 戊 · 出生时刻视点</b></div>
      </Html>
    </group>
  );
}

function timeArcPoint(decadeIndex: number, yearPosition: number, expanded: boolean) {
  const segment = (Math.PI * 2) / 10;
  const gap = 0.105;
  const angle = -Math.PI * 0.5 + decadeIndex * segment + gap + (yearPosition / 9) * (segment - gap * 2);
  const radius = 5.28 + (expanded ? 0.42 : 0);
  const y = Math.sin(angle * 2) * 0.62 + Math.cos((yearPosition / 9) * Math.PI) * 0.12;
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

function AnnualInstances({
  selectedDecade,
  selectedYearId,
  mode,
  onSelectYear,
}: {
  selectedDecade: number;
  selectedYearId: string;
  mode: ViewMode;
  onSelectYear: (annual: AnnualDatum) => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!mesh.current) return;
    ANNUAL_DATA.forEach((annual, index) => {
      const active = annual.decadeIndex === selectedDecade;
      const selected = annual.id === selectedYearId;
      const point = timeArcPoint(annual.decadeIndex, annual.yearIndex, active);
      dummy.position.copy(point);
      dummy.scale.setScalar(selected ? 0.12 : active ? 0.064 : 0.027);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
      const color = new THREE.Color(ELEMENT_COLORS[annual.element]);
      if (!active) color.multiplyScalar(mode === "time" ? 0.28 : 0.13);
      mesh.current?.setColorAt(index, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [dummy, mode, selectedDecade, selectedYearId]);

  const selectInstance = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId === undefined) return;
    const annual = ANNUAL_DATA[event.instanceId];
    if (annual) onSelectYear(annual);
  };

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, ANNUAL_DATA.length]}
      onClick={selectInstance}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  );
}

function TimeBraid({
  mode,
  selectedDecade,
  selectedYearId,
  onSelectDecade,
  onSelectYear,
}: {
  mode: ViewMode;
  selectedDecade: number;
  selectedYearId: string;
  onSelectDecade: (index: number) => void;
  onSelectYear: (annual: AnnualDatum) => void;
}) {
  const visible = mode !== "natal";
  if (!visible) return null;

  const selectedAnnual = ANNUAL_DATA.find((annual) => annual.id === selectedYearId);

  return (
    <group>
      {DECADES.map((decade) => {
        const selected = decade.index === selectedDecade;
        const points = Array.from({ length: 24 }, (_, index) => timeArcPoint(decade.index, (index / 23) * 9, selected));
        return <Line key={`arc-${decade.index}`} points={points} color={selected ? "#d7b16d" : "#7290a1"} transparent opacity={selected ? 0.72 : mode === "time" ? 0.14 : 0.055} lineWidth={selected ? 1.45 : 0.62} />;
      })}
      <AnnualInstances mode={mode} selectedDecade={selectedDecade} selectedYearId={selectedYearId} onSelectYear={onSelectYear} />
      {selectedAnnual && (
        <group position={timeArcPoint(selectedAnnual.decadeIndex, selectedAnnual.yearIndex, true)}>
          <Sphere args={[0.19, 18, 18]}><meshBasicMaterial color={ELEMENT_COLORS[selectedAnnual.element]} wireframe transparent opacity={0.52} toneMapped={false} /></Sphere>
          <Html position={[0, 0.29, 0]} center distanceFactor={8.4} transform sprite>
            <div className="annual-label"><b>{selectedAnnual.year}</b><span>{selectedAnnual.stemBranch} · {selectedAnnual.age}岁</span></div>
          </Html>
        </group>
      )}
      {DECADES.map((decade) => {
        const selected = decade.index === selectedDecade;
        const point = timeArcPoint(decade.index, 4.5, selected);
        const stemIndex = STEMS.indexOf(decade.stemBranch[0] as typeof STEMS[number]);
        const element = STEM_ELEMENTS[Math.max(stemIndex, 0)];
        const color = ELEMENT_COLORS[element];
        return (
          <group key={decade.stemBranch} position={point}>
            <mesh
              onClick={(event) => { event.stopPropagation(); onSelectDecade(decade.index); }}
              onPointerOver={() => { document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { document.body.style.cursor = "default"; }}
            >
              <sphereGeometry args={[selected ? 0.19 : 0.135, 24, 24]} />
              <meshBasicMaterial color={color} transparent opacity={selected ? 1 : 0.72} toneMapped={false} />
            </mesh>
            <Sphere args={[selected ? 0.31 : 0.22, 18, 18]}>
              <meshBasicMaterial color={color} wireframe transparent opacity={selected ? 0.42 : 0.16} toneMapped={false} />
            </Sphere>
            <Html position={[0, selected ? 0.43 : 0.31, 0]} center distanceFactor={8.8} transform sprite>
              <button className={`decade-label ${selected ? "is-selected" : ""}`} onClick={() => onSelectDecade(decade.index)} aria-pressed={selected} aria-label={`选择第${decade.index + 1}大运 ${decade.stemBranch}`}>
                <b>{String(decade.index + 1).padStart(2, "0")} · {decade.stemBranch}</b>
                <span>{decade.startAge}—{decade.endAge} 岁</span>
              </button>
            </Html>
          </group>
        );
      })}
      <Html position={timeArcPoint(0, 0, false)} center distanceFactor={9} transform sprite>
        <span className="time-axis-label">TEN DECADE CHAMBERS / 10 × 10</span>
      </Html>
    </group>
  );
}

function CelestialBody({ body, selected, motionEnabled, onSelect }: { body: BodyDatum; selected: boolean; motionEnabled: boolean; onSelect: (body: BodyDatum) => void }) {
  const position = toPosition(body);
  const projected: [number, number, number] = [position[0], 0, position[2]];
  const eclipticProjection = eclipticPosition(body.azimuth / 30, 4.02);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const pulse = motionEnabled ? 1 + Math.sin(clock.elapsedTime * 1.8 + body.azimuth) * 0.08 : 1;
    mesh.current.scale.setScalar(selected ? pulse * 1.45 : pulse);
  });
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(body);
  };
  return (
    <group>
      <Line points={[[0, 0, 0], position]} color={body.color} transparent opacity={selected ? 0.58 : 0.16} lineWidth={selected ? 1.15 : 0.5} />
      <Line points={[position, projected]} color={body.altitude >= 0 ? "#efc06e" : "#597baf"} transparent opacity={selected ? 0.65 : 0.22} lineWidth={0.75} dashed dashSize={0.06} gapSize={0.04} />
      <Line points={[position, eclipticProjection]} color="#d7aa62" transparent opacity={selected ? 0.46 : 0.08} lineWidth={0.55} dashed dashSize={0.05} gapSize={0.045} />
      <mesh position={eclipticProjection}>
        <sphereGeometry args={[selected ? 0.052 : 0.032, 10, 10]} />
        <meshBasicMaterial color={body.color} transparent opacity={selected ? 1 : 0.45} toneMapped={false} />
      </mesh>
      <mesh ref={mesh} position={position} onClick={click} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <sphereGeometry args={[body.size, 24, 24]} />
        <meshBasicMaterial color={body.color} toneMapped={false} />
      </mesh>
      <Html position={position} center distanceFactor={8.2} transform sprite>
        <button className={`body-label ${body.altitude < 0 ? "is-below" : ""} ${selected ? "is-selected" : ""}`} onClick={() => onSelect(body)} aria-label={`选择${body.name}`} aria-pressed={selected}>
          <span>{body.glyph}</span><b>{body.stem}</b>
        </button>
      </Html>
    </group>
  );
}

const ASPECTS = [
  ["sun", "mars", "#ff744a"], ["sun", "neptune", "#758dff"], ["moon", "venus", "#77dfd2"],
  ["mercury", "saturn", "#e0b468"], ["jupiter", "uranus", "#63e6d7"], ["venus", "pluto", "#be78ff"],
  ["moon", "jupiter", "#76bbff"], ["mars", "saturn", "#ff935e"], ["mercury", "uranus", "#6ce4df"],
] as const;

function AspectNetwork({ selectedBodyId }: { selectedBodyId: string }) {
  return (
    <group>
      {ASPECTS.map(([fromId, toId, color]) => {
        const from = BODIES.find((body) => body.id === fromId);
        const to = BODIES.find((body) => body.id === toId);
        if (!from || !to) return null;
        const active = fromId === selectedBodyId || toId === selectedBodyId;
        return <Line key={`${fromId}-${toId}`} points={[toPosition(from), toPosition(to)]} color={color} transparent opacity={active ? 0.58 : 0.09} lineWidth={active ? 1.15 : 0.45} />;
      })}
    </group>
  );
}

function CameraRig({ mode, motionEnabled }: { mode: ViewMode; motionEnabled: boolean }) {
  const { camera } = useThree();
  const start = useRef(camera.position.clone());
  const progress = useRef(1);
  const goal = useMemo(() => ({
    fusion: new THREE.Vector3(6.7, 5.1, 11.4),
    natal: new THREE.Vector3(0.5, 5.2, 10.6),
    time: new THREE.Vector3(7.8, 3.7, 10.8),
  })[mode], [mode]);

  useEffect(() => {
    start.current.copy(camera.position);
    progress.current = motionEnabled ? 0 : 1;
    if (!motionEnabled) {
      camera.position.copy(goal);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, goal, motionEnabled]);

  useFrame((_, delta) => {
    if (progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / 1.05);
    const t = progress.current * progress.current * (3 - 2 * progress.current);
    camera.position.lerpVectors(start.current, goal, t);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function CelestialScene({
  mode,
  motionEnabled,
  lowPower,
  selectedBody,
  selectedDecade,
  selectedYearId,
  onSelectBody,
  onSelectDecade,
  onSelectYear,
}: {
  mode: ViewMode;
  motionEnabled: boolean;
  lowPower: boolean;
  selectedBody: BodyDatum;
  selectedDecade: number;
  selectedYearId: string;
  onSelectBody: (body: BodyDatum) => void;
  onSelectDecade: (index: number) => void;
  onSelectYear: (annual: AnnualDatum) => void;
}) {
  const [userStoppedRotation, setUserStoppedRotation] = useState(false);
  return (
    <>
      <color attach="background" args={["#020509"]} />
      <fog attach="fog" args={["#020509", 11, 23]} />
      <ambientLight intensity={0.15} />
      <StarDust count={lowPower ? 850 : 1800} />
      {mode !== "time" && (
        <>
          <LatitudeGrid />
          <Sphere args={[4.46, 48, 48]}>
            <meshBasicMaterial color="#276078" wireframe transparent opacity={0.062} side={THREE.DoubleSide} depthWrite={false} />
          </Sphere>
          <HorizonPlane />
          <ZodiacSystem />
          <FourPillarCore motionEnabled={motionEnabled} />
          <AspectNetwork selectedBodyId={selectedBody.id} />
          {BODIES.map((body) => <CelestialBody key={body.id} body={body} selected={selectedBody.id === body.id} motionEnabled={motionEnabled} onSelect={onSelectBody} />)}
        </>
      )}
      {mode === "time" && <FourPillarCore motionEnabled={motionEnabled} compact />}
      <TimeBraid mode={mode} selectedDecade={selectedDecade} selectedYearId={selectedYearId} onSelectDecade={onSelectDecade} onSelectYear={onSelectYear} />
      <CameraRig mode={mode} motionEnabled={motionEnabled} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.055}
        minDistance={6.2}
        maxDistance={15.5}
        autoRotate={!userStoppedRotation && motionEnabled}
        autoRotateSpeed={0.16}
        target={[0, 0, 0]}
        onStart={() => setUserStoppedRotation(true)}
      />
      {!lowPower && (
        <Suspense fallback={null}><PostFx /></Suspense>
      )}
    </>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useLowPowerMode() {
  const measure = () => window.innerWidth < 760 || navigator.hardwareConcurrency <= 4 || window.matchMedia("(pointer: coarse)").matches;
  const [lowPower, setLowPower] = useState(() => typeof window !== "undefined" && measure());
  useEffect(() => {
    const update = () => setLowPower(measure());
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return lowPower;
}

export function CelestialLab() {
  const initialAnnual = ANNUAL_DATA.find((annual) => annual.year === 2026) ?? ANNUAL_DATA[0];
  const [mode, setMode] = useState<ViewMode>("fusion");
  const [selectedBody, setSelectedBody] = useState(BODIES[0]);
  const [selectedDecade, setSelectedDecade] = useState(initialAnnual.decadeIndex);
  const [selectedAnnual, setSelectedAnnual] = useState(initialAnnual);
  const [panel, setPanel] = useState<"body" | "decade" | "annual">("annual");
  const [viewKey, setViewKey] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const lowPower = useLowPowerMode();
  const [manualPaused, setManualPaused] = useState(false);
  const motionEnabled = !prefersReducedMotion && !manualPaused;
  const decade = DECADES[selectedDecade];
  const annualDecade = DECADES[selectedAnnual.decadeIndex];

  const chooseMode = (next: ViewMode) => {
    setMode(next);
    if (next === "natal") setPanel("body");
    if (next === "time" && panel === "body") setPanel("decade");
  };

  const chooseBody = (body: BodyDatum) => {
    setSelectedBody(body);
    setPanel("body");
  };

  const chooseDecade = (index: number) => {
    setSelectedDecade(index);
    setPanel("decade");
  };

  const chooseAnnual = (annual: AnnualDatum) => {
    setSelectedAnnual(annual);
    setSelectedDecade(annual.decadeIndex);
    setPanel("annual");
  };

  return (
    <main className="lab-shell">
      <div className="scene-canvas" aria-label="可拖拽旋转的立体星盘与八字融合原型">
        <Canvas key={viewKey} dpr={lowPower ? [0.75, 1] : [1, 1.4]} camera={{ position: [0.6, 4.9, 11.2], fov: 46, near: 0.1, far: 40 }} gl={{ antialias: !lowPower, alpha: false, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            <CelestialScene
              mode={mode}
              motionEnabled={motionEnabled}
              lowPower={lowPower}
              selectedBody={selectedBody}
              selectedDecade={selectedDecade}
              selectedYearId={panel === "annual" ? selectedAnnual.id : ""}
              onSelectBody={chooseBody}
              onSelectDecade={chooseDecade}
              onSelectYear={chooseAnnual}
            />
          </Suspense>
        </Canvas>
      </div>
      <header className="topbar">
        <div className="brand-lockup"><span>DESTINY PIXEL / R&amp;D 01</span><h1>天命合仪</h1><p>STATIC SAMPLE · 1991.09.17 / 21:36 / SHANGHAI</p></div>
        <div className="mode-tabs" aria-label="原型层级" role="tablist">
          <button role="tab" aria-selected={mode === "fusion"} className={mode === "fusion" ? "active" : ""} onClick={() => chooseMode("fusion")}>FUSION · 合仪</button>
          <button role="tab" aria-selected={mode === "natal"} className={mode === "natal" ? "active" : ""} onClick={() => chooseMode("natal")}>NATAL · 天球</button>
          <button role="tab" aria-selected={mode === "time"} className={mode === "time" ? "active" : ""} onClick={() => chooseMode("time")}>TIME · 大运</button>
        </div>
        <div className="view-controls">
          <button className="motion-button" aria-pressed={manualPaused || prefersReducedMotion} onClick={() => setManualPaused((paused) => !paused)} disabled={prefersReducedMotion}>{motionEnabled ? "MOTION ON" : "MOTION OFF"}</button>
          <button className="reset-button" onClick={() => setViewKey((key) => key + 1)}>RESET VIEW ↗</button>
        </div>
      </header>

      <div className="coordinate-legend" aria-label="坐标层说明">
        <span><i className="gold-dot" />TROPICAL ZODIAC · 春分点起算</span>
        <span><i className="cyan-dot" />MONTH BRANCHES · 节气季相偏移 −15°</span>
        <span><i className="blue-dot" />LIFE VECTOR · 时间只表达层级</span>
      </div>

      <aside className={`readout readout-${panel}`} aria-live="polite">
        <nav className="breadcrumb" aria-label="当前查看路径">本命天球 <i>›</i> 第{String(selectedDecade + 1).padStart(2, "0")}大运 {panel === "annual" && <><i>›</i> {selectedAnnual.year} {selectedAnnual.stemBranch}</>}</nav>
        {panel === "body" && (
          <>
            <div className="readout-index">CELESTIAL BODY / {String(BODIES.findIndex((item) => item.id === selectedBody.id) + 1).padStart(2, "0")}</div>
            <div className="readout-title"><span style={{ color: selectedBody.color }}>{selectedBody.glyph}</span><div><small>{selectedBody.name.toUpperCase()} / {selectedBody.id.toUpperCase()}</small><h2>{selectedBody.stem} · {selectedBody.stemElement}</h2></div></div>
            <p>{selectedBody.note}</p>
            <dl><div><dt>AZIMUTH</dt><dd>{selectedBody.azimuth}°</dd></div><div><dt>ALTITUDE</dt><dd className={selectedBody.altitude < 0 ? "below" : "above"}>{selectedBody.altitude > 0 ? "+" : ""}{selectedBody.altitude}° · {selectedBody.altitude >= 0 ? "地平线上" : "地平线下"}</dd></div></dl>
            <div className="mapping-note">十天干映射为 DestinyPixel 的视觉隐喻编码，不是古典命理或天文学的固定对应，也不参与排盘计算。</div>
          </>
        )}

        {panel === "decade" && (
          <>
            <div className="readout-index">DAYUN / {String(decade.index + 1).padStart(2, "0")} · TEN-YEAR FIELD</div>
            <div className="decade-heading"><span>{decade.stemBranch}</span><div><small>{decade.startYear}—{decade.endYear}</small><h2>{decade.phase}</h2></div></div>
            <p>{decade.prompt}</p>
            <div className="annual-mini-grid">
              {ANNUAL_DATA.filter((annual) => annual.decadeIndex === selectedDecade).map((annual) => (
                <button key={annual.id} onClick={() => chooseAnnual(annual)} aria-label={`查看${annual.year}年 ${annual.stemBranch}`}><b>{annual.year}</b><span style={{ color: ELEMENT_COLORS[annual.element] }}>{annual.stemBranch}</span></button>
              ))}
            </div>
            <div className="mapping-note">点击任一流年进入年度层。100 个流年存在于完整轨道，但只让当前大运的 10 个节点保持高亮。</div>
          </>
        )}

        {panel === "annual" && (
          <>
            <div className="readout-index">DAYUN {String(selectedAnnual.decadeIndex + 1).padStart(2, "0")} / LIUNIAN {String(selectedAnnual.yearIndex + 1).padStart(2, "0")}</div>
            <div className="annual-heading"><span style={{ color: ELEMENT_COLORS[selectedAnnual.element] }}>{selectedAnnual.stemBranch}</span><div><small>{selectedAnnual.year} · {selectedAnnual.age} 岁</small><h2>{selectedAnnual.theme}</h2></div></div>
            <div className="fact-line"><span>计算事实 / DEMO</span><b>{annualDecade.stemBranch}运 · {selectedAnnual.element}相 · 强度 {selectedAnnual.intensity}</b></div>
            <div className="intensity-meter"><i style={{ width: `${selectedAnnual.intensity}%`, background: ELEMENT_COLORS[selectedAnnual.element] }} /></div>
            <blockquote>{selectedAnnual.insight}</blockquote>
            <div className="choice-line"><span>心理选择</span><b>{selectedAnnual.choice}</b></div>
            <div className="annual-year-rail" aria-label={`第${selectedAnnual.decadeIndex + 1}大运的十个流年`}>
              {ANNUAL_DATA.filter((annual) => annual.decadeIndex === selectedAnnual.decadeIndex).map((annual) => (
                <button key={annual.id} aria-pressed={annual.id === selectedAnnual.id} onClick={() => chooseAnnual(annual)}><b>{String(annual.year).slice(2)}</b><span>{annual.stemBranch}</span></button>
              ))}
            </div>
            <div className="mapping-note">这是静态文案与假数据，用来确定信息密度和交互层级；不构成预测、诊断或确定事件。</div>
          </>
        )}
      </aside>

      <footer className="interaction-hint"><span className="mouse-icon">↔</span><b>拖拽旋转整套空间</b><i>滚轮 / 双指缩放</i><em>{mode === "natal" ? "点击星体" : "点击大运，再展开 10 个流年"}</em></footer>
      <div className="status-rail"><span>OBSERVER</span><b /><span>HORIZON 0°</span><b /><span>ECLIPTIC 23.4°</span><b /><span>TIME 100Y</span></div>
      <div className="prototype-notice">VISUAL SYSTEM STUDY · NO LIVE CALCULATION</div>
      <div className="mobile-disclaimer">静态假数据 · 艺术映射 · 非预测或诊断</div>
    </main>
  );
}
