import type { ElementName } from "@/lib/core/mappings";
import type {
  FunctionModuleKey,
  PillarKey,
  TotemModel,
  TotemPoint,
} from "@/lib/totem/types";

const CENTER = 500;

const elementOrder: ElementName[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

export type GuardianPlacement = {
  pillar: PillarKey;
  partId: string;
  branch: string;
  element: ElementName;
  point: TotemPoint;
  scale: number;
  motifPath: string;
};

export type ElementAura = {
  element: ElementName;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation: number;
  opacity: number;
};

export type TotemVisualGrammar = {
  symmetry: number;
  rotation: number;
  framePath: string;
  haloPath: string;
  knotPaths: string[];
  guardians: GuardianPlacement[];
  dayGuardian?: GuardianPlacement;
  auras: ElementAura[];
  rosetteCount: number;
};

const pillarCorridors: Record<
  PillarKey,
  { angle: number; inner: TotemPoint; outer: TotemPoint }
> = {
  year: {
    angle: -90,
    inner: { x: 500, y: 388 },
    outer: { x: 500, y: 142 },
  },
  month: {
    angle: -168.1,
    inner: { x: 397, y: 500 },
    outer: { x: 205, y: 438 },
  },
  day: {
    angle: -11.9,
    inner: { x: 603, y: 500 },
    outer: { x: 795, y: 438 },
  },
  hour: {
    angle: 90,
    inner: { x: 500, y: 612 },
    outer: { x: 500, y: 850 },
  },
};

function q(value: number) {
  return Math.round(value * 10) / 10;
}

function polar(angle: number, radius: number): TotemPoint {
  const radians = (angle * Math.PI) / 180;
  return {
    x: q(CENTER + Math.cos(radians) * radius),
    y: q(CENTER + Math.sin(radians) * radius),
  };
}

function smoothClosedPath(points: TotemPoint[], tension = 0.82) {
  if (points.length < 3) return "";
  const size = points.length;
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < size; index += 1) {
    const previous = points[(index - 1 + size) % size];
    const current = points[index];
    const next = points[(index + 1) % size];
    const after = points[(index + 2) % size];
    const controlOne = {
      x: q(current.x + ((next.x - previous.x) / 6) * tension),
      y: q(current.y + ((next.y - previous.y) / 6) * tension),
    };
    const controlTwo = {
      x: q(next.x - ((after.x - current.x) / 6) * tension),
      y: q(next.y - ((after.y - current.y) / 6) * tension),
    };
    path += ` C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${next.x} ${next.y}`;
  }

  return `${path} Z`;
}

function lobedPoints(
  lobes: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number,
) {
  return Array.from({ length: lobes * 2 }, (_, index) =>
    polar(rotation + (index * 180) / lobes, index % 2 === 0 ? outerRadius : innerRadius),
  );
}

export function getPillarCorridor(pillar: PillarKey) {
  return pillarCorridors[pillar];
}

export function buildCrestBoundaryPoints(
  pillars: Record<PillarKey, string>,
): TotemPoint[] {
  const branchIndex = (pillar: PillarKey) =>
    Math.max(0, "子丑寅卯辰巳午未申酉戌亥".indexOf(pillars[pillar][1]));
  const crown = 108 + (branchIndex("year") % 3) * 5;
  const shoulder = 360 + (branchIndex("month") % 3) * 9;
  const waist = 344 + (branchIndex("day") % 3) * 8;
  const tail = 112 + (branchIndex("hour") % 3) * 7;
  const left: TotemPoint[] = [
    { x: CENTER, y: crown },
    { x: 388, y: 135 },
    { x: 258, y: 220 },
    { x: CENTER - shoulder, y: 385 },
    { x: CENTER - waist, y: 622 },
    { x: CENTER - 202, y: 798 },
    { x: CENTER, y: 888 - (tail - 112) },
  ];
  const mirrored = left.slice(1, -1).reverse().map((point) => ({
    x: CENTER + (CENTER - point.x),
    y: point.y,
  }));
  return [...left, ...mirrored];
}

export function buildCrestBoundaryPath(pillars: Record<PillarKey, string>) {
  return smoothClosedPath(buildCrestBoundaryPoints(pillars), 0.68);
}

type RailRelation = "support" | "control" | "echo" | "drain";

const railControls: Partial<Record<
  `${PillarKey}:${PillarKey}`,
  [TotemPoint, TotemPoint]
>> = {
  "year:month": [{ x: 402, y: 160 }, { x: 258, y: 280 }],
  "month:day": [{ x: 318, y: 346 }, { x: 682, y: 346 }],
  "day:hour": [{ x: 762, y: 610 }, { x: 620, y: 790 }],
  "hour:year": [{ x: 874, y: 726 }, { x: 874, y: 258 }],
  "year:day": [{ x: 604, y: 164 }, { x: 748, y: 286 }],
  "month:hour": [{ x: 238, y: 610 }, { x: 380, y: 790 }],
};

function offsetPoint(point: TotemPoint, amount: number) {
  const dx = CENTER - point.x;
  const dy = CENTER - point.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  return {
    x: q(point.x + (dx / length) * amount),
    y: q(point.y + (dy / length) * amount),
  };
}

function cubicPath(
  from: TotemPoint,
  controlOne: TotemPoint,
  controlTwo: TotemPoint,
  to: TotemPoint,
) {
  return `M ${from.x} ${from.y} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${to.x} ${to.y}`;
}

export function buildRelationRailPath(
  fromKey: PillarKey,
  toKey: PillarKey,
  from: TotemPoint,
  to: TotemPoint,
  relation: RailRelation,
) {
  const controls = railControls[`${fromKey}:${toKey}`] ?? [
    { x: q(from.x * 0.6 + CENTER * 0.4), y: q(from.y * 0.6 + CENTER * 0.4) },
    { x: q(to.x * 0.6 + CENTER * 0.4), y: q(to.y * 0.6 + CENTER * 0.4) },
  ];
  const primary = cubicPath(from, controls[0], controls[1], to);
  if (relation !== "support" && relation !== "echo") return primary;

  const offset = relation === "echo" ? 13 : 8;
  return `${primary} ${cubicPath(
    offsetPoint(from, offset),
    offsetPoint(controls[0], offset),
    offsetPoint(controls[1], offset),
    offsetPoint(to, offset),
  )}`;
}

export function buildPillarFlourishPath(
  from: TotemPoint,
  to: TotemPoint,
  inward: boolean,
  variant: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normal = { x: -dy / length, y: dx / length };
  const bend = (inward ? -1 : 1) * (16 + variant * 5);
  const middle = {
    x: q((from.x + to.x) / 2 + normal.x * bend),
    y: q((from.y + to.y) / 2 + normal.y * bend),
  };
  const main = `M ${from.x} ${from.y} Q ${middle.x} ${middle.y} ${to.x} ${to.y}`;
  const root = {
    x: q(from.x + dx * 0.58),
    y: q(from.y + dy * 0.58),
  };
  const forward = { x: dx / length, y: dy / length };
  const spread = 19 + variant * 4;
  const reach = 30 + variant * 4;
  const leftTip = {
    x: q(root.x + forward.x * reach + normal.x * spread),
    y: q(root.y + forward.y * reach + normal.y * spread),
  };
  const rightTip = {
    x: q(root.x + forward.x * reach - normal.x * spread),
    y: q(root.y + forward.y * reach - normal.y * spread),
  };
  const leftControl = {
    x: q(root.x + forward.x * 10 + normal.x * spread * 0.9),
    y: q(root.y + forward.y * 10 + normal.y * spread * 0.9),
  };
  const rightControl = {
    x: q(root.x + forward.x * 10 - normal.x * spread * 0.9),
    y: q(root.y + forward.y * 10 - normal.y * spread * 0.9),
  };

  return `${main} M ${root.x} ${root.y} Q ${leftControl.x} ${leftControl.y} ${leftTip.x} ${leftTip.y} M ${root.x} ${root.y} Q ${rightControl.x} ${rightControl.y} ${rightTip.x} ${rightTip.y}`;
}

export function buildPracticeRailPath(
  from: TotemPoint,
  to: TotemPoint,
  index: number,
) {
  const fromDx = from.x - CENTER;
  const fromDy = from.y - CENTER;
  const toDx = to.x - CENTER;
  const toDy = to.y - CENTER;
  const fromLength = Math.max(1, Math.hypot(fromDx, fromDy));
  const toLength = Math.max(1, Math.hypot(toDx, toDy));
  const direction = index % 2 === 0 ? 1 : -1;
  const controlOne = {
    x: q(CENTER + (fromDx / fromLength) * 306 - (fromDy / fromLength) * 32 * direction),
    y: q(CENTER + (fromDy / fromLength) * 306 + (fromDx / fromLength) * 32 * direction),
  };
  const controlTwo = {
    x: q(CENTER + (toDx / toLength) * 354 + (toDy / toLength) * 42 * direction),
    y: q(CENTER + (toDy / toLength) * 354 - (toDx / toLength) * 42 * direction),
  };
  return cubicPath(from, controlOne, controlTwo, to);
}

export function buildGuardianMotifPath(branch: string) {
  const motifs: Record<string, string> = {
    子: "M -22 13 C -25 -8 -13 -24 0 -24 C 13 -24 25 -8 22 13 C 19 29 9 35 0 35 C -9 35 -19 29 -22 13 Z M -18 -18 A 10 10 0 1 1 -4 -26 M 18 -18 A 10 10 0 1 0 4 -26 M -5 15 L 0 19 L 5 15 M -10 20 L -31 14 M -9 25 L -31 27 M 10 20 L 31 14 M 9 25 L 31 27",
    丑: "M -20 -8 C -17 -25 17 -25 20 -8 L 17 24 L 0 35 L -17 24 Z M -17 -14 C -35 -22 -39 -9 -31 2 C -27 -12 -20 -7 -15 -4 M 17 -14 C 35 -22 39 -9 31 2 C 27 -12 20 -7 15 -4 M -8 18 Q 0 24 8 18",
    寅: "M -23 -12 L -17 -31 L -5 -20 Q 0 -24 5 -20 L 17 -31 L 23 -12 L 19 23 L 0 35 L -19 23 Z M -13 -10 L -3 -5 M 13 -10 L 3 -5 M 0 -15 L 0 4 M -8 -18 L 0 -12 L 8 -18 M -8 15 L 0 21 L 8 15 M -11 25 L -25 20 M 11 25 L 25 20",
    卯: "M -19 5 C -18 -13 -10 -21 0 -21 C 10 -21 18 -13 19 5 L 15 27 L 0 36 L -15 27 Z M -13 -17 C -24 -39 -16 -49 -6 -25 M 13 -17 C 24 -39 16 -49 6 -25 M -5 17 L 0 21 L 5 17",
    辰: "M -22 19 C -31 1 -19 -24 0 -24 C 19 -24 31 1 22 19 C 15 33 6 36 0 36 C -6 36 -15 33 -22 19 Z M -13 -20 C -30 -37 -25 -45 -15 -32 L -8 -24 M 13 -20 C 30 -37 25 -45 15 -32 L 8 -24 M -18 4 C -35 -2 -39 11 -27 18 M 18 4 C 35 -2 39 11 27 18 M -7 15 Q 0 8 7 15 M -5 24 Q 0 29 5 24",
    巳: "M -22 24 C -5 40 22 28 14 10 C 7 -5 -12 5 -9 17 C -5 29 13 23 18 4 C 24 -18 6 -31 -10 -22 C -18 -18 -18 -5 -9 -2 M -10 -22 L 0 -33 L 12 -22 L 0 -13 Z M -4 -25 L 4 -25 M 0 -25 L 0 -17",
    午: "M -16 -25 L -5 -34 L 0 -20 L 11 -32 L 15 -15 C 24 -1 18 24 0 36 C -18 24 -24 -1 -16 -25 Z M 15 -15 L 27 -4 L 17 2 M -8 7 L 3 3 M -7 19 Q 0 24 7 19 M -18 -10 L -28 -17 M -15 -2 L -29 0",
    未: "M -18 -11 C -13 -25 13 -25 18 -11 L 16 24 L 0 36 L -16 24 Z M -13 -13 C -36 -27 -39 7 -20 8 C -8 8 -7 -6 -16 -8 C -23 -10 -25 -1 -20 2 M 13 -13 C 36 -27 39 7 20 8 C 8 8 7 -6 16 -8 C 23 -10 25 -1 20 2 M -6 18 Q 0 24 6 18",
    申: "M -22 5 C -22 -17 -10 -28 0 -28 C 10 -28 22 -17 22 5 C 22 25 10 35 0 35 C -10 35 -22 25 -22 5 Z M -23 0 A 11 11 0 1 0 -23 20 M 23 0 A 11 11 0 1 1 23 20 M -13 -8 Q 0 2 13 -8 M -10 18 Q 0 27 10 18 M 19 27 C 35 34 38 17 28 13",
    酉: "M -17 -16 C -5 -29 17 -22 21 -5 C 25 12 13 31 -5 34 C -19 26 -24 6 -17 -16 Z M -12 -19 C -18 -37 -6 -38 -3 -24 C -3 -42 9 -39 7 -22 C 14 -38 24 -29 14 -15 M 20 -4 L 34 3 L 20 9 M -6 12 L 4 17 L -4 23 M -15 30 L -25 37 M 1 33 L 4 42",
    戌: "M -22 -6 L -18 -31 L -4 -19 Q 0 -22 4 -19 L 18 -31 L 22 -6 L 18 24 L 0 36 L -18 24 Z M -10 5 L -2 9 M 10 5 L 2 9 M -8 18 Q 0 10 8 18 L 0 25 Z M -17 -7 L -30 -15 M 17 -7 L 30 -15",
    亥: "M -25 3 C -25 -18 -13 -29 0 -29 C 13 -29 25 -18 25 3 C 25 24 13 35 0 35 C -13 35 -25 24 -25 3 Z M -17 -20 L -27 -31 L -28 -12 M 17 -20 L 27 -31 L 28 -12 M -13 11 C -11 1 11 1 13 11 C 12 24 -12 24 -13 11 Z M -5 9 L -5 17 M 5 9 L 5 17 M -18 17 Q -26 25 -30 14 M 18 17 Q 26 25 30 14",
  };

  return motifs[branch] ?? motifs.辰;
}

export function buildFunctionPortPath(
  module: FunctionModuleKey,
  cx: number,
  cy: number,
  radius: number,
) {
  const r = radius;
  const paths: Record<FunctionModuleKey, string> = {
    agency: `M ${q(cx)} ${q(cy - r * 1.25)} L ${q(cx + r)} ${q(cy - r * 0.35)} L ${q(cx + r * 0.72)} ${q(cy + r * 0.92)} L ${q(cx)} ${q(cy + r * 1.28)} L ${q(cx - r * 0.72)} ${q(cy + r * 0.92)} L ${q(cx - r)} ${q(cy - r * 0.35)} Z`,
    expression: `M ${q(cx)} ${q(cy)} C ${q(cx - r * 1.5)} ${q(cy - r * 1.15)}, ${q(cx - r * 1.35)} ${q(cy + r * 0.65)}, ${q(cx)} ${q(cy + r * 1.15)} C ${q(cx + r * 1.35)} ${q(cy + r * 0.65)}, ${q(cx + r * 1.5)} ${q(cy - r * 1.15)}, ${q(cx)} ${q(cy)} Z`,
    exchange: `M ${q(cx - r * 0.48)} ${q(cy - r * 0.06)} A ${q(r * 0.72)} ${q(r * 0.72)} 0 1 0 ${q(cx - r * 0.48)} ${q(cy + r * 0.06)} M ${q(cx + r * 0.48)} ${q(cy + r * 0.06)} A ${q(r * 0.72)} ${q(r * 0.72)} 0 1 1 ${q(cx + r * 0.48)} ${q(cy - r * 0.06)}`,
    structure: `M ${q(cx - r)} ${q(cy + r * 1.12)} L ${q(cx - r * 0.82)} ${q(cy - r * 0.18)} Q ${q(cx)} ${q(cy - r * 1.52)} ${q(cx + r * 0.82)} ${q(cy - r * 0.18)} L ${q(cx + r)} ${q(cy + r * 1.12)} Z M ${q(cx - r * 0.42)} ${q(cy + r * 1.08)} L ${q(cx - r * 0.35)} ${q(cy + r * 0.05)} Q ${q(cx)} ${q(cy - r * 0.58)} ${q(cx + r * 0.35)} ${q(cy + r * 0.05)} L ${q(cx + r * 0.42)} ${q(cy + r * 1.08)}`,
    insight: `M ${q(cx - r * 1.3)} ${q(cy)} Q ${q(cx)} ${q(cy - r * 1.18)} ${q(cx + r * 1.3)} ${q(cy)} Q ${q(cx)} ${q(cy + r * 1.18)} ${q(cx - r * 1.3)} ${q(cy)} Z M ${q(cx)} ${q(cy - r * 0.45)} A ${q(r * 0.45)} ${q(r * 0.45)} 0 1 1 ${q(cx - 0.1)} ${q(cy - r * 0.45)}`,
  };
  return paths[module];
}

export function buildResonanceRosettePath(
  cx: number,
  cy: number,
  radius: number,
  petals = 8,
) {
  const points = Array.from({ length: petals * 2 }, (_, index) => {
    const angle = -90 + (index * 180) / petals;
    const radians = (angle * Math.PI) / 180;
    const r = index % 2 === 0 ? radius * 1.18 : radius * 0.56;
    return {
      x: q(cx + Math.cos(radians) * r),
      y: q(cy + Math.sin(radians) * r),
    };
  });
  return `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} Z`;
}

export function buildTotemVisualGrammar(model: TotemModel): TotemVisualGrammar {
  const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(model.dayMaster);
  const symmetry = 5 + (stemIndex % 4);
  const rotation = -90 + ((model.seed >>> 4) % 3 - 1) * 7.5;
  const framePath = buildCrestBoundaryPath(
    Object.fromEntries(
      model.birthSignature.split("·").map((pillar, index) => [
        (["year", "month", "day", "hour"] as PillarKey[])[index],
        pillar,
      ]),
    ) as Record<PillarKey, string>,
  );
  const haloPath = smoothClosedPath(
    lobedPoints(symmetry, 338, 286, rotation),
    model.yinRatio >= 55 ? 0.95 : 0.55,
  );
  const knotPaths = [
    smoothClosedPath(lobedPoints(symmetry, 286, 218, rotation + 90 / symmetry), 0.92),
    smoothClosedPath(lobedPoints(symmetry, 266, 230, rotation - 90 / symmetry), 0.92),
  ];
  const guardians = (["year", "month", "day", "hour"] as PillarKey[])
    .map((pillar) => {
      const part = model.parts.find((candidate) => candidate.id === `pillar:${pillar}:branch`);
      if (!part || part.geometry.kind !== "circle" || !part.branch || !part.element) return null;
      return {
        pillar,
        partId: part.id,
        branch: part.branch,
        element: part.element,
        point: { x: part.geometry.cx, y: part.geometry.cy },
        scale: pillar === "year" ? 1.14 : pillar === "day" ? 1.05 : 0.96,
        motifPath: buildGuardianMotifPath(part.branch),
      } satisfies GuardianPlacement;
    })
    .filter((guardian): guardian is GuardianPlacement => Boolean(guardian));
  const dayGuardian = guardians.find((guardian) => guardian.pillar === "day");
  const rankedElements = [...elementOrder].sort(
    (a, b) => model.elementWeights[b] - model.elementWeights[a],
  );
  const auras = rankedElements.slice(0, 3).map((element, index) => {
    const weight = model.elementWeights[element];
    const angle = rotation + 30 + index * 120;
    const point = polar(angle, 54 + index * 12);
    return {
      element,
      cx: point.x,
      cy: point.y,
      rx: q(188 + weight * 1.35 - index * 20),
      ry: q(92 + weight * 0.72 - index * 8),
      rotation: angle + 90,
      opacity: q(0.08 + weight / 650),
    };
  });

  return {
    symmetry,
    rotation,
    framePath,
    haloPath,
    knotPaths,
    guardians,
    dayGuardian,
    auras,
    rosetteCount: symmetry * 2,
  };
}
