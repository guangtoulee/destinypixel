"use client";

import Image from "next/image";
import {
  BookOpen,
  Brain,
  Check,
  ClipboardCheck,
  Crosshair,
  Download,
  FileText,
  GraduationCap,
  Headphones,
  Play,
  RefreshCcw,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./english-learning-experience.module.css";

type LevelId = "starter" | "foundation" | "bridge" | "boost";
type ModuleKey = "words" | "target" | "textbook" | "listen" | "read" | "phonics";
type WordEntry = [string, string, string, string, string];

type Assessment = {
  score: number;
  level: LevelId;
  note: string;
  date: string;
};

type WrongItem = {
  id: string;
  prompt: string;
  answer: string;
  chosen: string;
  type: string;
  date: string;
  times: number;
};

type KnownWord = {
  word: string;
  meaning: string;
  learnedAt: string;
  count: number;
};

type TargetStats = {
  score: number;
  rounds: number;
  streak: number;
  bestStreak: number;
};

type TextbookExamScore = {
  correct: number;
  total: number;
  date: string;
};

type TextbookScanMode = "sequence" | "random" | "weak";
type TextbookSpellingMode = "cloze" | "dictation" | "photo";

type TextbookWordStat = {
  word: string;
  meaning: string;
  bookId: string;
  unitId: string;
  correct: number;
  wrong: number;
  mastered: boolean;
  updatedAt: string;
};

type TextbookScanState = {
  mode: TextbookScanMode;
  currentKey: string;
  rounds: number;
  streak: number;
  bestStreak: number;
  lastFeedback: string;
};

type TextbookSpellingRecord = {
  word: string;
  meaning: string;
  bookId: string;
  unitId: string;
  expected: string;
  answer: string;
  mode: TextbookSpellingMode;
  correct: boolean;
  issues: string[];
  ocrText?: string;
  imageName?: string;
  date: string;
};

type TextbookSpellingState = {
  mode: TextbookSpellingMode;
  currentKey: string;
  rounds: number;
  correct: number;
  wrong: number;
  lastFeedback: string;
};

type TextbookMemory = {
  bookId: string;
  unitId: string;
  doneUnits: Record<string, boolean>;
  answers: Record<string, string>;
  examScores: Record<string, TextbookExamScore>;
  wordStats: Record<string, TextbookWordStat>;
  scan: TextbookScanState;
  spellingRecords: Record<string, TextbookSpellingRecord>;
  spelling: TextbookSpellingState;
};

type LearningMemory = {
  assessment: Assessment | null;
  completed: {
    date: string;
    modules: Partial<Record<ModuleKey, boolean>>;
  };
  knownWords: Record<string, KnownWord>;
  reviewWords: Record<string, boolean>;
  wrongItems: WrongItem[];
  shadowCounts: Record<string, number>;
  readingAnswers: Record<string, boolean>;
  phonicsDone: Record<string, boolean>;
  targetStats: TargetStats;
  textbook: TextbookMemory;
  voiceURI: string;
  rate: number;
};

type SessionAnswer = {
  prompt: string;
  chosen: string;
  answer: string;
  type: string;
  isCorrect: boolean;
};

const storageKey = "brightStepsLearningMemoryV3";
const memberStorageKey = "brightStepsMemberSessionV1";

const levels: Record<
  LevelId,
  { name: string; range: string; focus: string; plan: string }
> = {
  starter: {
    name: "Starter",
    range: "约 400-800 词",
    focus: "先补高频动词和常见句型",
    plan: "每天 8 个核心词 + 4 个句子跟读",
  },
  foundation: {
    name: "Foundation A1",
    range: "约 800-1400 词",
    focus: "补词汇量、听出关键词",
    plan: "每天 10 个核心词 + 6 句听读 + 1 篇短文",
  },
  bridge: {
    name: "Bridge A1+",
    range: "约 1400-2200 词",
    focus: "补阅读速度和易错拼读",
    plan: "每天 12 个主题词 + 8 句跟读 + 1 篇阅读",
  },
  boost: {
    name: "A2 Prep",
    range: "约 2200-3200 词",
    focus: "扩展表达、整理错词",
    plan: "每天 15 个词块 + 复述短文 + 限时阅读",
  },
};

const diagnosticQuestions = [
  {
    type: "词义",
    prompt: "Which word means “经常”？",
    choices: ["usually", "quickly", "careful", "borrow"],
    answer: "usually",
    explain: "usually 是频率副词，表示“通常、经常”。",
  },
  {
    type: "词义",
    prompt: "Choose the meaning of “improve”.",
    choices: ["提高，改善", "忘记", "借入", "害怕的"],
    answer: "提高，改善",
    explain: "improve 常用于成绩、能力、发音变好。",
  },
  {
    type: "听力",
    prompt: "Listen and choose what you hear.",
    audio: "She is afraid of making mistakes.",
    choices: [
      "She is afraid of making mistakes.",
      "She is proud of making models.",
      "She is late for the meeting.",
      "She is good at taking photos.",
    ],
    answer: "She is afraid of making mistakes.",
    explain: "关键词是 afraid 和 mistakes。",
  },
  {
    type: "词义",
    prompt: "“borrow” 和 “lend” 哪个是“借入”？",
    choices: ["borrow", "lend", "both", "neither"],
    answer: "borrow",
    explain: "borrow 是向别人借入；lend 是把东西借给别人。",
  },
  {
    type: "拼写",
    prompt: "Fill in the missing word: I have e____h time to finish it.（足够的）",
    answer: "enough",
    explain: "enough 的 gh 发 /f/，结尾听起来像 /nʌf/。",
  },
  {
    type: "阅读",
    passage:
      "Mia joined the science club because she wanted to build a small robot. At first, the instructions were difficult, but her partner helped her read them step by step.",
    prompt: "Why did Mia join the club?",
    choices: ["To build a robot", "To play basketball", "To cook dinner", "To watch a film"],
    answer: "To build a robot",
    explain: "第一句直接说 she wanted to build a small robot。",
  },
  {
    type: "听力",
    prompt: "Listen and choose the missing word: I bought a ticket ______ the museum.",
    audio: "I bought a ticket for the museum.",
    choices: ["for", "from", "four", "floor"],
    answer: "for",
    explain: "ticket for... 表示“去某处/某活动的票”。",
  },
  {
    type: "词义",
    prompt: "Which word is closest to “decide”?",
    choices: ["make a choice", "take a shower", "draw a map", "miss a bus"],
    answer: "make a choice",
    explain: "decide 是“决定”，也就是 make a choice。",
  },
  {
    type: "拼写",
    prompt: "Fill in the missing word: The i____d is quiet and beautiful.（岛）",
    answer: "island",
    explain: "island 里的 s 不发音。",
  },
  {
    type: "阅读",
    passage:
      "Leo used to read very slowly. This month, he reads ten minutes before sleep every night. Now he can understand short stories more easily.",
    prompt: "What helped Leo read better?",
    choices: ["Reading every night", "Sleeping in class", "Buying a bike", "Watching short videos"],
    answer: "Reading every night",
    explain: "文中说 he reads ten minutes before sleep every night。",
  },
  {
    type: "词义",
    prompt: "Choose the meaning of “instead”.",
    choices: ["代替，反而", "几乎不", "立刻", "在楼上"],
    answer: "代替，反而",
    explain: "instead 常见于 do A instead of B。",
  },
  {
    type: "听力",
    prompt: "Listen and choose what you hear.",
    audio: "The weather changed quickly in the afternoon.",
    choices: [
      "The weather changed quickly in the afternoon.",
      "The water changed quietly after lunch.",
      "The waiter cleaned the kitchen.",
      "The weather was cloudy in the morning.",
    ],
    answer: "The weather changed quickly in the afternoon.",
    explain: "注意 weather / water、quickly / quietly 的区别。",
  },
];

const wordDecks: Record<LevelId, WordEntry[]> = {
  starter: [
    ["always", "总是", "I always check my homework.", "al-ways：把 al 当成 all，全部时间都做。", "频率"],
    ["before", "在……之前", "Wash your hands before dinner.", "be + fore，fore 像 forward，位置在前。", "时间"],
    ["because", "因为", "I stayed home because it rained.", "because 后面给理由。", "连词"],
    ["enough", "足够的", "We have enough time.", "e-nough 读 /ɪˈnʌf/，gh 发 /f/。", "易错音"],
    ["idea", "主意", "That is a great idea.", "i-de-a 三拍，不要读成一个音。", "表达"],
    ["quiet", "安静的", "The library is quiet.", "qui 读 /kwaɪ/，和 quite 只差一个 e。", "易混"],
    ["usually", "通常", "I usually get up at seven.", "u-su-al-ly，四小块拼起来。", "频率"],
    ["world", "世界", "People around the world learn English.", "wor + ld，r 音别吞掉。", "主题"],
  ],
  foundation: [
    ["improve", "提高，改善", "Practice can improve pronunciation.", "im + prove，像证明自己变好。", "核心动词"],
    ["mistake", "错误", "Do not be afraid of mistakes.", "mis + take，拿错了就是 mistake。", "学习"],
    ["borrow", "借入", "Can I borrow your dictionary?", "borrow 是借进来，lend 是借出去。", "易混"],
    ["foreign", "外国的", "Learning a foreign language takes time.", "for-eign，g 不发音。", "易错音"],
    ["through", "穿过，通过", "We walked through the park.", "through 读 /θruː/，gh 不发音。", "难发音"],
    ["although", "虽然", "Although it was late, he kept reading.", "al-though，句子前后有转折。", "连词"],
    ["careful", "小心的，仔细的", "Be careful with the glass.", "care + ful，充满 care。", "形容词"],
    ["result", "结果", "Her test result was better.", "re-sult，重音在第二拍。", "学校"],
    ["sentence", "句子", "Write one sentence about your day.", "sen-ten-ce，不要丢中间 /tən/。", "学习"],
    ["listen", "听", "Listen to the story again.", "listen 的 t 不发音。", "易错音"],
  ],
  bridge: [
    ["environment", "环境", "Plastic bags are bad for the environment.", "en-vi-ron-ment，拆成四块背。", "主题"],
    ["confidence", "信心", "Reading aloud builds confidence.", "con + fi + dence，有信心就是 confidence。", "表达"],
    ["especially", "尤其", "I like sports, especially tennis.", "e-spe-cial-ly，special 变副词。", "副词"],
    ["knowledge", "知识", "Books give us knowledge.", "know + ledge，k 不发音。", "易错音"],
    ["necessary", "必要的", "Sleep is necessary for health.", "ne-ces-sa-ry，中间一个 c 两个 s。", "拼写"],
    ["pronounce", "发音", "Can you pronounce this word?", "pro + nounce，noun 的发音在里面。", "发音"],
    ["temperature", "温度", "The temperature dropped at night.", "tem-per-a-ture，常被读快。", "科学"],
    ["thought", "想法，认为", "I thought it was easy.", "thought 读 /θɔːt/，gh 不发音。", "难发音"],
    ["receive", "收到", "I received a message.", "i before e except after c：receive 是 cei。", "拼写"],
    ["journey", "旅程", "The journey took two hours.", "jour-ney，/dʒɜːrni/。", "主题"],
  ],
  boost: [
    ["achievement", "成就", "The prize was a great achievement.", "achieve + ment，先会 achieve。", "学业"],
    ["opportunity", "机会", "This is a good opportunity to speak.", "op-por-tu-ni-ty，五块拆开。", "表达"],
    ["responsible", "负责任的", "He is responsible for the project.", "be responsible for 是常见搭配。", "搭配"],
    ["communicate", "交流", "We communicate in English.", "com-mu-ni-cate，最后 cate 读 /keɪt/。", "表达"],
    ["recommend", "推荐", "Can you recommend a book?", "re-com-mend，中间双 m。", "动词"],
    ["challenge", "挑战", "The listening test was a challenge.", "chal-lenge，ch 读 /tʃ/。", "学习"],
    ["explain", "解释", "Please explain the rule.", "ex + plain，说清楚。", "课堂"],
    ["valuable", "有价值的", "Your advice is valuable.", "value + able，e 丢掉。", "形容词"],
  ],
};

type TextbookQuestion = {
  skill: string;
  prompt: string;
  choices: string[];
  answer: string;
  explain: string;
};

type TextbookUnit = {
  id: string;
  title: string;
  theme: string;
  target: string;
  words: WordEntry[];
  patterns: string[];
  drills: string[];
  exam: TextbookQuestion[];
};

type TextbookBook = {
  id: string;
  grade: string;
  semester: string;
  label: string;
  note: string;
  units: TextbookUnit[];
};

type TextbookWordItem = {
  key: string;
  bookId: string;
  unitId: string;
  unitTitle: string;
  word: string;
  meaning: string;
  sample: string;
  tip: string;
  tag: string;
};

function createTextbookUnit({
  id,
  title,
  theme,
  target,
  words,
  patterns,
  drills,
}: Omit<TextbookUnit, "exam">): TextbookUnit {
  const [firstWord, firstMeaning, firstSample] = words[0];
  const [, secondMeaning] = words[1] ?? words[0];

  return {
    id,
    title,
    theme,
    target,
    words,
    patterns,
    drills,
    exam: [
      {
        skill: "词义反应",
        prompt: `Which meaning matches “${firstWord}”?`,
        choices: [firstMeaning, secondMeaning, "在……之间", "安静地"],
        answer: firstMeaning,
        explain: `本单元重点词 ${firstWord} 可以放进句子：${firstSample}`,
      },
      {
        skill: "句型选择",
        prompt: "Choose the sentence that best fits this unit.",
        choices: [
          firstSample,
          "The mountain was invented yesterday.",
          "She usually bought tomorrow.",
          "Because yes, so no.",
        ],
        answer: firstSample,
        explain: `这题考 ${patterns[0]}，先看主语、时态和关键词。`,
      },
    ],
  };
}

function getTextbookWordItems(book: TextbookBook): TextbookWordItem[] {
  return book.units.flatMap((unit) =>
    unit.words.map(([word, meaning, sample, tip, tag]) => ({
      key: `${book.id}:${unit.id}:${word}`,
      bookId: book.id,
      unitId: unit.id,
      unitTitle: unit.title,
      word,
      meaning,
      sample,
      tip,
      tag,
    })),
  );
}

function getTextbookMeaningOptions(items: TextbookWordItem[], currentKey: string, rounds: number) {
  const currentIndex = Math.max(0, items.findIndex((item) => item.key === currentKey));
  const current = items[currentIndex] ?? items[0];
  if (!current) return [];

  const meanings = [current.meaning];
  for (let offset = 1; meanings.length < Math.min(4, items.length) && offset < items.length * 2; offset += 1) {
    const candidate = items[(currentIndex + offset * 2) % items.length];
    if (candidate && !meanings.includes(candidate.meaning)) {
      meanings.push(candidate.meaning);
    }
  }

  const rotation = meanings.length ? rounds % meanings.length : 0;
  return [...meanings.slice(rotation), ...meanings.slice(0, rotation)];
}

function isWeakTextbookWord(stat: TextbookWordStat | undefined) {
  return Boolean(stat && !stat.mastered && stat.wrong > 0);
}

function isMasteredTextbookWord(stat: TextbookWordStat | undefined) {
  return Boolean(stat?.mastered);
}

function pickNextTextbookWordKey({
  items,
  stats,
  currentKey,
  mode,
  randomValue,
}: {
  items: TextbookWordItem[];
  stats: Record<string, TextbookWordStat>;
  currentKey: string;
  mode: TextbookScanMode;
  randomValue: number;
}) {
  if (items.length === 0) return "";

  if (mode === "sequence") {
    const currentIndex = Math.max(0, items.findIndex((item) => item.key === currentKey));
    return items[(currentIndex + 1) % items.length].key;
  }

  const weakItems = items.filter((item) => isWeakTextbookWord(stats[item.key]));
  const unmasteredItems = items.filter((item) => !isMasteredTextbookWord(stats[item.key]));
  const pool = mode === "weak"
    ? weakItems.length
      ? weakItems
      : unmasteredItems.length
        ? unmasteredItems
        : items
    : items;
  const nextIndex = Math.floor(randomValue * pool.length) % pool.length;

  return pool[nextIndex]?.key ?? items[0].key;
}

function normalizeSpellingAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function maskTextbookWord(word: string) {
  const chars = word.split("");
  const letterIndexes = chars
    .map((char, index) => (/[a-z]/i.test(char) ? index : -1))
    .filter((index) => index >= 0);
  const internalIndexes = letterIndexes.slice(1, -1);

  if (internalIndexes.length === 0) {
    return chars.map((char, index) => (index === 0 ? char : "_")).join("");
  }

  const maskCount = Math.min(internalIndexes.length, Math.max(1, Math.ceil(internalIndexes.length * 0.5)));
  const start = Math.max(0, Math.floor((internalIndexes.length - maskCount) / 2));
  const maskIndexes = new Set(internalIndexes.slice(start, start + maskCount));

  return chars.map((char, index) => (maskIndexes.has(index) ? "_" : char)).join("");
}

function getSpellingIssues(expected: string, answer: string) {
  const expectedText = normalizeSpellingAnswer(expected);
  const answerText = normalizeSpellingAnswer(answer);
  const issues: string[] = [];

  if (!answerText) return ["还没写出单词"];
  if (answerText.length !== expectedText.length) {
    issues.push(`长度应为 ${expectedText.length} 个字母，现在是 ${answerText.length} 个`);
  }

  for (let index = 0; index < Math.min(expectedText.length, answerText.length) && issues.length < 4; index += 1) {
    if (expectedText[index] !== answerText[index]) {
      issues.push(`第 ${index + 1} 位应为 ${expectedText[index].toUpperCase()}`);
    }
  }

  return issues.length ? issues : ["字母顺序不对，再核一遍"];
}

function pickNextSpellingWordKey({
  items,
  stats,
  currentKey,
  randomValue,
}: {
  items: TextbookWordItem[];
  stats: Record<string, TextbookWordStat>;
  currentKey: string;
  randomValue: number;
}) {
  if (items.length === 0) return "";

  const weakItems = items.filter((item) => isWeakTextbookWord(stats[item.key]));
  if (weakItems.length) {
    const nextIndex = Math.floor(randomValue * weakItems.length) % weakItems.length;
    return weakItems[nextIndex]?.key ?? weakItems[0].key;
  }

  const unmasteredItems = items.filter((item) => !isMasteredTextbookWord(stats[item.key]));
  if (unmasteredItems.length) {
    const currentIndex = Math.max(0, items.findIndex((item) => item.key === currentKey));
    for (let offset = 1; offset <= items.length; offset += 1) {
      const candidate = items[(currentIndex + offset) % items.length];
      if (candidate && unmasteredItems.some((item) => item.key === candidate.key)) {
        return candidate.key;
      }
    }
  }

  return pickNextTextbookWordKey({
    items,
    stats,
    currentKey,
    mode: "sequence",
    randomValue,
  });
}

const textbookCatalog: TextbookBook[] = [
  {
    id: "g3a",
    grade: "三年级",
    semester: "上册",
    label: "三年级上册",
    note: "入门阶段原创同步包：听说、认读和课堂指令优先。",
    units: [
      createTextbookUnit({
        id: "g3a-u1",
        title: "Greetings",
        theme: "问候与自我介绍",
        target: "能听懂 hello / name / friend，并说出简单问候。",
        words: [
          ["hello", "你好", "Hello, I am Lily.", "he-llo 两拍，开口说。", "问候"],
          ["name", "名字", "My name is Tom.", "name 里的 a 读 /eɪ/。", "介绍"],
          ["friend", "朋友", "This is my friend.", "fri + end，结尾 d 要带上。", "人物"],
        ],
        patterns: ["I am... / My name is...", "This is..."],
        drills: ["听 3 个名字并选头像", "用 I am... 说一句自我介绍", "把 hello / hi / goodbye 分类"],
      }),
      createTextbookUnit({
        id: "g3a-u2",
        title: "Classroom",
        theme: "教室和学习用品",
        target: "能听懂常见课堂物品和指令。",
        words: [
          ["book", "书", "Open your book.", "book 和 look 押韵。", "用品"],
          ["pencil", "铅笔", "I have a pencil.", "pen + cil，第一拍重。", "用品"],
          ["open", "打开", "Open the door, please.", "o-pen 两拍。", "指令"],
        ],
        patterns: ["I have a/an...", "Open / Close..."],
        drills: ["听指令点物品", "用 I have... 造 2 句", "区分 a book / an eraser"],
      }),
    ],
  },
  {
    id: "g3b",
    grade: "三年级",
    semester: "下册",
    label: "三年级下册",
    note: "入门阶段原创同步包：家庭、动物、食物主题。",
    units: [
      createTextbookUnit({
        id: "g3b-u1",
        title: "Family",
        theme: "家庭成员",
        target: "能介绍家人并听懂 he / she。",
        words: [
          ["family", "家庭", "This is my family.", "fa-mi-ly 三小块。", "家庭"],
          ["mother", "妈妈", "My mother is kind.", "th 轻咬舌。", "家庭"],
          ["sister", "姐妹", "She is my sister.", "sis + ter。", "人物"],
        ],
        patterns: ["This is my...", "He / She is..."],
        drills: ["看照片选家庭称呼", "听 he/she 选人物", "介绍 2 位家人"],
      }),
      createTextbookUnit({
        id: "g3b-u2",
        title: "Animals",
        theme: "动物与喜好",
        target: "能说出动物名称和简单喜好。",
        words: [
          ["animal", "动物", "The panda is an animal.", "an-i-mal 三拍。", "动物"],
          ["panda", "熊猫", "I like pandas.", "pan-da 两拍。", "动物"],
          ["cute", "可爱的", "The cat is cute.", "u 读 /juː/。", "形容"],
        ],
        patterns: ["I like...", "It is..."],
        drills: ["听动物音选单词", "用 cute / big 描述动物", "选择 I like... 的正确句子"],
      }),
    ],
  },
  {
    id: "g4a",
    grade: "四年级",
    semester: "上册",
    label: "四年级上册",
    note: "四年级原创同步包：学校、房间、天气。",
    units: [
      createTextbookUnit({
        id: "g4a-u1",
        title: "School Things",
        theme: "书包与文具",
        target: "能描述书包里有什么，并使用复数。",
        words: [
          ["schoolbag", "书包", "My schoolbag is heavy.", "school + bag。", "校园"],
          ["notebook", "笔记本", "There is a notebook.", "note + book。", "用品"],
          ["heavy", "重的", "The box is heavy.", "ea 读 /e/。", "形容"],
        ],
        patterns: ["There is / There are...", "单复数区分"],
        drills: ["看图说数量", "听物品放进书包", "改错：There are a book"],
      }),
      createTextbookUnit({
        id: "g4a-u2",
        title: "My Home",
        theme: "房间与位置",
        target: "能说房间名称和物品位置。",
        words: [
          ["bedroom", "卧室", "My bedroom is small.", "bed + room。", "家居"],
          ["kitchen", "厨房", "Mum is in the kitchen.", "kit-chen。", "家居"],
          ["beside", "在……旁边", "The chair is beside the desk.", "be + side。", "方位"],
        ],
        patterns: ["Where is...? It is...", "方位介词 in / on / beside"],
        drills: ["听方位摆物品", "用 where 问答", "区分 in / on / under"],
      }),
    ],
  },
  {
    id: "g4b",
    grade: "四年级",
    semester: "下册",
    label: "四年级下册",
    note: "四年级原创同步包：时间、购物、农场。",
    units: [
      createTextbookUnit({
        id: "g4b-u1",
        title: "Time",
        theme: "时间与日程",
        target: "能听懂整点和半点，描述日常安排。",
        words: [
          ["o'clock", "……点钟", "It is seven o'clock.", "o'clock 有撇号。", "时间"],
          ["breakfast", "早餐", "I have breakfast at seven.", "break + fast。", "生活"],
          ["late", "迟到的", "Do not be late.", "a 读 /eɪ/。", "时间"],
        ],
        patterns: ["What time is it?", "at + 时间点"],
        drills: ["听时间选钟表", "安排一天日程", "补全 at seven"],
      }),
      createTextbookUnit({
        id: "g4b-u2",
        title: "Shopping",
        theme: "衣物与价格",
        target: "能询问价格和表达想买什么。",
        words: [
          ["price", "价格", "What is the price?", "price 里 i 读 /aɪ/。", "购物"],
          ["shirt", "衬衫", "This shirt is blue.", "sh 读 /ʃ/。", "衣物"],
          ["cheap", "便宜的", "The bag is cheap.", "ea 读 /iː/。", "形容"],
        ],
        patterns: ["How much is it?", "I want..."],
        drills: ["听价格选数字", "完成购物对话", "区分 cheap / expensive"],
      }),
    ],
  },
  {
    id: "g5a",
    grade: "五年级",
    semester: "上册",
    label: "五年级上册",
    note: "五年级原创同步包：人物、周计划、食物。",
    units: [
      createTextbookUnit({
        id: "g5a-u1",
        title: "People Around Us",
        theme: "人物外貌与性格",
        target: "能描述老师、同学和朋友。",
        words: [
          ["strict", "严格的", "Our teacher is strict.", "str 开头连读。", "人物"],
          ["kind", "友善的", "She is kind to us.", "i 读 /aɪ/。", "性格"],
          ["helpful", "乐于助人的", "He is helpful at home.", "help + ful。", "性格"],
        ],
        patterns: ["What is he/she like?", "be + 性格形容词"],
        drills: ["听描述选人物", "用两个形容词介绍老师", "判断 kind / strict 语境"],
      }),
      createTextbookUnit({
        id: "g5a-u2",
        title: "My Week",
        theme: "星期与活动",
        target: "能说一周安排和频率。",
        words: [
          ["weekend", "周末", "I read on the weekend.", "week + end。", "时间"],
          ["usually", "通常", "I usually play football.", "u-su-al-ly。", "频率"],
          ["schedule", "日程", "My schedule is full.", "sch 读 /sk/。", "学习"],
        ],
        patterns: ["What do you do on...?", "频率副词位置"],
        drills: ["听星期选活动", "制作一周计划", "改错：I play usually"],
      }),
    ],
  },
  {
    id: "g5b",
    grade: "五年级",
    semester: "下册",
    label: "五年级下册",
    note: "五年级原创同步包：季节、旅行、自然。",
    units: [
      createTextbookUnit({
        id: "g5b-u1",
        title: "Seasons",
        theme: "季节与活动",
        target: "能描述季节、天气和喜欢的活动。",
        words: [
          ["season", "季节", "Spring is my favourite season.", "sea-son 两拍。", "自然"],
          ["spring", "春天", "Trees are green in spring.", "spr 连读。", "季节"],
          ["because", "因为", "I like winter because I can skate.", "because 后给理由。", "连词"],
        ],
        patterns: ["Which season do you like?", "because 表原因"],
        drills: ["听天气选季节", "用 because 说理由", "匹配季节活动"],
      }),
      createTextbookUnit({
        id: "g5b-u2",
        title: "Travel Plans",
        theme: "旅行与地点",
        target: "能表达想去哪里和计划做什么。",
        words: [
          ["travel", "旅行", "We will travel by train.", "tra-vel。", "旅行"],
          ["museum", "博物馆", "I want to visit a museum.", "mu-se-um 三拍。", "地点"],
          ["plan", "计划", "Make a plan before the trip.", "pl 开头连读。", "计划"],
        ],
        patterns: ["be going to / will", "visit + 地点"],
        drills: ["听计划选城市", "写 3 句旅行计划", "区分 go to / visit"],
      }),
    ],
  },
  {
    id: "g6a",
    grade: "六年级",
    semester: "上册",
    label: "六年级上册",
    note: "六年级原创同步包：交通、爱好、职业。",
    units: [
      createTextbookUnit({
        id: "g6a-u1",
        title: "Transportation",
        theme: "交通方式与路线",
        target: "能描述如何去某地，并理解路线指令。",
        words: [
          ["subway", "地铁", "I go to school by subway.", "sub + way。", "交通"],
          ["crossing", "十字路口", "Turn left at the crossing.", "cross + ing。", "路线"],
          ["straight", "笔直地", "Go straight for two minutes.", "gh 不发音。", "方位"],
        ],
        patterns: ["How do you get to...?", "祈使句路线指令"],
        drills: ["听路线选地图", "说 2 种上学方式", "区分 by bus / take a bus"],
      }),
      createTextbookUnit({
        id: "g6a-u2",
        title: "Hobbies",
        theme: "爱好与社团",
        target: "能介绍爱好、频率和原因。",
        words: [
          ["hobby", "爱好", "My hobby is drawing.", "hob-by。", "兴趣"],
          ["collect", "收集", "I collect postcards.", "col-lect 重音在后。", "兴趣"],
          ["share", "分享", "We share ideas in the club.", "sh 读 /ʃ/。", "社交"],
        ],
        patterns: ["like doing / My hobby is...", "第三人称单数"],
        drills: ["听爱好选人物", "用 like doing 造句", "改错：He like swimming"],
      }),
    ],
  },
  {
    id: "g6b",
    grade: "六年级",
    semester: "下册",
    label: "六年级下册",
    note: "六年级原创同步包：过去经历、小升初复习、毕业表达。",
    units: [
      createTextbookUnit({
        id: "g6b-u1",
        title: "Past Events",
        theme: "过去经历",
        target: "能用一般过去时描述上周或假期。",
        words: [
          ["visited", "参观了", "We visited a farm last week.", "visit + ed。", "过去"],
          ["stayed", "待着", "I stayed at home.", "stay + ed。", "过去"],
          ["yesterday", "昨天", "It rained yesterday.", "yes-ter-day。", "时间"],
        ],
        patterns: ["一般过去时 -ed", "last / yesterday 时间标志"],
        drills: ["听过去活动选图片", "把 go 改成 went", "写 3 句周末经历"],
      }),
      createTextbookUnit({
        id: "g6b-u2",
        title: "Graduation",
        theme: "毕业与未来",
        target: "能表达感谢、回忆和计划。",
        words: [
          ["graduate", "毕业", "We will graduate in June.", "gra-du-ate。", "学校"],
          ["memory", "回忆", "This photo is a good memory.", "mem-o-ry。", "情感"],
          ["future", "未来", "I want to study hard in the future.", "fu-ture。", "计划"],
        ],
        patterns: ["will 表未来", "thank sb. for..."],
        drills: ["完成感谢句", "听未来计划选答案", "写一句毕业留言"],
      }),
    ],
  },
  {
    id: "g7a",
    grade: "七年级",
    semester: "上册",
    label: "七年级上册",
    note: "七上按人教社新版单元名对齐；题目为原创同步训练，不复制课文原文。",
    units: [
      createTextbookUnit({
        id: "g7a-u1",
        title: "Unit 1 You and Me",
        theme: "自我介绍与同伴关系",
        target: "能介绍姓名、班级、爱好，并听懂同伴信息。",
        words: [
          ["classmate", "同班同学", "This is my new classmate.", "class + mate。", "校园"],
          ["introduce", "介绍", "Let me introduce myself.", "in-tro-duce，重音在后。", "表达"],
          ["hobby", "爱好", "My hobby is reading.", "hob-by 两拍。", "兴趣"],
          ["together", "一起", "We study English together.", "to-ge-ther。", "关系"],
        ],
        patterns: ["be 动词与主语一致", "介绍姓名、年龄、班级和爱好"],
        drills: ["听 4 条个人信息并匹配人物", "用 My hobby is... 造 3 句", "改错：He are my classmate"],
      }),
      createTextbookUnit({
        id: "g7a-u2",
        title: "Unit 2 We're Family!",
        theme: "家庭成员与人物关系",
        target: "能介绍家庭成员、关系和基本性格。",
        words: [
          ["family", "家庭", "We are a happy family.", "fa-mi-ly 三拍。", "家庭"],
          ["cousin", "堂/表兄弟姐妹", "My cousin is twelve.", "cou-sin，s 读 /z/。", "家庭"],
          ["photo", "照片", "Look at this family photo.", "ph 读 /f/。", "家庭"],
          ["parent", "父亲或母亲", "A parent can help a child.", "pa-rent。", "家庭"],
        ],
        patterns: ["形容词性物主代词 my / your / his / her", "This is... / These are..."],
        drills: ["看家庭树选关系", "听人物介绍填 his/her", "用 This is... 介绍照片"],
      }),
      createTextbookUnit({
        id: "g7a-u3",
        title: "Unit 3 My School",
        theme: "校园空间与设施",
        target: "能描述学校地点、设施和位置。",
        words: [
          ["classroom", "教室", "Our classroom is bright.", "class + room。", "校园"],
          ["library", "图书馆", "The library is next to the lab.", "li-bra-ry。", "校园"],
          ["playground", "操场", "We run on the playground.", "play + ground。", "校园"],
          ["building", "建筑物", "The building has four floors.", "build + ing。", "地点"],
        ],
        patterns: ["There is / There are...", "方位介词 next to / between / behind"],
        drills: ["听校园地图选位置", "用 there be 描述 3 个地点", "改错：There are a library"],
      }),
      createTextbookUnit({
        id: "g7a-u4",
        title: "Unit 4 My Favourite Subject",
        theme: "学科、喜好与理由",
        target: "能表达喜欢的学科并给出理由。",
        words: [
          ["subject", "学科", "English is my favourite subject.", "sub-ject。", "学校"],
          ["history", "历史", "History stories are interesting.", "his-to-ry。", "学科"],
          ["reason", "理由", "Give me one reason.", "rea-son。", "表达"],
          ["because", "因为", "I like science because it is useful.", "because 后给理由。", "连词"],
        ],
        patterns: ["What is your favourite...?", "because 表原因"],
        drills: ["听课程表回答问题", "用 because 写 3 个理由", "区分 subject / lesson"],
      }),
      createTextbookUnit({
        id: "g7a-u5",
        title: "Unit 5 Fun Clubs",
        theme: "社团、能力与活动",
        target: "能谈论社团和 can 表能力。",
        words: [
          ["club", "社团", "I want to join the music club.", "cl 开头连读。", "校园"],
          ["join", "加入", "Can I join your team?", "oi 读 /ɔɪ/。", "动作"],
          ["activity", "活动", "The club has many activities.", "ac-ti-vi-ty。", "活动"],
          ["skill", "技能", "Speaking is an important skill.", "sk 开头连读。", "能力"],
        ],
        patterns: ["can / can't 表能力", "want to do"],
        drills: ["听社团广告选活动", "用 can 写能力清单", "模拟社团报名小对话"],
      }),
      createTextbookUnit({
        id: "g7a-u6",
        title: "Unit 6 A Day in the Life",
        theme: "日常作息与频率",
        target: "能描述一天安排、时间和频率。",
        words: [
          ["routine", "日常安排", "My morning routine is simple.", "rou-tine。", "生活"],
          ["usually", "通常", "I usually get up at seven.", "u-su-al-ly。", "频率"],
          ["breakfast", "早餐", "I have breakfast at home.", "break + fast。", "生活"],
          ["finish", "完成", "I finish homework before dinner.", "fi-nish。", "动作"],
        ],
        patterns: ["一般现在时", "频率副词 always / usually / sometimes"],
        drills: ["听作息表填时间", "把 I 改成 he/she", "整理自己的 weekday routine"],
      }),
      createTextbookUnit({
        id: "g7a-u7",
        title: "Unit 7 Happy Birthday!",
        theme: "生日、日期和邀请",
        target: "能询问日期、表达生日和邀请。",
        words: [
          ["birthday", "生日", "My birthday is in May.", "birth + day。", "日期"],
          ["month", "月份", "January is the first month.", "th 轻咬舌。", "日期"],
          ["party", "聚会", "We have a birthday party.", "par-ty。", "活动"],
          ["invite", "邀请", "I want to invite my friends.", "in-vite。", "社交"],
        ],
        patterns: ["When is your birthday?", "序数词 first / second / third"],
        drills: ["听日期选月份", "写生日邀请句", "区分 in May / on May 2nd"],
      }),
    ],
  },
  {
    id: "g7b",
    grade: "七年级",
    semester: "下册",
    label: "七年级下册",
    note: "七下原创同步包：能力、作息、出行、规则。",
    units: [
      createTextbookUnit({
        id: "g7b-u1",
        title: "Abilities and Clubs",
        theme: "能力与社团",
        target: "能用 can 谈论能力和社团选择。",
        words: [
          ["guitar", "吉他", "She can play the guitar.", "gui-tar。", "音乐"],
          ["dance", "跳舞", "Can you dance?", "a 读 /ɑː/。", "能力"],
          ["join", "加入", "I want to join the art club.", "oi 读 /ɔɪ/。", "动作"],
        ],
        patterns: ["Can you...? Yes, I can.", "play + the + 乐器"],
        drills: ["听能力选社团", "完成 can 问答", "写一个社团申请句"],
      }),
      createTextbookUnit({
        id: "g7b-u2",
        title: "Daily Routines",
        theme: "作息与频率",
        target: "能描述一天安排和时间顺序。",
        words: [
          ["brush", "刷", "I brush my teeth at seven.", "br 开头连读。", "生活"],
          ["exercise", "锻炼", "My father exercises every day.", "ex-er-cise。", "健康"],
          ["quarter", "一刻钟", "It is a quarter past six.", "qu 读 /kw/。", "时间"],
        ],
        patterns: ["What time do you...?", "时间表达 past / to"],
        drills: ["听时间选活动", "排序 morning routine", "改错：He go to school"],
      }),
      createTextbookUnit({
        id: "g7b-u3",
        title: "Getting Around",
        theme: "交通方式与距离",
        target: "能说明如何到校和花多长时间。",
        words: [
          ["kilometer", "千米", "It is two kilometers from my home.", "ki-lo-me-ter。", "距离"],
          ["ride", "骑", "I ride a bike to school.", "i 读 /aɪ/。", "交通"],
          ["minute", "分钟", "It takes ten minutes.", "mi-nute。", "时间"],
        ],
        patterns: ["How do you get to...?", "It takes..."],
        drills: ["听交通方式选人物", "计算距离与时间", "区分 by bike / ride a bike"],
      }),
    ],
  },
  {
    id: "g8a",
    grade: "八年级",
    semester: "上册",
    label: "八年级上册",
    note: "八上原创同步包：假期、习惯、比较、未来。",
    units: [
      createTextbookUnit({
        id: "g8a-u1",
        title: "Vacation and Experience",
        theme: "假期经历",
        target: "能用一般过去时描述旅行和活动。",
        words: [
          ["vacation", "假期", "I went to Beijing on vacation.", "va-ca-tion。", "旅行"],
          ["wonderful", "精彩的", "The trip was wonderful.", "won-der-ful。", "形容"],
          ["decide", "决定", "We decided to visit a museum.", "de-cide。", "动词"],
        ],
        patterns: ["一般过去时", "anything / something"],
        drills: ["听假期经历选地点", "把动词改过去式", "写 4 句 vacation diary"],
      }),
      createTextbookUnit({
        id: "g8a-u2",
        title: "Habits and Health",
        theme: "频率与健康习惯",
        target: "能谈论频率、健康习惯和建议。",
        words: [
          ["hardly", "几乎不", "He hardly ever eats junk food.", "hard + ly。", "频率"],
          ["healthy", "健康的", "Vegetables are healthy.", "health + y。", "健康"],
          ["result", "结果", "The survey result is clear.", "re-sult。", "调查"],
        ],
        patterns: ["How often...?", "频率副词排序"],
        drills: ["听调查结果填频率", "做健康习惯问卷", "区分 always / hardly ever"],
      }),
      createTextbookUnit({
        id: "g8a-u3",
        title: "Comparisons",
        theme: "人物比较",
        target: "能用比较级描述相同与不同。",
        words: [
          ["outgoing", "外向的", "Tina is more outgoing.", "out + going。", "性格"],
          ["better", "更好的", "He is better at math.", "good 的比较级。", "比较"],
          ["similar", "相似的", "The two answers are similar.", "si-mi-lar。", "比较"],
        ],
        patterns: ["形容词比较级", "as...as..."],
        drills: ["听比较选人物", "改写比较级句子", "写自己和朋友的 3 点不同"],
      }),
    ],
  },
  {
    id: "g8b",
    grade: "八年级",
    semester: "下册",
    label: "八年级下册",
    note: "八下原创同步包：经历、故事、志愿服务、自然。",
    units: [
      createTextbookUnit({
        id: "g8b-u1",
        title: "Health and Advice",
        theme: "健康问题与建议",
        target: "能描述不适并给出建议。",
        words: [
          ["stomachache", "胃痛", "He has a stomachache.", "stomach + ache。", "健康"],
          ["fever", "发烧", "She has a fever.", "fe-ver。", "健康"],
          ["advice", "建议", "Can you give me some advice?", "ad-vice 不可数。", "建议"],
        ],
        patterns: ["have a/an + 症状", "should / shouldn't"],
        drills: ["听症状选建议", "补全 doctor 对话", "区分 advice / advise"],
      }),
      createTextbookUnit({
        id: "g8b-u2",
        title: "Volunteering",
        theme: "志愿服务",
        target: "能描述帮助他人的计划和意义。",
        words: [
          ["volunteer", "志愿者", "I want to be a volunteer.", "vo-lun-teer。", "公益"],
          ["raise", "筹集", "They raise money for children.", "ai 读 /eɪ/。", "公益"],
          ["lonely", "孤独的", "We visited lonely old people.", "lone + ly。", "情感"],
        ],
        patterns: ["动词不定式 to do", "help sb. do"],
        drills: ["听志愿活动选地点", "写 3 条 volunteer plan", "区分 alone / lonely"],
      }),
      createTextbookUnit({
        id: "g8b-u3",
        title: "Stories and Events",
        theme: "故事与过去进行时",
        target: "能讲述事件发生时正在做什么。",
        words: [
          ["suddenly", "突然", "Suddenly, it began to rain.", "sud-den-ly。", "故事"],
          ["while", "当……时候", "I was reading while he was cooking.", "wh 读 /w/。", "连词"],
          ["strange", "奇怪的", "A strange sound came from the room.", "str 开头连读。", "形容"],
        ],
        patterns: ["过去进行时 was/were doing", "when / while"],
        drills: ["听故事排序", "用 was doing 造句", "区分 when / while"],
      }),
    ],
  },
  {
    id: "g9a",
    grade: "九年级",
    semester: "上册",
    label: "九年级上册",
    note: "九上原创同步包：学习方法、节日、发明与规则。",
    units: [
      createTextbookUnit({
        id: "g9a-u1",
        title: "Learning How to Learn",
        theme: "学习策略",
        target: "能谈论英语学习方法和困难。",
        words: [
          ["pronunciation", "发音", "Good pronunciation helps listening.", "pro-nun-ci-a-tion。", "学习"],
          ["grammar", "语法", "Grammar rules can help writing.", "gram-mar。", "学习"],
          ["review", "复习", "Review words every day.", "re-view。", "学习"],
        ],
        patterns: ["by doing 表方式", "how to do"],
        drills: ["听学习建议选方法", "用 by doing 写 4 句", "整理错词复习计划"],
      }),
      createTextbookUnit({
        id: "g9a-u2",
        title: "Festivals and Culture",
        theme: "节日与文化",
        target: "能介绍节日活动、传统和感受。",
        words: [
          ["festival", "节日", "The Spring Festival is important.", "fes-ti-val。", "文化"],
          ["relative", "亲戚", "We visit relatives.", "re-la-tive。", "家庭"],
          ["tradition", "传统", "This tradition is old.", "tra-di-tion。", "文化"],
        ],
        patterns: ["宾语从句 that / if / whether", "感叹句"],
        drills: ["听节日活动选答案", "写一个 festival card", "判断宾语从句语序"],
      }),
      createTextbookUnit({
        id: "g9a-u3",
        title: "Inventions",
        theme: "发明与科技",
        target: "能描述发明用途和被动语态。",
        words: [
          ["invent", "发明", "People invented paper long ago.", "in-vent。", "科技"],
          ["useful", "有用的", "The phone is useful.", "use + ful。", "形容"],
          ["material", "材料", "The cup is made of paper.", "ma-te-ri-al。", "科技"],
        ],
        patterns: ["被动语态 be done", "be made of / from"],
        drills: ["听发明年代选物品", "主动句改被动句", "说明一个 useful invention"],
      }),
    ],
  },
  {
    id: "g9b",
    grade: "九年级",
    semester: "下册",
    label: "九年级下册",
    note: "九下原创同步包：考前综合、环境、毕业与复习。",
    units: [
      createTextbookUnit({
        id: "g9b-u1",
        title: "Exam Review Sprint",
        theme: "中考综合复习",
        target: "综合复习词汇、阅读、听力和写作句型。",
        words: [
          ["achievement", "成就", "Hard work brings achievement.", "achieve + ment。", "学业"],
          ["challenge", "挑战", "This exam is a challenge.", "chal-lenge。", "学业"],
          ["confidence", "信心", "Practice builds confidence.", "con-fi-dence。", "表达"],
        ],
        patterns: ["时态综合", "阅读定位与同义替换"],
        drills: ["做 8 题限时模拟", "整理错题同义表达", "写一段考前目标"],
      }),
      createTextbookUnit({
        id: "g9b-u2",
        title: "Environment",
        theme: "环境保护",
        target: "能讨论环保问题、原因和行动。",
        words: [
          ["environment", "环境", "We should protect the environment.", "en-vi-ron-ment。", "环保"],
          ["pollution", "污染", "Air pollution is serious.", "pol-lu-tion。", "环保"],
          ["recycle", "回收", "We recycle paper and bottles.", "re-cy-cle。", "行动"],
        ],
        patterns: ["should / must 表建议和义务", "cause and effect"],
        drills: ["听环保倡议选行动", "用 should 写建议", "匹配 cause / result"],
      }),
    ],
  },
];

const listeningDrills = [
  {
    title: "关键词",
    sentence: "I usually finish my homework before dinner.",
    cn: "我通常在晚饭前完成作业。",
    focus: "usually / before",
  },
  {
    title: "易混音",
    sentence: "The island is quiet in the morning.",
    cn: "这座岛早晨很安静。",
    focus: "island 的 s 不发音，quiet 不是 quite",
  },
  {
    title: "七年级句型",
    sentence: "Although English is difficult, I can improve it step by step.",
    cn: "虽然英语很难，但我可以一步步提高。",
    focus: "although 引导让步",
  },
  {
    title: "考试高频",
    sentence: "Reading aloud helps me remember new words.",
    cn: "大声朗读帮助我记住新单词。",
    focus: "reading aloud / remember",
  },
];

const readingPassages = [
  {
    title: "A Better Way to Remember Words",
    text: "Many students try to remember English words by reading a word list again and again. It may work for a short time, but they often forget the words later. A better way is to use the words in short sentences. When you hear, read, and say the same word in different sentences, your brain can keep it longer.",
    questions: [
      {
        q: "What is the better way to remember words?",
        choices: ["Use words in sentences", "Only copy word lists", "Never read aloud", "Study once a month"],
        answer: "Use words in sentences",
      },
      {
        q: "What three actions does the passage mention?",
        choices: ["Hear, read, and say", "Run, jump, and swim", "Buy, sell, and lend", "Draw, cut, and paint"],
        answer: "Hear, read, and say",
      },
    ],
  },
  {
    title: "Why Pronunciation Matters",
    text: "Good pronunciation is not about sounding exactly like a native speaker. It is about being clear. If a student cannot hear the difference between ship and sheep, reading and listening both become harder. Slow shadow reading can help. Listen to one sentence, pause, and then say it with the same rhythm.",
    questions: [
      {
        q: "What is good pronunciation mainly about?",
        choices: ["Being clear", "Speaking very fast", "Using long words", "Never making mistakes"],
        answer: "Being clear",
      },
      {
        q: "What can help pronunciation?",
        choices: ["Slow shadow reading", "Skipping listening", "Only translating", "Writing Chinese notes"],
        answer: "Slow shadow reading",
      },
    ],
  },
];

const phonicsGroups = [
  {
    pattern: "gh",
    rule: "gh 有三种常见情况：/f/、不发音、和前面的元音一起变音。",
    examples: ["laugh", "enough", "through", "thought"],
    tip: "先按家族背：laugh/enough 读 /f/；through/thought 里 gh 不单独读。",
  },
  {
    pattern: "silent letters",
    rule: "有些字母写出来只是历史痕迹，读的时候要放过它。",
    examples: ["island", "listen", "climb", "knowledge"],
    tip: "给不发音字母画一条浅横线，再读三遍整词，不要逐字母硬拼。",
  },
  {
    pattern: "ear / air / ere",
    rule: "这些组合看着像，嘴型和音长不同，最容易听混。",
    examples: ["hear", "heart", "wear", "there"],
    tip: "hear 是 /hɪr/，heart 是 /hɑːrt/；先听最小差异，再放进句子。",
  },
  {
    pattern: "ough",
    rule: "ough 是英语里很任性的组合，不能只靠自然拼读硬猜。",
    examples: ["though", "through", "thought", "bought"],
    tip: "把 though-through-thought-bought 做成四连读，一口气背家族。",
  },
  {
    pattern: "ea",
    rule: "ea 不总是 /iː/，同一组合会出现不同读音。",
    examples: ["read", "bread", "great", "learn"],
    tip: "用例句记：bread 和 breakfast 一起背，great 单独归组。",
  },
  {
    pattern: "r-controlled",
    rule: "元音碰到 r 会变形，中国学生常把 r 吞掉或读太硬。",
    examples: ["world", "work", "early", "foreign"],
    tip: "先把舌头收住，不卷得太夸张；world 练 /wɜːrld/。",
  },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultMemory(): LearningMemory {
  const defaultBook = textbookCatalog.find((book) => book.id === "g7a") ?? textbookCatalog[0];
  const defaultUnit = defaultBook.units[0];

  return {
    assessment: null,
    completed: { date: getTodayKey(), modules: {} },
    knownWords: {},
    reviewWords: {},
    wrongItems: [],
    shadowCounts: {},
    readingAnswers: {},
    phonicsDone: {},
    targetStats: { score: 0, rounds: 0, streak: 0, bestStreak: 0 },
    textbook: {
      bookId: defaultBook.id,
      unitId: defaultUnit.id,
      doneUnits: {},
      answers: {},
      examScores: {},
      wordStats: {},
      scan: {
        mode: "sequence",
        currentKey: `${defaultBook.id}:${defaultUnit.id}:${defaultUnit.words[0][0]}`,
        rounds: 0,
        streak: 0,
        bestStreak: 0,
        lastFeedback: "从第一个词开始扫漏洞，答错会自动进入弱词池。",
      },
      spellingRecords: {},
      spelling: {
        mode: "cloze",
        currentKey: `${defaultBook.id}:${defaultUnit.id}:${defaultUnit.words[0][0]}`,
        rounds: 0,
        correct: 0,
        wrong: 0,
        lastFeedback: "缺字母、听写和拍照查错都要写出完整单词才算会。",
      },
    },
    voiceURI: "",
    rate: 0.78,
  };
}

function normalizeMemory(input: Partial<LearningMemory> | null): LearningMemory {
  const base = createDefaultMemory();
  const merged = {
    ...base,
    ...input,
    completed: {
      date: input?.completed?.date ?? base.completed.date,
      modules: input?.completed?.modules ?? {},
    },
    knownWords: input?.knownWords ?? {},
    reviewWords: input?.reviewWords ?? {},
    wrongItems: input?.wrongItems ?? [],
    shadowCounts: input?.shadowCounts ?? {},
    readingAnswers: input?.readingAnswers ?? {},
    phonicsDone: input?.phonicsDone ?? {},
    targetStats: {
      ...base.targetStats,
      ...(input?.targetStats ?? {}),
    },
    textbook: {
      ...base.textbook,
      ...(input?.textbook ?? {}),
      doneUnits: input?.textbook?.doneUnits ?? {},
      answers: input?.textbook?.answers ?? {},
      examScores: input?.textbook?.examScores ?? {},
      wordStats: input?.textbook?.wordStats ?? {},
      scan: {
        ...base.textbook.scan,
        ...(input?.textbook?.scan ?? {}),
      },
      spellingRecords: input?.textbook?.spellingRecords ?? {},
      spelling: {
        ...base.textbook.spelling,
        ...(input?.textbook?.spelling ?? {}),
      },
    },
    voiceURI: input?.voiceURI ?? "",
    rate: input?.rate ?? 0.78,
  };

  const book = textbookCatalog.find((item) => item.id === merged.textbook.bookId) ?? textbookCatalog[0];
  const unit = book.units.find((item) => item.id === merged.textbook.unitId) ?? book.units[0];
  merged.textbook.bookId = book.id;
  merged.textbook.unitId = unit.id;
  const bookWords = getTextbookWordItems(book);
  if (!bookWords.some((item) => item.key === merged.textbook.scan.currentKey)) {
    merged.textbook.scan.currentKey = bookWords[0]?.key ?? "";
  }
  if (!bookWords.some((item) => item.key === merged.textbook.spelling.currentKey)) {
    merged.textbook.spelling.currentKey = bookWords[0]?.key ?? "";
  }
  if (!["cloze", "dictation", "photo"].includes(merged.textbook.spelling.mode)) {
    merged.textbook.spelling.mode = "cloze";
  }

  if (merged.completed.date !== getTodayKey()) {
    merged.completed = { date: getTodayKey(), modules: {} };
  }

  return merged;
}

function estimateLevel(score: number): LevelId {
  const ratio = score / diagnosticQuestions.length;
  if (ratio < 0.35) return "starter";
  if (ratio < 0.62) return "foundation";
  if (ratio < 0.84) return "bridge";
  return "boost";
}

function getRecommendedVoices(voices: SpeechSynthesisVoice[]) {
  const isEnglish = (voice: SpeechSynthesisVoice) => voice.lang.toLowerCase().startsWith("en");
  const namedVoices = voices.filter(
    (voice) => isEnglish(voice) && /\b(Daniel|Karen|Moira|Samantha|Tessa)\b/i.test(voice.name),
  );
  const googleVoices = voices
    .filter((voice) => isEnglish(voice) && /google/i.test(voice.name))
    .slice(0, 3);

  return [...namedVoices, ...googleVoices].filter(
    (voice, index, list) => list.findIndex((item) => item.voiceURI === voice.voiceURI) === index,
  );
}

function chooseBestVoice(voices: SpeechSynthesisVoice[], savedURI: string) {
  const recommendedVoices = getRecommendedVoices(voices);
  const saved = recommendedVoices.find((voice) => voice.voiceURI === savedURI);
  if (saved) return saved;

  return recommendedVoices[0];
}

function getTargetOptions(deck: WordEntry[], targetIndex: number, rounds: number) {
  const indexes = [targetIndex];
  for (let offset = 1; indexes.length < 3 && offset < deck.length; offset += 1) {
    const nextIndex = (targetIndex + offset * 2) % deck.length;
    if (!indexes.includes(nextIndex)) {
      indexes.push(nextIndex);
    }
  }

  const rotation = rounds % indexes.length;
  return [...indexes.slice(rotation), ...indexes.slice(0, rotation)];
}

function formatSavedTime(date: Date | null) {
  if (!date) return "等待保存";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("照片读取失败。"));
    reader.readAsDataURL(file);
  });
}

async function resizeImageForOcr(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("请上传照片或图片。");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = document.createElement("img");
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("照片打开失败。"));
    nextImage.src = dataUrl;
  });
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d");
  if (!context) return dataUrl;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.84);
}

export default function EnglishLearningExperience() {
  const [activeTab, setActiveTab] = useState("diagnostic");
  const [memory, setMemory] = useState<LearningMemory>(() => createDefaultMemory());
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [feedback, setFeedback] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [spellingValue, setSpellingValue] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechNotice, setSpeechNotice] = useState("正在读取英文语音");
  const [targetFeedback, setTargetFeedback] = useState("先听单词，再点中对应的中文靶心。");
  const [textbookSpellingValue, setTextbookSpellingValue] = useState("");
  const [textbookOcrBusy, setTextbookOcrBusy] = useState(false);
  const [textbookOcrMessage, setTextbookOcrMessage] = useState("");
  const [textbookPhotoPreview, setTextbookPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textbookPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(false);

  const levelId = memory.assessment?.level ?? "foundation";
  const level = levels[levelId];
  const completedCount = Object.values(memory.completed.modules).filter(Boolean).length;
  const knownCount = Object.keys(memory.knownWords).length;
  const reviewCount = Object.keys(memory.reviewWords).filter((word) => memory.reviewWords[word]).length;
  const shadowTotal = Object.values(memory.shadowCounts).reduce((sum, count) => sum + count, 0);
  const availableVoices = useMemo(() => getRecommendedVoices(voices), [voices]);
  const selectedVoice = useMemo(
    () => chooseBestVoice(voices, memory.voiceURI),
    [voices, memory.voiceURI],
  );
  const targetDeck = wordDecks[levelId];
  const targetIndex = memory.targetStats.rounds % targetDeck.length;
  const targetOptions = useMemo(
    () => getTargetOptions(targetDeck, targetIndex, memory.targetStats.rounds),
    [memory.targetStats.rounds, targetDeck, targetIndex],
  );
  const targetAccuracy = memory.targetStats.rounds
    ? Math.round((memory.targetStats.score / memory.targetStats.rounds) * 100)
    : 0;
  const selectedBook =
    textbookCatalog.find((book) => book.id === memory.textbook.bookId) ??
    textbookCatalog.find((book) => book.id === "g7a") ??
    textbookCatalog[0];
  const selectedUnit =
    selectedBook.units.find((unit) => unit.id === memory.textbook.unitId) ?? selectedBook.units[0];
  const textbookAnswerKeys = selectedUnit.exam.map((_, index) => `${selectedUnit.id}:${index}`);
  const textbookAnsweredCount = textbookAnswerKeys.filter((key) => key in memory.textbook.answers).length;
  const textbookCorrectCount = selectedUnit.exam.filter(
    (question, index) => memory.textbook.answers[`${selectedUnit.id}:${index}`] === question.answer,
  ).length;
  const latestTextbookScore = memory.textbook.examScores[selectedUnit.id];
  const textbookWords = useMemo(() => getTextbookWordItems(selectedBook), [selectedBook]);
  const textbookMasteredCount = textbookWords.filter((item) =>
    isMasteredTextbookWord(memory.textbook.wordStats[item.key]),
  ).length;
  const textbookWeakWords = textbookWords.filter((item) => isWeakTextbookWord(memory.textbook.wordStats[item.key]));
  const textbookMasteryPercent = textbookWords.length
    ? Math.round((textbookMasteredCount / textbookWords.length) * 100)
    : 0;
  const currentTextbookWord =
    textbookWords.find((item) => item.key === memory.textbook.scan.currentKey) ?? textbookWords[0];
  const currentTextbookWordStat = currentTextbookWord
    ? memory.textbook.wordStats[currentTextbookWord.key]
    : undefined;
  const textbookScanOptions = useMemo(
    () => getTextbookMeaningOptions(textbookWords, currentTextbookWord?.key ?? "", memory.textbook.scan.rounds),
    [currentTextbookWord?.key, memory.textbook.scan.rounds, textbookWords],
  );
  const currentSpellingWord =
    textbookWords.find((item) => item.key === memory.textbook.spelling.currentKey) ??
    currentTextbookWord ??
    textbookWords[0];
  const currentSpellingWordStat = currentSpellingWord
    ? memory.textbook.wordStats[currentSpellingWord.key]
    : undefined;
  const currentSpellingRecord = currentSpellingWord
    ? memory.textbook.spellingRecords[currentSpellingWord.key]
    : undefined;
  const maskedSpellingWord = currentSpellingWord ? maskTextbookWord(currentSpellingWord.word) : "";
  const spellingAccuracy = memory.textbook.spelling.rounds
    ? Math.round((memory.textbook.spelling.correct / memory.textbook.spelling.rounds) * 100)
    : 0;

  useEffect(() => {
    mountedRef.current = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMemory(normalizeMemory(JSON.parse(saved) as Partial<LearningMemory>));
      }
    } catch {
      setMemory(createDefaultMemory());
    }

    localStorage.removeItem(memberStorageKey);

    const loadVoices = () => {
      if (!("speechSynthesis" in window)) {
        setSpeechNotice("当前浏览器没有朗读引擎");
        return;
      }

      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);
      const best = chooseBestVoice(nextVoices, "");
      if (best) {
        setSpeechNotice(`当前语音：${best.name}`);
        setMemory((current) => {
          const currentBest = chooseBestVoice(nextVoices, current.voiceURI);
          if (!currentBest || current.voiceURI === currentBest.voiceURI) return current;
          return { ...current, voiceURI: currentBest.voiceURI };
        });
      } else {
        setSpeechNotice("未找到 Daniel/Karen/Moira/Samantha/Tessa 或 Google 英文语音");
      }
    };

    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    localStorage.setItem(storageKey, JSON.stringify(memory));
    setSavedAt(new Date());
  }, [memory]);

  useEffect(() => {
    setTextbookSpellingValue("");
    setTextbookOcrMessage("");
    setTextbookPhotoPreview("");
  }, [memory.textbook.spelling.currentKey, memory.textbook.spelling.mode]);

  async function requestJson<T>(url: string, init: RequestInit = {}) {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    const payload = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "请求失败。");
    }

    return payload;
  }

  function patchMemory(updater: (current: LearningMemory) => LearningMemory) {
    setMemory((current) => normalizeMemory(updater(current)));
  }

  function speak(text: string, rateOverride?: number) {
    if (!("speechSynthesis" in window)) {
      setSpeechNotice("当前浏览器没有朗读引擎");
      return;
    }

    const voice = chooseBestVoice(voices, memory.voiceURI);
    if (!voice) {
      setSpeechNotice("未找到推荐英文语音，先在系统或浏览器里安装 Daniel/Karen/Moira/Samantha/Tessa 或 Google 英文语音。");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-US";
    setSpeechNotice(`当前语音：${voice.name}`);
    utterance.rate = rateOverride ?? memory.rate;
    utterance.pitch = 0.98;
    utterance.volume = 0.96;
    utterance.onerror = () => setSpeechNotice("这个声音播不出来，换一个英文声音试试");
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function startAssessment() {
    setQuestionIndex(0);
    setSessionAnswers([]);
    setFeedback("");
    setSelectedChoice("");
    setSpellingValue("");
    patchMemory((current) => ({ ...current, assessment: null }));
  }

  function recordAnswer(chosen: string) {
    if (feedback) return;
    const question = diagnosticQuestions[questionIndex];
    const isCorrect = chosen.trim().toLowerCase() === question.answer.toLowerCase();
    setSelectedChoice(chosen);
    setFeedback(`${isCorrect ? "答对了。" : `正确答案：${question.answer}。`} ${question.explain}`);
    setSessionAnswers((answers) => [
      ...answers,
      {
        prompt: question.prompt,
        chosen,
        answer: question.answer,
        type: question.type,
        isCorrect,
      },
    ]);

    window.setTimeout(() => {
      setFeedback("");
      setSelectedChoice("");
      setSpellingValue("");
      setQuestionIndex((index) => {
        const nextIndex = index + 1;
        if (nextIndex >= diagnosticQuestions.length) {
          finishAssessment([
            ...sessionAnswers,
            {
              prompt: question.prompt,
              chosen,
              answer: question.answer,
              type: question.type,
              isCorrect,
            },
          ]);
          return 0;
        }
        return nextIndex;
      });
    }, 780);
  }

  function finishAssessment(answers: SessionAnswer[]) {
    const score = answers.filter((item) => item.isCorrect).length;
    const nextLevel = estimateLevel(score);
    const missed = answers.filter((item) => !item.isCorrect);
    const note = missed.length
      ? `先回炉：${missed.slice(0, 4).map((item) => item.answer).join("、")}。`
      : "基础很稳，可以把训练重心放到阅读速度、复述和更长表达。";

    patchMemory((current) => {
      const wrongMap = new Map(current.wrongItems.map((item) => [item.id, item]));
      missed.forEach((item) => {
        const id = `${item.type}:${item.answer}`;
        const previous = wrongMap.get(id);
        wrongMap.set(id, {
          id,
          prompt: item.prompt,
          answer: item.answer,
          chosen: item.chosen,
          type: item.type,
          date: new Date().toISOString(),
          times: (previous?.times ?? 0) + 1,
        });
      });

      return {
        ...current,
        assessment: {
          score,
          level: nextLevel,
          note,
          date: new Date().toISOString(),
        },
        wrongItems: Array.from(wrongMap.values()),
      };
    });
    setSessionAnswers([]);
  }

  function markModule(module: ModuleKey) {
    patchMemory((current) => ({
      ...current,
      completed: {
        date: getTodayKey(),
        modules: {
          ...current.completed.modules,
          [module]: true,
        },
      },
    }));
  }

  function resetToday() {
    patchMemory((current) => ({
      ...current,
      completed: { date: getTodayKey(), modules: {} },
      shadowCounts: {},
    }));
  }

  function markWord(word: string, meaning: string, known: boolean) {
    patchMemory((current) => {
      const nextKnown = { ...current.knownWords };
      const nextReview = { ...current.reviewWords };
      if (known) {
        nextKnown[word] = {
          word,
          meaning,
          learnedAt: new Date().toISOString(),
          count: (nextKnown[word]?.count ?? 0) + 1,
        };
        delete nextReview[word];
      } else {
        nextReview[word] = true;
      }

      return {
        ...current,
        knownWords: nextKnown,
        reviewWords: nextReview,
        completed: known
          ? {
              date: getTodayKey(),
              modules: { ...current.completed.modules, words: true },
            }
          : current.completed,
      };
    });
  }

  function answerTarget(optionIndex: number) {
    const [word, meaning, sample] = targetDeck[targetIndex];
    const [, chosenMeaning] = targetDeck[optionIndex];
    const isCorrect = chosenMeaning === meaning;

    patchMemory((current) => {
      const nextKnown = { ...current.knownWords };
      const nextReview = { ...current.reviewWords };
      const nextStats: TargetStats = {
        score: current.targetStats.score + (isCorrect ? 1 : 0),
        rounds: current.targetStats.rounds + 1,
        streak: isCorrect ? current.targetStats.streak + 1 : 0,
        bestStreak: current.targetStats.bestStreak,
      };
      nextStats.bestStreak = Math.max(nextStats.bestStreak, nextStats.streak);

      let wrongItems = current.wrongItems;
      if (isCorrect) {
        nextKnown[word] = {
          word,
          meaning,
          learnedAt: new Date().toISOString(),
          count: (nextKnown[word]?.count ?? 0) + 1,
        };
        delete nextReview[word];
      } else {
        nextReview[word] = true;
        const wrongMap = new Map(current.wrongItems.map((item) => [item.id, item]));
        const id = `target:${word}`;
        const previous = wrongMap.get(id);
        wrongMap.set(id, {
          id,
          prompt: `单词靶场：${word}`,
          answer: meaning,
          chosen: chosenMeaning,
          type: "单词靶场",
          date: new Date().toISOString(),
          times: (previous?.times ?? 0) + 1,
        });
        wrongItems = Array.from(wrongMap.values());
      }

      return {
        ...current,
        targetStats: nextStats,
        knownWords: nextKnown,
        reviewWords: nextReview,
        wrongItems,
        completed: {
          date: getTodayKey(),
          modules: { ...current.completed.modules, target: true },
        },
      };
    });

    setTargetFeedback(
      isCorrect
        ? `命中：${word} = ${meaning}。例句：${sample}`
        : `偏了：${word} 是「${meaning}」，不是「${chosenMeaning}」。已放进复习词。`,
    );
  }

  function addShadow(index: number) {
    patchMemory((current) => ({
      ...current,
      shadowCounts: {
        ...current.shadowCounts,
        [index]: Math.min(3, (current.shadowCounts[index] ?? 0) + 1),
      },
      completed: {
        date: getTodayKey(),
        modules: { ...current.completed.modules, listen: true },
      },
    }));
  }

  function answerReading(key: string, isCorrect: boolean) {
    patchMemory((current) => ({
      ...current,
      readingAnswers: { ...current.readingAnswers, [key]: isCorrect },
      completed: {
        date: getTodayKey(),
        modules: { ...current.completed.modules, read: true },
      },
    }));
  }

  function selectTextbookBook(bookId: string) {
    const nextBook = textbookCatalog.find((book) => book.id === bookId);
    if (!nextBook) return;
    const nextWordKey = getTextbookWordItems(nextBook)[0]?.key ?? "";

    patchMemory((current) => ({
      ...current,
      textbook: {
        ...current.textbook,
        bookId: nextBook.id,
        unitId: nextBook.units[0].id,
        scan: {
          ...current.textbook.scan,
          currentKey: nextWordKey,
          lastFeedback: "已切换教材，从这一册的第一个词开始扫描。",
        },
      },
    }));
  }

  function selectTextbookUnit(unitId: string) {
    if (!selectedBook.units.some((unit) => unit.id === unitId)) return;

    patchMemory((current) => ({
      ...current,
      textbook: {
        ...current.textbook,
        unitId,
      },
    }));
  }

  function setTextbookScanMode(mode: TextbookScanMode) {
    const nextKey = pickNextTextbookWordKey({
      items: textbookWords,
      stats: memory.textbook.wordStats,
      currentKey: currentTextbookWord?.key ?? "",
      mode,
      randomValue: Math.random(),
    });

    patchMemory((current) => ({
      ...current,
      textbook: {
        ...current.textbook,
        scan: {
          ...current.textbook.scan,
          mode,
          currentKey: nextKey,
          lastFeedback:
            mode === "weak"
              ? "弱词强化已开启，优先抽错过的词。"
              : mode === "random"
                ? "随机抽测已开启，全册单词会打乱出现。"
                : "顺序扫描已开启，从当前词继续往后扫。",
        },
      },
    }));
  }

  function setTextbookSpellingMode(mode: TextbookSpellingMode) {
    patchMemory((current) => ({
      ...current,
      textbook: {
        ...current.textbook,
        spelling: {
          ...current.textbook.spelling,
          mode,
          lastFeedback:
            mode === "cloze"
              ? "缺字母模式：补全中间字母，不能只认中文。"
              : mode === "dictation"
                ? "听写模式：先听再写，检查真实拼写。"
                : "拍照查错：纸上写完拍照，系统识别后逐字检查。",
        },
      },
    }));
  }

  function skipTextbookSpellingWord() {
    if (!currentSpellingWord) return;
    const nextKey = pickNextSpellingWordKey({
      items: textbookWords,
      stats: memory.textbook.wordStats,
      currentKey: currentSpellingWord.key,
      randomValue: Math.random(),
    });

    patchMemory((current) => ({
      ...current,
      textbook: {
        ...current.textbook,
        spelling: {
          ...current.textbook.spelling,
          currentKey: nextKey,
          lastFeedback: "已换下一个词，弱词会被优先抽到。",
        },
      },
    }));
  }

  function submitTextbookSpelling(answer = textbookSpellingValue, ocrText?: string, imageName?: string) {
    if (!currentSpellingWord) return;

    const submitted = answer.trim();
    if (!submitted) {
      setTextbookOcrMessage("先写出完整英文单词再验收。");
      return;
    }

    const isCorrect = normalizeSpellingAnswer(submitted) === normalizeSpellingAnswer(currentSpellingWord.word);
    const issues = isCorrect ? [] : getSpellingIssues(currentSpellingWord.word, submitted);
    const randomValue = Math.random();

    patchMemory((current) => {
      const previous = current.textbook.wordStats[currentSpellingWord.key];
      const nextCorrect = (previous?.correct ?? 0) + (isCorrect ? 1 : 0);
      const nextWrong = (previous?.wrong ?? 0) + (isCorrect ? 0 : 1);
      const mastered = isCorrect ? nextCorrect >= Math.max(2, nextWrong + 2) : false;
      const nextStat: TextbookWordStat = {
        word: currentSpellingWord.word,
        meaning: currentSpellingWord.meaning,
        bookId: currentSpellingWord.bookId,
        unitId: currentSpellingWord.unitId,
        correct: nextCorrect,
        wrong: nextWrong,
        mastered,
        updatedAt: new Date().toISOString(),
      };
      const nextStats = {
        ...current.textbook.wordStats,
        [currentSpellingWord.key]: nextStat,
      };
      const nextKnown = { ...current.knownWords };
      const nextReview = { ...current.reviewWords };
      const wrongMap = new Map(current.wrongItems.map((item) => [item.id, item]));

      if (mastered) {
        nextKnown[currentSpellingWord.word] = {
          word: currentSpellingWord.word,
          meaning: currentSpellingWord.meaning,
          learnedAt: new Date().toISOString(),
          count: (nextKnown[currentSpellingWord.word]?.count ?? 0) + 1,
        };
        delete nextReview[currentSpellingWord.word];
        wrongMap.delete(`textbook-spelling:${currentSpellingWord.key}`);
      } else if (!isCorrect) {
        nextReview[currentSpellingWord.word] = true;
        const id = `textbook-spelling:${currentSpellingWord.key}`;
        const previousWrong = wrongMap.get(id);
        wrongMap.set(id, {
          id,
          prompt: `教材拼写：${currentSpellingWord.meaning}`,
          answer: currentSpellingWord.word,
          chosen: submitted,
          type: "教材拼写验收",
          date: new Date().toISOString(),
          times: (previousWrong?.times ?? 0) + 1,
        });
      }

      const nextKey = pickNextSpellingWordKey({
        items: textbookWords,
        stats: nextStats,
        currentKey: currentSpellingWord.key,
        randomValue,
      });
      const masteredCount = textbookWords.filter((item) => isMasteredTextbookWord(nextStats[item.key])).length;
      const allMastered = textbookWords.length > 0 && masteredCount >= textbookWords.length;

      return {
        ...current,
        knownWords: nextKnown,
        reviewWords: nextReview,
        wrongItems: Array.from(wrongMap.values()),
        textbook: {
          ...current.textbook,
          wordStats: nextStats,
          spellingRecords: {
            ...current.textbook.spellingRecords,
            [currentSpellingWord.key]: {
              word: currentSpellingWord.word,
              meaning: currentSpellingWord.meaning,
              bookId: currentSpellingWord.bookId,
              unitId: currentSpellingWord.unitId,
              expected: currentSpellingWord.word,
              answer: submitted,
              mode: current.textbook.spelling.mode,
              correct: isCorrect,
              issues,
              ocrText,
              imageName,
              date: new Date().toISOString(),
            },
          },
          spelling: {
            ...current.textbook.spelling,
            currentKey: nextKey,
            rounds: current.textbook.spelling.rounds + 1,
            correct: current.textbook.spelling.correct + (isCorrect ? 1 : 0),
            wrong: current.textbook.spelling.wrong + (isCorrect ? 0 : 1),
            lastFeedback: isCorrect
              ? mastered
                ? `拼对：${currentSpellingWord.word} 已达到掌握标准。`
                : `拼对：${currentSpellingWord.word}，再稳定几次就算真正会。`
              : `${currentSpellingWord.word} 拼写不稳：${issues.join("；")}。已进弱词。`,
          },
        },
        completed: allMastered
          ? {
              date: getTodayKey(),
              modules: { ...current.completed.modules, textbook: true },
            }
          : current.completed,
      };
    });

    setTextbookSpellingValue("");
  }

  async function handleTextbookPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !currentSpellingWord) return;

    setTextbookOcrBusy(true);
    setTextbookOcrMessage("正在识别手写单词...");

    try {
      const imageDataUrl = await resizeImageForOcr(file);
      setTextbookPhotoPreview(imageDataUrl);
      const result = await requestJson<{ text?: string; note?: string }>("/api/english/ocr", {
        method: "POST",
        body: JSON.stringify({
          imageDataUrl,
          expectedWord: currentSpellingWord.word,
        }),
      });
      const recognizedText = (result.text ?? "").trim();

      if (!recognizedText) {
        setTextbookOcrMessage(result.note ?? "没识别出英文单词，可以手动输入后验收。");
        return;
      }

      setTextbookSpellingValue(recognizedText);
      submitTextbookSpelling(recognizedText, recognizedText, file.name);
      setTextbookOcrMessage(`识别到：${recognizedText}`);
    } catch (error) {
      setTextbookOcrMessage(error instanceof Error ? error.message : "识别失败，可以手动输入后验收。");
    } finally {
      setTextbookOcrBusy(false);
    }
  }

  function answerTextbookWord(choice: string) {
    if (!currentTextbookWord) return;
    const isCorrect = choice === currentTextbookWord.meaning;
    const randomValue = Math.random();

    patchMemory((current) => {
      const previous = current.textbook.wordStats[currentTextbookWord.key];
      const nextCorrect = (previous?.correct ?? 0) + (isCorrect ? 1 : 0);
      const nextWrong = (previous?.wrong ?? 0) + (isCorrect ? 0 : 1);
      const mastered = isCorrect
        ? nextCorrect >= Math.max(2, nextWrong + 2)
        : false;
      const nextStat: TextbookWordStat = {
        word: currentTextbookWord.word,
        meaning: currentTextbookWord.meaning,
        bookId: currentTextbookWord.bookId,
        unitId: currentTextbookWord.unitId,
        correct: nextCorrect,
        wrong: nextWrong,
        mastered,
        updatedAt: new Date().toISOString(),
      };
      const nextStats = {
        ...current.textbook.wordStats,
        [currentTextbookWord.key]: nextStat,
      };
      const nextKnown = { ...current.knownWords };
      const nextReview = { ...current.reviewWords };
      let wrongItems = current.wrongItems;

      if (mastered) {
        nextKnown[currentTextbookWord.word] = {
          word: currentTextbookWord.word,
          meaning: currentTextbookWord.meaning,
          learnedAt: new Date().toISOString(),
          count: (nextKnown[currentTextbookWord.word]?.count ?? 0) + 1,
        };
        delete nextReview[currentTextbookWord.word];
      } else if (!isCorrect) {
        nextReview[currentTextbookWord.word] = true;
        const wrongMap = new Map(current.wrongItems.map((item) => [item.id, item]));
        const id = `textbook-word:${currentTextbookWord.key}`;
        const previousWrong = wrongMap.get(id);
        wrongMap.set(id, {
          id,
          prompt: `教材词汇：${currentTextbookWord.word}`,
          answer: currentTextbookWord.meaning,
          chosen: choice,
          type: "教材漏洞扫描",
          date: new Date().toISOString(),
          times: (previousWrong?.times ?? 0) + 1,
        });
        wrongItems = Array.from(wrongMap.values());
      }

      const nextKey = pickNextTextbookWordKey({
        items: textbookWords,
        stats: nextStats,
        currentKey: currentTextbookWord.key,
        mode: current.textbook.scan.mode,
        randomValue,
      });
      const nextStreak = isCorrect ? current.textbook.scan.streak + 1 : 0;
      const masteredCount = textbookWords.filter((item) => isMasteredTextbookWord(nextStats[item.key])).length;
      const allMastered = textbookWords.length > 0 && masteredCount >= textbookWords.length;

      return {
        ...current,
        knownWords: nextKnown,
        reviewWords: nextReview,
        wrongItems,
        textbook: {
          ...current.textbook,
          wordStats: nextStats,
          scan: {
            ...current.textbook.scan,
            currentKey: nextKey,
            rounds: current.textbook.scan.rounds + 1,
            streak: nextStreak,
            bestStreak: Math.max(current.textbook.scan.bestStreak, nextStreak),
            lastFeedback: isCorrect
              ? mastered
                ? `掌握：${currentTextbookWord.word} 已进全册掌握清单。`
                : `答对：${currentTextbookWord.word} 再命中几次就能标记掌握。`
              : `漏洞：${currentTextbookWord.word} 是「${currentTextbookWord.meaning}」，已进弱词池。`,
          },
        },
        completed: allMastered
          ? {
              date: getTodayKey(),
              modules: { ...current.completed.modules, textbook: true },
            }
          : current.completed,
      };
    });
  }

  function markTextbookWordMastered() {
    if (!currentTextbookWord) return;

    patchMemory((current) => {
      const previous = current.textbook.wordStats[currentTextbookWord.key];
      const nextStats = {
        ...current.textbook.wordStats,
        [currentTextbookWord.key]: {
          word: currentTextbookWord.word,
          meaning: currentTextbookWord.meaning,
          bookId: currentTextbookWord.bookId,
          unitId: currentTextbookWord.unitId,
          correct: Math.max(previous?.correct ?? 0, 2),
          wrong: previous?.wrong ?? 0,
          mastered: true,
          updatedAt: new Date().toISOString(),
        },
      };
      const nextKnown = { ...current.knownWords };
      const nextReview = { ...current.reviewWords };
      nextKnown[currentTextbookWord.word] = {
        word: currentTextbookWord.word,
        meaning: currentTextbookWord.meaning,
        learnedAt: new Date().toISOString(),
        count: (nextKnown[currentTextbookWord.word]?.count ?? 0) + 1,
      };
      delete nextReview[currentTextbookWord.word];

      return {
        ...current,
        knownWords: nextKnown,
        reviewWords: nextReview,
        textbook: {
          ...current.textbook,
          wordStats: nextStats,
          scan: {
            ...current.textbook.scan,
            lastFeedback: `${currentTextbookWord.word} 已手动标记掌握。`,
          },
        },
      };
    });
  }

  function markTextbookWordWeak() {
    if (!currentTextbookWord) return;

    patchMemory((current) => {
      const previous = current.textbook.wordStats[currentTextbookWord.key];
      return {
        ...current,
        reviewWords: {
          ...current.reviewWords,
          [currentTextbookWord.word]: true,
        },
        textbook: {
          ...current.textbook,
          wordStats: {
            ...current.textbook.wordStats,
            [currentTextbookWord.key]: {
              word: currentTextbookWord.word,
              meaning: currentTextbookWord.meaning,
              bookId: currentTextbookWord.bookId,
              unitId: currentTextbookWord.unitId,
              correct: previous?.correct ?? 0,
              wrong: (previous?.wrong ?? 0) + 1,
              mastered: false,
              updatedAt: new Date().toISOString(),
            },
          },
          scan: {
            ...current.textbook.scan,
            mode: "weak",
            lastFeedback: `${currentTextbookWord.word} 已加入弱词强化。`,
          },
        },
      };
    });
  }

  function answerTextbookExam(questionIndex: number, choice: string) {
    const question = selectedUnit.exam[questionIndex];
    if (!question) return;

    patchMemory((current) => {
      const nextAnswers = {
        ...current.textbook.answers,
        [`${selectedUnit.id}:${questionIndex}`]: choice,
      };
      const correct = selectedUnit.exam.filter(
        (item, index) => nextAnswers[`${selectedUnit.id}:${index}`] === item.answer,
      ).length;
      const allAnswered = selectedUnit.exam.every((_, index) => `${selectedUnit.id}:${index}` in nextAnswers);

      return {
        ...current,
        textbook: {
          ...current.textbook,
          answers: nextAnswers,
          examScores: allAnswered
            ? {
                ...current.textbook.examScores,
                [selectedUnit.id]: {
                  correct,
                  total: selectedUnit.exam.length,
                  date: new Date().toISOString(),
                },
              }
            : current.textbook.examScores,
        },
        completed: allAnswered
          ? {
              date: getTodayKey(),
              modules: { ...current.completed.modules, textbook: true },
            }
          : current.completed,
      };
    });
  }

  function completeTextbookUnit() {
    patchMemory((current) => ({
      ...current,
      textbook: {
        ...current.textbook,
        doneUnits: {
          ...current.textbook.doneUnits,
          [selectedUnit.id]: true,
        },
      },
      completed: {
        date: getTodayKey(),
        modules: { ...current.completed.modules, textbook: true },
      },
    }));
  }

  function exportMemory() {
    const blob = new Blob([JSON.stringify(memory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bright-steps-memory-${getTodayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importMemory(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Partial<LearningMemory>;
        setMemory(normalizeMemory(imported));
      } catch {
        setSpeechNotice("档案文件读取失败");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function clearMemory() {
    if (!window.confirm("清空本机学习记录？")) return;
    setMemory(createDefaultMemory());
    setQuestionIndex(0);
    setSessionAnswers([]);
    setFeedback("");
  }

  const navItems = [
    ["diagnostic", "摸底测评", ClipboardCheck],
    ["plan", "今日训练", Brain],
    ["target", "单词靶场", Crosshair],
    ["textbook", "教材同步", GraduationCap],
    ["listen", "听力跟读", Headphones],
    ["read", "阅读理解", BookOpen],
    ["phonics", "发音窍门", Volume2],
  ] as const;

  const dailyModules: Array<{
    key: ModuleKey;
    chip: string;
    title: string;
    text: string;
    tab: string;
    action: string;
  }> = [
    {
      key: "words",
      chip: "8-12 min",
      title: "核心词卡",
      text: `${level.range} 阶段先练能造句的词，不只背中文意思。`,
      tab: "plan",
      action: "开始词卡",
    },
    {
      key: "target",
      chip: "Game",
      title: "单词靶场",
      text: "看英文点中文，专门把词义反应速度和错词记忆练起来。",
      tab: "target",
      action: "去打靶",
    },
    {
      key: "textbook",
      chip: "PEP",
      title: "教材同步",
      text: `${selectedBook.label} · ${selectedUnit.title}，按单元做词汇、句型和考前模拟。`,
      tab: "textbook",
      action: "同步练",
    },
    {
      key: "listen",
      chip: "5 min",
      title: "听句跟读",
      text: "每句先听两遍，再慢速影子跟读三遍，抓关键词。",
      tab: "listen",
      action: "去跟读",
    },
    {
      key: "read",
      chip: "6 min",
      title: "短文阅读",
      text: "一篇短文两道题，练定位细节和理解句子关系。",
      tab: "read",
      action: "去阅读",
    },
    {
      key: "phonics",
      chip: "4 min",
      title: "易错发音",
      text: "集中处理 gh、silent letters、ough 这些不讲理的组合。",
      tab: "phonics",
      action: "练发音",
    },
  ];

  return (
    <main className={styles.shell}>
      <aside className={styles.sidePanel} aria-label="学习导航">
        <div className={styles.brandBlock}>
          <div className={styles.brandMark} aria-hidden="true">
            BS
          </div>
          <div>
            <p className={styles.eyebrow}>Adaptive English Lab</p>
            <h1>Bright Steps</h1>
          </div>
        </div>

        <section className={styles.memoryCard}>
          <div className={styles.memoryTopline}>
            <p className={styles.sectionKicker}>学习记忆</p>
            <span>已保存 {formatSavedTime(savedAt)}</span>
          </div>
          <div className={styles.memoryMetrics}>
            <div>
              <strong>{knownCount}</strong>
              <span>已掌握</span>
            </div>
            <div>
              <strong>{reviewCount}</strong>
              <span>再练词</span>
            </div>
            <div>
              <strong>{memory.wrongItems.length}</strong>
              <span>错题</span>
            </div>
            <div>
              <strong>{shadowTotal}</strong>
              <span>跟读</span>
            </div>
          </div>
          <div className={styles.memoryActions}>
            <button type="button" onClick={exportMemory}>
              <Download size={16} />
              导出
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              导入
            </button>
            <button type="button" onClick={clearMemory}>
              <Trash2 size={16} />
              清空
            </button>
          </div>
          <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="application/json" onChange={importMemory} />
        </section>

        <section className={styles.voiceCard}>
          <p className={styles.sectionKicker}>语音</p>
          <select
            value={selectedVoice?.voiceURI ?? ""}
            onChange={(event) =>
              patchMemory((current) => ({ ...current, voiceURI: event.target.value }))
            }
            aria-label="选择英文语音"
          >
            {availableVoices.length === 0 ? (
              <option value="">
                {voices.length === 0 ? "正在读取推荐语音" : "未找到推荐语音"}
              </option>
            ) : (
              availableVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} · {voice.lang}
                </option>
              ))
            )}
          </select>
          <label className={styles.speedControl}>
            <span>速度 {memory.rate.toFixed(2)}</span>
            <input
              type="range"
              min="0.62"
              max="0.95"
              step="0.01"
              value={memory.rate}
              onChange={(event) =>
                patchMemory((current) => ({ ...current, rate: Number(event.target.value) }))
              }
            />
          </label>
          <div className={styles.voiceActions}>
            <button type="button" onClick={() => speak("This voice sounds clear and friendly.", memory.rate)}>
              <Play size={16} />
              试听
            </button>
            <button type="button" onClick={stopSpeech}>
              <Square size={16} />
              停止
            </button>
          </div>
          <p className={styles.voiceNotice}>{speechNotice}</p>
        </section>

        <nav className={styles.mainNav} aria-label="主功能">
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={activeTab === id ? styles.activeNav : ""}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <section className={styles.routeNote}>
          <p className={styles.sectionKicker}>路线</p>
          <p>不按年龄分班，先摸底，再按词汇、听读、教材单元和错词记录自动往合适题库走。</p>
        </section>
      </aside>

      <section className={styles.content}>
        <section className={styles.heroPanel}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Vocabulary · Textbook · Listening · Target Game</p>
            <h2>先找准水平，再把薄弱项一点点补上来。</h2>
            <p>全年龄可用的自适应英语训练站：先测大致词汇和理解水平，再练词卡、人教版同步、听读、发音和单词靶场。</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryAction} onClick={() => setActiveTab("diagnostic")}>
                <ClipboardCheck size={18} />
                开始摸底
              </button>
              <button type="button" className={styles.secondaryAction} onClick={() => setActiveTab("textbook")}>
                <GraduationCap size={18} />
                教材同步
              </button>
            </div>
          </div>
          <Image
            src="/english/hero-study.png"
            alt="两个孩子在家里用平板和耳机学习英语"
            width={1792}
            height={1024}
            priority
          />
        </section>

        <section className={styles.statusStrip} aria-label="当前学习状态">
          <article>
            <span>估算级别</span>
            <strong>{memory.assessment ? `${level.name} · ${level.range}` : "未测评"}</strong>
          </article>
          <article>
            <span>今日完成</span>
            <strong>{completedCount} / {dailyModules.length}</strong>
          </article>
          <article>
            <span>重点补强</span>
            <strong>{memory.assessment ? level.focus : "先做摸底"}</strong>
          </article>
          <article>
            <span>学习档案</span>
            <strong>{knownCount + memory.wrongItems.length + reviewCount} 条记录</strong>
          </article>
        </section>

        {activeTab === "diagnostic" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>3分钟</p>
                <h2>词汇 + 听力 + 阅读摸底</h2>
              </div>
              <button type="button" className={styles.secondaryAction} onClick={startAssessment}>
                <RotateCcw size={17} />
                重测
              </button>
            </div>
            <div className={styles.diagnosticLayout}>
              <DiagnosticCard
                assessment={memory.assessment}
                feedback={feedback}
                questionIndex={questionIndex}
                selectedChoice={selectedChoice}
                spellingValue={spellingValue}
                onSpellingChange={setSpellingValue}
                onAnswer={recordAnswer}
                onStartAgain={startAssessment}
                onSpeak={speak}
                onOpenPlan={() => setActiveTab("plan")}
              />
              <aside className={styles.insightCard}>
                <h3>怎么判断</h3>
                <ul>
                  <li>词义题看高频词是否扎实。</li>
                  <li>听力题看能否听出关键词。</li>
                  <li>阅读题看句子理解和细节定位。</li>
                  <li>拼写题专门抓易错音形。</li>
                </ul>
              </aside>
            </div>
          </section>
        )}

        {activeTab === "plan" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>Daily Sprint</p>
                <h2>今日 15-20 分钟训练</h2>
              </div>
              <button type="button" className={styles.secondaryAction} onClick={resetToday}>
                <RefreshCcw size={17} />
                清空今日
              </button>
            </div>
            <div className={styles.dailyGrid}>
              {dailyModules.map((module) => {
                const done = Boolean(memory.completed.modules[module.key]);
                return (
                  <article key={module.key} className={styles.dailyCard}>
                    <span className={styles.dailyChip}>{done ? "已完成" : module.chip}</span>
                    <h3>{module.title}</h3>
                    <p>{module.text}</p>
                    <button
                      type="button"
                      className={done ? styles.secondaryAction : styles.primaryAction}
                      onClick={() => setActiveTab(module.tab)}
                    >
                      {done ? <Check size={17} /> : <Play size={17} />}
                      {done ? "再练一次" : module.action}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>Word Cards</p>
                <h2>今日核心词</h2>
              </div>
            </div>
            <WordDeck
              deck={wordDecks[levelId]}
              knownWords={memory.knownWords}
              reviewWords={memory.reviewWords}
              onMark={markWord}
              onSpeak={speak}
            />
          </section>
        )}

        {activeTab === "target" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>Target Game</p>
                <h2>单词靶场</h2>
              </div>
              <button type="button" className={styles.secondaryAction} onClick={() => speak(targetDeck[targetIndex][0], 0.72)}>
                <Volume2 size={17} />
                听当前词
              </button>
            </div>
            <div className={styles.targetArena}>
              <div className={styles.targetHud} aria-label="靶场得分">
                <div>
                  <span>命中</span>
                  <strong>{memory.targetStats.score}</strong>
                </div>
                <div>
                  <span>轮数</span>
                  <strong>{memory.targetStats.rounds}</strong>
                </div>
                <div>
                  <span>正确率</span>
                  <strong>{targetAccuracy}%</strong>
                </div>
                <div>
                  <span>连击</span>
                  <strong>{memory.targetStats.streak}</strong>
                </div>
                <div>
                  <span>最佳</span>
                  <strong>{memory.targetStats.bestStreak}</strong>
                </div>
              </div>

              <div className={styles.targetPrompt}>
                <button type="button" className={styles.soundButton} onClick={() => speak(`${targetDeck[targetIndex][0]}. ${targetDeck[targetIndex][2]}`, 0.72)}>
                  <Volume2 size={18} />
                </button>
                <div>
                  <span>Tap the matching meaning</span>
                  <h3>{targetDeck[targetIndex][0]}</h3>
                  <p>{targetDeck[targetIndex][2]}</p>
                </div>
              </div>

              <div className={styles.targetGrid}>
                {targetOptions.map((optionIndex) => {
                  const [, meaning] = targetDeck[optionIndex];
                  return (
                    <button
                      key={`${targetDeck[targetIndex][0]}-${meaning}`}
                      type="button"
                      className={styles.targetButton}
                      onClick={() => answerTarget(optionIndex)}
                    >
                      <span className={styles.targetRings} aria-hidden="true" />
                      <strong>{meaning}</strong>
                    </button>
                  );
                })}
              </div>
              <div className={styles.targetFeedback}>{targetFeedback}</div>
            </div>
          </section>
        )}

        {activeTab === "textbook" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>PEP Textbook Sync</p>
                <h2>人教版教材同步</h2>
              </div>
              <button type="button" className={styles.secondaryAction} onClick={completeTextbookUnit}>
                <Check size={17} />
                {memory.textbook.doneUnits[selectedUnit.id] ? "已完成" : "完成本单元"}
              </button>
            </div>

            <div className={styles.textbookControls}>
              <label>
                <span>年级学期</span>
                <select value={selectedBook.id} onChange={(event) => selectTextbookBook(event.target.value)}>
                  {textbookCatalog.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>同步单元</span>
                <select value={selectedUnit.id} onChange={(event) => selectTextbookUnit(event.target.value)}>
                  {selectedBook.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <section className={styles.textbookHero}>
              <div>
                <p className={styles.sectionKicker}>{selectedBook.grade} · {selectedBook.semester}</p>
                <h3>{selectedUnit.title}</h3>
                <p>{selectedUnit.theme}：{selectedUnit.target}</p>
                <span>{selectedBook.note}</span>
              </div>
              <div className={styles.textbookScoreCard}>
                <span>考前模拟</span>
                <strong>
                  {latestTextbookScore
                    ? `${latestTextbookScore.correct}/${latestTextbookScore.total}`
                    : `${textbookCorrectCount}/${selectedUnit.exam.length}`}
                </strong>
                <p>{textbookAnsweredCount}/{selectedUnit.exam.length} 已答</p>
              </div>
            </section>

            <section className={styles.gapScanPanel}>
              <div className={styles.gapScanTopline}>
                <div>
                  <p className={styles.sectionKicker}>Final Check</p>
                  <h3>期末漏洞扫描</h3>
                  <p>覆盖 {selectedBook.label} 全册 {textbookWords.length} 个同步词块，答错进弱词池，达标后自动标记掌握。</p>
                </div>
                <div className={styles.masteryMeter} aria-label="全册词汇掌握率">
                  <span style={{ width: `${textbookMasteryPercent}%` }} />
                  <strong>{textbookMasteryPercent}%</strong>
                </div>
              </div>

              <div className={styles.scanStatsGrid}>
                <div>
                  <span>已掌握</span>
                  <strong>{textbookMasteredCount}/{textbookWords.length}</strong>
                </div>
                <div>
                  <span>弱词</span>
                  <strong>{textbookWeakWords.length}</strong>
                </div>
                <div>
                  <span>扫描轮数</span>
                  <strong>{memory.textbook.scan.rounds}</strong>
                </div>
                <div>
                  <span>连击</span>
                  <strong>{memory.textbook.scan.streak}</strong>
                </div>
                <div>
                  <span>最佳连击</span>
                  <strong>{memory.textbook.scan.bestStreak}</strong>
                </div>
              </div>

              <div className={styles.scanModeBar} role="group" aria-label="词汇扫描模式">
                <button
                  type="button"
                  className={memory.textbook.scan.mode === "sequence" ? styles.activeScanMode : ""}
                  onClick={() => setTextbookScanMode("sequence")}
                >
                  顺序扫
                </button>
                <button
                  type="button"
                  className={memory.textbook.scan.mode === "random" ? styles.activeScanMode : ""}
                  onClick={() => setTextbookScanMode("random")}
                >
                  随机抽
                </button>
                <button
                  type="button"
                  className={memory.textbook.scan.mode === "weak" ? styles.activeScanMode : ""}
                  onClick={() => setTextbookScanMode("weak")}
                >
                  弱词强化
                </button>
              </div>

              {currentTextbookWord ? (
                <div className={styles.wordBossArena}>
                  <div className={styles.wordBossPrompt}>
                    <button type="button" className={styles.soundButton} onClick={() => speak(`${currentTextbookWord.word}. ${currentTextbookWord.sample}`, 0.72)}>
                      <Volume2 size={18} />
                    </button>
                    <div>
                      <span>{currentTextbookWord.unitTitle}</span>
                      <h3>{currentTextbookWord.word}</h3>
                      <p>{currentTextbookWord.sample}</p>
                    </div>
                    <div className={styles.wordBossBadge}>
                      <span>{currentTextbookWordStat?.mastered ? "已掌握" : isWeakTextbookWord(currentTextbookWordStat) ? "弱词" : "待检测"}</span>
                      <strong>{currentTextbookWordStat?.correct ?? 0}:{currentTextbookWordStat?.wrong ?? 0}</strong>
                    </div>
                  </div>

                  <div className={styles.scanChoiceGrid}>
                    {textbookScanOptions.map((choice) => (
                      <button key={choice} type="button" className={styles.scanChoiceButton} onClick={() => answerTextbookWord(choice)}>
                        <span aria-hidden="true" />
                        <strong>{choice}</strong>
                      </button>
                    ))}
                  </div>

                  <div className={styles.scanActions}>
                    <button type="button" className={styles.miniActionStrong} onClick={markTextbookWordMastered}>
                      会了
                    </button>
                    <button type="button" className={styles.miniAction} onClick={markTextbookWordWeak}>
                      放进弱词
                    </button>
                    <p>{memory.textbook.scan.lastFeedback}</p>
                  </div>
                </div>
              ) : null}

              <div className={styles.weakWordDock}>
                <span>弱词池</span>
                {textbookWeakWords.length ? (
                  textbookWeakWords.slice(0, 10).map((item) => (
                    <button key={item.key} type="button" onClick={() => {
                      patchMemory((current) => ({
                        ...current,
                        textbook: {
                          ...current.textbook,
                          scan: {
                            ...current.textbook.scan,
                            mode: "weak",
                            currentKey: item.key,
                            lastFeedback: `正在强化 ${item.word}。`,
                          },
                        },
                      }));
                    }}>
                      {item.word}
                    </button>
                  ))
                ) : (
                  <strong>暂时没有漏洞</strong>
                )}
              </div>
            </section>

            <section className={styles.spellingLabPanel}>
              <div className={styles.spellingLabTopline}>
                <div>
                  <p className={styles.sectionKicker}>Spell Check</p>
                  <h3>拼写验收</h3>
                  <p>缺字母、听写和拍照查错都按完整英文判定，拼错会同步进弱词池。</p>
                </div>
                <div className={styles.spellingScorePills} aria-label="拼写验收统计">
                  <div>
                    <span>验收</span>
                    <strong>{memory.textbook.spelling.rounds}</strong>
                  </div>
                  <div>
                    <span>正确率</span>
                    <strong>{spellingAccuracy}%</strong>
                  </div>
                  <div>
                    <span>错拼</span>
                    <strong>{memory.textbook.spelling.wrong}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.spellingModeBar} role="group" aria-label="拼写验收模式">
                <button
                  type="button"
                  className={memory.textbook.spelling.mode === "cloze" ? styles.activeSpellingMode : ""}
                  onClick={() => setTextbookSpellingMode("cloze")}
                >
                  缺字母
                </button>
                <button
                  type="button"
                  className={memory.textbook.spelling.mode === "dictation" ? styles.activeSpellingMode : ""}
                  onClick={() => setTextbookSpellingMode("dictation")}
                >
                  听写
                </button>
                <button
                  type="button"
                  className={memory.textbook.spelling.mode === "photo" ? styles.activeSpellingMode : ""}
                  onClick={() => setTextbookSpellingMode("photo")}
                >
                  拍照查错
                </button>
              </div>

              {currentSpellingWord ? (
                <div className={styles.spellingChallenge}>
                  <div className={styles.spellingPromptBlock}>
                    <span>{currentSpellingWord.unitTitle} · {currentSpellingWord.tag}</span>
                    {memory.textbook.spelling.mode === "cloze" ? (
                      <strong className={styles.maskedWord}>{maskedSpellingWord}</strong>
                    ) : (
                      <strong>{memory.textbook.spelling.mode === "dictation" ? "听写输入" : "纸上默写后拍照"}</strong>
                    )}
                    <p>{currentSpellingWord.meaning}</p>
                    <button type="button" className={styles.soundButton} onClick={() => speak(currentSpellingWord.word, 0.68)}>
                      <Volume2 size={18} />
                    </button>
                  </div>

                  <div className={styles.spellingWriteBlock}>
                    <form
                      className={styles.spellingInputRow}
                      onSubmit={(event) => {
                        event.preventDefault();
                        submitTextbookSpelling();
                      }}
                    >
                      <input
                        value={textbookSpellingValue}
                        onChange={(event) => setTextbookSpellingValue(event.target.value)}
                        placeholder="写完整英文单词"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      <button type="submit" className={styles.miniActionStrong}>
                        验收
                      </button>
                    </form>

                    {memory.textbook.spelling.mode === "photo" ? (
                      <div className={styles.photoCheckPanel}>
                        <button
                          type="button"
                          className={styles.photoUploadButton}
                          disabled={textbookOcrBusy}
                          onClick={() => textbookPhotoInputRef.current?.click()}
                        >
                          <Upload size={17} />
                          {textbookOcrBusy ? "识别中" : "拍照上传"}
                        </button>
                        <input
                          ref={textbookPhotoInputRef}
                          className={styles.hiddenInput}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleTextbookPhoto}
                        />
                        {textbookPhotoPreview ? (
                          <img className={styles.photoPreview} src={textbookPhotoPreview} alt="手写单词预览" />
                        ) : (
                          <p>手机打开时会调相机，桌面也可以上传手写照片。</p>
                        )}
                      </div>
                    ) : null}

                    <div className={styles.spellingActionRow}>
                      <button type="button" className={styles.miniAction} onClick={() => speak(currentSpellingWord.word, 0.62)}>
                        慢速听
                      </button>
                      <button type="button" className={styles.miniAction} onClick={skipTextbookSpellingWord}>
                        换一个
                      </button>
                      <span>{currentSpellingWordStat?.mastered ? "已掌握" : isWeakTextbookWord(currentSpellingWordStat) ? "弱词优先" : "待验收"}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={styles.spellingFeedback}>
                <strong>{memory.textbook.spelling.lastFeedback}</strong>
                {textbookOcrMessage ? <p>{textbookOcrMessage}</p> : null}
                {currentSpellingRecord ? (
                  <p>
                    本词上次：{currentSpellingRecord.correct ? "拼对" : `拼错，${currentSpellingRecord.issues.join("；")}`}。
                  </p>
                ) : null}
              </div>
            </section>

            <div className={styles.textbookBoard}>
              <article className={styles.syncPanel}>
                <div className={styles.syncPanelHeading}>
                  <FileText size={18} />
                  <h3>同步词块</h3>
                </div>
                <div className={styles.syncWordList}>
                  {selectedUnit.words.map(([word, meaning, sample, tip, tag]) => (
                    <div key={word} className={styles.syncWordItem}>
                      <button type="button" className={styles.soundButton} onClick={() => speak(`${word}. ${sample}`, 0.72)}>
                        <Volume2 size={17} />
                      </button>
                      <div>
                        <strong>{word}</strong>
                        <span>{meaning} · {tag}</span>
                        <p>{sample}</p>
                        <p>{tip}</p>
                      </div>
                      <button type="button" className={styles.miniActionStrong} onClick={() => markWord(word, meaning, true)}>
                        记住
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              <article className={styles.syncPanel}>
                <div className={styles.syncPanelHeading}>
                  <Brain size={18} />
                  <h3>句型语法</h3>
                </div>
                <div className={styles.patternList}>
                  {selectedUnit.patterns.map((pattern) => (
                    <div key={pattern}>
                      <span>Pattern</span>
                      <strong>{pattern}</strong>
                    </div>
                  ))}
                </div>
                <div className={styles.drillList}>
                  {selectedUnit.drills.map((drill, index) => (
                    <p key={drill}>
                      {index + 1}. {drill}
                    </p>
                  ))}
                </div>
              </article>
            </div>

            <article className={styles.mockExamCard}>
              <div className={styles.syncPanelHeading}>
                <ClipboardCheck size={18} />
                <h3>考前模拟</h3>
              </div>
              <div className={styles.mockExamGrid}>
                {selectedUnit.exam.map((question, index) => {
                  const answerKey = `${selectedUnit.id}:${index}`;
                  const chosen = memory.textbook.answers[answerKey];
                  const answered = Boolean(chosen);
                  return (
                    <section key={question.prompt} className={styles.mockQuestion}>
                      <span>{question.skill}</span>
                      <strong>{index + 1}. {question.prompt}</strong>
                      <div className={styles.choiceGrid}>
                        {question.choices.map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            className={[
                              styles.choiceButton,
                              answered && choice === question.answer ? styles.correctChoice : "",
                              answered && chosen === choice && choice !== question.answer ? styles.wrongChoice : "",
                            ].join(" ")}
                            disabled={answered}
                            onClick={() => answerTextbookExam(index, choice)}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                      {answered ? <p>{question.explain}</p> : null}
                    </section>
                  );
                })}
              </div>
            </article>
          </section>
        )}

        {activeTab === "listen" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>Listen & Shadow</p>
                <h2>听句子，跟着读</h2>
              </div>
            </div>
            <div className={styles.listeningBoard}>
              {listeningDrills.map((item, index) => (
                <article key={item.sentence} className={styles.listenCard}>
                  <button type="button" className={styles.soundButton} onClick={() => speak(item.sentence)}>
                    <Volume2 size={18} />
                  </button>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.sentence}</p>
                    <p>{item.cn}</p>
                    <p>
                      <strong>Focus:</strong> {item.focus}
                    </p>
                  </div>
                  <div className={styles.listenTools}>
                    <button type="button" className={styles.miniAction} onClick={() => speak(item.sentence, 0.66)}>
                      慢速
                    </button>
                    <button type="button" className={styles.miniActionStrong} onClick={() => addShadow(index)}>
                      跟读+1
                    </button>
                    <span>{memory.shadowCounts[index] ?? 0} / 3</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "read" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>Reading</p>
                <h2>短文阅读与理解</h2>
              </div>
            </div>
            <div className={styles.readingBoard}>
              {readingPassages.map((passage, pIndex) => (
                <article key={passage.title} className={styles.readingCard}>
                  <h3>{passage.title}</h3>
                  <p className={styles.readingText}>{passage.text}</p>
                  {passage.questions.map((question, qIndex) => {
                    const key = `${pIndex}-${qIndex}`;
                    return (
                      <div key={question.q} className={styles.readingQuestion}>
                        <strong>
                          {qIndex + 1}. {question.q}
                        </strong>
                        <div className={styles.choiceGrid}>
                          {question.choices.map((choice) => {
                            const answered = key in memory.readingAnswers;
                            const isAnswer = choice === question.answer;
                            const correct = memory.readingAnswers[key];
                            return (
                              <button
                                key={choice}
                                type="button"
                                className={[
                                  styles.choiceButton,
                                  answered && isAnswer ? styles.correctChoice : "",
                                  answered && !correct && !isAnswer ? styles.wrongChoice : "",
                                ].join(" ")}
                                disabled={answered}
                                onClick={() => answerReading(key, isAnswer)}
                              >
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "phonics" && (
          <section className={styles.tabPanel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.sectionKicker}>Tricky Sounds</p>
                <h2>不按常理出牌的发音</h2>
              </div>
            </div>
            <div className={styles.phonicsGrid}>
              {phonicsGroups.map((group, index) => (
                <article key={group.pattern} className={styles.phonicsCard}>
                  <h3>{group.pattern}</h3>
                  <p>{group.rule}</p>
                  <div className={styles.exampleList}>
                    {group.examples.map((example) => (
                      <button key={example} type="button" onClick={() => speak(example, 0.7)}>
                        {example}
                      </button>
                    ))}
                  </div>
                  <p>{group.tip}</p>
                  <button
                    type="button"
                    className={styles.miniActionStrong}
                    onClick={() => {
                      patchMemory((current) => ({
                        ...current,
                        phonicsDone: { ...current.phonicsDone, [index]: true },
                        completed: {
                          date: getTodayKey(),
                          modules: { ...current.completed.modules, phonics: true },
                        },
                      }));
                    }}
                  >
                    {memory.phonicsDone[index] ? "已完成" : "完成这一组"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function DiagnosticCard({
  assessment,
  feedback,
  questionIndex,
  selectedChoice,
  spellingValue,
  onSpellingChange,
  onAnswer,
  onStartAgain,
  onSpeak,
  onOpenPlan,
}: {
  assessment: Assessment | null;
  feedback: string;
  questionIndex: number;
  selectedChoice: string;
  spellingValue: string;
  onSpellingChange: (value: string) => void;
  onAnswer: (answer: string) => void;
  onStartAgain: () => void;
  onSpeak: (text: string, rate?: number) => void;
  onOpenPlan: () => void;
}) {
  if (assessment) {
    const level = levels[assessment.level];
    return (
      <article className={styles.testCard}>
        <span className={styles.questionType}>最近一次结果</span>
        <h3 className={styles.questionText}>当前估算：{level.name}</h3>
        <div className={styles.resultGrid}>
          <div>
            <span>得分</span>
            <strong>
              {assessment.score} / {diagnosticQuestions.length}
            </strong>
          </div>
          <div>
            <span>词汇量</span>
            <strong>{level.range}</strong>
          </div>
          <div>
            <span>重点</span>
            <strong>{level.focus}</strong>
          </div>
          <div>
            <span>训练</span>
            <strong>{level.plan}</strong>
          </div>
        </div>
        <div className={styles.feedbackBox}>{assessment.note}</div>
        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryAction} onClick={onOpenPlan}>
            <Brain size={17} />
            进入今日训练
          </button>
          <button type="button" className={styles.secondaryAction} onClick={onStartAgain}>
            <RotateCcw size={17} />
            重新测一次
          </button>
        </div>
      </article>
    );
  }

  const question = diagnosticQuestions[questionIndex];
  const progress = Math.round((questionIndex / diagnosticQuestions.length) * 100);
  const choices = "choices" in question && question.choices ? question.choices : [];

  return (
    <article className={styles.testCard}>
      <div className={styles.testProgress}>
        <div className={styles.progressBar} aria-label="测评进度">
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong>
          {questionIndex + 1}/{diagnosticQuestions.length}
        </strong>
      </div>
      <span className={styles.questionType}>{question.type}</span>
      <h3 className={styles.questionText}>{question.prompt}</h3>
      {"passage" in question && question.passage ? (
        <div className={styles.questionPassage}>{question.passage}</div>
      ) : null}
      {"audio" in question && question.audio ? (
        <button type="button" className={styles.secondaryAction} onClick={() => onSpeak(question.audio, 0.7)}>
          <Volume2 size={17} />
          播放
        </button>
      ) : null}
      {question.type === "拼写" ? (
        <form
          className={styles.spellingRow}
          onSubmit={(event) => {
            event.preventDefault();
            onAnswer(spellingValue.trim() || "空白");
          }}
        >
          <input
            value={spellingValue}
            onChange={(event) => onSpellingChange(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="输入英文单词"
          />
          <button type="submit" className={styles.primaryAction}>
            提交
          </button>
        </form>
      ) : (
        <div className={styles.choiceGrid}>
          {choices.map((choice) => {
            const answered = Boolean(feedback);
            return (
              <button
                key={choice}
                type="button"
                className={[
                  styles.choiceButton,
                  answered && choice === question.answer ? styles.correctChoice : "",
                  answered && selectedChoice === choice && choice !== question.answer ? styles.wrongChoice : "",
                ].join(" ")}
                disabled={answered}
                onClick={() => onAnswer(choice)}
              >
                {choice}
              </button>
            );
          })}
        </div>
      )}
      {feedback ? <div className={styles.feedbackBox}>{feedback}</div> : null}
    </article>
  );
}

function WordDeck({
  deck,
  knownWords,
  reviewWords,
  onMark,
  onSpeak,
}: {
  deck: Array<[string, string, string, string, string]>;
  knownWords: Record<string, KnownWord>;
  reviewWords: Record<string, boolean>;
  onMark: (word: string, meaning: string, known: boolean) => void;
  onSpeak: (text: string, rate?: number) => void;
}) {
  return (
    <div className={styles.wordDeck}>
      {deck.map(([word, meaning, sample, tip, tag]) => (
        <article key={word} className={styles.wordCard}>
          <div className={styles.wordTopline}>
            <button type="button" className={styles.soundButton} onClick={() => onSpeak(`${word}. ${sample}`, 0.72)} aria-label={`播放 ${word}`}>
              <Volume2 size={18} />
            </button>
            <span>{knownWords[word] ? "已掌握" : reviewWords[word] ? "再练" : tag}</span>
          </div>
          <h3>{word}</h3>
          <p className={styles.meaning}>{meaning}</p>
          <p className={styles.sample}>{sample}</p>
          <p className={styles.memoryTip}>{tip}</p>
          <div className={styles.cardActions}>
            <button type="button" className={styles.miniAction} onClick={() => onMark(word, meaning, false)}>
              再练
            </button>
            <button type="button" className={styles.miniActionStrong} onClick={() => onMark(word, meaning, true)}>
              会了
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
