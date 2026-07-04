"use client";

import {
  Atom,
  Brain,
  Check,
  ChevronRight,
  Cpu,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  allowedEnglishVoiceSummary,
  chooseAllowedEnglishVoice,
} from "@/lib/english-voices";
import styles from "./danci-experience.module.css";

type CacheMode = "map" | "forge" | "patch" | "trace";
type CombatMode = "forge" | "patch";
type CombatStatus = "active" | "success" | "failure";
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
  computePower: number;
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

type CombatState = {
  nodeId: string;
  mode: CombatMode;
  status: CombatStatus;
  seed: number;
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
    root: "energ",
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
    root: "scient",
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
    root: "scient",
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
    root: "member",
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
  { code: "at", label: "at-", meaning: "朝向 / 贴近" },
  { code: "de", label: "de-", meaning: "向下 / 分离" },
  { code: "en", label: "en-", meaning: "使进入 / 包围" },
  { code: "ex", label: "ex-", meaning: "向外" },
  { code: "im", label: "im-", meaning: "向内 / 进入" },
  { code: "in", label: "in-", meaning: "进入 / 使" },
  { code: "net", label: "net-", meaning: "网状连接" },
  { code: "pre", label: "pre-", meaning: "提前" },
  { code: "pro", label: "pro-", meaning: "向前 / 保护" },
  { code: "re", label: "re-", meaning: "再次 / 回来" },
  { code: "trans", label: "trans-", meaning: "跨越 / 转换" },
  { code: "un", label: "un-", meaning: "否定 / 反向" },
  { code: "con", label: "con-", meaning: "共同 / 合在一起" },
];

const roots: Part[] = [
  { code: "act", label: "act", meaning: "行动" },
  { code: "bear", label: "bear", meaning: "承受" },
  { code: "bio", label: "bio", meaning: "生命" },
  { code: "bright", label: "bright", meaning: "明亮 / 清晰" },
  { code: "cord", label: "cord", meaning: "心 / 记录" },
  { code: "dict", label: "dict", meaning: "说" },
  { code: "energ", label: "energ", meaning: "工作 / 能量" },
  { code: "erg", label: "erg", meaning: "工作 / 能量" },
  { code: "form", label: "form", meaning: "形状 / 形成" },
  { code: "geo", label: "geo", meaning: "地球 / 地理" },
  { code: "hist", label: "hist", meaning: "询问 / 记录" },
  { code: "light", label: "light", meaning: "光 / 轻" },
  { code: "member", label: "member", meaning: "记忆中的片段" },
  { code: "memor", label: "memor", meaning: "记住" },
  { code: "mut", label: "mut", meaning: "改变" },
  { code: "nect", label: "nect", meaning: "绑在一起" },
  { code: "plan", label: "plan", meaning: "游走 / 平面" },
  { code: "port", label: "port", meaning: "搬运" },
  { code: "sci", label: "sci", meaning: "知道" },
  { code: "scient", label: "scient", meaning: "知道 / 科学" },
  { code: "sign", label: "sign", meaning: "标记" },
  { code: "source", label: "source", meaning: "来源" },
  { code: "struct", label: "struct", meaning: "建造 / 堆叠" },
  { code: "system", label: "system", meaning: "组合成整体" },
  { code: "tack", label: "tack", meaning: "钉住 / 触碰" },
  { code: "target", label: "target", meaning: "瞄准点" },
  { code: "tect", label: "tect", meaning: "覆盖 / 保护" },
  { code: "viron", label: "viron", meaning: "围绕" },
  { code: "work", label: "work", meaning: "工作 / 运转" },
];

const suffixes: Part[] = [
  { code: nonePart, label: "∅", meaning: "不加后缀" },
  { code: "al", label: "-al", meaning: "……的" },
  { code: "able", label: "-able", meaning: "能被……的" },
  { code: "ation", label: "-ation", meaning: "动作 / 结果" },
  { code: "ence", label: "-ence", meaning: "性质 / 状态" },
  { code: "et", label: "-et", meaning: "小型名词尾" },
  { code: "graphy", label: "-graphy", meaning: "书写 / 绘制" },
  { code: "ific", label: "-ific", meaning: "……性质的" },
  { code: "ion", label: "-ion", meaning: "动作 / 结果" },
  { code: "ist", label: "-ist", meaning: "做这件事的人" },
  { code: "logy", label: "-logy", meaning: "学科 / 研究" },
  { code: "ory", label: "-ory", meaning: "相关的事物" },
  { code: "tion", label: "-tion", meaning: "名词化" },
  { code: "ure", label: "-ure", meaning: "结果 / 结构" },
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
    root: "scient",
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
    selectedId: "bright",
    mode: "map",
    records: {},
    computePower: 100,
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
  merged.computePower = Math.min(100, Math.max(0, Math.round(merged.computePower ?? base.computePower)));

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

const initialUnlockedIds = ["bright", "system"];

function getPart(parts: Part[], code: string) {
  return parts.find((part) => part.code === code);
}

function getForgeAnswer(node: WordNode) {
  return {
    prefix: node.prefix || nonePart,
    root: node.root,
    suffix: node.suffix || nonePart,
  };
}

function isForgeableNode(node: WordNode) {
  const answer = getForgeAnswer(node);
  return Boolean(
    getPart(prefixes, answer.prefix) &&
      getPart(roots, answer.root) &&
      getPart(suffixes, answer.suffix) &&
      normalizeAnswer(buildWord(answer.prefix, answer.root, answer.suffix)) === normalizeAnswer(node.word),
  );
}

export default function DanciExperience() {
  const [memory, setMemory] = useState<CacheMemory>(() => createDefaultMemory());
  const [loaded, setLoaded] = useState(false);
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [patchInput, setPatchInput] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedParts, setSelectedParts] = useState({
    prefix: "",
    root: "",
    suffix: "",
  });
  const [lastUnlockedId, setLastUnlockedId] = useState("");

  const unlockedNodeIds = useMemo(() => {
    const ids = new Set(initialUnlockedIds);
    Object.entries(memory.records).forEach(([id, record]) => {
      if (record.correct > 0 || record.mastered) {
        ids.add(id);
      }
    });
    return ids;
  }, [memory.records]);
  const selectedNode = wordNodes.find((node) => node.id === memory.selectedId) ?? wordNodes[0];
  const combatNode = combat ? wordNodes.find((node) => node.id === combat.nodeId) ?? null : null;
  const combatForgeChallenge = combatNode ? forgeChallenges.find((challenge) => challenge.targetId === combatNode.id) : undefined;
  const unlockedCount = wordNodes.filter((node) => unlockedNodeIds.has(node.id)).length;
  const gameOver = memory.computePower <= 0;
  const shellClass = [
    styles.shell,
    combat ? styles.combatOpen : "",
    combat?.status === "failure" ? styles.shellFailure : "",
    gameOver ? styles.shellGameOver : "",
  ].join(" ");
  const combatForgeOptions = useMemo(() => {
    if (!combatNode) {
      return { prefixes: [], roots: [], suffixes: [] };
    }
    const answer = getForgeAnswer(combatNode);
    const seed = combat?.seed ?? 1;

    return {
      prefixes: shuffleBySeed(
        [answer.prefix, "un", "re", "trans", "in", nonePart].filter((value, index, list) => list.indexOf(value) === index),
        seed,
      ).map((code) => getPart(prefixes, code) ?? prefixes[0]),
      roots: shuffleBySeed(
        [answer.root, "form", "port", "act", "struct", "sci", "bear"].filter((value, index, list) => list.indexOf(value) === index),
        seed + 3,
      ).map((code) => getPart(roots, code) ?? roots[0]),
      suffixes: shuffleBySeed(
        [answer.suffix, "able", "ation", "ion", "ist", nonePart].filter((value, index, list) => list.indexOf(value) === index),
        seed + 5,
      ).map((code) => getPart(suffixes, code) ?? suffixes[0]),
    };
  }, [combat?.seed, combatNode]);

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

  function openCombat(node: WordNode) {
    if (gameOver) return;
    const forgeable = isForgeableNode(node);
    const mode: CombatMode = forgeable && Math.random() > 0.5 ? "forge" : "patch";
    setPatchInput("");
    setSelectedParts({ prefix: "", root: "", suffix: "" });
    setCombat({
      nodeId: node.id,
      mode,
      status: "active",
      seed: memory.patchIndex + memory.forgeIndex + node.word.length + Math.floor(Math.random() * 97),
    });
    patchMemory((current) => ({
      ...current,
      selectedId: node.id,
      mode,
      lastFeedback: `Encrypted node detected: ${node.word}`,
    }));
  }

  function handleNodeClick(node: WordNode) {
    if (gameOver) return;
    if (!unlockedNodeIds.has(node.id)) {
      openCombat(node);
      return;
    }
    patchMemory((current) => ({
      ...current,
      selectedId: node.id,
      mode: "map",
      lastFeedback: `Node intel loaded: ${node.word}`,
    }));
  }

  function resolveHack(correct: boolean) {
    if (!combat || !combatNode) return;
    const mode = combat.mode;
    const feedback = correct
      ? `Access Granted: ${combatNode.word} 节点已点亮。`
      : `Hack Failed: ${combatNode.word} 仍处于加密状态。`;

    patchMemory((current) => {
      const previous = getRecord(current.records, combatNode.id);
      const nextRecord: WordRecord = {
        attempts: previous.attempts + 1,
        correct: previous.correct + (correct ? 1 : 0),
        wrong: previous.wrong + (correct ? 0 : 1),
        mastered: correct ? true : previous.mastered,
        lastMode: mode,
        updatedAt: new Date().toISOString(),
      };
      const nextStreak = correct ? current.streak + 1 : 0;
      const nextRecords = {
        ...current.records,
        [combatNode.id]: nextRecord,
      };
      const nextUnlocked = wordNodes.filter((node) => initialUnlockedIds.includes(node.id) || getRecord(nextRecords, node.id).correct > 0).length;

      return {
        ...current,
        records: nextRecords,
        computePower: Math.max(0, current.computePower - 10),
        selectedId: combatNode.id,
        mode,
        patchIndex: mode === "patch" ? current.patchIndex + 1 : current.patchIndex,
        forgeIndex: mode === "forge" ? current.forgeIndex + 1 : current.forgeIndex,
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
        credits: Math.max(0, current.credits + (correct ? 6 + nextRecord.correct : -3)),
        unlockedLevel: Math.min(5, Math.max(current.unlockedLevel, 1 + Math.floor(nextUnlocked / 7))),
        lastFeedback: feedback,
        history: [feedback, ...current.history].slice(0, 8),
      };
    });

    if (correct) {
      setCombat({ ...combat, status: "success" });
      setLastUnlockedId(combatNode.id);
      setSelectedParts({ prefix: "", root: "", suffix: "" });
      setPatchInput("");
      window.setTimeout(() => setCombat(null), 920);
      return;
    }

    setCombat({ ...combat, status: "failure" });
    window.setTimeout(() => {
      setCombat((current) => {
        if (!current || current.nodeId !== combat.nodeId || current.status !== "failure") return current;
        if (memory.computePower - 10 <= 0) return null;
        return { ...current, status: "active" };
      });
    }, 680);
  }

  function submitCombatForge() {
    if (!combatNode) return;
    const formed = buildWord(selectedParts.prefix, selectedParts.root, selectedParts.suffix);
    resolveHack(normalizeAnswer(formed) === normalizeAnswer(combatNode.word));
  }

  function submitCombatPatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!combatNode || !patchInput.trim()) return;
    resolveHack(normalizeAnswer(patchInput) === normalizeAnswer(combatNode.word));
  }

  function resetMemory() {
    if (!window.confirm("重置 Neural Cache 的本机训练记录？")) return;
    setMemory(createDefaultMemory());
    setCombat(null);
    setPatchInput("");
    setSelectedParts({ prefix: "", root: "", suffix: "" });
    setLastUnlockedId("");
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
    <main className={shellClass}>
      <section className={styles.worldMap} aria-label="Vocabulary Galaxy world map">
        <svg className={styles.starMap} viewBox="0 0 1040 840" preserveAspectRatio="xMidYMid meet" role="img" aria-label="单词星图">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#fff7ba" />
              <stop offset="45%" stopColor="#38f6b4" />
              <stop offset="100%" stopColor="#29a6ff" />
            </radialGradient>
            <filter id="electricGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {wordNodes.flatMap((node) =>
            node.links.map((link) => {
              const target = wordNodes.find((item) => item.id === link);
              if (!target) return null;
              const liveLine = unlockedNodeIds.has(node.id) && unlockedNodeIds.has(target.id);
              return (
                <line
                  key={`${node.id}-${link}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  className={liveLine ? styles.signalLine : styles.fogLine}
                />
              );
            }),
          )}
          {wordNodes.map((node) => {
            const unlocked = unlockedNodeIds.has(node.id);
            const selected = node.id === selectedNode.id;
            const className = [
              styles.starNode,
              unlocked ? styles.unlockedNode : styles.encryptedNode,
              selected ? styles.selectedNode : "",
              lastUnlockedId === node.id ? styles.newlyUnlockedNode : "",
            ].join(" ");

            return (
              <g
                key={node.id}
                className={className}
                role="button"
                tabIndex={0}
                aria-label={`${unlocked ? "已点亮" : "加密"}节点 ${node.word}`}
                onClick={() => handleNodeClick(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    handleNodeClick(node);
                  }
                }}
              >
                {lastUnlockedId === node.id ? <circle cx={node.x} cy={node.y} r={32} className={styles.unlockPulse} /> : null}
                <circle cx={node.x} cy={node.y} r={unlocked ? 17 : 14} />
                {unlocked ? null : (
                  <>
                    <path d={`M ${node.x - 6} ${node.y - 2} v-7 a6 6 0 0 1 12 0 v7`} className={styles.lockShackle} />
                    <rect x={node.x - 9} y={node.y - 2} width="18" height="14" rx="3" className={styles.lockBody} />
                  </>
                )}
                <text x={node.x + 22} y={node.y + 5}>{unlocked ? node.word : "ENCRYPTED"}</text>
              </g>
            );
          })}
        </svg>
      </section>

      <section className={styles.hud} aria-label="Neural Cache HUD">
        <div className={styles.brandBlock}>
          <span>NC</span>
          <div>
            <p>Neural Cache</p>
            <h1>Vocabulary Galaxy</h1>
          </div>
        </div>
        <div className={styles.computeBlock}>
          <div>
            <span>剩余算力</span>
            <strong>{memory.computePower}</strong>
          </div>
          <div className={styles.computeTrack}>
            <i style={{ width: `${memory.computePower}%` }} />
          </div>
        </div>
        <div className={styles.hudStats}>
          <span>{unlockedCount}/{wordNodes.length} nodes online</span>
          <span>Best streak {memory.bestStreak}</span>
        </div>
      </section>

      <section className={styles.intelPanel} aria-label="Selected node intel">
        <div className={styles.nodeBadge}>
          <span>{getThemeLabel(selectedNode.theme)}</span>
          <strong>Lv.{selectedNode.level}</strong>
        </div>
        <button type="button" className={styles.soundButton} onClick={() => speak(`${selectedNode.word}. ${selectedNode.example}`)}>
          <Volume2 size={17} />
        </button>
        <h2>{selectedNode.word}</h2>
        <p>{selectedNode.meaning}</p>
        <div className={styles.rootFormula}>
          <span>{selectedNode.prefix || "∅"}</span>
          <ChevronRight size={14} />
          <span>{selectedNode.root}</span>
          <ChevronRight size={14} />
          <span>{selectedNode.suffix || "∅"}</span>
        </div>
        <div className={styles.exampleText}>
          <Sparkles size={15} />
          <p>{selectedNode.example}</p>
        </div>
        <p className={styles.statusFeed}>{memory.lastFeedback}</p>
      </section>

      <button type="button" className={styles.resetButton} onClick={resetMemory}>
        <RefreshCcw size={16} />
        Reset
      </button>

      {combat && combatNode ? (
        <section className={styles.modalLayer} aria-label="Combat phase">
          <div className={[styles.combatModal, styles[`combat${combat.status}`]].join(" ")}>
            <button type="button" className={styles.closeButton} aria-label="关闭破解弹窗" onClick={() => setCombat(null)}>
              <X size={18} />
            </button>
            <div className={styles.modalHeader}>
              <span>{combat.mode === "forge" ? <Atom size={20} /> : <Brain size={20} />}</span>
              <div>
                <p>Combat Phase</p>
                <h2>{combat.mode === "forge" ? "Root Forge" : "Spell Patch"}</h2>
              </div>
            </div>
            <div className={styles.targetReadout}>
              <span>Encrypted Node</span>
              <strong>{combatNode.meaning}</strong>
            </div>

            {combat.mode === "forge" ? (
              <div className={styles.combatBody}>
                <p className={styles.missionPrompt}>{combatForgeChallenge?.prompt ?? `合成目标单词：${combatNode.meaning}`}</p>
                <div className={styles.formulaPreview}>
                  {[selectedParts.prefix, selectedParts.root, selectedParts.suffix].map((part, index) => (
                    <span key={`${part}-${index}`}>{part ? prefixes.concat(roots, suffixes).find((item) => item.code === part)?.label ?? part : "?"}</span>
                  ))}
                  <strong>{buildWord(selectedParts.prefix, selectedParts.root, selectedParts.suffix) || "awaiting formula"}</strong>
                </div>
                <PartRow
                  label="前缀"
                  parts={combatForgeOptions.prefixes}
                  selected={selectedParts.prefix}
                  onSelect={(code) => setSelectedParts((current) => ({ ...current, prefix: code }))}
                />
                <PartRow
                  label="词根"
                  parts={combatForgeOptions.roots}
                  selected={selectedParts.root}
                  onSelect={(code) => setSelectedParts((current) => ({ ...current, root: code }))}
                />
                <PartRow
                  label="后缀"
                  parts={combatForgeOptions.suffixes}
                  selected={selectedParts.suffix}
                  onSelect={(code) => setSelectedParts((current) => ({ ...current, suffix: code }))}
                />
                <button
                  type="button"
                  className={styles.primaryAction}
                  disabled={!selectedParts.prefix || !selectedParts.root || !selectedParts.suffix || combat.status !== "active"}
                  onClick={submitCombatForge}
                >
                  <Zap size={17} />
                  Execute Hack
                </button>
              </div>
            ) : (
              <form className={styles.combatBody} onSubmit={submitCombatPatch}>
                <div className={styles.patchWord}>{maskWord(combatNode.word, combat.seed)}</div>
                <p className={styles.missionPrompt}>{combatNode.example}</p>
                <div className={styles.patchForm}>
                  <input
                    value={patchInput}
                    onChange={(event) => setPatchInput(event.target.value)}
                    placeholder="输入完整英文"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <button type="submit" className={styles.primaryAction} disabled={combat.status !== "active"}>
                    <Check size={17} />
                    Inject
                  </button>
                </div>
              </form>
            )}

            {combat.status !== "active" ? (
              <div className={styles.combatResult}>
                {combat.status === "success" ? "ACCESS GRANTED" : "HACK FAILED"}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {gameOver ? (
        <section className={styles.gameOverPanel} aria-label="Game over">
          <div>
            <ShieldAlert size={42} />
            <p>Compute Power Depleted</p>
            <h2>Game Over</h2>
            <span>算力归零，神经缓存链路已断开。</span>
            <button type="button" onClick={resetMemory}>
              <Cpu size={17} />
              重启缓存核心
            </button>
          </div>
        </section>
      ) : null}
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
