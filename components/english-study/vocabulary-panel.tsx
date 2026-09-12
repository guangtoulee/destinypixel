"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Search, Volume2 } from "lucide-react";
import { getWordsForGrade } from "@/lib/english-study/catalog";
import { getStudyStats, getWordStatus } from "@/lib/english-study/engine";
import type { Grade, StudyProgress, WordItem } from "@/lib/english-study/types";
import styles from "./reference-panels.module.css";

export interface VocabularyPanelProps {
  progress: StudyProgress;
  grade: Grade;
  onAsk: (wordId: string) => void;
  onExposure?: (wordId: string) => void;
}

type WordFilter = "all" | "due" | "practiced";
const gradeNames: Record<Grade, string> = { "7": "七年级", "8": "八年级", "9": "九年级", general: "通用词汇" };
const statusNames = { new: "还未练习", supported: "已经练过", independent: "独立回忆过", delayed: "隔日回忆过" };

function WordRow({ word, progress, open, onToggle, onAsk, onExposure, onSpeechMessage }: {
  word: WordItem;
  progress: StudyProgress;
  open: boolean;
  onToggle: () => void;
  onAsk: () => void;
  onExposure?: (wordId: string) => void;
  onSpeechMessage: (message: string) => void;
}) {
  const rowRef = useRef<HTMLElement>(null);
  const exposed = useRef(false);
  const status = getWordStatus(progress.memories[word.id]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || !onExposure || exposed.current) return;
    // Seeing the English spelling is exposure too, even before opening its meaning.
    if (typeof IntersectionObserver === "undefined") {
      exposed.current = true;
      onExposure(word.id);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !exposed.current) {
        exposed.current = true;
        onExposure(word.id);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(row);
    return () => observer.disconnect();
  }, [onExposure, word.id]);

  function speak() {
    onExposure?.(word.id);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onSpeechMessage("这个浏览器暂不支持听读，可以换用系统浏览器。");
      return;
    }
    onSpeechMessage("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => /^en[-_]US$/i.test(voice.lang))
      ?? voices.find((voice) => /^en(?:[-_]|$)/i.test(voice.lang));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.lang = englishVoice?.lang ?? "en-US";
    utterance.rate = 0.86;
    utterance.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        onSpeechMessage("这次没有播放成功，请再点一次听读。");
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  return (
    <article ref={rowRef} className={`${styles.wordRow} ${open ? styles.wordRowOpen : ""}`}>
      <div className={styles.wordHeading}>
        <button type="button" className={styles.wordToggle} aria-expanded={open}
          aria-controls={`word-details-${word.id}`} onClick={() => { onExposure?.(word.id); onToggle(); }}>
          <span className={styles.wordLabel}><span lang="en" className={styles.wordEnglish}>{word.word}</span><span className={styles.phonetic}>{word.phonetic}</span></span>
          <span className={`${styles.wordStatus} ${status !== "new" ? styles.wordStatusActive : ""}`}>
            {status === "delayed" && <Check size={13} aria-hidden="true" />}{statusNames[status]}
          </span>
          <ChevronDown size={18} aria-hidden="true" className={open ? styles.chevronOpen : styles.chevron} />
        </button>
        <button type="button" className={styles.audioButton} onClick={speak} aria-label={`听 ${word.word} 的发音`}><Volume2 size={19} aria-hidden="true" /></button>
      </div>
      {open && <div id={`word-details-${word.id}`} className={styles.wordDetails}>
        <p className={styles.wordMeaning}>{word.meaning}</p>
        <div className={styles.exampleBox}><p lang="en">{word.example}</p><p className={styles.exampleTranslation}>{word.translation}</p></div>
        <p className={styles.wordTip}><span>记住这一点</span>{word.tip}</p>
        <button type="button" className={styles.textButton} onClick={() => { onExposure?.(word.id); onAsk(); }}>让 AI 帮我讲清楚 <ArrowUpRight size={16} aria-hidden="true" /></button>
      </div>}
    </article>
  );
}

export function VocabularyPanel({ progress, grade, onAsk, onExposure }: VocabularyPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WordFilter>("all");
  const [openWord, setOpenWord] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [speechMessage, setSpeechMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const words = useMemo(() => getWordsForGrade(grade), [grade]);
  const stats = getStudyStats(progress, grade, new Date(now).toISOString());
  const dueWords = words.filter((word) => {
    const memory = progress.memories[word.id];
    return memory && Date.parse(memory.nextReviewAt) <= now;
  });
  const practicedWords = words.filter((word) => Boolean(progress.memories[word.id]));
  const source = filter === "due" ? dueWords : filter === "practiced" ? practicedWords : words;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredWords = source.filter((word) => [word.word, word.meaning, word.topic].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));

  return (
    <section className={styles.panel} aria-labelledby="vocabulary-heading">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>一点点积累，慢慢用得出来</span>
        <h2 id="vocabulary-heading">你的随身词本</h2>
        <p>{gradeNames[grade]}基础词包 · 当前收录 {words.length} 个词，持续补充中。</p>
      </header>
      <div className={styles.vocabularyOverview}>
        <div className={styles.overviewMain}><span className={styles.smallLabel}>已经开始练习</span><strong>{practicedWords.length}<span> / {words.length} 词</span></strong><p>看过、写出、隔日记得，是不同的进步。</p></div>
        <div className={styles.overviewAside}><span><strong>{stats.due}</strong> 个到期复习</span><span><strong>{stats.delayed}</strong> 个隔日回忆过</span></div>
      </div>
      <div className={styles.searchBox}><Search size={19} aria-hidden="true" /><label className={styles.srOnly} htmlFor="vocabulary-search">搜索英文或中文释义</label><input id="vocabulary-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} placeholder="搜一个词，或它的中文意思" autoComplete="off" /></div>
      <div className={styles.filterRow} aria-label="词本筛选">
        {([{ key: "all", name: "全部", count: words.length }, { key: "due", name: "待复习", count: dueWords.length }, { key: "practiced", name: "已练过", count: practicedWords.length }] as const).map((item) => <button key={item.key} type="button" aria-pressed={filter === item.key} className={`${styles.filterButton} ${filter === item.key ? styles.filterActive : ""}`} onClick={() => { setFilter(item.key); setVisibleCount(12); }}>{item.name}<span>{item.count}</span></button>)}
      </div>
      <div className={styles.wordList}>
        {filteredWords.slice(0, visibleCount).map((word) => <WordRow key={word.id} word={word} progress={progress} open={openWord === word.id} onToggle={() => setOpenWord((current) => current === word.id ? null : word.id)} onAsk={() => onAsk(word.id)} onExposure={onExposure} onSpeechMessage={setSpeechMessage} />)}
        {filteredWords.length === 0 && <div className={styles.emptyState}><strong>{query ? "这里还没有找到这个词" : filter === "due" ? "暂时没有到期的词" : "还没有练习记录"}</strong><p>{query ? "试试更短的英文或中文关键词。当前词包还在补充。" : filter === "due" ? "完成今天的学习后，系统会为你安排下一次复习。" : "从今天的 6 个词开始，练过的词会出现在这里。"}</p></div>}
      </div>
      {filteredWords.length > visibleCount && <button type="button" className={styles.loadMore} onClick={() => setVisibleCount((count) => count + 12)}>再看 {Math.min(12, filteredWords.length - visibleCount)} 个词 <ChevronDown size={16} aria-hidden="true" /></button>}
      <p className={styles.footnote}>这里是基础练习词包，尚未覆盖整册教材。点开词条可看例句和常见用法。</p>
      <p className={styles.speechMessage} role="status" aria-live="polite">{speechMessage}</p>
    </section>
  );
}

export default VocabularyPanel;
