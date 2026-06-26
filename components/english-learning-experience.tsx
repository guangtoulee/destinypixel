"use client";

import Image from "next/image";
import {
  BookOpen,
  Brain,
  Check,
  ClipboardCheck,
  Download,
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
type ModuleKey = "words" | "listen" | "read" | "phonics";

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

const wordDecks: Record<LevelId, Array<[string, string, string, string, string]>> = {
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
  return {
    assessment: null,
    completed: { date: getTodayKey(), modules: {} },
    knownWords: {},
    reviewWords: {},
    wrongItems: [],
    shadowCounts: {},
    readingAnswers: {},
    phonicsDone: {},
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
    rate: input?.rate ?? 0.78,
  };

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

function chooseBestVoice(voices: SpeechSynthesisVoice[], savedURI: string) {
  const saved = voices.find((voice) => voice.voiceURI === savedURI);
  if (saved) return saved;

  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const avoid = /(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Fred|Good News|Hysterical|Jester|Junior|Pipe Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox)/i;
  const preferred = /(Google US English|Samantha|Microsoft (Aria|Jenny|Michelle|Christopher|Guy)|Natural|Premium|Daniel|Karen|Moira|Tessa|Ava|Allison|Serena|Kate)/i;

  return (
    englishVoices.find((voice) => preferred.test(voice.name) && !avoid.test(voice.name)) ??
    englishVoices.find((voice) => !avoid.test(voice.name)) ??
    englishVoices[0] ??
    voices[0]
  );
}

function formatSavedTime(date: Date | null) {
  if (!date) return "等待保存";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(false);

  const levelId = memory.assessment?.level ?? "foundation";
  const level = levels[levelId];
  const completedCount = Object.values(memory.completed.modules).filter(Boolean).length;
  const knownCount = Object.keys(memory.knownWords).length;
  const reviewCount = Object.keys(memory.reviewWords).filter((word) => memory.reviewWords[word]).length;
  const shadowTotal = Object.values(memory.shadowCounts).reduce((sum, count) => sum + count, 0);
  const selectedVoice = useMemo(
    () => chooseBestVoice(voices, memory.voiceURI),
    [voices, memory.voiceURI],
  );

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
        setMemory((current) => (current.voiceURI ? current : { ...current, voiceURI: best.voiceURI }));
      } else {
        setSpeechNotice("没有找到英文语音");
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

  function patchMemory(updater: (current: LearningMemory) => LearningMemory) {
    setMemory((current) => normalizeMemory(updater(current)));
  }

  function speak(text: string, rateOverride?: number) {
    if (!("speechSynthesis" in window)) {
      setSpeechNotice("当前浏览器没有朗读引擎");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = chooseBestVoice(voices, memory.voiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "en-US";
      setSpeechNotice(`当前语音：${voice.name}`);
    } else {
      utterance.lang = "en-US";
      setSpeechNotice("没有找到英文语音");
    }
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
            <p className={styles.eyebrow}>Kids English Lab</p>
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
            {voices.length === 0 ? (
              <option value="">系统英文语音</option>
            ) : (
              voices
                .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
                .map((voice) => (
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
          <p>先用高频词和听读能力分级，再补课标主题词；教材同步可以后续接进来。</p>
        </section>
      </aside>

      <section className={styles.content}>
        <section className={styles.heroPanel}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Vocabulary · Listening · Reading · Pronunciation</p>
            <h2>先找准水平，再把薄弱项一点点补上来。</h2>
            <p>适合 11-13 岁孩子的轻量训练站：测词汇量、听句子、读短文、拆难发音词，每天 15 分钟。</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryAction} onClick={() => setActiveTab("diagnostic")}>
                <ClipboardCheck size={18} />
                开始摸底
              </button>
              <button type="button" className={styles.secondaryAction} onClick={() => setActiveTab("plan")}>
                <Brain size={18} />
                看今日训练
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
            <strong>{completedCount} / 4</strong>
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
                <h2>今日 15 分钟训练</h2>
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
