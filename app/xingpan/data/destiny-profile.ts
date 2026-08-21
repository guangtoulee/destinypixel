import type {
  BirthInput,
  DestinyCycle,
  DestinyPalette,
  DestinyProfile,
  ElementalSignature,
} from "../types";

const zodiac = [
  ["♈", "ARIES"],
  ["♉", "TAURUS"],
  ["♊", "GEMINI"],
  ["♋", "CANCER"],
  ["♌", "LEO"],
  ["♍", "VIRGO"],
  ["♎", "LIBRA"],
  ["♏", "SCORPIO"],
  ["♐", "SAGITTARIUS"],
  ["♑", "CAPRICORN"],
  ["♒", "AQUARIUS"],
  ["♓", "PISCES"],
].map(([glyph, name]) => ({ glyph, name }));

const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const jiazi = Array.from({ length: 60 }, (_, index) =>
  `${stems[index % stems.length]}${branches[index % branches.length]}`,
);

const baseCycles: Omit<DestinyCycle, "intensity" | "valence">[] = [
  {
    id: "origin",
    age: 6,
    decade: "06—15",
    label: "原初感知",
    stemBranch: "癸亥",
    keywords: ["敏锐", "内在秩序", "高感受力"],
    insight: "你比周围的人更早读懂气氛。别急着把敏感修剪成懂事，它最初是一种高分辨率。",
  },
  {
    id: "departure",
    age: 16,
    decade: "16—25",
    label: "离岸试验",
    stemBranch: "甲子",
    keywords: ["试错", "迁移", "身份重组"],
    insight: "真正的成长不是找到标准答案，而是允许旧身份失效。你需要一次主动离岸。",
  },
  {
    id: "forge",
    age: 26,
    decade: "26—35",
    label: "熔炉周期",
    stemBranch: "乙丑",
    keywords: ["野心", "高压成形", "边界"],
    insight: "能力增长很快，代价是容易把自我价值绑定在产出上。边界不是减速，而是你的散热系统。",
  },
  {
    id: "axis",
    age: 36,
    decade: "36—45",
    label: "主轴确立",
    stemBranch: "丙寅",
    keywords: ["选择", "领导力", "长期主义"],
    insight: "这一阶段不缺机会，缺的是拒绝。每一次清晰的“不”，都在给真正重要的事增加重力。",
  },
  {
    id: "expansion",
    age: 46,
    decade: "46—55",
    label: "外环扩张",
    stemBranch: "丁卯",
    keywords: ["影响力", "协作", "传递"],
    insight: "你的经验开始从个人资产变成公共能力。少证明自己，多设计让别人也能发光的系统。",
  },
  {
    id: "return",
    age: 56,
    decade: "56—65",
    label: "回声归位",
    stemBranch: "戊辰",
    keywords: ["整合", "松弛", "关系修复"],
    insight: "曾经被效率压低的声音会回来。真正的成熟，是让力量和柔软出现在同一个决定里。",
  },
  {
    id: "legacy",
    age: 66,
    decade: "66—75",
    label: "余辉工程",
    stemBranch: "己巳",
    keywords: ["传承", "取舍", "精神资产"],
    insight: "留下来的不是你完成了多少，而是你改变了哪些人的理解方式。开始编辑自己的精神遗产。",
  },
  {
    id: "horizon",
    age: 76,
    decade: "76+",
    label: "无界视野",
    stemBranch: "庚午",
    keywords: ["自由", "见证", "澄明"],
    insight: "当评价系统逐渐退场，生命重新变得宽阔。你不再追赶意义，而成为意义经过的地方。",
  },
];

const palettes: DestinyPalette[] = [
  { void: "#030611", blue: "#3f7cff", gold: "#d7a85b", ember: "#ff5a24" },
  { void: "#05030d", blue: "#6262ff", gold: "#e1b66c", ember: "#ff7138" },
  { void: "#02080b", blue: "#1d9ac6", gold: "#c8a65b", ember: "#ff4f2b" },
];

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed: number, salt: number) {
  const value = Math.sin(seed * 0.000001 + salt * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function createElements(seed: number): ElementalSignature {
  const raw = Array.from({ length: 5 }, (_, index) => 0.3 + seededUnit(seed, index + 1));
  const total = raw.reduce((sum, value) => sum + value, 0);
  const normalized = raw.map((value) => Math.round((value / total) * 100));
  normalized[4] += 100 - normalized.reduce((sum, value) => sum + value, 0);
  return {
    wood: normalized[0],
    fire: normalized[1],
    earth: normalized[2],
    metal: normalized[3],
    water: normalized[4],
  };
}

export function createDestinyProfile(input: BirthInput): DestinyProfile {
  const seed = hashString(`${input.birthDate}|${input.birthTime}|${input.birthplace}`);
  const cycles = baseCycles.map((cycle, index) => ({
    ...cycle,
    intensity: 0.36 + seededUnit(seed, index * 2 + 11) * 0.58,
    valence: seededUnit(seed, index * 2 + 19) * 2 - 1,
    stemBranch: jiazi[(seed + index * 11) % jiazi.length],
  }));

  return {
    id: `DP-${seed.toString(16).toUpperCase().padStart(8, "0")}`,
    subject: "观测者 01",
    birth: input,
    generatedAt: "NOW / LOCAL OBSERVATION",
    palette: palettes[seed % palettes.length],
    elements: createElements(seed),
    cycles,
    zodiac,
    jiazi,
  };
}

export const sampleBirth: BirthInput = {
  birthDate: "1993-09-17",
  birthTime: "21:36",
  birthplace: "上海 · 徐汇",
};

export const sampleDestinyProfile = createDestinyProfile(sampleBirth);
