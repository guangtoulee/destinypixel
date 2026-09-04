import {
  branchElements,
  branchHiddenStems,
  stemElements,
  stemPolarity,
  type EarthlyBranch,
  type ElementName,
  type HeavenlyStem,
} from "@/lib/core/mappings";
import {
  functionModuleKeys,
  resonanceKeys,
  type FunctionModule,
  type FunctionModuleKey,
  type PillarKey,
  type RelationDetail,
  type ResonanceDomain,
  type ResonanceKey,
  type StructureState,
  type TenGodName,
  type TotemCalibration,
  type TotemModel,
  type TotemPart,
  type TotemPoint,
  type TotemSource,
} from "@/lib/totem/types";

const CENTER = 500;
const elements: ElementName[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
const pillarKeys: PillarKey[] = ["year", "month", "day", "hour"];
const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export const elementColors: Record<ElementName, string> = {
  Wood: "#61d7a0",
  Fire: "#ff7657",
  Earth: "#d4a15d",
  Metal: "#dce5ef",
  Water: "#55bfe5",
};

const branchPolarity: Record<EarthlyBranch, "Yin" | "Yang"> = {
  子: "Yang",
  丑: "Yin",
  寅: "Yang",
  卯: "Yin",
  辰: "Yang",
  巳: "Yin",
  午: "Yang",
  未: "Yin",
  申: "Yang",
  酉: "Yin",
  戌: "Yang",
  亥: "Yin",
};

const producingCycle: Record<ElementName, ElementName> = {
  Wood: "Fire",
  Fire: "Earth",
  Earth: "Metal",
  Metal: "Water",
  Water: "Wood",
};

const controllingCycle: Record<ElementName, ElementName> = {
  Wood: "Earth",
  Earth: "Water",
  Water: "Fire",
  Fire: "Metal",
  Metal: "Wood",
};

const canonicalPairs = (pairs: string[]) =>
  new Set(pairs.map((pair) => pairKey(pair[0], pair[1])));

const stemCombinations = canonicalPairs(["甲己", "乙庚", "丙辛", "丁壬", "戊癸"]);
const branchHarmonies = canonicalPairs(["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"]);
const branchClashes = canonicalPairs(["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"]);

const pillarBaseAngles: Record<PillarKey, number> = {
  year: 210,
  month: 300,
  day: 30,
  hour: 120,
};

const pillarReach: Record<PillarKey, number> = {
  year: 350,
  month: 255,
  day: 205,
  hour: 390,
};

const pillarWeight: Record<PillarKey, number> = {
  year: 0.95,
  month: 1.35,
  day: 1.15,
  hour: 1,
};

const functionTenGods: Record<FunctionModuleKey, TenGodName[]> = {
  agency: ["比肩", "劫财", "日主"],
  expression: ["食神", "伤官"],
  exchange: ["正财", "偏财"],
  structure: ["正官", "七杀"],
  insight: ["正印", "偏印"],
};

const resonanceMatrix: Record<
  ResonanceKey,
  {
    functions: Partial<Record<FunctionModuleKey, number>>;
    elements: Partial<Record<ElementName, number>>;
    yin?: number;
    yang?: number;
    balance?: number;
  }
> = {
  language: {
    functions: { expression: 0.58, insight: 0.12 },
    elements: { Water: 0.13, Fire: 0.1, Wood: 0.07 },
  },
  logic: {
    functions: { structure: 0.34, insight: 0.26 },
    elements: { Metal: 0.19, Earth: 0.11 },
    yin: 0.1,
  },
  visual: {
    functions: { expression: 0.36, insight: 0.22 },
    elements: { Metal: 0.14, Wood: 0.12, Water: 0.08 },
    yin: 0.08,
  },
  kinesthetic: {
    functions: { agency: 0.49, structure: 0.13 },
    elements: { Wood: 0.14, Fire: 0.14 },
    yang: 0.1,
  },
  musical: {
    functions: { expression: 0.46, insight: 0.14 },
    elements: { Water: 0.17, Fire: 0.12 },
    yin: 0.11,
  },
  interpersonal: {
    functions: { exchange: 0.4, expression: 0.18, agency: 0.08 },
    elements: { Earth: 0.12, Water: 0.1 },
    balance: 0.12,
  },
  intrapersonal: {
    functions: { insight: 0.48, agency: 0.1 },
    elements: { Water: 0.2, Earth: 0.08 },
    yin: 0.14,
  },
  naturalistic: {
    functions: { insight: 0.31, exchange: 0.08 },
    elements: { Wood: 0.25, Earth: 0.2, Water: 0.09 },
    balance: 0.07,
  },
};

type PillarRecord = {
  key: PillarKey;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: ElementName;
  branchElement: ElementName;
  tenGod: TenGodName;
  hidden: Array<{
    stem: HeavenlyStem;
    element: ElementName;
    tenGod: TenGodName;
    transparent: boolean;
  }>;
};

const seasonalElement: Record<EarthlyBranch, ElementName> = {
  子: "Water", 丑: "Water", 寅: "Wood", 卯: "Wood", 辰: "Wood", 巳: "Fire",
  午: "Fire", 未: "Fire", 申: "Metal", 酉: "Metal", 戌: "Metal", 亥: "Water",
};

function hiddenShares(count: number) {
  if (count <= 1) return [1];
  if (count === 2) return [0.7, 0.3];
  return [0.6, 0.25, 0.15];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function q(value: number) {
  return Math.round(value * 10) / 10;
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("");
}

export function stableHash(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function stableUnit(seedKey: string, namespace: string) {
  return stableHash(`${seedKey}|${namespace}`) / 0xffffffff;
}

function polar(angle: number, radius: number): TotemPoint {
  const radians = (angle * Math.PI) / 180;

  return {
    x: q(CENTER + Math.cos(radians) * radius),
    y: q(CENTER + Math.sin(radians) * radius),
  };
}

function linePath(from: TotemPoint, to: TotemPoint) {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

function curvedPath(from: TotemPoint, to: TotemPoint, bend: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const midpoint = {
    x: q((from.x + to.x) / 2 - (dy / length) * bend),
    y: q((from.y + to.y) / 2 + (dx / length) * bend),
  };

  return `M ${from.x} ${from.y} Q ${midpoint.x} ${midpoint.y} ${to.x} ${to.y}`;
}

function getTenGod(dayMaster: HeavenlyStem, targetStem: HeavenlyStem): TenGodName {
  if (dayMaster === targetStem) return "比肩";

  const dayElement = stemElements[dayMaster];
  const targetElement = stemElements[targetStem];
  const samePolarity = stemPolarity[dayMaster] === stemPolarity[targetStem];

  if (targetElement === dayElement) return samePolarity ? "比肩" : "劫财";
  if (producingCycle[dayElement] === targetElement) return samePolarity ? "食神" : "伤官";
  if (controllingCycle[dayElement] === targetElement) return samePolarity ? "偏财" : "正财";
  if (controllingCycle[targetElement] === dayElement) return samePolarity ? "七杀" : "正官";

  return samePolarity ? "偏印" : "正印";
}

export function mapTenGodToFunction(tenGod: TenGodName): FunctionModuleKey {
  return (
    functionModuleKeys.find((key) => functionTenGods[key].includes(tenGod)) ??
    "agency"
  );
}

function parseSource(source: TotemSource): PillarRecord[] {
  const visibleStems = pillarKeys.map((key) => source.pillars[key][0]);
  const dayMaster = source.pillars.day[0] as HeavenlyStem;

  return pillarKeys.map((key) => {
    const pillar = source.pillars[key];
    const stem = pillar[0] as HeavenlyStem;
    const branch = pillar[1] as EarthlyBranch;

    if (!stems.includes(stem) || !branches.includes(branch)) {
      throw new Error(`Invalid ${key} pillar: ${pillar}`);
    }

    const suppliedTenGod = source.tenGods?.stems[key]?.tenGod as TenGodName | undefined;
    const suppliedHidden = source.tenGods?.hiddenStems[key] ?? [];

    return {
      key,
      stem,
      branch,
      stemElement: stemElements[stem],
      branchElement: branchElements[branch],
      tenGod: key === "day" ? "日主" : suppliedTenGod ?? getTenGod(dayMaster, stem),
      hidden: branchHiddenStems[branch].map((hiddenStem, hiddenIndex) => ({
        stem: hiddenStem,
        element: stemElements[hiddenStem],
        tenGod:
          (suppliedHidden[hiddenIndex]?.tenGod as TenGodName | undefined) ??
          getTenGod(dayMaster, hiddenStem),
        transparent: visibleStems.includes(hiddenStem),
      })),
    };
  });
}

function calculateElementWeights(records: PillarRecord[]) {
  const raw = Object.fromEntries(elements.map((element) => [element, 0])) as Record<
    ElementName,
    number
  >;

  records.forEach((record) => {
    const weight = pillarWeight[record.key];
    raw[record.stemElement] += 1 * weight;
    raw[record.branchElement] += 1.15 * weight;
    const shares = hiddenShares(record.hidden.length);
    record.hidden.forEach((hidden, index) => {
      raw[hidden.element] += shares[index] * weight;
    });
  });

  const month = records.find((record) => record.key === "month")!;
  raw[seasonalElement[month.branch]] += 1.1;
  if (["辰", "戌", "丑", "未"].includes(month.branch)) raw.Earth += 0.45;

  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);

  return Object.fromEntries(
    elements.map((element) => [element, q((raw[element] / total) * 100)]),
  ) as Record<ElementName, number>;
}

function calculateYinRatio(records: PillarRecord[]) {
  const signals = records.flatMap((record) => [
    stemPolarity[record.stem],
    branchPolarity[record.branch],
    ...record.hidden.map((hidden) => stemPolarity[hidden.stem]),
  ]);

  return q((signals.filter((signal) => signal === "Yin").length / signals.length) * 100);
}

function calculateFunctions(records: PillarRecord[]): FunctionModule[] {
  const raw = Object.fromEntries(functionModuleKeys.map((key) => [key, 0])) as Record<
    FunctionModuleKey,
    number
  >;
  const tenGodSets = Object.fromEntries(
    functionModuleKeys.map((key) => [key, new Set<TenGodName>()]),
  ) as Record<FunctionModuleKey, Set<TenGodName>>;
  const partIds = Object.fromEntries(
    functionModuleKeys.map((key) => [key, [] as string[]]),
  ) as Record<FunctionModuleKey, string[]>;

  records.forEach((record) => {
    const visibleModule = mapTenGodToFunction(record.tenGod);
    raw[visibleModule] += 1.15 * pillarWeight[record.key];
    tenGodSets[visibleModule].add(record.tenGod);
    partIds[visibleModule].push(`pillar:${record.key}:stem`);

    const shares = hiddenShares(record.hidden.length);
    record.hidden.forEach((hidden, index) => {
      const hiddenModule = mapTenGodToFunction(hidden.tenGod);
      raw[hiddenModule] += shares[index] * 0.8 * pillarWeight[record.key];
      tenGodSets[hiddenModule].add(hidden.tenGod);
      partIds[hiddenModule].push(`pillar:${record.key}:hidden:${index}`);
    });
  });

  const total = Object.values(raw).reduce((sum, value) => sum + value, 0) || 1;

  return functionModuleKeys.map((key) => ({
    key,
    score: Math.round(clamp(18 + (raw[key] / total) * 285, 18, 94)),
    tenGods: [...tenGodSets[key]],
    partIds: partIds[key],
  }));
}

function relationBetween(
  a: PillarRecord,
  b: PillarRecord,
): { relation: NonNullable<TotemPart["relation"]>; detail: RelationDetail } {
  if (a.stem === b.stem || a.branch === b.branch) {
    return { relation: "echo", detail: "same-symbol" };
  }
  if (stemCombinations.has(pairKey(a.stem, b.stem))) {
    return { relation: "support", detail: "stem-combination" };
  }
  if (branchHarmonies.has(pairKey(a.branch, b.branch))) {
    return { relation: "support", detail: "branch-harmony" };
  }
  if (branchClashes.has(pairKey(a.branch, b.branch))) {
    return { relation: "control", detail: "branch-clash" };
  }
  if (a.branchElement === b.branchElement) {
    return { relation: "support", detail: "same-element" };
  }
  if (
    producingCycle[a.branchElement] === b.branchElement ||
    producingCycle[b.branchElement] === a.branchElement
  ) {
    return { relation: "support", detail: "producing-cycle" };
  }
  if (
    controllingCycle[a.branchElement] === b.branchElement ||
    controllingCycle[b.branchElement] === a.branchElement
  ) {
    return { relation: "control", detail: "controlling-cycle" };
  }

  return { relation: "drain", detail: "diffusion" };
}

function normalizeCalibration(calibration?: TotemCalibration) {
  if (!calibration) return undefined;
  const keys = Object.keys(calibration);
  if (
    keys.length !== resonanceKeys.length ||
    !keys.every((key) => resonanceKeys.includes(key as ResonanceKey))
  ) {
    throw new Error("Calibration must contain exactly the eight resonance fields.");
  }

  return Object.fromEntries(
    resonanceKeys.map((key) => {
      const value = calibration[key];
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new Error(`Invalid calibration value for ${key}.`);
      }
      return [key, value];
    }),
  ) as TotemCalibration;
}

function relationState(relation: TotemPart["relation"]): StructureState {
  if (relation === "support") return "connected";
  if (relation === "echo") return "overload";
  if (relation === "control") return "tension";
  return "latent";
}

function calculateResonances(
  functions: FunctionModule[],
  elementWeights: Record<ElementName, number>,
  yinRatio: number,
  calibration?: TotemCalibration,
): ResonanceDomain[] {
  const functionScores = Object.fromEntries(
    functions.map((module) => [module.key, module.score]),
  ) as Record<FunctionModuleKey, number>;
  const yangRatio = 100 - yinRatio;
  const polarityBalance = 100 - Math.abs(50 - yinRatio) * 2;

  return resonanceKeys.map((key) => {
    const matrix = resonanceMatrix[key];
    let weightedScore = 0;
    let totalWeight = 0;

    Object.entries(matrix.functions).forEach(([module, weight]) => {
      weightedScore += functionScores[module as FunctionModuleKey] * weight;
      totalWeight += weight;
    });
    Object.entries(matrix.elements).forEach(([element, weight]) => {
      weightedScore += elementWeights[element as ElementName] * 2.25 * weight;
      totalWeight += weight;
    });
    if (matrix.yin) {
      weightedScore += yinRatio * matrix.yin;
      totalWeight += matrix.yin;
    }
    if (matrix.yang) {
      weightedScore += yangRatio * matrix.yang;
      totalWeight += matrix.yang;
    }
    if (matrix.balance) {
      weightedScore += polarityBalance * matrix.balance;
      totalWeight += matrix.balance;
    }

    const natalScore = Math.round(clamp(22 + (weightedScore / Math.max(totalWeight, 0.01)) * 0.72, 24, 92));
    const calibrationValue = calibration?.[key];
    const currentScore =
      calibrationValue === undefined
        ? natalScore
        : Math.round(clamp(natalScore + (calibrationValue - 50) * 0.3, 18, 96));
    const state: StructureState =
      calibrationValue !== undefined && calibrationValue < 28
        ? "tension"
        : currentScore > 84
          ? "overload"
          : currentScore < 40
            ? "latent"
            : "connected";
    const functionModules = Object.entries(matrix.functions)
      .sort((a, b) => b[1] - a[1])
      .map(([module]) => module as FunctionModuleKey);
    const resonanceElements = Object.entries(matrix.elements)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element as ElementName);

    return {
      key,
      natalScore,
      currentScore,
      state,
      contributorPartIds: [],
      functionModules,
      elements: resonanceElements,
    };
  });
}

function corePath(stem: HeavenlyStem, scale: number) {
  const s = scale;
  const x = CENTER;
  const y = CENTER;

  switch (stem) {
    case "甲":
      return `M ${x} ${q(y + s)} L ${x} ${q(y - s)} M ${x} ${q(y - s * 0.35)} L ${q(x - s * 0.72)} ${q(y - s * 0.9)} M ${x} ${q(y - s * 0.35)} L ${q(x + s * 0.72)} ${q(y - s * 0.9)}`;
    case "乙":
      return `M ${q(x - s * 0.72)} ${q(y - s * 0.8)} C ${q(x + s)} ${q(y - s * 0.7)}, ${q(x - s)} ${q(y + s * 0.15)}, ${q(x + s * 0.72)} ${q(y + s * 0.85)}`;
    case "丙":
      return `M ${x} ${q(y - s)} L ${q(x + s * 0.9)} ${q(y + s * 0.72)} L ${q(x - s * 0.9)} ${q(y + s * 0.72)} Z M ${x} ${q(y - s * 1.25)} L ${x} ${q(y - s * 0.72)} M ${q(x - s * 1.08)} ${y} L ${q(x - s * 0.55)} ${y} M ${q(x + s * 0.55)} ${y} L ${q(x + s * 1.08)} ${y}`;
    case "丁":
      return `M ${x} ${q(y + s)} L ${x} ${q(y - s * 0.55)} M ${x} ${q(y - s * 0.55)} L ${q(x - s * 0.55)} ${q(y - s)} M ${x} ${q(y - s * 0.55)} L ${q(x + s * 0.55)} ${q(y - s)}`;
    case "戊":
      return `M ${x} ${q(y - s)} L ${q(x + s)} ${y} L ${x} ${q(y + s)} L ${q(x - s)} ${y} Z M ${q(x - s * 0.7)} ${y} L ${q(x + s * 0.7)} ${y}`;
    case "己":
      return `M ${q(x - s)} ${q(y - s * 0.72)} L ${q(x + s * 0.55)} ${q(y - s * 0.72)} L ${q(x + s * 0.55)} ${q(y + s * 0.7)} L ${q(x - s * 0.45)} ${q(y + s * 0.7)} L ${q(x - s * 0.45)} ${q(y - s * 0.2)} L ${q(x + s * 0.12)} ${q(y - s * 0.2)}`;
    case "庚":
      return `M ${q(x - s)} ${q(y + s * 0.75)} L ${q(x + s)} ${q(y - s * 0.75)} M ${q(x - s * 0.65)} ${q(y - s)} L ${q(x + s * 0.65)} ${q(y - s * 0.15)} M ${q(x - s * 0.35)} ${q(y + s)} L ${q(x + s * 0.8)} ${q(y + s * 0.2)}`;
    case "辛":
      return `M ${x} ${q(y - s)} L ${q(x + s * 0.86)} ${q(y - s * 0.5)} L ${q(x + s * 0.86)} ${q(y + s * 0.5)} L ${x} ${q(y + s)} L ${q(x - s * 0.86)} ${q(y + s * 0.5)} L ${q(x - s * 0.86)} ${q(y - s * 0.5)} Z M ${q(x - s * 0.45)} ${y} L ${q(x + s * 0.45)} ${y}`;
    case "壬":
      return `M ${q(x - s)} ${q(y - s * 0.55)} C ${q(x - s * 0.35)} ${q(y - s * 1.1)}, ${q(x + s * 0.25)} ${q(y + s * 0.15)}, ${q(x + s)} ${q(y - s * 0.55)} M ${q(x - s)} ${q(y + s * 0.55)} C ${q(x - s * 0.25)} ${q(y - s * 0.15)}, ${q(x + s * 0.35)} ${q(y + s * 1.1)}, ${q(x + s)} ${q(y + s * 0.55)}`;
    case "癸":
      return `M ${x} ${q(y - s * 1.15)} C ${q(x + s * 1.15)} ${q(y - s * 0.15)}, ${q(x + s * 0.65)} ${q(y + s)}, ${x} ${q(y + s)} C ${q(x - s * 0.65)} ${q(y + s)}, ${q(x - s * 1.15)} ${q(y - s * 0.15)}, ${x} ${q(y - s * 1.15)} Z M ${x} ${q(y - s * 0.45)} L ${x} ${q(y + s * 0.42)}`;
  }
}

function stateForScore(score: number): StructureState {
  if (score > 84) return "overload";
  if (score < 36) return "latent";
  return "connected";
}

export function buildTotemModel(
  source: TotemSource,
  calibration?: TotemCalibration,
): TotemModel {
  const safeCalibration = normalizeCalibration(calibration);
  const records = parseSource(source);
  const birthSignature = pillarKeys.map((key) => source.pillars[key]).join("·");
  // The standardized Four Pillars are the complete geometry seed. Birth date,
  // clock time, place, name, and hashes of those values never enter the model,
  // so a result can be reproduced without leaking a brute-forceable timestamp.
  const seedKey = `totem-v1|${birthSignature}`;
  const seed = stableHash(seedKey);
  const fingerprint = `BT1-${seed.toString(36).toUpperCase().padStart(7, "0")}`;
  const dayMaster = records.find((record) => record.key === "day")!.stem;
  const dayElement = stemElements[dayMaster];
  const elementWeights = calculateElementWeights(records);
  const dominantElement = [...elements].sort(
    (a, b) => elementWeights[b] - elementWeights[a],
  )[0];
  const yinRatio = calculateYinRatio(records);
  const functions = calculateFunctions(records);
  const resonances = calculateResonances(functions, elementWeights, yinRatio, safeCalibration);
  const parts: TotemPart[] = [];
  const anchors = {} as Record<PillarKey, TotemPoint>;
  let order = 0;

  const boundaryPoints = Array.from({ length: 12 }, (_, index) => {
    const record = records[index % records.length];
    const element = elements[index % elements.length];
    const branchIndex = branches.indexOf(record.branch);
    const angularJitter = (stableUnit(seedKey, `boundary:${index}:angle`) - 0.5) * 7;
    const radialJitter = (stableUnit(seedKey, `boundary:${index}:radius`) - 0.5) * 26;
    const radius =
      338 +
      (branchIndex - 5.5) * 2.2 +
      (elementWeights[element] - 20) * 0.45 +
      radialJitter;
    return polar(-90 + index * 30 + angularJitter, radius);
  });

  parts.push({
    id: "boundary:birth-field",
    kind: "boundary",
    layers: ["overview", "pillars", "elements"],
    geometry: {
      kind: "polygon",
      points: boundaryPoints.map((point) => `${point.x},${point.y}`).join(" "),
      strokeWidth: 1.6,
    },
    color: "#bda06b",
    opacity: 0.44,
    intensity: Math.round(elementWeights[dominantElement]),
    state: "connected",
    order: order++,
    element: dominantElement,
    pillar: "year",
    relatedIds: ["pillar:year:stem", "pillar:year:branch"],
  });

  const coreScale = 62 + (stems.indexOf(dayMaster) % 4) * 7;
  parts.push({
    id: "core:day-master",
    kind: "core",
    layers: ["overview", "pillars", "elements", "functions"],
    geometry: {
      kind: "path",
      d: corePath(dayMaster, coreScale),
      strokeWidth: stemPolarity[dayMaster] === "Yang" ? 5.8 : 4.2,
    },
    color: elementColors[dayElement],
    opacity: 1,
    intensity: Math.round(elementWeights[dayElement]),
    state: "connected",
    order: order++,
    element: dayElement,
    polarity: stemPolarity[dayMaster],
    pillar: "day",
    stem: dayMaster,
    tenGod: "日主",
    functionModule: "agency",
    relatedIds: ["pillar:day:stem", "function:agency"],
  });

  records.forEach((record, recordIndex) => {
    const branchIndex = branches.indexOf(record.branch);
    const angle =
      pillarBaseAngles[record.key] +
      (branchIndex - 5.5) * 1.1 +
      (stableUnit(seedKey, `pillar:${record.key}:angle`) - 0.5) * 8;
    const inner = polar(angle, record.key === "day" ? 86 : 108);
    const reach =
      pillarReach[record.key] +
      (branchIndex % 4) * 10 +
      (stableUnit(seedKey, `pillar:${record.key}:reach`) - 0.5) * 20;
    const outer = polar(angle, reach);
    anchors[record.key] = outer;
    const bendDirection = stemPolarity[record.stem] === "Yin" ? -1 : 1;
    const bend =
      bendDirection *
      (16 + stableUnit(seedKey, `pillar:${record.key}:bend`) * 30);
    const stemId = `pillar:${record.key}:stem`;
    const branchId = `pillar:${record.key}:branch`;

    parts.push({
      id: stemId,
      kind: "pillar-stem",
      layers: ["overview", "pillars", "elements", "functions"],
      geometry: {
        kind: "path",
        d:
          stemPolarity[record.stem] === "Yin"
            ? curvedPath(inner, outer, bend)
            : linePath(inner, outer),
        strokeWidth: stemPolarity[record.stem] === "Yang" ? 5.2 : 3.2,
        dash: record.key === "hour" ? "18 8" : undefined,
      },
      color: elementColors[record.stemElement],
      opacity: 0.82,
      intensity: Math.round(elementWeights[record.stemElement]),
      state: stateForScore(elementWeights[record.stemElement] * 2.5),
      order: order++,
      element: record.stemElement,
      polarity: stemPolarity[record.stem],
      pillar: record.key,
      stem: record.stem,
      tenGod: record.tenGod,
      functionModule: mapTenGodToFunction(record.tenGod),
      relatedIds: [branchId, `function:${mapTenGodToFunction(record.tenGod)}`],
    });

    parts.push({
      id: branchId,
      kind: "pillar-branch",
      layers: ["overview", "pillars", "elements"],
      geometry: {
        kind: "circle",
        cx: outer.x,
        cy: outer.y,
        r: 14 + record.hidden.length * 4 + (branchIndex % 3),
        strokeWidth: branchPolarity[record.branch] === "Yang" ? 4 : 2.6,
      },
      color: elementColors[record.branchElement],
      opacity: 0.9,
      intensity: Math.round(elementWeights[record.branchElement]),
      state: "connected",
      order: order++,
      element: record.branchElement,
      polarity: branchPolarity[record.branch],
      pillar: record.key,
      branch: record.branch,
      relatedIds: [stemId, ...record.hidden.map((_, index) => `pillar:${record.key}:hidden:${index}`)],
    });

    record.hidden.forEach((hidden, hiddenIndex) => {
      const spread = record.hidden.length === 1 ? 0 : (hiddenIndex - (record.hidden.length - 1) / 2) * 26;
      const hiddenAngle = angle + spread + (branchPolarity[record.branch] === "Yin" ? -8 : 8);
      const hiddenPoint = polar(
        hiddenAngle,
        reach - 42 - hiddenIndex * 21 - stableUnit(seedKey, `hidden:${record.key}:${hiddenIndex}`) * 15,
      );
      const hiddenId = `pillar:${record.key}:hidden:${hiddenIndex}`;

      parts.push({
        id: hiddenId,
        kind: "hidden-stem",
        layers: ["overview", "pillars", "functions"],
        geometry: {
          kind: "branch",
          d: curvedPath(outer, hiddenPoint, (hiddenIndex - 1) * 12),
          cx: hiddenPoint.x,
          cy: hiddenPoint.y,
          r: hidden.transparent ? 7.5 : 5.5,
          strokeWidth: hidden.transparent ? 2.7 : 1.8,
        },
        color: elementColors[hidden.element],
        opacity: hidden.transparent ? 0.78 : 0.46,
        intensity: Math.round(elementWeights[hidden.element]),
        state: hidden.transparent ? "connected" : "latent",
        order: order++,
        element: hidden.element,
        polarity: stemPolarity[hidden.stem],
        pillar: record.key,
        stem: hidden.stem,
        branch: record.branch,
        hiddenIndex,
        tenGod: hidden.tenGod,
        functionModule: mapTenGodToFunction(hidden.tenGod),
        relatedIds: [branchId, `function:${mapTenGodToFunction(hidden.tenGod)}`],
      });
    });

    if (record.key === "month") {
      parts.push({
        id: "pillar:month:drive-ring",
        kind: "pillar-branch",
        layers: ["overview", "pillars", "elements"],
        geometry: {
          kind: "circle",
          cx: CENTER,
          cy: CENTER,
          r: 225 + (branchIndex % 4) * 9,
          strokeWidth: 2.2,
        },
        color: elementColors[record.branchElement],
        opacity: 0.34,
        intensity: Math.round(elementWeights[record.branchElement]),
        state: "connected",
        order: order++,
        element: record.branchElement,
        polarity: branchPolarity[record.branch],
        pillar: "month",
        branch: record.branch,
        relatedIds: [branchId, stemId],
      });
    }

    if (record.key === "day") {
      const axisAngle = -90 + stems.indexOf(record.stem) * 18;
      const axisFrom = polar(axisAngle + 180, 118);
      const axisTo = polar(axisAngle, 155 + recordIndex * 3);
      parts.push({
        id: "pillar:day:axis",
        kind: "pillar-stem",
        layers: ["overview", "pillars", "elements"],
        geometry: {
          kind: "path",
          d: linePath(axisFrom, axisTo),
          strokeWidth: 2.4,
        },
        color: elementColors[dayElement],
        opacity: 0.5,
        intensity: Math.round(elementWeights[dayElement]),
        state: "connected",
        order: order++,
        element: dayElement,
        polarity: stemPolarity[dayMaster],
        pillar: "day",
        stem: dayMaster,
        tenGod: "日主",
        functionModule: "agency",
        relatedIds: ["core:day-master", stemId],
      });
    }
  });

  const relationPairs: Array<[PillarKey, PillarKey]> = [
    ["year", "month"],
    ["month", "day"],
    ["day", "hour"],
    ["hour", "year"],
    ["year", "day"],
    ["month", "hour"],
  ];
  const relationResults = relationPairs.map(([fromKey, toKey], relationIndex) => {
    const fromRecord = records.find((record) => record.key === fromKey)!;
    const toRecord = records.find((record) => record.key === toKey)!;
    const { relation, detail } = relationBetween(fromRecord, toRecord);
    const state = relationState(relation);
    const from = anchors[fromKey];
    const to = anchors[toKey];
    const bend = (stableUnit(seedKey, `relation:${fromKey}:${toKey}`) - 0.5) * 95;
    const id = `flow:${fromKey}:${toKey}`;

    parts.push({
      id,
      kind: "element-flow",
      layers: ["overview", "elements"],
      geometry: {
        kind: "path",
        d: curvedPath(from, to, bend),
        strokeWidth: relation === "echo" ? 3.5 : relation === "support" ? 2.8 : 1.9,
        dash:
          relation === "control"
            ? "5 12"
            : relation === "drain"
              ? "2 14"
              : relation === "echo"
                ? "14 5"
                : undefined,
      },
      color: elementColors[fromRecord.branchElement],
      opacity: relation === "drain" ? 0.26 : relation === "control" ? 0.48 : 0.66,
      intensity: Math.round(
        (elementWeights[fromRecord.branchElement] + elementWeights[toRecord.branchElement]) / 2,
      ),
      state,
      order: order++,
      element: fromRecord.branchElement,
      relation,
      relationDetail: detail,
      relationPillars: [fromKey, toKey],
      relatedIds: [`pillar:${fromKey}:branch`, `pillar:${toKey}:branch`],
    });

    return { relation, state, id, relationIndex };
  });

  const functionPositions = {} as Record<FunctionModuleKey, TotemPoint>;
  functions.forEach((module, index) => {
    const angle = -90 + index * 72 + (stableUnit(seedKey, `function:${module.key}:angle`) - 0.5) * 9;
    const point = polar(angle, 184 + module.score * 0.48);
    functionPositions[module.key] = point;
    parts.push({
      id: `function:${module.key}`,
      kind: "function-port",
      layers: ["overview", "functions", "resonance"],
      geometry: {
        kind: "circle",
        cx: point.x,
        cy: point.y,
        r: 8 + module.score * 0.08,
        strokeWidth: 2.4,
      },
      color: elementColors[elements[index]],
      opacity: 0.8,
      intensity: module.score,
      state: stateForScore(module.score),
      order: order++,
      functionModule: module.key,
      tenGod: module.tenGods[0],
      tenGods: module.tenGods,
      relatedIds: module.partIds,
    });
  });

  resonances.forEach((resonance, index) => {
    const angle = -112.5 + index * 45;
    const radius = 414 + (stableUnit(seedKey, `resonance:${resonance.key}:radius`) - 0.5) * 20;
    const point = polar(angle, radius);
    const primaryModule = resonance.functionModules[0];
    const primaryElement = resonance.elements[0] ?? dominantElement;
    const functionPoint = functionPositions[primaryModule];
    const contributorIds = [
      ...resonance.functionModules.flatMap((moduleKey) => {
        const module = functions.find((candidate) => candidate.key === moduleKey)!;
        return [`function:${moduleKey}`, ...module.partIds];
      }),
      ...parts
        .filter(
          (part) =>
            part.element &&
            resonance.elements.includes(part.element) &&
            part.kind !== "boundary" &&
            part.kind !== "function-port",
        )
        .map((part) => part.id),
    ];
    resonance.contributorPartIds = [...new Set(contributorIds)];

    parts.push({
      id: `practice:${resonance.key}`,
      kind: "practice-line",
      layers: ["overview", "resonance"],
      geometry: {
        kind: "path",
        d: curvedPath(
          functionPoint,
          point,
          (stableUnit(seedKey, `practice:${resonance.key}:bend`) - 0.5) * 58,
        ),
        strokeWidth: safeCalibration ? 1.4 + resonance.currentScore / 50 : 1.35,
        dash:
          resonance.state === "tension"
            ? "4 12"
            : resonance.state === "latent"
              ? "2 16"
              : undefined,
      },
      color: elementColors[primaryElement],
      opacity: safeCalibration ? 0.25 + resonance.currentScore / 180 : 0.3 + resonance.natalScore / 260,
      intensity: resonance.currentScore,
      state: resonance.state,
      order: order++,
      element: primaryElement,
      functionModule: primaryModule,
      resonance: resonance.key,
      relatedIds: [`function:${primaryModule}`, `resonance:${resonance.key}`],
    });

    parts.push({
      id: `resonance:${resonance.key}`,
      kind: "resonance-port",
      layers: ["overview", "resonance"],
      geometry: {
        kind: "circle",
        cx: point.x,
        cy: point.y,
        r: 8 + resonance.currentScore * 0.065,
        strokeWidth: resonance.state === "overload" ? 4 : 2.4,
      },
      color: elementColors[primaryElement],
      opacity: 0.88,
      intensity: resonance.currentScore,
      state: resonance.state,
      order: order++,
      element: primaryElement,
      resonance: resonance.key,
      relatedIds: resonance.contributorPartIds,
    });
  });

  const hiddenCount = records.reduce((sum, record) => sum + record.hidden.length, 0);
  const visibleFunctions = functions.filter((module) => module.tenGods.length > 0).length;
  const uniqueElements = elements.filter((element) => elementWeights[element] > 4).length;
  const supportiveRelations = relationResults.filter(
    (item) => item.relation === "support" || item.relation === "echo",
  ).length;
  const tenseRelations = relationResults.filter((item) => item.relation === "control").length;
  const dayRoots = records.filter(
    (record) =>
      record.branchElement === dayElement ||
      record.hidden.some((hidden) => hidden.element === dayElement),
  ).length;
  const monthElement = records.find((record) => record.key === "month")!.branchElement;
  const seasonalSupport =
    monthElement === dayElement || producingCycle[monthElement] === dayElement ? 1 : 0;
  const calibrationValues = safeCalibration
    ? resonanceKeys.map((key) => safeCalibration[key])
    : [];
  const calibrationAverage = safeCalibration
    ? calibrationValues.reduce((sum, value) => sum + value, 0) / resonanceKeys.length
    : 50;
  const calibrationVariance = safeCalibration
    ? calibrationValues.reduce(
        (sum, value) => sum + Math.abs(value - calibrationAverage),
        0,
      ) / resonanceKeys.length
    : 0;
  const insightScore = functions.find((module) => module.key === "insight")!.score;
  const supportingHidden = records.flatMap((record) => record.hidden).filter(
    (hidden) =>
      hidden.element === dayElement || producingCycle[hidden.element] === dayElement,
  );
  const transparentSupport = supportingHidden.filter((hidden) => hidden.transparent).length;
  const dayInnerSupport = records
    .find((record) => record.key === "day")!
    .hidden.filter(
      (hidden) =>
        hidden.element === dayElement || producingCycle[hidden.element] === dayElement,
    ).length;

  const metrics = {
    complexity: Math.round(
      clamp(13 + hiddenCount * 4.4 + supportiveRelations * 4 + tenseRelations * 3 + visibleFunctions * 3),
    ),
    connectivity: Math.round(
      clamp(
        24 + supportiveRelations * 9 + visibleFunctions * 5 - tenseRelations * 5 +
          (safeCalibration ? (calibrationAverage - 50) * 0.18 : 0),
      ),
    ),
    stability: Math.round(
      clamp(
        28 + dayRoots * 12 + seasonalSupport * 16 +
          (100 - Math.abs(50 - yinRatio) * 2) * 0.18 - tenseRelations * 4 -
          (safeCalibration ? calibrationVariance * 0.16 : 0),
      ),
    ),
    depth: Math.round(
      clamp(
        22 +
          (supportingHidden.length / Math.max(hiddenCount, 1)) * 35 +
          transparentSupport * 5 +
          dayInnerSupport * 9 +
          insightScore * 0.18 +
          uniqueElements * 1.5,
      ),
    ),
  };

  return {
    version: 1,
    phase: safeCalibration ? "current" : "natal",
    seed,
    fingerprint,
    birthSignature,
    dayMaster,
    dayElement,
    dominantElement,
    elementWeights,
    yinRatio,
    metrics,
    functions,
    resonances,
    parts,
    calibration: safeCalibration ? { ...safeCalibration } : undefined,
  };
}

export const defaultCalibration: TotemCalibration = Object.fromEntries(
  resonanceKeys.map((key) => [key, 50]),
) as TotemCalibration;
