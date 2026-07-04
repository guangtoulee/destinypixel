"use client";

import {
  Activity,
  Atom,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleDot,
  Crosshair,
  Database,
  FlaskConical,
  Gauge,
  Play,
  RefreshCcw,
  Rocket,
  Shuffle,
  Sparkles,
  Target,
  Volume2,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  allowedEnglishVoiceSummary,
  chooseAllowedEnglishVoice,
} from "@/lib/english-voices";
import styles from "./danci-experience.module.css";

type CacheMode = "map" | "forge" | "patch" | "trace";
type ThemeId = "space" | "bio" | "geo" | "machine" | "exam";

type WordNode = {
  id: string;
  word: string;
  meaning: string;
  level: number;
  family: string;
  theme: ThemeId;
  root: string;
  prefix: string;
  suffix: string;
  rootMeaning: string;
  example: string;
  x: number;
  y: number;
  links: string[];
};

type Part = {
  code: string;
  label: string;
  meaning: string;
};

type ForgeChallenge = {
  targetId: string;
  prompt: string;
  prefix: string;
  root: string;
  suffix: string;
};

type WordRecord = {
  attempts: number;
  correct: number;
  wrong: number;
  mastered: boolean;
  lastMode: CacheMode;
  updatedAt: string;
};

type CacheMemory = {
  selectedId: string;
  mode: CacheMode;
  records: Record<string, WordRecord>;
  patchIndex: number;
  traceIndex: number;
  forgeIndex: number;
  streak: number;
  bestStreak: number;
  credits: number;
  risk: 1 | 2;
  unlockedLevel: number;
  lastFeedback: string;
  history: string[];
};

const storageKey = "neuralCacheWordMemoryV1";
const nonePart = "none";

const wordNodes: WordNode[] = [
  {
    id: "bright",
    word: "bright",
    meaning: "明亮的；聪明的",
    level: 1,
    family: "light",
    theme: "space",
    root: "bright",
    prefix: "",
    suffix: "",
    rootMeaning: "光亮 / 清晰",
    example: "The rover follows a bright signal under the frozen moon.",
    x: 90,
    y: 110,
    links: ["signal", "light"],
  },
  {
    id: "signal",
    word: "signal",
    meaning: "信号",
    level: 1,
    family: "system",
    theme: "machine",
    root: "sign",
    prefix: "",
    suffix: "al",
    rootMeaning: "标记",
    example: "A weak signal can still guide the drone through the storm.",
    x: 230,
    y: 90,
    links: ["system", "design"],
  },
  {
    id: "system",
    word: "system",
    meaning: "系统",
    level: 1,
    family: "system",
    theme: "machine",
    root: "system",
    prefix: "",
    suffix: "",
    rootMeaning: "组合成整体",
    example: "The oxygen system fails when one tiny sensor overheats.",
    x: 370,
    y: 130,
    links: ["signal", "memory", "network"],
  },
  {
    id: "memory",
    word: "memory",
    meaning: "记忆；内存",
    level: 1,
    family: "mind",
    theme: "machine",
    root: "memor",
    prefix: "",
    suffix: "y",
    rootMeaning: "记住",
    example: "The ship stores every route in a protected memory core.",
    x: 520,
    y: 90,
    links: ["remember", "information"],
  },
  {
    id: "target",
    word: "target",
    meaning: "目标",
    level: 1,
    family: "combat",
    theme: "machine",
    root: "target",
    prefix: "",
    suffix: "",
    rootMeaning: "瞄准点",
    example: "The laser target moves before the robot can lock on.",
    x: 690,
    y: 130,
    links: ["attack", "protect"],
  },
  {
    id: "energy",
    word: "energy",
    meaning: "能量",
    level: 1,
    family: "physics",
    theme: "space",
    root: "erg",
    prefix: "",
    suffix: "y",
    rootMeaning: "工作 / 能量",
    example: "The shield loses energy after every asteroid hit.",
    x: 830,
    y: 90,
    links: ["active", "reaction"],
  },
  {
    id: "planet",
    word: "planet",
    meaning: "行星",
    level: 1,
    family: "space",
    theme: "space",
    root: "plan",
    prefix: "",
    suffix: "et",
    rootMeaning: "游走的星体",
    example: "One planet hides an ocean below a layer of black ice.",
    x: 120,
    y: 245,
    links: ["environment", "geography"],
  },
  {
    id: "environment",
    word: "environment",
    meaning: "环境",
    level: 2,
    family: "nature",
    theme: "space",
    root: "viron",
    prefix: "en",
    suffix: "ment",
    rootMeaning: "围绕",
    example: "Mars has a hostile environment, so the colony builds magnetic shields.",
    x: 285,
    y: 255,
    links: ["planet", "biology", "resource"],
  },
  {
    id: "biology",
    word: "biology",
    meaning: "生物学",
    level: 2,
    family: "science",
    theme: "bio",
    root: "bio",
    prefix: "",
    suffix: "logy",
    rootMeaning: "生命",
    example: "Alien biology changes fast when gravity doubles overnight.",
    x: 450,
    y: 240,
    links: ["environment", "scientist", "mutation"],
  },
  {
    id: "geography",
    word: "geography",
    meaning: "地理",
    level: 2,
    family: "earth",
    theme: "geo",
    root: "geo",
    prefix: "",
    suffix: "graphy",
    rootMeaning: "地球 / 地表",
    example: "The map team studies canyon geography before landing.",
    x: 615,
    y: 255,
    links: ["planet", "transport", "resource"],
  },
  {
    id: "history",
    word: "history",
    meaning: "历史",
    level: 2,
    family: "time",
    theme: "exam",
    root: "hist",
    prefix: "",
    suffix: "ory",
    rootMeaning: "记录 / 询问",
    example: "The base computer stores the history of every failed launch.",
    x: 780,
    y: 245,
    links: ["memory", "record"],
  },
  {
    id: "resource",
    word: "resource",
    meaning: "资源",
    level: 2,
    family: "economy",
    theme: "geo",
    root: "source",
    prefix: "re",
    suffix: "",
    rootMeaning: "来源",
    example: "Water is the rarest resource on the desert moon.",
    x: 910,
    y: 260,
    links: ["environment", "export"],
  },
  {
    id: "form",
    word: "form",
    meaning: "形式；形成",
    level: 2,
    family: "form",
    theme: "machine",
    root: "form",
    prefix: "",
    suffix: "",
    rootMeaning: "形状",
    example: "The metal can form a bridge when heated by lasers.",
    x: 85,
    y: 400,
    links: ["reform", "inform", "transform"],
  },
  {
    id: "reform",
    word: "reform",
    meaning: "改革；重组",
    level: 3,
    family: "form",
    theme: "exam",
    root: "form",
    prefix: "re",
    suffix: "",
    rootMeaning: "重新形成",
    example: "The colony must reform its rules after the power grid fails.",
    x: 215,
    y: 380,
    links: ["form", "transform"],
  },
  {
    id: "inform",
    word: "inform",
    meaning: "通知",
    level: 3,
    family: "form",
    theme: "machine",
    root: "form",
    prefix: "in",
    suffix: "",
    rootMeaning: "把信息放入形态",
    example: "The drone will inform the team when oxygen drops.",
    x: 350,
    y: 405,
    links: ["form", "information"],
  },
  {
    id: "information",
    word: "information",
    meaning: "信息",
    level: 3,
    family: "form",
    theme: "machine",
    root: "form",
    prefix: "in",
    suffix: "ation",
    rootMeaning: "形成出的内容",
    example: "Bad information is more dangerous than no map at all.",
    x: 500,
    y: 370,
    links: ["inform", "memory", "network"],
  },
  {
    id: "transform",
    word: "transform",
    meaning: "转化；变形",
    level: 3,
    family: "form",
    theme: "bio",
    root: "form",
    prefix: "trans",
    suffix: "",
    rootMeaning: "跨过去改变形态",
    example: "The virus can transform a plant into a light sensor.",
    x: 650,
    y: 405,
    links: ["form", "mutation"],
  },
  {
    id: "transport",
    word: "transport",
    meaning: "运输",
    level: 3,
    family: "port",
    theme: "geo",
    root: "port",
    prefix: "trans",
    suffix: "",
    rootMeaning: "搬运",
    example: "A rail tunnel can transport ice from the polar mine.",
    x: 815,
    y: 385,
    links: ["import", "export", "portable"],
  },
  {
    id: "import",
    word: "import",
    meaning: "进口；输入",
    level: 3,
    family: "port",
    theme: "machine",
    root: "port",
    prefix: "im",
    suffix: "",
    rootMeaning: "搬进来",
    example: "The city must import nitrogen before the farms restart.",
    x: 930,
    y: 420,
    links: ["transport", "export"],
  },
  {
    id: "export",
    word: "export",
    meaning: "出口；输出",
    level: 3,
    family: "port",
    theme: "machine",
    root: "port",
    prefix: "ex",
    suffix: "",
    rootMeaning: "搬出去",
    example: "The server can export the route data to every scout drone.",
    x: 860,
    y: 535,
    links: ["transport", "resource"],
  },
  {
    id: "portable",
    word: "portable",
    meaning: "便携的",
    level: 3,
    family: "port",
    theme: "machine",
    root: "port",
    prefix: "",
    suffix: "able",
    rootMeaning: "能被携带",
    example: "A portable reactor keeps the rover alive for two days.",
    x: 700,
    y: 535,
    links: ["transport", "unbearable"],
  },
  {
    id: "bear",
    word: "bear",
    meaning: "承受；忍受",
    level: 3,
    family: "bear",
    theme: "exam",
    root: "bear",
    prefix: "",
    suffix: "",
    rootMeaning: "承受",
    example: "The cable can bear the weight of a small landing craft.",
    x: 520,
    y: 520,
    links: ["unbearable", "portable"],
  },
  {
    id: "unbearable",
    word: "unbearable",
    meaning: "不可忍受的",
    level: 4,
    family: "bear",
    theme: "space",
    root: "bear",
    prefix: "un",
    suffix: "able",
    rootMeaning: "不能承受",
    example: "The unbearable heat forces the crew into underground shelters.",
    x: 390,
    y: 555,
    links: ["bear", "portable"],
  },
  {
    id: "science",
    word: "science",
    meaning: "科学",
    level: 2,
    family: "science",
    theme: "exam",
    root: "sci",
    prefix: "",
    suffix: "ence",
    rootMeaning: "知道",
    example: "Real science begins when a guess survives a brutal test.",
    x: 165,
    y: 560,
    links: ["scientist", "scientific"],
  },
  {
    id: "scientist",
    word: "scientist",
    meaning: "科学家",
    level: 3,
    family: "science",
    theme: "bio",
    root: "sci",
    prefix: "",
    suffix: "ist",
    rootMeaning: "知道的人",
    example: "The scientist grows algae that eat metal dust.",
    x: 265,
    y: 510,
    links: ["science", "biology"],
  },
  {
    id: "scientific",
    word: "scientific",
    meaning: "科学的",
    level: 3,
    family: "science",
    theme: "exam",
    root: "sci",
    prefix: "",
    suffix: "ific",
    rootMeaning: "与知道有关",
    example: "A scientific model must predict the next earthquake swarm.",
    x: 300,
    y: 620,
    links: ["science", "predict"],
  },
  {
    id: "active",
    word: "active",
    meaning: "活跃的；主动的",
    level: 2,
    family: "act",
    theme: "bio",
    root: "act",
    prefix: "",
    suffix: "ive",
    rootMeaning: "行动",
    example: "An active enzyme can repair tissue before the next battle.",
    x: 95,
    y: 650,
    links: ["reaction", "activity"],
  },
  {
    id: "reaction",
    word: "reaction",
    meaning: "反应",
    level: 3,
    family: "act",
    theme: "bio",
    root: "act",
    prefix: "re",
    suffix: "ion",
    rootMeaning: "回过来的行动",
    example: "The chemical reaction releases enough heat to melt ice.",
    x: 455,
    y: 670,
    links: ["active", "energy"],
  },
  {
    id: "protect",
    word: "protect",
    meaning: "保护",
    level: 2,
    family: "tect",
    theme: "machine",
    root: "tect",
    prefix: "pro",
    suffix: "",
    rootMeaning: "盖住 / 防护",
    example: "The shield will protect the city from solar dust.",
    x: 630,
    y: 660,
    links: ["target", "construct"],
  },
  {
    id: "construct",
    word: "construct",
    meaning: "建造",
    level: 4,
    family: "struct",
    theme: "machine",
    root: "struct",
    prefix: "con",
    suffix: "",
    rootMeaning: "堆叠 / 建立",
    example: "Robots construct a bridge from recycled spaceship parts.",
    x: 800,
    y: 665,
    links: ["structure", "instruction", "protect"],
  },
  {
    id: "structure",
    word: "structure",
    meaning: "结构",
    level: 4,
    family: "struct",
    theme: "machine",
    root: "struct",
    prefix: "",
    suffix: "ure",
    rootMeaning: "搭建出的形态",
    example: "The crystal structure stores light like a battery.",
    x: 930,
    y: 635,
    links: ["construct", "instruction"],
  },
  {
    id: "instruction",
    word: "instruction",
    meaning: "指令；说明",
    level: 4,
    family: "struct",
    theme: "machine",
    root: "struct",
    prefix: "in",
    suffix: "ion",
    rootMeaning: "建立进脑中的步骤",
    example: "One wrong instruction can crash the whole mining robot.",
    x: 945,
    y: 520,
    links: ["construct", "structure"],
  },
  {
    id: "predict",
    word: "predict",
    meaning: "预测",
    level: 4,
    family: "dict",
    theme: "geo",
    root: "dict",
    prefix: "pre",
    suffix: "",
    rootMeaning: "提前说出",
    example: "The model can predict where the storm will split.",
    x: 80,
    y: 745,
    links: ["scientific", "record"],
  },
  {
    id: "record",
    word: "record",
    meaning: "记录",
    level: 2,
    family: "cord",
    theme: "exam",
    root: "cord",
    prefix: "re",
    suffix: "",
    rootMeaning: "放回心里",
    example: "The black box records every sound before impact.",
    x: 230,
    y: 755,
    links: ["history", "memory"],
  },
  {
    id: "network",
    word: "network",
    meaning: "网络",
    level: 2,
    family: "system",
    theme: "machine",
    root: "work",
    prefix: "net",
    suffix: "",
    rootMeaning: "互相连接的工作",
    example: "A hidden network links the satellites above the jungle.",
    x: 405,
    y: 775,
    links: ["system", "connect", "information"],
  },
  {
    id: "connect",
    word: "connect",
    meaning: "连接",
    level: 3,
    family: "nect",
    theme: "machine",
    root: "nect",
    prefix: "con",
    suffix: "",
    rootMeaning: "绑在一起",
    example: "The engineer must connect three power lines before dawn.",
    x: 560,
    y: 780,
    links: ["network", "signal"],
  },
  {
    id: "mutation",
    word: "mutation",
    meaning: "变异",
    level: 4,
    family: "mut",
    theme: "bio",
    root: "mut",
    prefix: "",
    suffix: "ation",
    rootMeaning: "改变",
    example: "A mutation lets the fungus digest plastic armor.",
    x: 710,
    y: 775,
    links: ["biology", "transform"],
  },
  {
    id: "attack",
    word: "attack",
    meaning: "攻击",
    level: 1,
    family: "combat",
    theme: "machine",
    root: "tack",
    prefix: "at",
    suffix: "",
    rootMeaning: "钉住 / 触碰",
    example: "The drone will attack only after it confirms the target.",
    x: 850,
    y: 780,
    links: ["target", "protect"],
  },
  {
    id: "design",
    word: "design",
    meaning: "设计",
    level: 2,
    family: "sign",
    theme: "machine",
    root: "sign",
    prefix: "de",
    suffix: "",
    rootMeaning: "做出标记",
    example: "A clean design makes the rescue pod faster to repair.",
    x: 990,
    y: 760,
    links: ["signal", "construct"],
  },
  {
    id: "light",
    word: "light",
    meaning: "光；轻的",
    level: 1,
    family: "light",
    theme: "space",
    root: "light",
    prefix: "",
    suffix: "",
    rootMeaning: "光亮 / 不重",
    example: "A light drone can cross the canyon without landing.",
    x: 40,
    y: 40,
    links: ["bright", "energy"],
  },
  {
    id: "remember",
    word: "remember",
    meaning: "记得",
    level: 2,
    family: "mind",
    theme: "exam",
    root: "memor",
    prefix: "re",
    suffix: "",
    rootMeaning: "重新带回记忆",
    example: "The pilot must remember the code before the doors lock.",
    x: 520,
    y: 25,
    links: ["memory", "record"],
  },
];

const prefixes: Part[] = [
  { code: nonePart, label: "∅", meaning: "不加前缀" },
  { code: "un", label: "un-", meaning: "否定 / 反向" },
  { code: "re", label: "re-", meaning: "再次 / 回来" },
  { code: "in", label: "in-", meaning: "进入 / 使" },
  { code: "trans", label: "trans-", meaning: "跨越 / 转换" },
  { code: "con", label: "con-", meaning: "共同 / 合在一起" },
  { code: "pro", label: "pro-", meaning: "向前 / 保护" },
  { code: "pre", label: "pre-", meaning: "提前" },
  { code: "ex", label: "ex-", meaning: "向外" },
  { code: "im", label: "im-", meaning: "向内 / 进入" },
  { code: "de", label: "de-", meaning: "向下 / 分离" },
];

const roots: Part[] = [
  { code: "form", label: "form", meaning: "形状 / 形成" },
  { code: "port", label: "port", meaning: "搬运" },
  { code: "bear", label: "bear", meaning: "承受" },
  { code: "sci", label: "sci", meaning: "知道" },
  { code: "act", label: "act", meaning: "行动" },
  { code: "struct", label: "struct", meaning: "建造 / 堆叠" },
  { code: "dict", label: "dict", meaning: "说" },
  { code: "tect", label: "tect", meaning: "覆盖 / 保护" },
  { code: "bio", label: "bio", meaning: "生命" },
  { code: "geo", label: "geo", meaning: "地球 / 地理" },
];

const suffixes: Part[] = [
  { code: nonePart, label: "∅", meaning: "不加后缀" },
  { code: "able", label: "-able", meaning: "能被……的" },
  { code: "tion", label: "-tion", meaning: "名词化" },
  { code: "ation", label: "-ation", meaning: "动作 / 结果" },
  { code: "ion", label: "-ion", meaning: "动作 / 结果" },
  { code: "ist", label: "-ist", meaning: "做这件事的人" },
  { code: "ific", label: "-ific", meaning: "……性质的" },
  { code: "ive", label: "-ive", meaning: "有……倾向的" },
  { code: "ment", label: "-ment", meaning: "状态 / 结果" },
  { code: "y", label: "-y", meaning: "有……性质" },
];

const forgeChallenges: ForgeChallenge[] = [
  {
    targetId: "unbearable",
    prompt: "生成一个形容词：不可忍受的",
    prefix: "un",
    root: "bear",
    suffix: "able",
  },
  {
    targetId: "transport",
    prompt: "生成一个动词：跨区域运输",
    prefix: "trans",
    root: "port",
    suffix: nonePart,
  },
  {
    targetId: "information",
    prompt: "生成一个名词：被整理出来的信息",
    prefix: "in",
    root: "form",
    suffix: "ation",
  },
  {
    targetId: "scientist",
    prompt: "生成一个人：做科学的人",
    prefix: nonePart,
    root: "sci",
    suffix: "ist",
  },
  {
    targetId: "protect",
    prompt: "生成一个动词：向前覆盖并保护",
    prefix: "pro",
    root: "tect",
    suffix: nonePart,
  },
  {
    targetId: "predict",
    prompt: "生成一个动词：提前说出结果",
    prefix: "pre",
    root: "dict",
    suffix: nonePart,
  },
  {
    targetId: "reaction",
    prompt: "生成一个名词：回过来的反应",
    prefix: "re",
    root: "act",
    suffix: "ion",
  },
  {
    targetId: "construct",
    prompt: "生成一个动词：共同搭建",
    prefix: "con",
    root: "struct",
    suffix: nonePart,
  },
];

function createDefaultMemory(): CacheMemory {
  return {
    selectedId: "environment",
    mode: "map",
    records: {},
    patchIndex: 0,
    traceIndex: 2,
    forgeIndex: 0,
    streak: 0,
    bestStreak: 0,
    credits: 20,
    risk: 1,
    unlockedLevel: 2,
    lastFeedback: "缓存已启动：先修复低阶词，再解锁派生词网络。",
    history: [],
  };
}

function normalizeMemory(input: Partial<CacheMemory> | null): CacheMemory {
  const base = createDefaultMemory();
  const merged = {
    ...base,
    ...(input ?? {}),
    records: input?.records ?? {},
    history: input?.history ?? [],
  };

  if (!wordNodes.some((node) => node.id === merged.selectedId)) {
    merged.selectedId = base.selectedId;
  }
  if (!["map", "forge", "patch", "trace"].includes(merged.mode)) {
    merged.mode = "map";
  }
  if (![1, 2].includes(merged.risk)) {
    merged.risk = 1;
  }

  merged.unlockedLevel = Math.min(5, Math.max(1, Math.round(merged.unlockedLevel || 1)));

  return merged;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function partCode(value: string) {
  return value === nonePart ? "" : value;
}

function buildWord(prefix: string, root: string, suffix: string) {
  return `${partCode(prefix)}${root}${partCode(suffix)}`;
}

function maskWord(word: string, seed: number) {
  const letters = word.split("");
  const internal = letters
    .map((letter, index) => (/[a-z]/i.test(letter) && index > 0 && index < letters.length - 1 ? index : -1))
    .filter((index) => index >= 0);
  const count = Math.min(internal.length, Math.max(1, Math.ceil(internal.length * 0.45)));
  const start = internal.length ? seed % internal.length : 0;
  const masked = new Set<number>();

  for (let offset = 0; offset < count; offset += 1) {
    masked.add(internal[(start + offset * 2) % internal.length]);
  }

  return letters.map((letter, index) => (masked.has(index) ? "_" : letter)).join("");
}

function shuffleBySeed<T>(items: T[], seed: number) {
  return [...items].sort((a, b) => {
    const aScore = Math.sin((seed + 1) * (items.indexOf(a) + 3)) * 10000;
    const bScore = Math.sin((seed + 1) * (items.indexOf(b) + 3)) * 10000;
    return aScore - bScore;
  });
}

function getRecord(records: Record<string, WordRecord>, id: string) {
  return records[id] ?? {
    attempts: 0,
    correct: 0,
    wrong: 0,
    mastered: false,
    lastMode: "map" as CacheMode,
    updatedAt: "",
  };
}

function getThemeLabel(theme: ThemeId) {
  const labels: Record<ThemeId, string> = {
    space: "星际",
    bio: "生物",
    geo: "地理",
    machine: "机械",
    exam: "考点",
  };

  return labels[theme];
}

export default function DanciExperience() {
  const [memory, setMemory] = useState<CacheMemory>(() => createDefaultMemory());
  const [loaded, setLoaded] = useState(false);
  const [patchInput, setPatchInput] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedParts, setSelectedParts] = useState({
    prefix: "",
    root: "",
    suffix: "",
  });
  const mapRef = useRef<HTMLElement | null>(null);
  const forgeRef = useRef<HTMLElement | null>(null);
  const patchRef = useRef<HTMLElement | null>(null);
  const traceRef = useRef<HTMLElement | null>(null);

  const masteredCount = wordNodes.filter((node) => getRecord(memory.records, node.id).mastered).length;
  const weakCount = wordNodes.filter((node) => {
    const record = getRecord(memory.records, node.id);
    return record.wrong > record.correct && record.attempts > 0;
  }).length;
  const totalAttempts = Object.values(memory.records).reduce((sum, record) => sum + record.attempts, 0);
  const totalCorrect = Object.values(memory.records).reduce((sum, record) => sum + record.correct, 0);
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const computedLevel = Math.min(5, Math.max(memory.unlockedLevel, 2 + Math.floor(masteredCount / 7)));
  const cacheHealth = Math.max(
    8,
    Math.min(99, Math.round(42 + masteredCount * 1.5 + accuracy * 0.34 + memory.streak * 1.8 - weakCount * 5)),
  );
  const availableWords = wordNodes.filter((node) => node.level <= computedLevel);
  const selectedNode = wordNodes.find((node) => node.id === memory.selectedId) ?? wordNodes[0];
  const patchNode = availableWords[memory.patchIndex % availableWords.length] ?? wordNodes[0];
  const traceNode = availableWords[memory.traceIndex % availableWords.length] ?? wordNodes[0];
  const currentForge = forgeChallenges[memory.forgeIndex % forgeChallenges.length];
  const forgeTarget = wordNodes.find((node) => node.id === currentForge.targetId) ?? selectedNode;
  const traceChoices = useMemo(() => {
    const distractors = wordNodes
      .filter((node) => node.id !== traceNode.id && node.level <= Math.min(5, traceNode.level + 1))
      .slice(0, 18);
    return shuffleBySeed([traceNode, ...shuffleBySeed(distractors, memory.traceIndex).slice(0, 3)], memory.traceIndex + 7);
  }, [memory.traceIndex, traceNode]);
  const forgePrefixOptions = useMemo(
    () => shuffleBySeed([currentForge.prefix, "un", "re", "trans", "in", nonePart].filter((value, index, list) => list.indexOf(value) === index), memory.forgeIndex)
      .map((code) => prefixes.find((part) => part.code === code) ?? prefixes[0]),
    [currentForge.prefix, memory.forgeIndex],
  );
  const forgeRootOptions = useMemo(
    () => shuffleBySeed([currentForge.root, "form", "port", "act", "struct", "sci"].filter((value, index, list) => list.indexOf(value) === index), memory.forgeIndex + 3)
      .map((code) => roots.find((part) => part.code === code) ?? roots[0]),
    [currentForge.root, memory.forgeIndex],
  );
  const forgeSuffixOptions = useMemo(
    () => shuffleBySeed([currentForge.suffix, "able", "ation", "ion", "ist", nonePart].filter((value, index, list) => list.indexOf(value) === index), memory.forgeIndex + 5)
      .map((code) => suffixes.find((part) => part.code === code) ?? suffixes[0]),
    [currentForge.suffix, memory.forgeIndex],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMemory(normalizeMemory(JSON.parse(saved) as Partial<CacheMemory>));
      }
    } catch {
      setMemory(createDefaultMemory());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify(memory));
  }, [loaded, memory]);

  function patchMemory(updater: (current: CacheMemory) => CacheMemory) {
    setMemory((current) => normalizeMemory(updater(current)));
  }

  function recordResult({
    id,
    correct,
    mode,
    feedback,
    extra,
  }: {
    id: string;
    correct: boolean;
    mode: CacheMode;
    feedback: string;
    extra?: Partial<CacheMemory>;
  }) {
    patchMemory((current) => {
      const previous = getRecord(current.records, id);
      const nextRecord: WordRecord = {
        attempts: previous.attempts + 1,
        correct: previous.correct + (correct ? 1 : 0),
        wrong: previous.wrong + (correct ? 0 : 1),
        mastered: correct
          ? previous.correct + 1 >= 2 && previous.correct + 1 >= previous.wrong + 1
          : false,
        lastMode: mode,
        updatedAt: new Date().toISOString(),
      };
      const nextRecords = {
        ...current.records,
        [id]: nextRecord,
      };
      const nextMastered = wordNodes.filter((node) => getRecord(nextRecords, node.id).mastered).length;
      const nextStreak = correct ? current.streak + 1 : 0;
      const creditDelta = correct ? 3 * current.risk + nextRecord.correct : -2 * current.risk;

      return {
        ...current,
        ...extra,
        records: nextRecords,
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
        credits: Math.max(0, current.credits + creditDelta),
        unlockedLevel: Math.min(5, Math.max(current.unlockedLevel, 2 + Math.floor(nextMastered / 7))),
        lastFeedback: feedback,
        history: [feedback, ...current.history].slice(0, 6),
      };
    });
  }

  function setMode(mode: CacheMode) {
    patchMemory((current) => ({ ...current, mode }));
    window.setTimeout(() => {
      const targets: Record<CacheMode, HTMLElement | null> = {
        map: mapRef.current,
        forge: forgeRef.current,
        patch: patchRef.current,
        trace: traceRef.current,
      };
      targets[mode]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }

  function selectNode(id: string) {
    patchMemory((current) => ({ ...current, selectedId: id, mode: "map" }));
  }

  function submitForge() {
    const formed = buildWord(selectedParts.prefix, selectedParts.root, selectedParts.suffix);
    const expected = forgeTarget.word;
    const correct = normalizeAnswer(formed) === normalizeAnswer(expected);

    recordResult({
      id: forgeTarget.id,
      correct,
      mode: "forge",
      feedback: correct
        ? `合成成功：${expected} 已写入神经缓存。`
        : `合成失败：目标是 ${expected}，你生成了 ${formed || "空配方"}。`,
      extra: {
        forgeIndex: memory.forgeIndex + 1,
        selectedId: forgeTarget.id,
        mode: "forge",
      },
    });
    setSelectedParts({ prefix: "", root: "", suffix: "" });
  }

  function submitPatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = patchInput.trim();
    if (!answer) return;
    const correct = normalizeAnswer(answer) === normalizeAnswer(patchNode.word);

    recordResult({
      id: patchNode.id,
      correct,
      mode: "patch",
      feedback: correct
        ? `补丁命中：${patchNode.word} 拼写稳定度上升。`
        : `缓存抖动：${patchNode.meaning} 应写 ${patchNode.word}。`,
      extra: {
        patchIndex: memory.patchIndex + 1,
        selectedId: patchNode.id,
        mode: "patch",
      },
    });
    setPatchInput("");
  }

  function answerTrace(choiceId: string) {
    const choice = wordNodes.find((node) => node.id === choiceId);
    const correct = choiceId === traceNode.id;

    recordResult({
      id: traceNode.id,
      correct,
      mode: "trace",
      feedback: correct
        ? `链路追踪成功：${traceNode.word} = ${traceNode.meaning}。`
        : `追踪偏移：${traceNode.meaning} 是 ${traceNode.word}，不是 ${choice?.word ?? "未知节点"}。`,
      extra: {
        traceIndex: memory.traceIndex + 1,
        selectedId: traceNode.id,
        mode: "trace",
      },
    });
  }

  function randomizeMission() {
    patchMemory((current) => ({
      ...current,
      selectedId: availableWords[Math.floor(Math.random() * availableWords.length)]?.id ?? current.selectedId,
      patchIndex: current.patchIndex + 1 + Math.floor(Math.random() * 5),
      traceIndex: current.traceIndex + 1 + Math.floor(Math.random() * 5),
      forgeIndex: current.forgeIndex + 1,
      lastFeedback: "任务队列已重新洗牌。",
    }));
  }

  function resetMemory() {
    if (!window.confirm("重置 Neural Cache 的本机训练记录？")) return;
    setMemory(createDefaultMemory());
    setPatchInput("");
    setSelectedParts({ prefix: "", root: "", suffix: "" });
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    const nextVoices = voices.length ? voices : window.speechSynthesis.getVoices();
    if (!voices.length && nextVoices.length) {
      setVoices(nextVoices);
    }
    const voice = chooseAllowedEnglishVoice(nextVoices);
    if (!voice) {
      patchMemory((current) => ({
        ...current,
        lastFeedback: `未找到白名单语音：${allowedEnglishVoiceSummary}`,
      }));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-US";
    utterance.rate = 0.76;
    utterance.pitch = 0.96;
    utterance.volume = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className={styles.shell}>
      <section className={styles.commandDeck}>
        <div className={styles.identityBlock}>
          <div className={styles.mark} aria-hidden="true">
            NC
          </div>
          <div>
            <p>Neural Cache</p>
            <h1>单词缓存查杀台</h1>
          </div>
        </div>

        <section className={styles.cacheDial} aria-label="缓存健康度">
          <div className={styles.dialRing} style={{ "--health": `${cacheHealth}%` } as React.CSSProperties}>
            <strong>{cacheHealth}</strong>
            <span>Cache Health</span>
          </div>
          <div className={styles.dialStats}>
            <div>
              <span>已掌握</span>
              <strong>{masteredCount}/{wordNodes.length}</strong>
            </div>
            <div>
              <span>弱节点</span>
              <strong>{weakCount}</strong>
            </div>
            <div>
              <span>连击</span>
              <strong>{memory.streak}</strong>
            </div>
            <div>
              <span>缓存币</span>
              <strong>{memory.credits}</strong>
            </div>
          </div>
        </section>

        <section className={styles.modePanel}>
          <button type="button" className={memory.mode === "map" ? styles.activeMode : ""} onClick={() => setMode("map")}>
            <Rocket size={17} />
            星图
          </button>
          <button type="button" className={memory.mode === "forge" ? styles.activeMode : ""} onClick={() => setMode("forge")}>
            <FlaskConical size={17} />
            合成炉
          </button>
          <button type="button" className={memory.mode === "patch" ? styles.activeMode : ""} onClick={() => setMode("patch")}>
            <Target size={17} />
            拼写补丁
          </button>
          <button type="button" className={memory.mode === "trace" ? styles.activeMode : ""} onClick={() => setMode("trace")}>
            <Crosshair size={17} />
            链路追踪
          </button>
        </section>

        <section className={styles.riskPanel}>
          <div>
            <p>收益杠杆</p>
            <strong>{memory.risk === 2 ? "x2 加压" : "x1 标准"}</strong>
          </div>
          <button
            type="button"
            className={memory.risk === 2 ? styles.riskHot : ""}
            onClick={() => patchMemory((current) => ({ ...current, risk: current.risk === 1 ? 2 : 1 }))}
          >
            <Zap size={16} />
            {memory.risk === 2 ? "降杠杆" : "加杠杆"}
          </button>
        </section>

        <div className={styles.deckActions}>
          <button type="button" onClick={randomizeMission}>
            <Shuffle size={16} />
            洗牌
          </button>
          <button type="button" onClick={resetMemory}>
            <RefreshCcw size={16} />
            重置
          </button>
        </div>
      </section>

      <section className={styles.workspace}>
        <section className={styles.topBar}>
          <div>
            <p>Level {computedLevel} Unlocked</p>
            <h2>{memory.lastFeedback}</h2>
          </div>
          <div className={styles.gradeReadout}>
            <Gauge size={18} />
            <span>李嘉益短板锁定：英语词汇缓存</span>
          </div>
        </section>

        <section className={styles.coreGrid}>
          <article ref={mapRef} className={styles.starPanel}>
            <div className={styles.panelTitle}>
              <span>
                <Database size={18} />
                Vocabulary Galaxy
              </span>
              <strong>{availableWords.length} nodes online</strong>
            </div>
            <svg className={styles.starMap} viewBox="0 0 1040 840" role="img" aria-label="单词星图">
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#f5d56f" />
                  <stop offset="48%" stopColor="#32d2a0" />
                  <stop offset="100%" stopColor="#2368ff" />
                </radialGradient>
              </defs>
              {wordNodes.flatMap((node) =>
                node.links.map((link) => {
                  const target = wordNodes.find((item) => item.id === link);
                  if (!target) return null;
                  const locked = node.level > computedLevel || target.level > computedLevel;
                  return (
                    <line
                      key={`${node.id}-${link}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      className={locked ? styles.lockedLine : styles.signalLine}
                    />
                  );
                }),
              )}
              {wordNodes.map((node) => {
                const record = getRecord(memory.records, node.id);
                const locked = node.level > computedLevel;
                const selected = node.id === selectedNode.id;
                const className = [
                  styles.starNode,
                  locked ? styles.lockedNode : "",
                  record.mastered ? styles.masteredNode : "",
                  record.wrong > record.correct ? styles.weakNode : "",
                  selected ? styles.selectedNode : "",
                ].join(" ");

                return (
                  <g
                    key={node.id}
                    className={className}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    onClick={() => {
                      if (!locked) selectNode(node.id);
                    }}
                    onKeyDown={(event) => {
                      if (!locked && (event.key === "Enter" || event.key === " ")) {
                        selectNode(node.id);
                      }
                    }}
                  >
                    <circle cx={node.x} cy={node.y} r={selected ? 19 : 14} />
                    <text x={node.x + 20} y={node.y + 5}>{locked ? "LOCK" : node.word}</text>
                  </g>
                );
              })}
            </svg>
          </article>

          <article className={styles.nodeInspector}>
            <div className={styles.nodeBadge}>
              <span>{getThemeLabel(selectedNode.theme)}</span>
              <strong>Lv.{selectedNode.level}</strong>
            </div>
            <button type="button" className={styles.soundButton} onClick={() => speak(`${selectedNode.word}. ${selectedNode.example}`)}>
              <Volume2 size={18} />
            </button>
            <h2>{selectedNode.word}</h2>
            <p>{selectedNode.meaning}</p>
            <div className={styles.rootFormula}>
              <span>{selectedNode.prefix || "∅"}</span>
              <ChevronRight size={15} />
              <span>{selectedNode.root}</span>
              <ChevronRight size={15} />
              <span>{selectedNode.suffix || "∅"}</span>
            </div>
            <div className={styles.exampleText}>
              <Sparkles size={16} />
              <p>{selectedNode.example}</p>
            </div>
            <div className={styles.recordGrid}>
              <div>
                <span>命中</span>
                <strong>{getRecord(memory.records, selectedNode.id).correct}</strong>
              </div>
              <div>
                <span>错漏</span>
                <strong>{getRecord(memory.records, selectedNode.id).wrong}</strong>
              </div>
              <div>
                <span>词根</span>
                <strong>{selectedNode.rootMeaning}</strong>
              </div>
            </div>
          </article>
        </section>

        <section className={styles.missionGrid}>
          <article ref={forgeRef} className={[styles.missionCard, memory.mode === "forge" ? styles.liveMission : ""].join(" ")}>
            <div className={styles.missionHeader}>
              <span>
                <Atom size={18} />
                Root Forge
              </span>
              <strong>{forgeTarget.meaning}</strong>
            </div>
            <p className={styles.missionPrompt}>{currentForge.prompt}</p>
            <div className={styles.formulaPreview}>
              {[selectedParts.prefix, selectedParts.root, selectedParts.suffix].map((part, index) => (
                <span key={`${part}-${index}`}>{part ? prefixes.concat(roots, suffixes).find((item) => item.code === part)?.label ?? part : "?"}</span>
              ))}
              <strong>{buildWord(selectedParts.prefix, selectedParts.root, selectedParts.suffix) || "awaiting formula"}</strong>
            </div>
            <PartRow
              label="前缀"
              parts={forgePrefixOptions}
              selected={selectedParts.prefix}
              onSelect={(code) => setSelectedParts((current) => ({ ...current, prefix: code }))}
            />
            <PartRow
              label="词根"
              parts={forgeRootOptions}
              selected={selectedParts.root}
              onSelect={(code) => setSelectedParts((current) => ({ ...current, root: code }))}
            />
            <PartRow
              label="后缀"
              parts={forgeSuffixOptions}
              selected={selectedParts.suffix}
              onSelect={(code) => setSelectedParts((current) => ({ ...current, suffix: code }))}
            />
            <button
              type="button"
              className={styles.primaryAction}
              disabled={!selectedParts.prefix || !selectedParts.root || !selectedParts.suffix}
              onClick={submitForge}
            >
              <Play size={17} />
              注入合成炉
            </button>
          </article>

          <article ref={patchRef} className={[styles.missionCard, memory.mode === "patch" ? styles.liveMission : ""].join(" ")}>
            <div className={styles.missionHeader}>
              <span>
                <Brain size={18} />
                Spell Patch
              </span>
              <strong>{patchNode.meaning}</strong>
            </div>
            <div className={styles.patchWord}>{maskWord(patchNode.word, memory.patchIndex)}</div>
            <p className={styles.missionPrompt}>{patchNode.example}</p>
            <form className={styles.patchForm} onSubmit={submitPatch}>
              <input
                value={patchInput}
                onChange={(event) => setPatchInput(event.target.value)}
                placeholder="输入完整英文"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button type="submit" className={styles.primaryAction}>
                <Check size={17} />
                修复
              </button>
            </form>
          </article>

          <article ref={traceRef} className={[styles.missionCard, memory.mode === "trace" ? styles.liveMission : ""].join(" ")}>
            <div className={styles.missionHeader}>
              <span>
                <Activity size={18} />
                Meaning Trace
              </span>
              <strong>反推英文节点</strong>
            </div>
            <p className={styles.traceMeaning}>{traceNode.meaning}</p>
            <p className={styles.missionPrompt}>{traceNode.example.replace(traceNode.word, "______")}</p>
            <div className={styles.traceGrid}>
              {traceChoices.map((choice) => (
                <button key={choice.id} type="button" onClick={() => answerTrace(choice.id)}>
                  <CircleDot size={15} />
                  {choice.word}
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.historyPanel}>
          <div className={styles.panelTitle}>
            <span>
              <BookOpen size={18} />
              Cache Log
            </span>
            <strong>Best streak {memory.bestStreak}</strong>
          </div>
          {memory.history.length ? (
            memory.history.map((item) => <p key={item}>{item}</p>)
          ) : (
            <p>等待第一次缓存写入。</p>
          )}
        </section>
      </section>
    </main>
  );
}

function PartRow({
  label,
  parts,
  selected,
  onSelect,
}: {
  label: string;
  parts: Part[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className={styles.partRow}>
      <span>{label}</span>
      <div>
        {parts.map((part) => (
          <button
            key={`${label}-${part.code}`}
            type="button"
            className={selected === part.code ? styles.selectedPart : ""}
            onClick={() => onSelect(part.code)}
            title={part.meaning}
          >
            <strong>{part.label}</strong>
            <small>{part.meaning}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
