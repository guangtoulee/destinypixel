"use client";

import { Brain, Check, RefreshCcw, Sparkles, Volume2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  allowedEnglishVoiceSummary,
  chooseAllowedEnglishVoice,
} from "@/lib/english-voices";
import styles from "./danci-experience.module.css";

type TrainingMode = "study" | "meaning" | "spell" | "listen" | "feedback";

type WordItem = {
  id: string;
  word: string;
  meaning: string;
  unit: string;
  level: 1 | 2 | 3;
  family: string;
  example: string;
  tip: string;
};

type WordRecord = {
  seen: number;
  correct: number;
  wrong: number;
  stage: 0 | 1 | 2 | 3 | 4;
  dueAt: number;
  lastMode: TrainingMode;
  updatedAt: string;
};

type TrainerMemory = {
  records: Record<string, WordRecord>;
  todayKey: string;
  todayAnswered: number;
  totalAnswered: number;
  streak: number;
  bestStreak: number;
  lastFeedback: string;
};

type Outcome = {
  correct: boolean;
  title: string;
  body: string;
};

const storageKey = "danciTrainerMemoryV2";
const reviewIntervals = [5 * 60 * 1000, 30 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];

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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultMemory(): TrainerMemory {
  return {
    records: {},
    todayKey: todayKey(),
    todayAnswered: 0,
    totalAnswered: 0,
    streak: 0,
    bestStreak: 0,
    lastFeedback: "今天不用闯关，也不会归零重来。只做一件事：把该复习的词回忆出来。",
  };
}

function normalizeMemory(input: Partial<TrainerMemory> | null): TrainerMemory {
  const base = createDefaultMemory();
  const memory = {
    ...base,
    ...(input ?? {}),
    records: input?.records ?? {},
  };

  if (memory.todayKey !== todayKey()) {
    memory.todayKey = todayKey();
    memory.todayAnswered = 0;
  }

  return memory;
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
  };
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function stageLabel(stage: number) {
  return ["初见", "认得", "会拼", "会听写", "稳固"][stage] ?? "初见";
}

function nextDueText(dueAt: number) {
  if (!dueAt || dueAt <= Date.now()) return "现在";
  const minutes = Math.ceil((dueAt - Date.now()) / 60000);
  if (minutes < 60) return `${minutes} 分钟后`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} 小时后`;
  return `${Math.ceil(hours / 24)} 天后`;
}

function getStartMode(word: WordItem, memory: TrainerMemory): TrainingMode {
  const record = memory.records[word.id] ?? getEmptyRecord();
  if (!record.seen) return "study";
  if (record.stage >= 2) return "listen";
  if (record.stage === 1) return "spell";
  return "meaning";
}

function scoreFor(id: string, seed: number) {
  let score = seed + 17;
  for (const char of id) {
    score = (score * 31 + char.charCodeAt(0)) % 1000003;
  }
  return score;
}

function shuffleBySeed<T extends { id: string }>(items: T[], seed: number) {
  return [...items].sort((a, b) => scoreFor(a.id, seed) - scoreFor(b.id, seed));
}

function buildChoices(word: WordItem, seed: number) {
  const sameLevel = wordBank.filter((item) => item.id !== word.id && item.level <= Math.min(3, word.level + 1));
  return shuffleBySeed([word, ...shuffleBySeed(sameLevel, seed).slice(0, 3)], seed + 13);
}

function buildQueue(memory: TrainerMemory) {
  const now = Date.now();
  const due = wordBank
    .filter((word) => {
      const record = memory.records[word.id];
      return record && record.stage < 4 && record.dueAt <= now;
    })
    .sort((a, b) => (memory.records[a.id]?.dueAt ?? 0) - (memory.records[b.id]?.dueAt ?? 0));
  const weak = wordBank
    .filter((word) => {
      const record = memory.records[word.id];
      return record && record.wrong > record.correct && record.stage < 3;
    })
    .sort((a, b) => (memory.records[b.id]?.wrong ?? 0) - (memory.records[a.id]?.wrong ?? 0));
  const fresh = wordBank.filter((word) => !memory.records[word.id]).slice(0, 8);
  const learning = wordBank
    .filter((word) => {
      const record = memory.records[word.id];
      return record && record.stage > 0 && record.stage < 3 && record.dueAt > now;
    })
    .sort((a, b) => (memory.records[a.id]?.stage ?? 0) - (memory.records[b.id]?.stage ?? 0))
    .slice(0, 6);

  const seen = new Set<string>();
  return [...due, ...weak, ...fresh, ...learning]
    .filter((word) => {
      if (seen.has(word.id)) return false;
      seen.add(word.id);
      return true;
    })
    .slice(0, 20);
}

function maskWord(word: string) {
  const letters = word.split("");
  if (letters.length <= 3) return `${letters[0]}${"_".repeat(Math.max(1, letters.length - 1))}`;
  return letters
    .map((letter, index) => {
      if (index === 0 || index === letters.length - 1) return letter;
      return index % 2 === 0 ? "_" : letter;
    })
    .join("");
}

export default function DanciExperience() {
  const [memory, setMemory] = useState<TrainerMemory>(() => createDefaultMemory());
  const [loaded, setLoaded] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [activeId, setActiveId] = useState(wordBank[0].id);
  const [mode, setMode] = useState<TrainingMode>("study");
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const activeWord = wordBank.find((word) => word.id === activeId) ?? wordBank[0];
  const activeRecord = memory.records[activeWord.id] ?? getEmptyRecord();
  const choices = useMemo(
    () => buildChoices(activeWord, memory.totalAnswered + activeWord.word.length + activeRecord.wrong * 7),
    [activeRecord.wrong, activeWord, memory.totalAnswered],
  );
  const stats = useMemo(() => {
    const records = wordBank.map((word) => memory.records[word.id] ?? getEmptyRecord());
    return {
      mastered: records.filter((record) => record.stage >= 4).length,
      active: records.filter((record) => record.stage > 0 && record.stage < 4).length,
      weak: records.filter((record) => record.wrong > record.correct).length,
      due: wordBank.filter((word) => {
        const record = memory.records[word.id];
        return record && record.stage < 4 && record.dueAt <= Date.now();
      }).length,
    };
  }, [memory.records]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setMemory(saved ? normalizeMemory(JSON.parse(saved) as Partial<TrainerMemory>) : createDefaultMemory());
    } catch {
      setMemory(createDefaultMemory());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify(memory));
  }, [loaded, memory]);

  useEffect(() => {
    if (!loaded) return;
    if (queue.length) return;
    const nextQueue = buildQueue(memory).map((word) => word.id);
    setQueue(nextQueue);
    if (nextQueue[0]) {
      const nextWord = wordBank.find((word) => word.id === nextQueue[0]) ?? wordBank[0];
      setActiveId(nextWord.id);
      setMode(getStartMode(nextWord, memory));
    }
  }, [loaded, memory, queue.length]);

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

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    const nextVoices = voices.length ? voices : window.speechSynthesis.getVoices();
    if (!voices.length && nextVoices.length) setVoices(nextVoices);
    const voice = chooseAllowedEnglishVoice(nextVoices);
    if (!voice) {
      setMemory((current) => ({
        ...current,
        lastFeedback: `未找到白名单语音：${allowedEnglishVoiceSummary}`,
      }));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-US";
    utterance.rate = 0.78;
    utterance.pitch = 0.96;
    utterance.volume = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  function startRecall() {
    const nextMemory = {
      ...memory,
      records: {
        ...memory.records,
        [activeWord.id]: {
          ...activeRecord,
          seen: Math.max(1, activeRecord.seen + 1),
          lastMode: "study" as TrainingMode,
          updatedAt: new Date().toISOString(),
        },
      },
      lastFeedback: `${activeWord.word} 已看过。现在开始主动回忆。`,
    };
    setMemory(nextMemory);
    setMode("meaning");
    setOutcome(null);
  }

  function recordAnswer(correct: boolean, answerMode: TrainingMode) {
    const previous = memory.records[activeWord.id] ?? getEmptyRecord();
    const nextStage = correct ? (Math.min(4, previous.stage + 1) as WordRecord["stage"]) : (Math.max(0, previous.stage - 1) as WordRecord["stage"]);
    const nextDueAt = Date.now() + (correct ? reviewIntervals[nextStage] : 4 * 60 * 1000);
    const nextRecord: WordRecord = {
      seen: Math.max(1, previous.seen + 1),
      correct: previous.correct + (correct ? 1 : 0),
      wrong: previous.wrong + (correct ? 0 : 1),
      stage: nextStage,
      dueAt: nextDueAt,
      lastMode: answerMode,
      updatedAt: new Date().toISOString(),
    };
    const nextStreak = correct ? memory.streak + 1 : 0;
    const nextMemory: TrainerMemory = {
      ...memory,
      records: {
        ...memory.records,
        [activeWord.id]: nextRecord,
      },
      todayAnswered: memory.todayAnswered + 1,
      totalAnswered: memory.totalAnswered + 1,
      streak: nextStreak,
      bestStreak: Math.max(memory.bestStreak, nextStreak),
      lastFeedback: correct
        ? `${activeWord.word} 升到「${stageLabel(nextStage)}」，${nextDueText(nextDueAt)}再复习。`
        : `${activeWord.word} 降级并进入错词回流，几题后再回来。`,
    };

    setMemory(nextMemory);
    setOutcome({
      correct,
      title: correct ? "回忆成功" : "还没背牢",
      body: correct ? `下次复习：${nextDueText(nextDueAt)}` : `正确拼写：${activeWord.word}。${activeWord.tip}`,
    });
    setMode("feedback");
    setInput("");
  }

  function answerMeaning(choiceId: string) {
    if (choiceId !== activeWord.id) {
      recordAnswer(false, "meaning");
      return;
    }
    setOutcome({
      correct: true,
      title: "意思认对了",
      body: "不要停在认识。下一步把它拼出来。",
    });
    setMode("spell");
    setInput("");
  }

  function submitSpelling(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    const correct = normalizeAnswer(input) === normalizeAnswer(activeWord.word);
    recordAnswer(correct, mode);
  }

  function giveUp() {
    recordAnswer(false, mode);
  }

  function nextCard() {
    const rest = queue.filter((id) => id !== activeWord.id);
    const nextQueue = outcome?.correct ? rest : [...rest.slice(0, 3), activeWord.id, ...rest.slice(3)];
    const refill = nextQueue.length ? nextQueue : buildQueue(memory).map((word) => word.id).filter((id) => id !== activeWord.id);
    const nextId = refill[0];
    setQueue(refill);
    setOutcome(null);
    setInput("");

    if (!nextId) {
      setMode("feedback");
      setActiveId(activeWord.id);
      setOutcome({
        correct: true,
        title: "今天这一轮清空了",
        body: "没有要强行重置的东西。明天回来，系统会把该复习的词叫出来。",
      });
      return;
    }

    const nextWord = wordBank.find((word) => word.id === nextId) ?? wordBank[0];
    setActiveId(nextWord.id);
    setMode(getStartMode(nextWord, memory));
  }

  function resetMemory() {
    if (!window.confirm("清空本机背词记录？这不会影响网站代码，只会重置这个浏览器里的进度。")) return;
    const nextMemory = createDefaultMemory();
    const nextQueue = buildQueue(nextMemory).map((word) => word.id);
    setMemory(nextMemory);
    setQueue(nextQueue);
    setActiveId(nextQueue[0] ?? wordBank[0].id);
    setMode("study");
    setOutcome(null);
    setInput("");
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>NC</span>
          <div>
            <p>Grade 7 Word Trainer</p>
            <h1>Daily Recall</h1>
          </div>
        </div>
        <div className={styles.progressCard}>
          <div>
            <span>今日回忆</span>
            <strong>{memory.todayAnswered}</strong>
          </div>
          <div className={styles.progressTrack}>
            <i style={{ width: `${Math.min(100, (memory.todayAnswered / 18) * 100)}%` }} />
          </div>
          <p>目标不是刷完，而是把错词叫回来。</p>
        </div>
        <div className={styles.statGrid}>
          <div><span>待复习</span><strong>{stats.due}</strong></div>
          <div><span>学习中</span><strong>{stats.active}</strong></div>
          <div><span>错词</span><strong>{stats.weak}</strong></div>
          <div><span>稳固</span><strong>{stats.mastered}</strong></div>
        </div>
        <button type="button" className={styles.resetButton} onClick={resetMemory}>
          <RefreshCcw size={16} />
          清空本机记录
        </button>
      </aside>

      <section className={styles.workbench}>
        <div className={styles.topLine}>
          <p>{activeWord.unit} / {activeWord.family}</p>
          <span>{stageLabel(activeRecord.stage)}</span>
        </div>

        <article className={styles.card}>
          {mode === "study" ? (
            <StudyView word={activeWord} onSpeak={speak} onStart={startRecall} />
          ) : null}

          {mode === "meaning" ? (
            <MeaningView word={activeWord} choices={choices} onSpeak={speak} onChoose={answerMeaning} />
          ) : null}

          {(mode === "spell" || mode === "listen") ? (
            <SpellingView
              word={activeWord}
              mode={mode}
              input={input}
              onInput={setInput}
              onSubmit={submitSpelling}
              onSpeak={speak}
              onGiveUp={giveUp}
            />
          ) : null}

          {mode === "feedback" && outcome ? (
            <FeedbackView word={activeWord} outcome={outcome} record={memory.records[activeWord.id] ?? activeRecord} onSpeak={speak} onNext={nextCard} />
          ) : null}
        </article>

        <div className={styles.feedbackLine}>
          <Sparkles size={15} />
          <span>{memory.lastFeedback}</span>
        </div>
      </section>

      <aside className={styles.queuePanel}>
        <div className={styles.panelHeader}>
          <p>Today Queue</p>
          <strong>{queue.length || buildQueue(memory).length}</strong>
        </div>
        <div className={styles.queueList}>
          {(queue.length ? queue : buildQueue(memory).map((word) => word.id)).slice(0, 12).map((id) => {
            const word = wordBank.find((item) => item.id === id);
            if (!word) return null;
            const record = memory.records[word.id] ?? getEmptyRecord();
            return (
              <button
                key={word.id}
                type="button"
                className={word.id === activeWord.id ? styles.activeQueueItem : ""}
                onClick={() => {
                  setActiveId(word.id);
                  setMode(getStartMode(word, memory));
                  setOutcome(null);
                  setInput("");
                }}
              >
                <span>{word.word}</span>
                <small>{stageLabel(record.stage)} · {word.meaning}</small>
              </button>
            );
          })}
        </div>
      </aside>
    </main>
  );
}

function StudyView({ word, onSpeak, onStart }: { word: WordItem; onSpeak: (text: string) => void; onStart: () => void }) {
  return (
    <div className={styles.studyView}>
      <div className={styles.modePill}><Brain size={16} />先看一眼</div>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(`${word.word}. ${word.example}`)}>
        <Volume2 size={20} />
      </button>
      <h2>{word.word}</h2>
      <p className={styles.meaning}>{word.meaning}</p>
      <div className={styles.exampleBox}>{word.example}</div>
      <div className={styles.tipBox}>{word.tip}</div>
      <button type="button" className={styles.primaryButton} onClick={onStart}>
        开始回忆
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
    <div className={styles.quizView}>
      <div className={styles.modePill}><Brain size={16} />先认意思</div>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(word.word)}>
        <Volume2 size={20} />
      </button>
      <h2>{word.word}</h2>
      <p className={styles.prompt}>这个词是什么意思？先在脑子里说出来，再点选项。</p>
      <div className={styles.choiceGrid}>
        {choices.map((choice) => (
          <button key={choice.id} type="button" onClick={() => onChoose(choice.id)}>
            {choice.meaning}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpellingView({
  word,
  mode,
  input,
  onInput,
  onSubmit,
  onSpeak,
  onGiveUp,
}: {
  word: WordItem;
  mode: TrainingMode;
  input: string;
  onInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSpeak: (text: string) => void;
  onGiveUp: () => void;
}) {
  const listenMode = mode === "listen";
  return (
    <form className={styles.quizView} onSubmit={onSubmit}>
      <div className={styles.modePill}>{listenMode ? "听音写词" : "缺字母拼写"}</div>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(word.word)}>
        <Volume2 size={20} />
      </button>
      <h2>{listenMode ? "Listen" : maskWord(word.word)}</h2>
      <p className={styles.prompt}>{word.meaning}。{listenMode ? "听完直接写英文。" : `提示：${word.tip}`}</p>
      <input
        value={input}
        onChange={(event) => onInput(event.target.value)}
        placeholder="输入英文单词"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <div className={styles.actionRow}>
        <button type="submit" className={styles.primaryButton}>
          <Check size={17} />
          提交
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onGiveUp}>
          看答案，稍后再来
        </button>
      </div>
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
    <div className={styles.feedbackView}>
      <div className={outcome.correct ? styles.goodBadge : styles.badBadge}>
        {outcome.correct ? "Correct" : "Again"}
      </div>
      <button type="button" className={styles.audioButton} onClick={() => onSpeak(`${word.word}. ${word.example}`)}>
        <Volume2 size={20} />
      </button>
      <h2>{outcome.title}</h2>
      <p className={styles.meaning}>{word.word} · {word.meaning}</p>
      <div className={styles.exampleBox}>{word.example}</div>
      <div className={styles.tipBox}>{outcome.body}</div>
      <div className={styles.stageRail}>
        {[0, 1, 2, 3, 4].map((stage) => (
          <span key={stage} className={record.stage >= stage ? styles.stageOn : ""}>{stageLabel(stage)}</span>
        ))}
      </div>
      <button type="button" className={styles.primaryButton} onClick={onNext}>
        下一个
      </button>
    </div>
  );
}
