"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCheck, ChevronRight, Clock3, ExternalLink, Feather, Leaf, Lightbulb, LoaderCircle, MessageCircle, PencilLine, RotateCcw, Sparkles, Sprout, Target, Volume2 } from "lucide-react";
import { getWord, WORD_CATALOG } from "@/lib/english-study/catalog";
import { emptyProgress, getStudyStats, gradeAnswer, makeSession, recordAnswer, restoreProgress } from "@/lib/english-study/engine";
import type { Grade, StudyProgress, StudySession, WordItem } from "@/lib/english-study/types";
import { AssessmentPanel } from "./assessment-panel";
import { VocabularyPanel } from "./vocabulary-panel";
import { askTutor, CoachAnswer, CoachDrawer, isTutorReply, type TutorReply } from "./ai-coach";
import styles from "./study.module.css";

const STORAGE_KEY = "brightStepsStudyV1";
type View = "today" | "vocabulary" | "assessment";
type Card = { key: string; wordId: string; mode: "recall" | "cloze"; retry?: boolean };
type CardResult = { answer: string; correct: boolean; assisted: boolean };
type Run = {
  session: StudySession;
  step: number;
  answers: Record<string, CardResult>;
  retryWordIds: string[];
  draft: string;
  hint: number;
  sentenceWordId: string;
  sentence: string;
  sentenceReply?: TutorReply;
  summaryReply?: TutorReply;
  complete: boolean;
};
type Saved = { version: 1; grade: Grade; progress: StudyProgress; run: Run | null; otherRuns: Partial<Record<Grade, Run>>; exposures: Record<string, number> };
const initialSaved = (): Saved => ({ version: 1, grade: "7", progress: emptyProgress(), run: null, otherRuns: {}, exposures: {} });

function cardsFor(run: Run): Card[] {
  return [
    ...run.session.wordIds.map((wordId) => ({ key: `recall-${wordId}`, wordId, mode: "recall" as const })),
    ...run.session.clozeWordIds.map((wordId) => ({ key: `cloze-${wordId}`, wordId, mode: "cloze" as const })),
    ...run.retryWordIds.map((wordId) => ({ key: `retry-${wordId}`, wordId, mode: "recall" as const, retry: true })),
  ];
}

function restoreSaved(value: unknown): Saved {
  const base = initialSaved();
  if (!value || typeof value !== "object") return base;
  const stored = value as Partial<Saved>;
  if (stored.version !== 1) return base;
  base.grade = ["7", "8", "9", "general"].includes(stored.grade ?? "") ? stored.grade! : "7";
  base.progress = restoreProgress(stored.progress);
  if (stored.exposures && typeof stored.exposures === "object") {
    base.exposures = Object.fromEntries(Object.entries(stored.exposures).filter(([key, time]) => getWord(key) && typeof time === "number" && Number.isFinite(time)));
  }
  if (stored.otherRuns && typeof stored.otherRuns === "object") {
    for (const grade of ["7", "8", "9", "general"] as Grade[]) {
      if (grade === base.grade) continue;
      const parked = restoreSaved({ version: 1, grade, run: stored.otherRuns[grade] }).run;
      if (parked && parked.session.grade === grade) base.otherRuns[grade] = parked;
    }
  }
  const run = stored.run;
  if (run?.session && Array.isArray(run.session.wordIds) && run.session.wordIds.length > 0 && run.session.wordIds.length <= 6 && run.session.wordIds.every((id) => typeof id === "string" && getWord(id)) && Array.isArray(run.session.clozeWordIds) && run.session.clozeWordIds.length <= 3 && run.session.clozeWordIds.every((id) => run.session.wordIds.includes(id)) && typeof run.session.id === "string" && typeof run.session.createdAt === "string" && Number.isFinite(Date.parse(run.session.createdAt)) && ["7", "8", "9", "general"].includes(run.session.grade) && typeof run.session.dateKey === "string" && Number.isInteger(run.step) && run.step >= 0 && run.step <= 12 && Array.isArray(run.retryWordIds) && run.retryWordIds.length <= 3 && run.retryWordIds.every((id) => run.session.wordIds.includes(id)) && run.answers && typeof run.answers === "object" && typeof run.draft === "string" && typeof run.sentence === "string" && typeof run.complete === "boolean") {
    const possibleCards = cardsFor(run);
    const answers: Record<string, CardResult> = {};
    for (const card of possibleCards) {
      const result = run.answers[card.key];
      if (result && typeof result.answer === "string" && typeof result.correct === "boolean" && typeof result.assisted === "boolean") answers[card.key] = { ...result, answer: result.answer.slice(0, 200) };
    }
    // Never restore beyond an unanswered card, even from a stale or damaged save.
    const firstUnanswered = possibleCards.findIndex((card) => !answers[card.key]);
    const maxStep = firstUnanswered < 0 ? possibleCards.length : firstUnanswered;
    base.run = { ...run, step: Math.min(run.step, maxStep), answers, draft: run.draft.slice(0, 200), sentence: run.sentence.slice(0, 600), hint: Math.min(3, Math.max(0, Number(run.hint) || 0)), sentenceWordId: run.session.wordIds.includes(run.sentenceWordId) ? run.sentenceWordId : run.session.wordIds[0], complete: run.complete && firstUnanswered < 0 };
    if (!isTutorReply(run.sentenceReply)) delete base.run.sentenceReply;
    if (!isTutorReply(run.summaryReply)) delete base.run.summaryReply;
  }
  return base;
}

function maskedExample(word: WordItem) {
  const words = [word.word, ...word.variants].map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return word.example.replace(new RegExp(`\\b(?:${words.join("|")})\\b`, "gi"), "______");
}

function playWord(word: string): boolean {
  if (!("speechSynthesis" in window)) return false;
  const utterance = new SpeechSynthesisUtterance(word);
  const voice = window.speechSynthesis.getVoices().find((item) => item.lang.startsWith("en"));
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-GB";
  utterance.rate = .85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export default function StudyExperience({ initialView = "today" }: { initialView?: View }) {
  const [saved, setSaved] = useState<Saved>(initialSaved);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const [studying, setStudying] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const [coach, setCoach] = useState<{ wordId?: string } | null>(null);
  const [feedbackAI, setFeedbackAI] = useState<TutorReply | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const pendingAI = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const storageReadable = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Restore the device's independent learning profile once after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSaved(restoreSaved(JSON.parse(raw)));
      }
    } catch {
      storageReadable.current = false;
      setStorageWarning("此设备暂时无法读取存档，原存档已保留。这次练习仅临时保存，请刷新重试。");
    }
    setReady(true);
    return () => pendingAI.current?.abort();
  }, []);

  useEffect(() => {
    if (!ready || !storageReadable.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
    catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageWarning("浏览器没有保存成功。请允许本地存储；关闭页面可能丢失本次进度。");
    }
  }, [saved, ready]);

  const run = saved.run;
  const cards = run ? cardsFor(run) : [];
  const card = run ? cards[run.step] : undefined;
  const word = card ? getWord(card.wordId) : undefined;
  const result = card && run ? run.answers[card.key] : undefined;
  const stats = getStudyStats(saved.progress, saved.grade);
  const selectedWords = run?.session.wordIds.map(getWord).filter((item): item is WordItem => !!item) ?? [];
  const currentGrade = studying && run ? run.session.grade : saved.grade;
  const recallResults = run ? run.session.wordIds.map((id) => run.answers[`recall-${id}`]).filter(Boolean) : [];
  const recalled = recallResults.filter((item) => item.correct && !item.assisted).length;
  const assisted = recallResults.filter((item) => item.assisted || !item.correct).length;

  function expose(wordId: string) { setSaved((previous) => ({ ...previous, exposures: { ...previous.exposures, [wordId]: Date.now() } })); }
  function exposeText(text: string) {
    const ids = WORD_CATALOG.filter((item) => new RegExp(`\\b${item.word}\\b`, "i").test(text)).map((item) => item.id);
    if (ids.length) setSaved((previous) => ({ ...previous, exposures: { ...previous.exposures, ...Object.fromEntries(ids.map((id) => [id, Date.now()])) } }));
  }
  function updateRun(update: Partial<Run>) { setSaved((previous) => previous.run ? { ...previous, run: { ...previous.run, ...update } } : previous); }
  function clearAI() { pendingAI.current?.abort(); setAiLoading(false); setFeedbackAI(null); setAiError(""); }
  function navigate(next: View) {
    clearAI(); setStudying(false); setView(next);
  }
  function changeGrade(grade: Grade) {
    clearAI();
    setSaved((previous) => {
      if (grade === previous.grade) return previous;
      const otherRuns = { ...previous.otherRuns, ...(previous.run ? { [previous.grade]: previous.run } : {}) };
      const resumed = otherRuns[grade] ?? null;
      delete otherRuns[grade];
      return { ...previous, grade, run: resumed, otherRuns };
    });
  }
  function begin() {
    clearAI();
    if (!run || run.complete) {
      const session = makeSession({ grade: saved.grade, progress: saved.progress });
      setSaved((previous) => ({ ...previous, run: { session, step: 0, answers: {}, retryWordIds: [], draft: "", hint: 0, sentenceWordId: session.wordIds[0], sentence: "", complete: false } }));
    }
    setStudying(true); setView("today"); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function explain(currentWord: WordItem, studentAnswer: string, mode: "recall" | "cloze") {
    clearAI(); setAiLoading(true); expose(currentWord.id);
    const controller = new AbortController(); pendingAI.current = controller;
    try {
      const reply = await askTutor({ mode: "explain", exercise: mode, grade: currentGrade, wordId: currentWord.id, answer: studentAnswer || "还没想起来", question: mode === "recall" ? `我在根据中文释义回忆单词时遇到困难。请说明如何区分我的表达与本轮目标词 ${currentWord.word}，给出一个记忆提示和新情境小练习。若我的表达是合理同义词，不要说成英语错误。` : "请解释这道语境题中我漏掉的线索，帮我理解这个词或搭配，再换个情境练一次。" }, controller.signal);
      if (!controller.signal.aborted) { setFeedbackAI(reply); exposeText(JSON.stringify(reply)); }
    } catch (cause) { if (!controller.signal.aborted) setAiError(cause instanceof Error ? cause.message : "暂时没连上，请再试一次。"); }
    finally { if (!controller.signal.aborted) setAiLoading(false); }
  }
  function submit(answer: string, reveal = false) {
    if (!run || !card || !word || result) return;
    const correct = !reveal && gradeAnswer(word, answer, card.mode);
    // eslint-disable-next-line react-hooks/purity -- This function runs only from submit/click handlers, never during render.
    const recentExposure = Date.now() - (saved.exposures[word.id] ?? 0) < 30 * 60 * 1000;
    const supported = run.hint > 0 || recentExposure || !!card.retry;
    const recorded = { answer, correct, assisted: supported || reveal };
    const needsRetry = !correct && !card.retry && card.mode === "recall" && run.retryWordIds.length < 3 && !run.retryWordIds.includes(word.id);
    setSaved((previous) => {
      if (!previous.run || previous.run.session.id !== run.session.id || previous.run.answers[card.key]) return previous;
      return {
        ...previous,
        progress: recordAnswer(previous.progress, { eventId: `${run.session.id}:${card.key}`, wordId: word.id, mode: card.mode, correct, hintShown: supported, answerShown: reveal || run.hint >= 3 }),
        exposures: { ...previous.exposures, [word.id]: Date.now() },
        run: { ...previous.run, answers: { ...previous.run.answers, [card.key]: recorded }, retryWordIds: needsRetry ? [...previous.run.retryWordIds, word.id] : previous.run.retryWordIds },
      };
    });
    exposeText(`${word.word} ${word.tip} ${word.example} ${card.mode === "cloze" ? word.cloze.explanation : ""}`);
    if (!correct) void explain(word, answer, card.mode);
  }
  function next() {
    if (!run || !result) return;
    clearAI(); updateRun({ step: run.step + 1, hint: 0, draft: "" });
    inputRef.current?.focus(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function checkSentence() {
    if (!run || run.sentence.trim().length < 3 || aiLoading || run.sentenceReply) return;
    clearAI(); setAiLoading(true);
    const controller = new AbortController(); pendingAI.current = controller;
    const sessionId = run.session.id;
    try {
      const reply = await askTutor({ mode: "sentence", grade: run.session.grade, wordId: run.sentenceWordId, answer: run.sentence, question: "请检查这句自主表达能否传达意思、目标词是否用得合适。接受合理的不同表达。只指出一个最值得改进的地方，不假定学生掌握了这个词。" }, controller.signal);
      if (!controller.signal.aborted) setSaved((previous) => previous.run?.session.id === sessionId ? {
        ...previous,
        progress: reply.sentence?.targetUsed ? recordAnswer(previous.progress, { eventId: `${sessionId}:sentence`, wordId: run.sentenceWordId, mode: "sentence", correct: !!reply.sentence?.acceptable, hintShown: true, answerShown: true }) : previous.progress,
        run: { ...previous.run, sentenceReply: reply },
      } : previous);
    } catch (cause) { if (!controller.signal.aborted) setAiError(cause instanceof Error ? cause.message : "暂时没连上，请再试一次。"); }
    finally { if (!controller.signal.aborted) setAiLoading(false); }
  }
  async function finish() {
    if (!run || aiLoading) return;
    clearAI(); updateRun({ complete: true }); setAiLoading(true);
    if (!run.complete) window.scrollTo({ top: 0, behavior: "smooth" });
    const controller = new AbortController(); pendingAI.current = controller;
    const sessionId = run.session.id;
    try {
      const reply = await askTutor({ mode: "summary", grade: run.session.grade, sessionEvidence: { reviewed: run.session.wordIds.length, correct: recalled, assisted, weakWordIds: run.session.wordIds.filter((id) => !run.answers[`recall-${id}`]?.correct || run.answers[`recall-${id}`]?.assisted), notes: ["correct 仅是本次第一轮未提示想起的词数，不是考试分数或永久掌握。", run.sentenceReply ? "做过一次刚学习目标词后的自主造句，不是延迟无提示测验。" : "本次跳过了自主造句，不应声称已经会运用。"] } }, controller.signal);
      if (!controller.signal.aborted) setSaved((previous) => previous.run?.session.id === sessionId ? { ...previous, run: { ...previous.run, summaryReply: reply } } : previous);
    } catch (cause) { if (!controller.signal.aborted) setAiError(cause instanceof Error ? cause.message : "AI 总结暂时没连上，学习记录已保存。"); }
    finally { if (!controller.signal.aborted) setAiLoading(false); }
  }
  const isSentence = studying && run && !run.complete && !card;
  return <div className={styles.app} lang="zh-CN">
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/english" aria-label="Bright Steps 英语首页"><div className={styles.brandIcon}><Sprout size={25} strokeWidth={1.7} /></div><div><strong>Bright Steps</strong><span>每天，学懂一点</span></div></Link>
        <nav className={styles.nav} aria-label="英语学习导航">
          <button className={view === "today" ? styles.navActive : ""} onClick={() => navigate("today")}><Leaf size={18} /> 今日学习</button>
          <button className={view === "vocabulary" ? styles.navActive : ""} onClick={() => navigate("vocabulary")}><BookOpen size={18} /> 我的词汇</button>
          <button className={view === "assessment" ? styles.navActive : ""} onClick={() => navigate("assessment")}><Target size={18} /> 词汇自测</button>
        </nav>
        <div className={styles.sidebarNote}><Feather className={styles.smallLeaf} size={22} /><p>不用一下学很多。<br />把今天的一点学扎实。</p><Link href="/english/classic">旧版练习 <ExternalLink size={11} /></Link></div>
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>学习空间 <ChevronRight size={13} /><strong>{studying ? "今天的练习" : view === "today" ? "今日学习" : view === "vocabulary" ? "我的词汇" : "词汇自测"}</strong></div>
          <div className={styles.topActions}>
            {view !== "assessment" && <label className={styles.gradeControl}>学习内容 <select value={currentGrade} disabled={studying} onChange={(event) => changeGrade(event.target.value as Grade)} aria-label="选择学习内容"><option value="7">七年级精选</option><option value="8">八年级精选</option><option value="9">九年级精选</option><option value="general">通用词汇</option></select></label>}
            <button className={styles.coachButton} onClick={() => setCoach({ wordId: studying ? word?.id : undefined })}><Sparkles size={15} /> 问问 AI 老师</button>
          </div>
        </header>
        {storageWarning && <p className={styles.storageWarning} role="alert">{storageWarning}</p>}
        {!ready ? <p className={styles.loading}><LoaderCircle className={styles.spin} size={18} /> 正在找回你的学习进度…</p> : view === "vocabulary" ? <VocabularyPanel progress={saved.progress} grade={saved.grade} onAsk={(wordId) => setCoach({ wordId })} onExposure={expose} /> : view === "assessment" ? <AssessmentPanel onExposure={expose} /> : !studying ? <>
          <div className={styles.welcome}><div><span className={styles.eyebrow}>A LITTLE BETTER, EVERY DAY</span><h1>把英语，学得轻一点。</h1><p className={styles.muted}>先补容易忘的，再学一点新的。今天就从这里开始。</p></div><span className={styles.date}>{new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}</span></div>
          <section className={styles.hero}>
            <div className={styles.heroContent}><div className={styles.heroKicker}><Clock3 size={14} /> {run?.complete ? "一点点积累，都有记录" : "今天的小计划 · 约 10 分钟"}</div><h2>{run?.complete ? "上次的练习，记下了。" : run ? "接着上次，继续学。" : "6 个核心词，从记住到会用。"}</h2><p>{run?.complete ? `上次练了 ${run.session.wordIds.length} 个词。回看小结，再决定是否多练一点。` : run ? `上次完成了 ${Object.keys(run.answers).length} 个小练习，进度已经替你留好。` : stats.due > 0 ? `有 ${stats.due} 个词到了复习时间，今天会先照顾它们。` : "先试着回想，再放进句子。遇到不懂的，让 AI 老师帮你讲明白。"}</p><div className={styles.heroBottom}><button className={styles.primaryButton} onClick={run?.complete ? () => { setStudying(true); setView("today"); } : begin}>{run?.complete ? "查看上次小结" : run ? "继续学习" : "开始今天的学习"}<ArrowRight size={17} /></button>{run?.complete ? <button className={styles.textButton} onClick={begin}>再练一组</button> : <span>不用先测评</span>}</div></div>
            <div className={styles.heroArt} aria-hidden="true"><div className={styles.artCircle} /><div className={styles.notebook}><b>Aa.</b><small>ONE SMALL STEP</small><i /><i /></div><div className={styles.pencil} /><Sparkles className={styles.artSpark} size={26} /><div className={styles.artTag}><Check size={13} /> I can do this.</div></div>
          </section>
          <div className={styles.stats}><div className={styles.stat}><label>在这个词库练过</label><strong>{stats.seen}</strong><small>/ {stats.total} 词</small></div><div className={styles.stat}><label>到了复习时间</label><strong>{stats.due}</strong><small>词</small></div><div className={styles.stat}><label>隔日也能想起</label><strong>{stats.delayed}</strong><small>词</small></div></div>
          <div className={styles.lowerGrid}><section><div className={styles.sectionTitle}><h2>今天，分三小步</h2><span>少一点负担，多一点理解</span></div><div className={styles.planSteps}>
            <div className={styles.planStep}><span className={styles.stepIcon}><RotateCcw size={18} /></span><div><h3>先试着想起来</h3><p>记不清也没关系，一点点提示你</p></div><small>6 个词</small></div>
            <div className={styles.planStep}><span className={styles.stepIcon}><BookOpen size={18} /></span><div><h3>放进句子里理解</h3><p>抓住语境和搭配，知道为什么选它</p></div><small>3 道题</small></div>
            <div className={styles.planStep}><span className={styles.stepIcon}><PencilLine size={18} /></span><div><h3>自己说一句</h3><p>写你的想法，AI 帮你把表达理顺</p></div><small>1 次表达</small></div>
          </div></section><section><div className={styles.sectionTitle}><h2>学习小提醒</h2><span><Leaf size={14} /></span></div><div className={styles.tipCard}><span className={styles.eyebrow}>让记忆多走一步</span><h3>“看着认识”之后，<br />试试合上答案。</h3><p>独立想起一次，比反复点“会了”更能看出哪里还不牢。没想起来的词，会再回来陪你练。</p><button className={styles.textButton} onClick={() => setCoach({})}>有个问题，想问老师 <ArrowRight size={13} /></button></div></section></div>
          <p className={styles.pageFoot}><Sprout size={12} /> 核心词主题精选 · 进度保存在此设备 · 大众可直接进入词汇自测</p>
        </> : run?.complete ? <section className={styles.session}>
          <div className={styles.summaryHeader}><div className={styles.completionMark}><CheckCheck size={30} /></div><span className={styles.eyebrow}>ONE STEP FORWARD</span><h1>今天的这一点，练好了。</h1><p>看看哪些能独立想起，哪些下次再巩固。</p></div>
          <div className={styles.studyCard}><div className={styles.summaryStats}><div><strong>{run.session.wordIds.length}</strong><span>本次练习词数</span></div><div><strong>{recalled}</strong><span>第一轮独立想起</span></div><div><strong>{assisted}</strong><span>需要再巩固</span></div></div>
            <span className={styles.eyebrow}>这次接触的词</span><div className={styles.wordPills}>{selectedWords.map((item) => <span key={item.id}>{item.word}</span>)}</div>
            <p className={styles.muted}>复习时间已经安排好。下次开始学习，会优先抽到需要巩固的词。</p><p className={styles.inlineNote}>这是一轮练习记录，不代表考试分数或长期掌握。刚看过答案的正确回答，单独记录为有提示完成。</p>
            {aiLoading && <p className={styles.loading}><LoaderCircle size={17} className={styles.spin} /> AI 老师正在整理这次的学习建议…</p>}{run.summaryReply && <CoachAnswer reply={run.summaryReply} />}{aiError && <p role="alert" className={styles.error}>{aiError}</p>}{!run.summaryReply && !aiLoading && <button className={styles.textButton} onClick={() => void finish()}><Sparkles size={15} /> 请 AI 整理学习建议</button>}
          </div><div className={styles.summaryActions}><button className={styles.primaryButton} onClick={() => navigate("today")}>回到今日学习 <ArrowRight size={16} /></button><button className={styles.secondaryButton} onClick={() => navigate("vocabulary")}>看看我的词汇</button></div>
        </section> : run ? <section className={styles.session}>
          <div className={styles.sessionTop}><button className={styles.textButton} onClick={() => navigate("today")}><ArrowLeft size={15} /> 暂停，稍后继续</button><span>{isSentence ? "最后一步 · 自己用一次" : `${run.step + 1} / ${cards.length + 1} 个小练习`}</span></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="今日学习进度" aria-valuemin={0} aria-valuemax={cards.length + 1} aria-valuenow={run.step}><i style={{ width: `${run.step / (cards.length + 1) * 100}%` }} /></div>
          {word && card ? <div className={styles.studyCard} key={card.key}>
            <div className={styles.cardMeta}><span className={styles.badge}>{card.retry ? <><RotateCcw size={12} /> 隔几题，再想一次</> : card.mode === "recall" ? <><PencilLine size={12} /> 回想单词</> : <><BookOpen size={12} /> 语境运用</>}</span><span>{word.topic}</span></div>
            <span className={styles.eyebrow}>{card.mode === "recall" ? "这个意思，可以怎样说？" : "读懂句子，再选合适的词"}</span>
            <h2 className={styles.questionHeading}>{card.mode === "recall" ? word.meaning : "把词放回句子里。"}</h2>
            {card.mode === "recall" ? <p className={styles.muted}>试写本轮核心词。想不起时，先要一点提示。</p> : <p className={styles.questionContext} lang="en">{word.cloze.sentence}</p>}
            {!result && card.mode === "recall" && <form className={styles.answerForm} onSubmit={(event) => { event.preventDefault(); if (run.draft.trim()) submit(run.draft); }}><label className={styles.srOnly} htmlFor="word-answer">输入英文单词</label><input ref={inputRef} id="word-answer" autoFocus className={styles.answerInput} value={run.draft} onChange={(event) => updateRun({ draft: event.target.value })} maxLength={120} placeholder="试着写出英文…" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
              {run.hint > 0 && <div className={styles.hint} role="status">{run.hint === 1 ? `以 ${word.word[0]} 开头，共 ${word.word.length} 个字母。` : run.hint === 2 ? <><span>放进这个句子想想：</span><p lang="en">{maskedExample(word)}</p></> : <><span>这次先记住它：</span><strong lang="en">{word.word}</strong><p>{word.tip}</p></>}</div>}
              <div className={styles.answerActions}><button type="button" className={styles.textButton} onClick={() => { updateRun({ hint: Math.min(3, run.hint + 1) }); if (run.hint >= 2) expose(word.id); }} disabled={run.hint >= 3}><Lightbulb size={15} />{run.hint === 0 ? "给我一点提示" : run.hint < 2 ? "再给一点提示" : "看看答案"}</button><button className={styles.primaryButton} disabled={!run.draft.trim()}>检查一下 <ArrowRight size={16} /></button></div>
              <button type="button" className={styles.textButton} style={{ marginTop: 12, fontSize: 12 }} onClick={() => submit("", true)}>还没想起来，先学这个词</button>
            </form>}
            {!result && card.mode === "cloze" && <div className={styles.optionList}>{word.cloze.options.map((option, index) => <button className={styles.option} key={option} onClick={() => submit(option)}><em>{"ABCD"[index]}</em>{option}</button>)}</div>}
            {result && <div className={styles.feedback} aria-live="polite"><div className={`${styles.feedbackHeading} ${!result.correct ? styles.neutral : ""}`}>{result.correct ? <Check size={20} /> : <Leaf size={20} />}{result.correct ? result.assisted ? "借助提示，这次完成了。" : card.mode === "recall" ? "这次，你自己想起来了。" : "对，抓住了句子的线索。" : "一起把这个词理清楚。"}</div><div className={styles.answerWord} lang="en">{word.word} <button className={styles.textButton} aria-label={`朗读 ${word.word}`} onClick={() => { if (!playWord(word.word)) setAiError("此浏览器暂不支持朗读，可以先看音标学习。"); }}><Volume2 size={18} /></button></div><p>{word.phonetic} · {word.meaning}</p><p>{card.mode === "cloze" ? word.cloze.explanation : word.tip}</p><div className={styles.example}><p lang="en">{word.example}</p><span>{word.translation}</span></div>
              {card.retry && <p className={styles.inlineNote}>这是同一次学习里的巩固，不计作隔日记忆。</p>}
              {aiLoading && <p className={styles.loading}><LoaderCircle size={17} className={styles.spin} /> 正在帮你找一个更好懂的解释…</p>}{feedbackAI && <CoachAnswer key={card.key} reply={feedbackAI} />}{aiError && <div className={styles.error} role="alert">{aiError}<br /><button className={styles.textButton} onClick={() => void explain(word, result.answer, card.mode)}>再请 AI 讲一次</button></div>}
              <div className={styles.feedbackActions}><button className={styles.textButton} onClick={() => void explain(word, result.answer, card.mode)} disabled={aiLoading}><Sparkles size={15} />{feedbackAI ? "换个解释" : "让 AI 讲明白"}</button><button className={styles.primaryButton} onClick={next}>继续 <ArrowRight size={16} /></button></div>
            </div>}
          </div> : <div className={styles.studyCard}>
            <div className={styles.cardMeta}><span className={styles.badge}><MessageCircle size={12} /> 自己用一次</span><span>AI 陪你理顺表达</span></div><h2 className={styles.questionHeading}>这一次，说你的想法。</h2><p className={styles.sentencePrompt}>选一个今天的词，写一句与自己有关的英文。可以说学校、生活或你的计划，<strong>不用和例句一样。</strong></p>
            <div className={styles.sentenceTargets}>{selectedWords.slice(0, 4).map((item) => <button key={item.id} disabled={aiLoading || !!run.sentenceReply} className={run.sentenceWordId === item.id ? styles.targetActive : ""} onClick={() => updateRun({ sentenceWordId: item.id })}>{item.word}</button>)}</div>
            <label className={styles.srOnly} htmlFor="my-sentence">写一句自己的英文</label><textarea id="my-sentence" className={styles.sentenceInput} rows={4} autoFocus maxLength={600} value={run.sentence} disabled={aiLoading || !!run.sentenceReply} onChange={(event) => updateRun({ sentence: event.target.value })} placeholder="写一句自己的英文，语法不确定也可以试试。" />
            {aiLoading && <p className={styles.loading}><LoaderCircle size={17} className={styles.spin} /> AI 老师正在认真看你的表达…</p>}{aiError && <p className={styles.error} role="alert">{aiError}</p>}{run.sentenceReply && <CoachAnswer reply={run.sentenceReply} />}
            <div className={styles.answerActions}>{!run.sentenceReply ? <><button className={styles.textButton} onClick={() => void finish()} disabled={aiLoading}>这次先跳过</button><button className={styles.primaryButton} onClick={() => void checkSentence()} disabled={aiLoading || run.sentence.trim().length < 3}><Sparkles size={16} /> 请老师看看</button></> : <><span className={styles.inlineNote}>本次为刚学习后的表达练习</span><button className={styles.primaryButton} onClick={() => void finish()} disabled={aiLoading}>完成今天的学习 <Check size={16} /></button></>}</div>
          </div>}
        </section> : null}
      </main>
    </div>
    {coach && <CoachDrawer key={coach.wordId ?? "general"} grade={currentGrade} wordId={coach.wordId} onExposure={expose} onClose={() => setCoach(null)} />}
  </div>;
}
