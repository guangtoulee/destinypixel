"use client";

import {
  AudioLines,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Cloud,
  Delete,
  Headphones,
  Keyboard,
  LogIn,
  LogOut,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  danciWordPacks,
  getDanciPack,
  type DanciWordItem,
  type DanciWordPack,
} from "@/data/danci-word-packs";
import {
  allowedEnglishVoiceSummary,
  chooseAllowedEnglishVoice,
} from "@/lib/english-voices";
import styles from "./danci-experience.module.css";

type RecallMode = "meaning" | "tiles" | "spell" | "listen" | "context";
type TrainingMode = "briefing" | "study" | RecallMode | "correction" | "feedback" | "complete";

type WordItem = DanciWordItem;
type DanciDifficulty = "foundation" | "standard" | "challenge";

type WordRecord = {
  seen: number;
  correct: number;
  wrong: number;
  stage: 0 | 1 | 2 | 3 | 4;
  dueAt: number;
  lastMode: TrainingMode;
  updatedAt: string;
  mistakes: Record<RecallMode, number>;
};

type TrainerMemory = {
  records: Record<string, WordRecord>;
  packId: string;
  difficulty: DanciDifficulty;
  recentIds: string[];
  todayKey: string;
  todayAnswered: number;
  totalAnswered: number;
  streak: number;
  bestStreak: number;
  lastFeedback: string;
  completedMissions: number;
  todayMissions: number;
  syncUpdatedAt: string;
};

type Member = {
  id: string;
  username: string;
};

type ProgressRoot = Record<string, unknown>;

type Outcome = {
  correct: boolean;
  title: string;
  body: string;
  needsCorrection: boolean;
  assisted?: boolean;
  recovered?: boolean;
  mode: RecallMode;
};

type SessionStats = {
  cleanHits: number;
  misses: number;
  recovered: number;
  xp: number;
  combo: number;
  bestCombo: number;
  errors: Record<RecallMode, number>;
};

type LetterTile = {
  id: string;
  letter: string;
};

const storageKey = "danciTrainerMemoryV2";
const sessionStorageKey = "danciMemberSessionV1";
const missionSize = 6;
const reviewIntervals = [10 * 60 * 1000, 30 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];
const recallModes: RecallMode[] = ["meaning", "tiles", "spell", "listen", "context"];

const wordBank: WordItem[] = [
  { id: "hello", word: "hello", meaning: "你好", unit: "Starter", level: 1, family: "starter", example: "Hello, I am Li Hua.", tip: "he-llo 两拍读清楚。" },
  { id: "name", word: "name", meaning: "名字", unit: "Starter", level: 1, family: "starter", example: "My name is Jack.", tip: "a 发 /eɪ/，尾音 m 收住。" },
  { id: "class", word: "class", meaning: "班级；课", unit: "Starter", level: 1, family: "school", example: "We are in Class One.", tip: "cl 开头连读，a 发 /ɑː/ 或 /æ/。" },
  { id: "grade", word: "grade", meaning: "年级", unit: "Starter", level: 1, family: "school", example: "I am in Grade Seven.", tip: "a_e 发 /eɪ/，别漏 e。" },
  { id: "school", word: "school", meaning: "学校", unit: "Starter", level: 1, family: "school", example: "Our school is big.", tip: "ch 在这里发 /k/，不是 /tʃ/。" },
  { id: "teacher", word: "teacher", meaning: "老师", unit: "Starter", level: 1, family: "people", example: "The teacher is kind.", tip: "teach + er，做这件事的人。" },
  { id: "student", word: "student", meaning: "学生", unit: "Starter", level: 1, family: "people", example: "Every student has a book.", tip: "stu-dent 分两块记。" },
  { id: "friend", word: "friend", meaning: "朋友", unit: "Unit 1", level: 1, family: "people", example: "Tom is my good friend.", tip: "ie 在这里发 /e/，不要写成 freind。" },
  { id: "family", word: "family", meaning: "家庭；家人", unit: "Unit 2", level: 1, family: "family", example: "This is my family.", tip: "fam-i-ly 三段记。" },
  { id: "father", word: "father", meaning: "父亲", unit: "Unit 2", level: 1, family: "family", example: "My father likes tea.", tip: "th 舌尖轻咬，a 发 /ɑː/。" },
  { id: "mother", word: "mother", meaning: "母亲", unit: "Unit 2", level: 1, family: "family", example: "My mother is at home.", tip: "mother / father 一起对比记。" },
  { id: "sister", word: "sister", meaning: "姐妹", unit: "Unit 2", level: 1, family: "family", example: "My sister is twelve.", tip: "sis-ter 两段记。" },
  { id: "brother", word: "brother", meaning: "兄弟", unit: "Unit 2", level: 1, family: "family", example: "His brother can swim.", tip: "br 开头连读，th 舌尖轻咬。" },
  { id: "parent", word: "parent", meaning: "父亲或母亲；家长", unit: "Unit 2", level: 2, family: "family", example: "A parent can help with homework.", tip: "par-ent 两段记。" },
  { id: "photo", word: "photo", meaning: "照片", unit: "Unit 2", level: 2, family: "family", example: "This photo is nice.", tip: "ph 发 /f/。" },
  { id: "book", word: "book", meaning: "书", unit: "Unit 3", level: 1, family: "things", example: "The book is on the desk.", tip: "oo 发短 /ʊ/。" },
  { id: "pencil", word: "pencil", meaning: "铅笔", unit: "Unit 3", level: 1, family: "things", example: "I need a pencil.", tip: "pen-cil 两段记。" },
  { id: "desk", word: "desk", meaning: "书桌", unit: "Unit 4", level: 1, family: "things", example: "The ruler is on the desk.", tip: "短 e 发 /e/。" },
  { id: "chair", word: "chair", meaning: "椅子", unit: "Unit 4", level: 1, family: "things", example: "The chair is blue.", tip: "ch 发 /tʃ/，air 发 /eə/。" },
  { id: "bag", word: "bag", meaning: "包", unit: "Unit 3", level: 1, family: "things", example: "My bag is black.", tip: "a 发 /æ/，嘴巴打开。" },
  { id: "map", word: "map", meaning: "地图", unit: "Unit 3", level: 1, family: "things", example: "Look at the map.", tip: "a 发 /æ/，和 bag 同组。" },
  { id: "ruler", word: "ruler", meaning: "尺子", unit: "Unit 3", level: 1, family: "things", example: "The ruler is long.", tip: "u 发 /uː/，ruler 不是 rules。" },
  { id: "dictionary", word: "dictionary", meaning: "词典", unit: "Unit 3", level: 2, family: "things", example: "Use a dictionary after you guess.", tip: "dic-tion-ar-y 分块记。" },
  { id: "red", word: "red", meaning: "红色；红色的", unit: "Starter", level: 1, family: "color", example: "The apple is red.", tip: "短 e 发 /e/。" },
  { id: "blue", word: "blue", meaning: "蓝色；蓝色的", unit: "Starter", level: 1, family: "color", example: "My chair is blue.", tip: "ue 发 /uː/。" },
  { id: "green", word: "green", meaning: "绿色；绿色的", unit: "Starter", level: 1, family: "color", example: "The bag is green.", tip: "ee 发 /iː/。" },
  { id: "yellow", word: "yellow", meaning: "黄色；黄色的", unit: "Starter", level: 1, family: "color", example: "The banana is yellow.", tip: "yel-low 两段记。" },
  { id: "apple", word: "apple", meaning: "苹果", unit: "Unit 6", level: 1, family: "food", example: "I have an apple.", tip: "ap-ple 两段记，双 p。" },
  { id: "banana", word: "banana", meaning: "香蕉", unit: "Unit 6", level: 1, family: "food", example: "The banana is on the table.", tip: "ba-na-na 三段记。" },
  { id: "milk", word: "milk", meaning: "牛奶", unit: "Unit 6", level: 1, family: "food", example: "I drink milk for breakfast.", tip: "短 i 发 /ɪ/。" },
  { id: "bread", word: "bread", meaning: "面包", unit: "Unit 6", level: 1, family: "food", example: "Bread and milk are on the desk.", tip: "ea 在这里发 /e/。" },
  { id: "rice", word: "rice", meaning: "米饭；大米", unit: "Unit 6", level: 1, family: "food", example: "We have rice for lunch.", tip: "i_e 发 /aɪ/。" },
  { id: "chicken", word: "chicken", meaning: "鸡肉；鸡", unit: "Unit 6", level: 1, family: "food", example: "Chicken is my favorite food.", tip: "ch 发 /tʃ/。" },
  { id: "vegetable", word: "vegetable", meaning: "蔬菜", unit: "Unit 6", level: 2, family: "food", example: "Carrots are vegetables.", tip: "veg-e-ta-ble 分块记。" },
  { id: "breakfast", word: "breakfast", meaning: "早餐", unit: "Unit 6", level: 2, family: "food", example: "Breakfast is important.", tip: "break + fast 合起来记。" },
  { id: "soccer", word: "soccer", meaning: "足球", unit: "Unit 5", level: 2, family: "activity", example: "They play soccer after school.", tip: "soc-cer 两段记。" },
  { id: "basketball", word: "basketball", meaning: "篮球", unit: "Unit 5", level: 2, family: "activity", example: "Basketball is fun.", tip: "basket + ball 合成记。" },
  { id: "music", word: "music", meaning: "音乐", unit: "Unit 9", level: 1, family: "subject", example: "Music is relaxing.", tip: "u 发 /juː/。" },
  { id: "history", word: "history", meaning: "历史", unit: "Unit 9", level: 2, family: "subject", example: "History is an interesting subject.", tip: "his-to-ry 三段记。" },
  { id: "science", word: "science", meaning: "科学", unit: "Unit 9", level: 2, family: "subject", example: "Science is useful.", tip: "sci 发 /saɪ/。" },
  { id: "math", word: "math", meaning: "数学", unit: "Unit 9", level: 1, family: "subject", example: "Math is not easy for everyone.", tip: "th 舌尖轻咬。" },
  { id: "english", word: "English", meaning: "英语；英国的", unit: "Unit 9", level: 1, family: "subject", example: "English can be easier with practice.", tip: "首字母常大写；练习时大小写都算对。" },
  { id: "subject", word: "subject", meaning: "学科；科目", unit: "Unit 9", level: 2, family: "subject", example: "What is your favorite subject?", tip: "sub-ject 分块记。" },
  { id: "favorite", word: "favorite", meaning: "最喜欢的", unit: "Unit 9", level: 2, family: "subject", example: "My favorite subject is English.", tip: "fa-vor-ite 分块记。" },
  { id: "monday", word: "Monday", meaning: "星期一", unit: "Unit 8", level: 1, family: "time", example: "We have English on Monday.", tip: "星期首字母常大写。" },
  { id: "birthday", word: "birthday", meaning: "生日", unit: "Unit 8", level: 1, family: "time", example: "My birthday is in May.", tip: "birth + day 合成记。" },
  { id: "month", word: "month", meaning: "月；月份", unit: "Unit 8", level: 1, family: "time", example: "January is the first month.", tip: "th 舌尖轻咬。" },
];

const foundationPack: DanciWordPack = {
  id: "g7-foundation",
  label: "七年级基础补漏",
  shortLabel: "七基",
  description: "小学到七年级的高频基础词，仅在基础确实不稳时使用。",
  words: wordBank,
};

const availablePacks = [foundationPack, ...danciWordPacks];

const difficultyOptions: Array<{
  id: DanciDifficulty;
  label: string;
  note: string;
}> = [
  { id: "foundation", label: "稳基础", note: "保留一级和二级词" },
  { id: "standard", label: "课本同步", note: "覆盖本册全部难度" },
  { id: "challenge", label: "挑战模式", note: "二级和三级词优先" },
];

function emptyMistakes(): Record<RecallMode, number> {
  return { meaning: 0, tiles: 0, spell: 0, listen: 0, context: 0 };
}

function createSessionStats(): SessionStats {
  return {
    cleanHits: 0,
    misses: 0,
    recovered: 0,
    xp: 0,
    combo: 0,
    bestCombo: 0,
    errors: emptyMistakes(),
  };
}

function getEmptyRecord(): WordRecord {
  return {
    seen: 0,
    correct: 0,
    wrong: 0,
    stage: 0,
    dueAt: 0,
    lastMode: "study",
    updatedAt: "",
    mistakes: emptyMistakes(),
  };
}

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function createDefaultMemory(): TrainerMemory {
  return {
    records: {},
    packId: "g7b",
    difficulty: "standard",
    recentIds: [],
    todayKey: todayKey(),
    todayAnswered: 0,
    totalAnswered: 0,
    streak: 0,
    bestStreak: 0,
    lastFeedback: "任务舱待命。",
    completedMissions: 0,
    todayMissions: 0,
    syncUpdatedAt: new Date().toISOString(),
  };
}

function normalizeMemory(input: Partial<TrainerMemory> | null): TrainerMemory {
  const base = createDefaultMemory();
  const records = Object.fromEntries(
    Object.entries(input?.records ?? {}).map(([id, rawRecord]) => {
      const record = rawRecord as Partial<WordRecord>;
      return [
        id,
        {
          ...getEmptyRecord(),
          ...record,
          mistakes: { ...emptyMistakes(), ...(record.mistakes ?? {}) },
        } satisfies WordRecord,
      ];
    }),
  );
  const memory: TrainerMemory = {
    ...base,
    ...(input ?? {}),
    records,
    packId: availablePacks.some((pack) => pack.id === input?.packId) ? String(input?.packId) : base.packId,
    difficulty: difficultyOptions.some((option) => option.id === input?.difficulty)
      ? (input?.difficulty as DanciDifficulty)
      : base.difficulty,
    recentIds: Array.isArray(input?.recentIds)
      ? input.recentIds.filter((id): id is string => typeof id === "string").slice(-18)
      : [],
  };

  if (memory.todayKey !== todayKey()) {
    memory.todayKey = todayKey();
    memory.todayAnswered = 0;
    memory.todayMissions = 0;
  }

  return memory;
}

function getSelectedPack(packId: string) {
  return availablePacks.find((pack) => pack.id === packId) ?? getDanciPack(packId);
}

function getTrainingWords(pack: DanciWordPack, difficulty: DanciDifficulty) {
  if (difficulty === "foundation") {
    const words = pack.words.filter((word) => word.level <= 2);
    return words.length >= missionSize ? words : pack.words;
  }

  if (difficulty === "challenge") {
    const words = pack.words.filter((word) => word.level >= 2);
    return words.length >= missionSize ? words : pack.words;
  }

  return pack.words;
}

function mergeTrainerMemory(localMemory: TrainerMemory, remoteInput: Partial<TrainerMemory> | null) {
  if (!remoteInput) {
    return normalizeMemory({
      ...localMemory,
      syncUpdatedAt: new Date().toISOString(),
    });
  }

  const remoteMemory = normalizeMemory(remoteInput);
  const records = { ...localMemory.records };

  Object.entries(remoteMemory.records).forEach(([id, remoteRecord]) => {
    const localRecord = records[id];
    if (!localRecord || remoteRecord.updatedAt > localRecord.updatedAt) {
      records[id] = remoteRecord;
    }
  });

  const remoteIsNewer = remoteMemory.syncUpdatedAt > localMemory.syncUpdatedAt;
  const recentIds = [...localMemory.recentIds, ...remoteMemory.recentIds]
    .filter((id, index, items) => items.lastIndexOf(id) === index)
    .slice(-18);

  return normalizeMemory({
    ...(remoteIsNewer ? localMemory : remoteMemory),
    ...(remoteIsNewer ? remoteMemory : localMemory),
    records,
    recentIds,
    totalAnswered: Math.max(localMemory.totalAnswered, remoteMemory.totalAnswered),
    bestStreak: Math.max(localMemory.bestStreak, remoteMemory.bestStreak),
    completedMissions: Math.max(localMemory.completedMissions, remoteMemory.completedMissions),
    syncUpdatedAt: new Date().toISOString(),
  });
}

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "请求失败，请稍后再试。");
  return payload;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function stageLabel(stage: number) {
  return ["初见", "认得", "会拼", "会听写", "稳固"][stage] ?? "初见";
}

function modeLabel(mode: TrainingMode) {
  const labels: Record<TrainingMode, string> = {
    briefing: "任务简报",
    study: "新词侦察",
    meaning: "意义锁定",
    tiles: "字母组装",
    spell: "主动拼写",
    listen: "听音写词",
    context: "语境填空",
    correction: "立即订正",
    feedback: "结果回传",
    complete: "任务完成",
  };
  return labels[mode];
}

function nextDueText(dueAt: number) {
  if (!dueAt || dueAt <= Date.now()) return "现在";
  const minutes = Math.ceil((dueAt - Date.now()) / 60000);
  if (minutes < 60) return `${minutes} 分钟后`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} 小时后`;
  return `${Math.ceil(hours / 24)} 天后`;
}

function shuffleBySeed<T extends { id: string }>(items: T[], seed: number) {
  const shuffled = [...items];
  let state = seed + items.reduce((total, item) => {
    return total + [...item.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  }, 0);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

function buildChoices(word: WordItem, seed: number, trainingWords: WordItem[]) {
  const peers = trainingWords.filter((item) => item.id !== word.id && item.level <= Math.min(3, word.level + 1));
  const choices = shuffleBySeed([word, ...shuffleBySeed(peers, seed).slice(0, 3)], seed + 13);
  if (choices[0]?.id === word.id && choices.length > 1) {
    const target = 1 + (seed % (choices.length - 1));
    [choices[0], choices[target]] = [choices[target], choices[0]];
  }
  return choices;
}

function buildMission(memory: TrainerMemory, trainingWords: WordItem[]) {
  if (trainingWords.length === 0) return [];

  const now = Date.now();
  const seed = Number(todayKey().replace(/-/g, "")) + memory.completedMissions * 97 + memory.totalAnswered * 7;
  const recentIds = new Set(memory.recentIds);
  const due = trainingWords
    .filter((word) => {
      const record = memory.records[word.id];
      return Boolean(record?.seen && record.dueAt <= now);
    })
    .sort((a, b) => (memory.records[a.id]?.dueAt ?? 0) - (memory.records[b.id]?.dueAt ?? 0));
  const weak = trainingWords
    .filter((word) => {
      const record = memory.records[word.id];
      return record && record.wrong > 0 && record.wrong >= Math.max(1, Math.floor(record.correct / 2));
    })
    .sort((a, b) => (memory.records[b.id]?.wrong ?? 0) - (memory.records[a.id]?.wrong ?? 0));
  const fresh = shuffleBySeed(
    trainingWords.filter((word) => !memory.records[word.id]?.seen && !recentIds.has(word.id)),
    seed,
  );
  const learning = trainingWords
    .filter((word) => {
      const record = memory.records[word.id];
      return record && record.stage < 4 && !recentIds.has(word.id);
    })
    .sort((a, b) => (memory.records[a.id]?.seen ?? 0) - (memory.records[b.id]?.seen ?? 0));
  const selected = new Set<string>();
  const mission: WordItem[] = [];

  const addWords = (items: WordItem[], limit = missionSize) => {
    for (const word of items) {
      if (mission.length >= missionSize || limit <= 0) break;
      if (selected.has(word.id)) continue;
      selected.add(word.id);
      mission.push(word);
      limit -= 1;
    }
  };

  addWords(weak.filter((word) => !recentIds.has(word.id)), 2);
  addWords(due.filter((word) => !recentIds.has(word.id)), 2);
  addWords(fresh, Math.max(2, missionSize - mission.length));
  addWords(learning);
  addWords(shuffleBySeed(trainingWords.filter((word) => !recentIds.has(word.id)), seed + 29));
  addWords(shuffleBySeed(trainingWords, seed + 61));

  return shuffleBySeed(mission, seed + 101);
}

function getStartMode(word: WordItem, memory: TrainerMemory, recheck = false): TrainingMode {
  const record = memory.records[word.id] ?? getEmptyRecord();
  if (recheck) return "spell";
  if (!record.seen) return "study";
  if (record.stage === 0) return "meaning";
  if (record.stage === 1) return "spell";
  if (record.stage === 2) return "listen";
  return record.lastMode === "context" ? "listen" : "context";
}

function maskWord(word: string) {
  const letters = normalizeAnswer(word).split("");
  if (letters.length <= 3) return `${letters[0]}${"_".repeat(Math.max(1, letters.length - 1))}`;
  return letters.map((letter, index) => (index === 0 || index === letters.length - 1 || index % 3 === 0 ? letter : "_")).join("");
}

function maskExample(word: WordItem) {
  const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return word.example.replace(new RegExp(escaped, "i"), "_____");
}

function buildLetterTiles(word: string, seed: number): LetterTile[] {
  const source = normalizeAnswer(word)
    .split("")
    .map((letter, index) => ({ id: `${index}-${letter}`, letter }));
  const shuffled = shuffleBySeed(source, seed);
  if (shuffled.map((tile) => tile.letter).join("") === normalizeAnswer(word) && shuffled.length > 1) {
    return [...shuffled.slice(1), shuffled[0]];
  }
  return shuffled;
}

function getMissionMix(words: WordItem[], memory: TrainerMemory) {
  const now = Date.now();
  return words.reduce(
    (mix, word) => {
      const record = memory.records[word.id];
      if (!record?.seen) mix.fresh += 1;
      else if (record.wrong > 0 && record.wrong >= Math.max(1, Math.floor(record.correct / 2))) mix.weak += 1;
      else if (record.dueAt <= now) mix.review += 1;
      else mix.review += 1;
      return mix;
    },
    { review: 0, weak: 0, fresh: 0 },
  );
}

function getWeakestMode(errors: Record<RecallMode, number>) {
  const labels: Record<RecallMode, string> = {
    meaning: "词义辨认",
    tiles: "字母顺序",
    spell: "主动拼写",
    listen: "听音辨词",
    context: "语境调用",
  };
  const [mode, count] = recallModes
    .map((item) => [item, errors[item]] as const)
    .sort((a, b) => b[1] - a[1])[0];
  return count ? labels[mode] : "本轮无明显短板";
}

export default function DanciExperience() {
  const [memory, setMemory] = useState<TrainerMemory>(() => createDefaultMemory());
  const [loaded, setLoaded] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [progressRoot, setProgressRoot] = useState<ProgressRoot>({});
  const [cloudReady, setCloudReady] = useState(false);
  const [syncState, setSyncState] = useState<"local" | "syncing" | "saved" | "error">("local");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [missionTarget, setMissionTarget] = useState(missionSize);
  const [tasksDone, setTasksDone] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [recheckCounts, setRecheckCounts] = useState<Record<string, number>>({});
  const [session, setSession] = useState<SessionStats>(() => createSessionStats());
  const [activeId, setActiveId] = useState(wordBank[0].id);
  const [mode, setMode] = useState<TrainingMode>("briefing");
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [tileSelection, setTileSelection] = useState<string[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [correctionError, setCorrectionError] = useState(false);
  const [consolePulse, setConsolePulse] = useState<"neutral" | "success" | "fail">("neutral");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const activePack = getSelectedPack(memory.packId);
  const trainingWords = useMemo(
    () => getTrainingWords(activePack, memory.difficulty),
    [activePack, memory.difficulty],
  );
  const activeWord = trainingWords.find((word) => word.id === activeId) ?? trainingWords[0] ?? activePack.words[0];
  const activeRecord: WordRecord = {
    ...getEmptyRecord(),
    ...(memory.records[activeWord.id] ?? {}),
    mistakes: { ...emptyMistakes(), ...(memory.records[activeWord.id]?.mistakes ?? {}) },
  };
  const choices = useMemo(
    () => buildChoices(activeWord, memory.totalAnswered + activeWord.word.length + activeRecord.wrong * 7, trainingWords),
    [activeRecord.wrong, activeWord, memory.totalAnswered, trainingWords],
  );
  const letterTiles = useMemo(
    () => buildLetterTiles(activeWord.word, memory.totalAnswered + activeWord.word.length * 11),
    [activeWord, memory.totalAnswered],
  );
  const tileAnswer = tileSelection.map((id) => letterTiles.find((tile) => tile.id === id)?.letter ?? "").join("");
  const preview = useMemo(() => buildMission(memory, trainingWords), [memory, trainingWords]);
  const missionMix = useMemo(() => getMissionMix(preview, memory), [memory, preview]);
  const stats = useMemo(() => {
    const records = trainingWords.map((word) => memory.records[word.id] ?? getEmptyRecord());
    return {
      mastered: records.filter((record) => record.stage >= 4).length,
      active: records.filter((record) => record.stage > 0 && record.stage < 4).length,
      weak: records.filter((record) => record.wrong > 0 && record.wrong >= record.correct).length,
    };
  }, [memory.records, trainingWords]);
  const missionPower = Math.min(100, Math.round((tasksDone / Math.max(1, missionTarget)) * 100));
  const baseModules = Math.min(12, memory.completedMissions + Math.floor(stats.mastered / 2));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setMemory(saved ? normalizeMemory(JSON.parse(saved) as Partial<TrainerMemory>) : createDefaultMemory());
      const savedSession = localStorage.getItem(sessionStorageKey);
      if (savedSession) {
        const parsed = JSON.parse(savedSession) as { token?: string };
        if (parsed.token) setSessionToken(parsed.token);
      }
    } catch {
      setMemory(createDefaultMemory());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...memory, syncUpdatedAt: new Date().toISOString() }),
    );
  }, [loaded, memory]);

  useEffect(() => {
    if (!loaded || !sessionToken) return;
    let cancelled = false;

    const loadCloudProgress = async () => {
      setSyncState("syncing");
      try {
        const response = await fetch("/api/english/progress", {
          headers: { Authorization: `Bearer ${sessionToken}` },
          cache: "no-store",
        });
        const payload = await response.json() as {
          error?: string;
          member?: Member;
          progress?: ProgressRoot;
        };
        if (!response.ok) throw new Error(payload.error || "登录已过期。");
        if (cancelled) return;

        const remoteRoot = payload.progress && typeof payload.progress === "object" ? payload.progress : {};
        const remoteDanci = remoteRoot.danciTrainer as Partial<TrainerMemory> | undefined;
        setProgressRoot(remoteRoot);
        setMember(payload.member ?? null);
        setMemory((current) => mergeTrainerMemory(current, remoteDanci ?? null));
        setCloudReady(true);
        setSyncState("saved");
      } catch {
        if (cancelled) return;
        localStorage.removeItem(sessionStorageKey);
        setSessionToken("");
        setMember(null);
        setCloudReady(false);
        setSyncState("error");
      }
    };

    void loadCloudProgress();
    return () => {
      cancelled = true;
    };
  }, [loaded, sessionToken]);

  useEffect(() => {
    if (!loaded || !sessionToken || !cloudReady) return;
    const timer = window.setTimeout(async () => {
      const nextMemory = { ...memory, syncUpdatedAt: new Date().toISOString() };
      setSyncState("syncing");
      try {
        const response = await fetch("/api/english/progress", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress: { ...progressRoot, danciTrainer: nextMemory },
          }),
        });
        if (!response.ok) throw new Error("save failed");
        setSyncState("saved");
      } catch {
        setSyncState("error");
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [cloudReady, loaded, memory, progressRoot, sessionToken]);

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

  function pulse(state: "success" | "fail") {
    setConsolePulse(state);
    if ("vibrate" in navigator) navigator.vibrate(state === "success" ? 18 : [35, 25, 35]);
    window.setTimeout(() => setConsolePulse("neutral"), 520);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    const nextVoices = voices.length ? voices : window.speechSynthesis.getVoices();
    if (!voices.length && nextVoices.length) setVoices(nextVoices);
    const voice = chooseAllowedEnglishVoice(nextVoices);
    if (!voice) {
      setMemory((current) => ({ ...current, lastFeedback: `未找到白名单语音：${allowedEnglishVoiceSummary}` }));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.94;
    window.speechSynthesis.speak(utterance);
  }

  function activateWord(id: string, sourceMemory: TrainerMemory, recheck = false) {
    const word = trainingWords.find((item) => item.id === id) ?? trainingWords[0] ?? activePack.words[0];
    setActiveId(word.id);
    setMode(getStartMode(word, sourceMemory, recheck));
    setInput("");
    setOutcome(null);
    setTileSelection([]);
    setHintShown(false);
    setCorrectionError(false);
    setConsolePulse("neutral");
  }

  function startMission() {
    const nextQueue = buildMission(memory, trainingWords).map((word) => word.id);
    setMissionStarted(true);
    setQueue(nextQueue);
    setMissionTarget(nextQueue.length);
    setTasksDone(0);
    setCompletedWords([]);
    setRecheckCounts({});
    setSession(createSessionStats());
    if (nextQueue[0]) activateWord(nextQueue[0], memory);
  }

  function startRecall() {
    const nextRecord: WordRecord = {
      ...activeRecord,
      seen: Math.max(1, activeRecord.seen + 1),
      lastMode: "study",
      updatedAt: new Date().toISOString(),
    };
    const nextMemory = {
      ...memory,
      records: { ...memory.records, [activeWord.id]: nextRecord },
      lastFeedback: `${activeWord.word} 已进入短时记忆。`,
      syncUpdatedAt: new Date().toISOString(),
    };
    setMemory(nextMemory);
    setMode("meaning");
    setOutcome(null);
  }

  function recordAnswer(correct: boolean, answerMode: RecallMode, assisted = false) {
    const previous = memory.records[activeWord.id] ?? getEmptyRecord();
    const promoted = correct && !assisted;
    const nextStage = promoted
      ? (Math.min(4, previous.stage + 1) as WordRecord["stage"])
      : correct
        ? previous.stage
        : (Math.max(0, previous.stage - 1) as WordRecord["stage"]);
    const nextDueAt = Date.now() + (correct ? (assisted ? reviewIntervals[0] : reviewIntervals[nextStage]) : reviewIntervals[0]);
    const mistakes = { ...emptyMistakes(), ...(previous.mistakes ?? {}) };
    if (!correct) mistakes[answerMode] += 1;
    const nextRecord: WordRecord = {
      ...previous,
      seen: Math.max(1, previous.seen + 1),
      correct: previous.correct + (correct ? 1 : 0),
      wrong: previous.wrong + (correct ? 0 : 1),
      stage: nextStage,
      dueAt: nextDueAt,
      lastMode: answerMode,
      updatedAt: new Date().toISOString(),
      mistakes,
    };
    const nextStreak = correct && !assisted ? memory.streak + 1 : 0;
    const nextMemory: TrainerMemory = {
      ...memory,
      records: { ...memory.records, [activeWord.id]: nextRecord },
      todayAnswered: memory.todayAnswered + 1,
      totalAnswered: memory.totalAnswered + 1,
      streak: nextStreak,
      bestStreak: Math.max(memory.bestStreak, nextStreak),
      lastFeedback: correct
        ? `${activeWord.word} · ${stageLabel(nextStage)} · ${nextDueText(nextDueAt)}复习`
        : `${activeWord.word} 已进入订正与回流。`,
      syncUpdatedAt: new Date().toISOString(),
    };

    setMemory(nextMemory);
    setSession((current) => {
      const combo = correct && !assisted ? current.combo + 1 : 0;
      const errors = { ...current.errors };
      if (!correct) errors[answerMode] += 1;
      return {
        cleanHits: current.cleanHits + (correct && !assisted ? 1 : 0),
        misses: current.misses + (correct ? 0 : 1),
        recovered: current.recovered,
        xp: current.xp + (correct ? (assisted ? 5 : 12 + Math.min(5, current.combo) * 2) : 0),
        combo,
        bestCombo: Math.max(current.bestCombo, combo),
        errors,
      };
    });
    const successTitle: Record<RecallMode, string> = {
      meaning: "词义已锁定",
      tiles: "拼写序列锁定",
      spell: "主动拼写命中",
      listen: "听写命中",
      context: "语境调用成功",
    };
    setOutcome({
      correct,
      assisted,
      title: correct ? (assisted ? "借助线索完成" : successTitle[answerMode]) : "信号未锁定",
      body: correct ? `${nextDueText(nextDueAt)}再次调用` : `正确拼写：${activeWord.word}`,
      needsCorrection: !correct,
      mode: answerMode,
    });
    setMode("feedback");
    setInput("");
    pulse(correct ? "success" : "fail");
  }

  function answerMeaning(choiceId: string) {
    if (choiceId !== activeWord.id) {
      recordAnswer(false, "meaning");
      return;
    }
    setMode("tiles");
    setTileSelection([]);
    setMemory((current) => ({
      ...current,
      lastFeedback: "词义已确认，继续重建字母序列。",
      syncUpdatedAt: new Date().toISOString(),
    }));
  }

  function selectTile(id: string) {
    if (tileSelection.includes(id)) return;
    setTileSelection((current) => [...current, id]);
  }

  function submitTiles() {
    if (tileSelection.length !== letterTiles.length) return;
    recordAnswer(normalizeAnswer(tileAnswer) === normalizeAnswer(activeWord.word), "tiles");
  }

  function submitSpelling(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    const correct = normalizeAnswer(input) === normalizeAnswer(activeWord.word);

    if (mode === "correction") {
      if (!correct) {
        setCorrectionError(true);
        setInput("");
        pulse("fail");
        return;
      }
      setSession((current) => ({ ...current, recovered: current.recovered + 1, xp: current.xp + 4 }));
      setMemory((current) => ({
        ...current,
        lastFeedback: `${activeWord.word} 已完成立即订正。`,
        syncUpdatedAt: new Date().toISOString(),
      }));
      setOutcome({
        correct: true,
        recovered: true,
        title: "订正完成",
        body: "两题后会再次抽查",
        needsCorrection: false,
        mode: outcome?.mode ?? "spell",
      });
      setMode("feedback");
      setInput("");
      pulse("success");
      return;
    }

    if (mode === "spell" || mode === "listen" || mode === "context") {
      recordAnswer(correct, mode, hintShown);
    }
  }

  function giveUp() {
    if (mode === "spell" || mode === "listen" || mode === "context") recordAnswer(false, mode);
  }

  function startCorrection() {
    setMode("correction");
    setInput("");
    setCorrectionError(false);
    setConsolePulse("neutral");
  }

  function advance() {
    const isRecheck = (recheckCounts[activeWord.id] ?? 0) > 0;
    const needsRecheck = Boolean(outcome?.recovered) && !isRecheck;
    const nextRechecks = { ...recheckCounts };
    let rest = queue[0] === activeWord.id ? queue.slice(1) : queue.filter((id) => id !== activeWord.id);

    if (needsRecheck) {
      const insertAt = Math.min(2, rest.length);
      rest = [...rest.slice(0, insertAt), activeWord.id, ...rest.slice(insertAt)];
      nextRechecks[activeWord.id] = 1;
      setMissionTarget((current) => current + 1);
    }

    setTasksDone((current) => current + 1);
    setCompletedWords((current) => (current.includes(activeWord.id) ? current : [...current, activeWord.id]));
    setRecheckCounts(nextRechecks);
    setQueue(rest);
    setOutcome(null);
    setInput("");
    setMemory((current) => ({
      ...current,
      recentIds: [...current.recentIds.filter((id) => id !== activeWord.id), activeWord.id].slice(-18),
      completedMissions: current.completedMissions + (!rest.length ? 1 : 0),
      todayMissions: current.todayMissions + (!rest.length ? 1 : 0),
      lastFeedback: !rest.length ? "任务完成，长期进度已保存。" : current.lastFeedback,
      syncUpdatedAt: new Date().toISOString(),
    }));

    if (!rest.length) {
      setMode("complete");
      return;
    }

    const nextId = rest[0];
    activateWord(nextId, memory, (nextRechecks[nextId] ?? 0) > 0);
  }

  function changePack(packId: string) {
    const pack = getSelectedPack(packId);
    setMemory((current) => ({
      ...current,
      packId: pack.id,
      recentIds: [],
      lastFeedback: `已切换到 ${pack.label}。`,
      syncUpdatedAt: new Date().toISOString(),
    }));
    setMissionStarted(false);
    setMode("briefing");
    setQueue([]);
  }

  function changeDifficulty(difficulty: DanciDifficulty) {
    const option = difficultyOptions.find((item) => item.id === difficulty);
    setMemory((current) => ({
      ...current,
      difficulty,
      recentIds: [],
      lastFeedback: `训练档位：${option?.label ?? "课本同步"}。`,
      syncUpdatedAt: new Date().toISOString(),
    }));
    setMissionStarted(false);
    setMode("briefing");
    setQueue([]);
  }

  function openAuth(modeToOpen: "login" | "register" = "login") {
    setAuthMode(modeToOpen);
    setAuthMessage("");
    setAuthPassword("");
    setAuthPasswordConfirm("");
    setAuthOpen(true);
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authBusy) return;
    if (authMode === "register" && authPassword !== authPasswordConfirm) {
      setAuthMessage("两次密码不一致。");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("");
    try {
      const endpoint = authMode === "register"
        ? "/api/english/auth/register"
        : "/api/english/auth/login";
      const payload = await requestJson<{
        token: string;
        member: Member;
        progress?: ProgressRoot;
      }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
          passwordConfirm: authPasswordConfirm,
          progress: authMode === "register"
            ? { ...progressRoot, danciTrainer: memory }
            : undefined,
        }),
      });

      const remoteRoot = payload.progress && typeof payload.progress === "object" ? payload.progress : {};
      const remoteDanci = remoteRoot.danciTrainer as Partial<TrainerMemory> | undefined;
      const merged = mergeTrainerMemory(memory, remoteDanci ?? null);
      localStorage.setItem(sessionStorageKey, JSON.stringify({ token: payload.token }));
      setSessionToken(payload.token);
      setMember(payload.member);
      setProgressRoot(remoteRoot);
      setMemory(merged);
      setCloudReady(true);
      setSyncState("syncing");
      setAuthOpen(false);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "登录失败，请稍后再试。");
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(sessionStorageKey);
    setSessionToken("");
    setMember(null);
    setProgressRoot({});
    setCloudReady(false);
    setSyncState("local");
  }

  function resetMemory() {
    if (!window.confirm("清空这个浏览器里的全部背词进度？")) return;
    const nextMemory = {
      ...createDefaultMemory(),
      packId: memory.packId,
      difficulty: memory.difficulty,
    };
    setMemory(nextMemory);
    setMissionStarted(false);
    setQueue([]);
    setMode("briefing");
    setOutcome(null);
    setInput("");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hud}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><BrainCircuit size={24} /></span>
          <div>
            <p>{activePack.shortLabel.toUpperCase()} WORD OPS</p>
            <h1>Recall Base</h1>
          </div>
        </div>
        <div className={styles.hudStats}>
          <div><span>今日调用</span><strong>{memory.todayAnswered}</strong></div>
          <div><span>稳定词汇</span><strong>{stats.mastered}</strong></div>
          <div><span>连续命中</span><strong>{memory.streak}</strong></div>
        </div>
        <div className={styles.hudActions}>
          <button
            type="button"
            className={styles.accountButton}
            onClick={() => openAuth("login")}
            aria-label={member ? `学习账号 ${member.username}` : "登录同步"}
            title={member ? `学习账号：${member.username}` : "登录并同步进度"}
          >
            {member ? <Cloud size={17} /> : <LogIn size={17} />}
            <span>{member?.username ?? "登录同步"}</span>
            {member ? <i className={syncState === "saved" ? styles.syncSaved : syncState === "error" ? styles.syncError : ""} /> : null}
          </button>
          <button type="button" className={styles.iconButton} onClick={resetMemory} title="清空学习进度" aria-label="清空学习进度">
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      {authOpen ? (
        <AccountModal
          member={member}
          mode={authMode}
          username={authUsername}
          password={authPassword}
          passwordConfirm={authPasswordConfirm}
          message={authMessage}
          busy={authBusy}
          syncState={syncState}
          onMode={setAuthMode}
          onUsername={setAuthUsername}
          onPassword={setAuthPassword}
          onPasswordConfirm={setAuthPasswordConfirm}
          onSubmit={submitAuth}
          onLogout={logout}
          onClose={() => setAuthOpen(false)}
        />
      ) : null}

      {!loaded ? (
        <section className={styles.bootPanel}><BrainCircuit size={30} /><span>正在载入记忆档案</span></section>
      ) : !missionStarted ? (
        <BriefingView
          words={preview}
          mix={missionMix}
          pack={activePack}
          packs={availablePacks}
          difficulty={memory.difficulty}
          trainingWordCount={trainingWords.length}
          completedMissions={memory.completedMissions}
          moduleCount={baseModules}
          onPack={changePack}
          onDifficulty={changeDifficulty}
          onStart={startMission}
        />
      ) : (
        <div className={styles.gameGrid}>
          <MissionRail target={missionTarget} done={tasksDone} combo={session.combo} />

          <section className={`${styles.console} ${consolePulse === "success" ? styles.consoleSuccess : ""} ${consolePulse === "fail" ? styles.consoleFail : ""}`}>
            <div className={styles.consoleHeader}>
              <div>
                <span>MISSION {String(memory.todayMissions + 1).padStart(2, "0")}</span>
                <strong>{modeLabel(mode)}</strong>
              </div>
              <div className={styles.powerReadout}>
                <span>基地充能 {missionPower}%</span>
                <div><i style={{ width: `${missionPower}%` }} /></div>
              </div>
              <b>{Math.min(tasksDone + 1, missionTarget)} / {missionTarget}</b>
            </div>

            <div className={styles.consoleBody}>
              {mode === "study" ? <StudyView word={activeWord} onSpeak={speak} onStart={startRecall} /> : null}
              {mode === "meaning" ? <MeaningView word={activeWord} choices={choices} onSpeak={speak} onChoose={answerMeaning} /> : null}
              {mode === "tiles" ? (
                <TilesView
                  word={activeWord}
                  tiles={letterTiles}
                  selected={tileSelection}
                  answer={tileAnswer}
                  onSelect={selectTile}
                  onUndo={() => setTileSelection((current) => current.slice(0, -1))}
                  onClear={() => setTileSelection([])}
                  onSubmit={submitTiles}
                  onSpeak={speak}
                />
              ) : null}
              {(mode === "spell" || mode === "listen" || mode === "context") ? (
                <RecallView
                  word={activeWord}
                  mode={mode}
                  input={input}
                  hintShown={hintShown}
                  onInput={setInput}
                  onSubmit={submitSpelling}
                  onSpeak={speak}
                  onHint={() => setHintShown(true)}
                  onGiveUp={giveUp}
                />
              ) : null}
              {mode === "correction" ? (
                <CorrectionView
                  word={activeWord}
                  input={input}
                  hasError={correctionError}
                  onInput={setInput}
                  onSubmit={submitSpelling}
                  onSpeak={speak}
                />
              ) : null}
              {mode === "feedback" && outcome ? (
                <FeedbackView
                  word={activeWord}
                  outcome={outcome}
                  record={memory.records[activeWord.id] ?? activeRecord}
                  onSpeak={speak}
                  onNext={outcome.needsCorrection ? startCorrection : advance}
                />
              ) : null}
              {mode === "complete" ? (
                <CompleteView
                  session={session}
                  wordCount={completedWords.length}
                  moduleCount={baseModules}
                  onNext={startMission}
                />
              ) : null}
            </div>
          </section>

          <BaseStatus
            moduleCount={baseModules}
            power={missionPower}
            active={stats.active}
            weak={stats.weak}
            feedback={memory.lastFeedback}
          />
        </div>
      )}
    </main>
  );
}

function AccountModal({
  member,
  mode,
  username,
  password,
  passwordConfirm,
  message,
  busy,
  syncState,
  onMode,
  onUsername,
  onPassword,
  onPasswordConfirm,
  onSubmit,
  onLogout,
  onClose,
}: {
  member: Member | null;
  mode: "login" | "register";
  username: string;
  password: string;
  passwordConfirm: string;
  message: string;
  busy: boolean;
  syncState: "local" | "syncing" | "saved" | "error";
  onMode: (mode: "login" | "register") => void;
  onUsername: (value: string) => void;
  onPassword: (value: string) => void;
  onPasswordConfirm: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  const syncLabel = syncState === "saved"
    ? "云端已保存"
    : syncState === "syncing"
      ? "正在同步"
      : syncState === "error"
        ? "同步失败，将保留本机进度"
        : "仅保存在本机";

  return (
    <div className={styles.accountOverlay}>
      <section className={styles.accountModal} role="dialog" aria-modal="true" aria-label="学习账号">
        <div className={styles.accountModalHeader}>
          <div>
            <span><UserRound size={16} /> LEARNER PROFILE</span>
            <h2>{member ? member.username : "保存背词进度"}</h2>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="关闭账号窗口" title="关闭">
            <X size={18} />
          </button>
        </div>

        {member ? (
          <div className={styles.memberPanel}>
            <div className={styles.cloudStatus}>
              <Cloud size={24} />
              <div><span>跨设备进度</span><strong>{syncLabel}</strong></div>
            </div>
            <button type="button" className={styles.secondaryButton} onClick={onLogout}>
              <LogOut size={17} />退出账号
            </button>
          </div>
        ) : (
          <>
            <div className={styles.authTabs} role="tablist" aria-label="账号操作">
              <button type="button" className={mode === "login" ? styles.authTabActive : ""} onClick={() => onMode("login")}>登录</button>
              <button type="button" className={mode === "register" ? styles.authTabActive : ""} onClick={() => onMode("register")}>注册</button>
            </div>
            <form className={styles.authForm} onSubmit={onSubmit}>
              <label>
                <span>用户名</span>
                <input value={username} onChange={(event) => onUsername(event.target.value)} autoComplete="username" minLength={2} maxLength={32} required />
              </label>
              <label>
                <span>密码</span>
                <input value={password} onChange={(event) => onPassword(event.target.value)} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} maxLength={72} required />
              </label>
              {mode === "register" ? (
                <label>
                  <span>确认密码</span>
                  <input value={passwordConfirm} onChange={(event) => onPasswordConfirm(event.target.value)} type="password" autoComplete="new-password" minLength={6} maxLength={72} required />
                </label>
              ) : null}
              {message ? <p className={styles.authMessage}>{message}</p> : null}
              <button type="submit" className={styles.primaryButton} disabled={busy}>
                {busy ? "正在连接" : mode === "login" ? "登录并同步" : "注册并保存"}
                <ChevronRight size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function BriefingView({
  words,
  mix,
  pack,
  packs,
  difficulty,
  trainingWordCount,
  completedMissions,
  moduleCount,
  onPack,
  onDifficulty,
  onStart,
}: {
  words: WordItem[];
  mix: { review: number; weak: number; fresh: number };
  pack: DanciWordPack;
  packs: DanciWordPack[];
  difficulty: DanciDifficulty;
  trainingWordCount: number;
  completedMissions: number;
  moduleCount: number;
  onPack: (packId: string) => void;
  onDifficulty: (difficulty: DanciDifficulty) => void;
  onStart: () => void;
}) {
  return (
    <section className={styles.briefing}>
      <div className={styles.briefingCopy}>
        <span className={styles.eyebrow}><Target size={16} /> DAILY MISSION</span>
        <h2>这一局，拿下 {words.length} 个词</h2>
        <p>{pack.description}</p>
        <div className={styles.missionConfig}>
          <label className={styles.packSelect}>
            <span><BookOpen size={15} />教材词库</span>
            <select value={pack.id} onChange={(event) => onPack(event.target.value)} aria-label="教材词库">
              {packs.map((item) => (
                <option key={item.id} value={item.id}>{item.label} · {item.words.length} 词</option>
              ))}
            </select>
          </label>
          <fieldset className={styles.difficultyFieldset}>
            <legend>训练档位</legend>
            <div className={styles.difficultySwitch}>
              {difficultyOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={difficulty === option.id ? styles.difficultyActive : ""}
                  onClick={() => onDifficulty(option.id)}
                  title={option.note}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <p className={styles.missionEstimate}>{pack.label} · 当前档位 {trainingWordCount} 词 · 每局约 6 分钟</p>
        <div className={styles.mixBar} aria-label="本轮词汇组成">
          {mix.review ? <i className={styles.reviewMix} style={{ flex: mix.review }} /> : null}
          {mix.weak ? <i className={styles.weakMix} style={{ flex: mix.weak }} /> : null}
          {mix.fresh ? <i className={styles.freshMix} style={{ flex: mix.fresh }} /> : null}
        </div>
        <div className={styles.mixLegend}>
          <span><i className={styles.reviewDot} />复习 {mix.review}</span>
          <span><i className={styles.weakDot} />薄弱 {mix.weak}</span>
          <span><i className={styles.freshDot} />新词 {mix.fresh}</span>
        </div>
        <button type="button" className={styles.primaryButton} onClick={onStart}>
          <Zap size={19} />
          启动任务
          <ChevronRight size={19} />
        </button>
      </div>
      <div className={styles.briefingBase}>
        <div className={styles.baseTitle}>
          <div><span>MEMORY BASE</span><strong>LV.{Math.max(1, completedMissions + 1)}</strong></div>
          <small>{moduleCount} / 12 模块在线</small>
        </div>
        <ModuleGrid count={moduleCount} />
      </div>
    </section>
  );
}

function MissionRail({ target, done, combo }: { target: number; done: number; combo: number }) {
  return (
    <aside className={styles.missionRail} aria-label="任务进度">
      <div className={styles.railHeading}>
        <span>RUN PATH</span>
        <strong>{combo > 1 ? `COMBO ×${combo}` : "STABLE"}</strong>
      </div>
      <div className={styles.railSteps}>
        {Array.from({ length: target }).map((_, index) => {
          const complete = index < done;
          const active = index === done;
          return (
            <span key={index} className={`${complete ? styles.stepComplete : ""} ${active ? styles.stepActive : ""}`} title={`任务 ${index + 1}`}>
              {complete ? <Check size={15} /> : index + 1}
            </span>
          );
        })}
      </div>
    </aside>
  );
}

function BaseStatus({
  moduleCount,
  power,
  active,
  weak,
  feedback,
}: {
  moduleCount: number;
  power: number;
  active: number;
  weak: number;
  feedback: string;
}) {
  return (
    <aside className={styles.baseStatus}>
      <div className={styles.baseTitle}>
        <div><span>MEMORY BASE</span><strong>{power}%</strong></div>
        <small>{moduleCount} / 12 模块在线</small>
      </div>
      <ModuleGrid count={moduleCount} />
      <div className={styles.baseReadouts}>
        <div><span>学习中</span><strong>{active}</strong></div>
        <div><span>需加固</span><strong>{weak}</strong></div>
      </div>
      <p className={styles.statusLine}><Sparkles size={15} />{feedback}</p>
    </aside>
  );
}

function ModuleGrid({ count }: { count: number }) {
  return (
    <div className={styles.moduleGrid}>
      {Array.from({ length: 12 }).map((_, index) => {
        const lit = index < count;
        return (
          <span key={index} className={lit ? styles.moduleLit : ""} title={lit ? `模块 ${index + 1} 在线` : `模块 ${index + 1} 未解锁`}>
            {lit ? <Zap size={17} /> : <LockKeyhole size={14} />}
          </span>
        );
      })}
    </div>
  );
}

function StudyView({ word, onSpeak, onStart }: { word: WordItem; onSpeak: (text: string) => void; onStart: () => void }) {
  return (
    <div className={styles.learningView}>
      <span className={styles.eyebrow}><BrainCircuit size={16} /> SCAN / 新词侦察</span>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(`${word.word}. ${word.example}`)} title="播放单词和例句" aria-label="播放单词和例句">
        <Volume2 size={21} />
      </button>
      <h2 className={styles.heroWord}>{word.word}</h2>
      <p className={styles.heroMeaning}>{word.meaning}</p>
      <p className={styles.exampleLine}>{word.example}</p>
      <p className={styles.memoryTip}><Sparkles size={16} />{word.tip}</p>
      <button type="button" className={styles.primaryButton} onClick={onStart}>
        遮住并锁定 <ChevronRight size={18} />
      </button>
    </div>
  );
}

function MeaningView({
  word,
  choices,
  onSpeak,
  onChoose,
}: {
  word: WordItem;
  choices: WordItem[];
  onSpeak: (text: string) => void;
  onChoose: (id: string) => void;
}) {
  return (
    <div className={styles.learningView}>
      <span className={styles.eyebrow}><Target size={16} /> TRACE / 意义锁定</span>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(word.word)} title="播放单词" aria-label="播放单词">
        <Volume2 size={21} />
      </button>
      <h2 className={styles.heroWord}>{word.word}</h2>
      <p className={styles.prompt}>先在脑中说出中文，再锁定目标。</p>
      <div className={styles.choiceGrid}>
        {choices.map((choice) => (
          <button key={choice.id} type="button" onClick={() => onChoose(choice.id)}>{choice.meaning}</button>
        ))}
      </div>
    </div>
  );
}

function TilesView({
  word,
  tiles,
  selected,
  answer,
  onSelect,
  onUndo,
  onClear,
  onSubmit,
  onSpeak,
}: {
  word: WordItem;
  tiles: LetterTile[];
  selected: string[];
  answer: string;
  onSelect: (id: string) => void;
  onUndo: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onSpeak: (text: string) => void;
}) {
  const letterCount = normalizeAnswer(word.word).length;
  return (
    <div className={styles.learningView}>
      <span className={styles.eyebrow}><Keyboard size={16} /> FORGE / 字母组装</span>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(word.word)} title="播放单词" aria-label="播放单词">
        <Volume2 size={21} />
      </button>
      <p className={styles.heroMeaning}>{word.meaning}</p>
      <div className={styles.letterSlots} aria-label="已选择的字母">
        {Array.from({ length: letterCount }).map((_, index) => <span key={index}>{answer[index] ?? ""}</span>)}
      </div>
      <div className={styles.tileBank}>
        {tiles.map((tile) => (
          <button key={tile.id} type="button" disabled={selected.includes(tile.id)} onClick={() => onSelect(tile.id)}>{tile.letter}</button>
        ))}
      </div>
      <div className={styles.actionRow}>
        <button type="button" className={styles.iconButtonLarge} onClick={onUndo} disabled={!selected.length} title="撤销一个字母" aria-label="撤销一个字母"><Delete size={20} /></button>
        <button type="button" className={styles.secondaryButton} onClick={onClear} disabled={!selected.length}>清空</button>
        <button type="button" className={styles.primaryButton} onClick={onSubmit} disabled={selected.length !== letterCount}><Target size={18} />锁定拼写</button>
      </div>
    </div>
  );
}

function RecallView({
  word,
  mode,
  input,
  hintShown,
  onInput,
  onSubmit,
  onSpeak,
  onHint,
  onGiveUp,
}: {
  word: WordItem;
  mode: "spell" | "listen" | "context";
  input: string;
  hintShown: boolean;
  onInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSpeak: (text: string) => void;
  onHint: () => void;
  onGiveUp: () => void;
}) {
  const icon = mode === "listen" ? <Headphones size={16} /> : mode === "context" ? <AudioLines size={16} /> : <Keyboard size={16} />;
  return (
    <form className={styles.learningView} onSubmit={onSubmit}>
      <span className={styles.eyebrow}>{icon} RECALL / {modeLabel(mode)}</span>
      {mode === "listen" ? (
        <button type="button" className={styles.listenTarget} onClick={() => onSpeak(word.word)} aria-label="播放听写单词">
          <Volume2 size={34} /><span>播放听写</span>
        </button>
      ) : null}
      {mode === "spell" ? <p className={styles.recallClue}>{word.meaning}</p> : null}
      {mode === "context" ? (
        <div className={styles.contextClue}><p>{maskExample(word)}</p><span>{word.meaning}</span></div>
      ) : null}
      {hintShown ? <p className={styles.hintReveal}><CircleHelp size={16} />{maskWord(word.word)} · {word.tip}</p> : null}
      <input
        value={input}
        onChange={(event) => onInput(event.target.value)}
        placeholder="输入完整英文单词"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="输入完整英文单词"
      />
      <div className={styles.actionRow}>
        <button type="submit" className={styles.primaryButton} disabled={!input.trim()}><Check size={18} />提交答案</button>
        {!hintShown ? <button type="button" className={styles.secondaryButton} onClick={onHint}><CircleHelp size={17} />线索</button> : null}
        <button type="button" className={styles.quietButton} onClick={onGiveUp}>暂时没想起来</button>
      </div>
    </form>
  );
}

function CorrectionView({
  word,
  input,
  hasError,
  onInput,
  onSubmit,
  onSpeak,
}: {
  word: WordItem;
  input: string;
  hasError: boolean;
  onInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSpeak: (text: string) => void;
}) {
  return (
    <form className={styles.learningView} onSubmit={onSubmit}>
      <span className={`${styles.eyebrow} ${styles.warningEyebrow}`}><RefreshCcw size={16} /> PATCH / 立即订正</span>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(word.word)} title="再次播放" aria-label="再次播放"><Volume2 size={21} /></button>
      <p className={styles.recallClue}>{word.meaning}</p>
      <p className={styles.maskedWord}>{maskWord(word.word)}</p>
      {hasError ? <p className={styles.correctionError}>再看线索：{word.tip}</p> : null}
      <input
        value={input}
        onChange={(event) => onInput(event.target.value)}
        placeholder="遮住答案，再写一次"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="订正单词"
      />
      <button type="submit" className={styles.primaryButton} disabled={!input.trim()}><ShieldCheck size={18} />完成订正</button>
    </form>
  );
}

function FeedbackView({
  word,
  outcome,
  record,
  onSpeak,
  onNext,
}: {
  word: WordItem;
  outcome: Outcome;
  record: WordRecord;
  onSpeak: (text: string) => void;
  onNext: () => void;
}) {
  return (
    <div className={styles.learningView}>
      <span className={`${styles.eyebrow} ${outcome.correct ? styles.successEyebrow : styles.failEyebrow}`}>
        {outcome.correct ? <ShieldCheck size={16} /> : <RefreshCcw size={16} />}
        {outcome.correct ? "LOCKED / 命中" : "REPAIR / 待订正"}
      </span>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(`${word.word}. ${word.example}`)} title="播放单词和例句" aria-label="播放单词和例句"><Volume2 size={21} /></button>
      <h2 className={outcome.correct ? styles.feedbackTitle : styles.answerWord}>{outcome.correct ? outcome.title : word.word}</h2>
      <p className={styles.heroMeaning}>{word.meaning}</p>
      <p className={styles.exampleLine}>{word.example}</p>
      <p className={styles.memoryTip}><Sparkles size={16} />{outcome.needsCorrection ? word.tip : outcome.body}</p>
      <div className={styles.stageRail}>
        {[0, 1, 2, 3, 4].map((stage) => <span key={stage} className={record.stage >= stage ? styles.stageOn : ""}>{stageLabel(stage)}</span>)}
      </div>
      <button type="button" className={styles.primaryButton} onClick={onNext}>
        {outcome.needsCorrection ? <><RefreshCcw size={18} />遮住，再写一次</> : <>继续任务<ChevronRight size={18} /></>}
      </button>
    </div>
  );
}

function CompleteView({
  session,
  wordCount,
  moduleCount,
  onNext,
}: {
  session: SessionStats;
  wordCount: number;
  moduleCount: number;
  onNext: () => void;
}) {
  const attempts = session.cleanHits + session.misses;
  const accuracy = attempts ? Math.round((session.cleanHits / attempts) * 100) : 100;
  return (
    <div className={styles.completeView}>
      <span className={`${styles.eyebrow} ${styles.successEyebrow}`}><ShieldCheck size={16} /> MISSION COMPLETE</span>
      <h2>基地模块已点亮</h2>
      <ModuleGrid count={moduleCount} />
      <div className={styles.resultReadouts}>
        <div><span>首答命中</span><strong>{accuracy}%</strong></div>
        <div><span>完成词汇</span><strong>{wordCount}</strong></div>
        <div><span>成功订正</span><strong>{session.recovered}</strong></div>
        <div><span>本局经验</span><strong>{session.xp}</strong></div>
      </div>
      <p className={styles.diagnosis}><Target size={17} />训练焦点：{getWeakestMode(session.errors)}</p>
      <button type="button" className={styles.primaryButton} onClick={onNext}><Zap size={18} />再来一局</button>
    </div>
  );
}
