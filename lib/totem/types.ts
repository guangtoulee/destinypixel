import type { ElementName, HeavenlyStem, StemPolarity } from "@/lib/core/mappings";
import type { BaziData } from "@/lib/engines/bazi";

export const totemLayers = [
  "overview",
  "pillars",
  "elements",
  "functions",
  "resonance",
] as const;

export type TotemLayer = (typeof totemLayers)[number];
export type PillarKey = keyof BaziData["pillars"];

export type TenGodName =
  | "比肩"
  | "劫财"
  | "食神"
  | "伤官"
  | "正财"
  | "偏财"
  | "正官"
  | "七杀"
  | "正印"
  | "偏印"
  | "日主";

export const functionModuleKeys = [
  "agency",
  "expression",
  "exchange",
  "structure",
  "insight",
] as const;

export type FunctionModuleKey = (typeof functionModuleKeys)[number];

export const resonanceKeys = [
  "language",
  "logic",
  "visual",
  "kinesthetic",
  "musical",
  "interpersonal",
  "intrapersonal",
  "naturalistic",
] as const;

export type ResonanceKey = (typeof resonanceKeys)[number];
export type TotemCalibration = Record<ResonanceKey, number>;
export type TotemPhase = "natal" | "current";
export type StructureState = "connected" | "latent" | "tension" | "overload";
export type RelationDetail =
  | "same-symbol"
  | "stem-combination"
  | "branch-harmony"
  | "branch-clash"
  | "same-element"
  | "producing-cycle"
  | "controlling-cycle"
  | "diffusion";

export type TotemSource = Pick<BaziData, "pillars"> &
  Partial<Pick<BaziData, "tenGods" | "trueSolarTime">>;

export type TotemPoint = {
  x: number;
  y: number;
};

export type TotemGeometry =
  | {
      kind: "path";
      d: string;
      strokeWidth: number;
      dash?: string;
    }
  | {
      kind: "branch";
      d: string;
      cx: number;
      cy: number;
      r: number;
      strokeWidth: number;
    }
  | {
      kind: "circle";
      cx: number;
      cy: number;
      r: number;
      strokeWidth: number;
    }
  | {
      kind: "polygon";
      points: string;
      strokeWidth: number;
    };

export type TotemPartKind =
  | "boundary"
  | "core"
  | "pillar-stem"
  | "pillar-branch"
  | "hidden-stem"
  | "element-flow"
  | "function-port"
  | "resonance-port"
  | "practice-line";

export type TotemPart = {
  id: string;
  kind: TotemPartKind;
  layers: TotemLayer[];
  geometry: TotemGeometry;
  color: string;
  opacity: number;
  intensity: number;
  state: StructureState;
  order: number;
  element?: ElementName;
  polarity?: StemPolarity;
  pillar?: PillarKey;
  stem?: HeavenlyStem;
  branch?: string;
  hiddenIndex?: number;
  tenGod?: TenGodName;
  tenGods?: TenGodName[];
  functionModule?: FunctionModuleKey;
  resonance?: ResonanceKey;
  relation?: "support" | "control" | "echo" | "drain";
  relationDetail?: RelationDetail;
  relationPillars?: [PillarKey, PillarKey];
  relatedIds: string[];
};

export type TotemMetricKey = "complexity" | "connectivity" | "stability" | "depth";

export type TotemMetrics = Record<TotemMetricKey, number>;

export type FunctionModule = {
  key: FunctionModuleKey;
  score: number;
  tenGods: TenGodName[];
  partIds: string[];
};

export type ResonanceDomain = {
  key: ResonanceKey;
  natalScore: number;
  currentScore: number;
  state: StructureState;
  contributorPartIds: string[];
  functionModules: FunctionModuleKey[];
  elements: ElementName[];
};

export type TotemModel = {
  version: 1;
  phase: TotemPhase;
  seed: number;
  fingerprint: string;
  birthSignature: string;
  dayMaster: HeavenlyStem;
  dayElement: ElementName;
  dominantElement: ElementName;
  elementWeights: Record<ElementName, number>;
  yinRatio: number;
  metrics: TotemMetrics;
  functions: FunctionModule[];
  resonances: ResonanceDomain[];
  parts: TotemPart[];
  calibration?: TotemCalibration;
};

export type TotemShareSnapshot = {
  version: 1;
  pillars: BaziData["pillars"];
  calibration?: TotemCalibration;
};
