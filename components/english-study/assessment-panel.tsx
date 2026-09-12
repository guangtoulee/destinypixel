"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { ArrowRight, Check, ChevronRight, RotateCcw } from "lucide-react";
import { getWord } from "@/lib/english-study/catalog";
import { buildAssessment } from "@/lib/english-study/engine";
import type { AssessmentItem } from "@/lib/english-study/types";
import styles from "./reference-panels.module.css";

export interface AssessmentPanelProps {
  onFinish?: (score: number, total: number) => void;
  onExposure?: (wordId: string) => void;
}

const STORAGE_KEY = "brightStepsEnglishAssessmentV1";
const STORAGE_EVENT = "bright-steps-assessment-change";
let fallbackSnapshot: string | null = null;
let storageUnavailable = false;

interface AssessmentSession {
  version: 1;
  id: string;
  startedAt: string;
  questions: AssessmentItem[];
  answers: (string | null)[];
  pending?: string | null;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, listener);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(STORAGE_EVENT, listener); };
}

function getSnapshot() {
  if (storageUnavailable) return fallbackSnapshot;
  try { return window.localStorage.getItem(STORAGE_KEY); } catch { storageUnavailable = true; return fallbackSnapshot; }
}

function saveSession(session: AssessmentSession | null) {
  fallbackSnapshot = session ? JSON.stringify(session) : null;
  try {
    if (fallbackSnapshot) window.localStorage.setItem(STORAGE_KEY, fallbackSnapshot);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch { storageUnavailable = true; /* Keep making progress if storage is full or unavailable. */ }
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function parseSession(raw: string | null): AssessmentSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as AssessmentSession;
    if (value.version !== 1 || typeof value.id !== "string" || typeof value.startedAt !== "string" || !Array.isArray(value.questions) || value.questions.length < 1 || value.questions.length > 24 || !Array.isArray(value.answers) || value.answers.length > value.questions.length) return null;
    for (const question of value.questions) {
      const word = getWord(question.wordId);
      if (!word || typeof question.id !== "string" || typeof question.prompt !== "string" || typeof question.explanation !== "string" || question.answer !== word.meaning || !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 8 || !question.options.every((option) => typeof option === "string") || !question.options.includes(question.answer)) return null;
    }
    if (!value.answers.every((answer, index) => answer === null || value.questions[index].options.includes(answer))) return null;
    if (value.pending !== undefined && value.pending !== null && !value.questions[value.answers.length]?.options.includes(value.pending)) return null;
    return value;
  } catch { return null; }
}

function AssessmentResult({ session, onExposure, onRestart }: { session: AssessmentSession; onExposure?: (wordId: string) => void; onRestart: () => void }) {
  const exposedIds = useRef(new Set<string>());
  const score = session.answers.filter((answer, index) => answer === session.questions[index].answer).length;
  const wrongQuestions = useMemo(() => session.questions.filter((question, index) => session.answers[index] !== question.answer), [session]);

  useEffect(() => {
    if (!onExposure) return;
    wrongQuestions.forEach((question) => {
      if (!exposedIds.current.has(question.wordId)) {
        exposedIds.current.add(question.wordId);
        onExposure(question.wordId);
      }
    });
  }, [onExposure, wrongQuestions]);

  const suggestion = score === session.questions.length
    ? "这组词义你都认出来了。下一步试着不看选项写出单词，再把它用进句子。"
    : score >= session.questions.length * 0.6
      ? "已经有一些熟悉的词了。先补上下面这些词，再用短句检验是否真的会用。"
      : "从常用词开始就很好。每天少量学习、隔天再回忆，比一次记很多更容易坚持。";

  return <div className={styles.assessmentResult}>
    <div className={styles.resultSummary}><span className={styles.eyebrow}>本次词义识别结果</span><div className={styles.resultScore}><strong>{score}</strong><span>/ {session.questions.length}</span></div><p>答对 {score} 题 · {session.questions.length - score} 题需要再认识一下</p><div className={styles.resultAdvice}>{suggestion}</div></div>
    {wrongQuestions.length > 0 ? <div className={styles.resultWords}><h3>从这些词开始补起</h3><p className={styles.muted}>现在看看正确词义；下次不看答案，再试一次。</p>{wrongQuestions.map((question) => {
      const word = getWord(question.wordId);
      const index = session.questions.findIndex((item) => item.id === question.id);
      return <article key={question.id} className={styles.resultWord}><div><strong lang="en">{word?.word ?? question.prompt}</strong><span>{question.answer}</span></div><p className={styles.previousAnswer}>你的选择：{session.answers[index] ?? "暂不认识"}</p><p>{question.explanation}</p></article>;
    })}</div> : <div className={styles.completeMessage}><Check size={22} aria-hidden="true" /><p>这一组没有需要订正的词。认识词义之后，还可以练习回忆和表达。</p></div>}
    <p className={styles.scopeNote}>这是当前词包中 {session.questions.length} 个词的识别练习，不代表你的总词汇量，也不能据此判断年级、CEFR 或考试分数。</p>
    <button type="button" className={styles.secondaryButton} onClick={onRestart}><RotateCcw size={17} aria-hidden="true" />换一组再测</button><p className={styles.footnote}>题目会重新抽取和排序，可能包含刚见过的词。复测变高也可能来自对题目的熟悉。</p>
  </div>;
}

export function AssessmentPanel({ onFinish, onExposure }: AssessmentPanelProps) {
  const rawSession = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const session = useMemo(() => parseSession(rawSession), [rawSession]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const exposedQuestions = useRef(new Set<string>());

  function start() {
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const questions = buildAssessment("general", 12, seed);
    saveSession({ version: 1, id: seed, startedAt: new Date().toISOString(), questions, answers: [] });
  }

  function advance() {
    if (!session || session.pending === undefined) return;
    const answers = [...session.answers, session.pending];
    const nextSession: AssessmentSession = { ...session, answers, pending: undefined };
    saveSession(nextSession);
    if (answers.length === session.questions.length) {
      const score = answers.filter((answer, index) => answer === session.questions[index].answer).length;
      onFinish?.(score, session.questions.length);
    }
    headingRef.current?.focus();
  }

  const completed = session && session.answers.length === session.questions.length;
  const question = session && !completed ? session.questions[session.answers.length] : null;
  const questionWordId = question?.wordId;
  const questionExposureKey = session && questionWordId ? `${session.id}:${questionWordId}` : null;

  useEffect(() => {
    if (!questionWordId || !questionExposureKey || !onExposure || exposedQuestions.current.has(questionExposureKey)) return;
    // The visible spelling is support for a later recall, regardless of the selected answer.
    exposedQuestions.current.add(questionExposureKey);
    onExposure(questionWordId);
  }, [questionWordId, questionExposureKey, onExposure]);

  return <section className={styles.panel} aria-labelledby="assessment-heading">
    <header className={styles.panelHeader}><span className={styles.eyebrow}>先了解自己，再决定从哪里开始</span><h2 id="assessment-heading" tabIndex={-1} ref={headingRef}>词汇起点快测</h2><p>面向所有学习者的词义识别小测。</p></header>
    {!session && <div className={styles.assessmentIntro}>
      <span className={styles.introBadge}>约 3 分钟 · 12 道题</span><h3>这些词，你能认出多少？</h3><p>不用准备，也不用猜。选出你认为合适的词义；不熟悉就点“暂不认识”。完成后一起看看，可以先补哪些词。</p>
      <ol className={styles.introSteps}><li><span>01</span>只测词义识别，不考打字速度</li><li><span>02</span>每题选好再继续，最后统一看结果</li><li><span>03</span>中途退出，同一设备可以接着做</li></ol>
      <button type="button" className={styles.primaryButton} onClick={start}>开始快测 <ArrowRight size={18} aria-hidden="true" /></button><p className={styles.scopeNote}>当前题目选自基础与进阶词汇样本，覆盖范围有限。结果用于选择练习起点，不估算总词汇量。</p>
    </div>}
    {session && question && <div className={styles.quiz}>
      <div className={styles.quizProgress}><span>第 {session.answers.length + 1} / {session.questions.length} 题</span><span>词义识别</span></div><div className={styles.progressTrack} role="progressbar" aria-label="测评进度" aria-valuemin={0} aria-valuemax={session.questions.length} aria-valuenow={session.answers.length}><div style={{ width: `${session.answers.length / session.questions.length * 100}%` }} /></div>
      <div className={styles.questionCard}><p className={styles.questionInstruction}>{question.prompt}</p><h3 lang="en">{getWord(question.wordId)?.word}</h3><div className={styles.answerOptions} role="group" aria-label="选择词义">{question.options.map((option, index) => <button key={`${question.id}-${index}`} type="button" aria-pressed={session.pending === option} className={`${styles.answerOption} ${session.pending === option ? styles.answerSelected : ""}`} onClick={() => saveSession({ ...session, pending: option })}><span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span><span>{option}</span>{session.pending === option && <Check size={18} aria-hidden="true" />}</button>)}</div><button type="button" className={`${styles.unknownButton} ${session.pending === null ? styles.unknownSelected : ""}`} aria-pressed={session.pending === null} onClick={() => saveSession({ ...session, pending: null })}>暂不认识，不猜了{session.pending === null && <Check size={16} aria-hidden="true" />}</button></div>
      <div className={styles.quizFooter}><p>按你的第一印象选择就好。</p><button type="button" className={styles.primaryButton} disabled={session.pending === undefined} onClick={advance}>{session.answers.length === session.questions.length - 1 ? "查看结果" : "下一题"}<ChevronRight size={18} aria-hidden="true" /></button></div><p className={styles.footnote}>{storageUnavailable ? "当前浏览器无法保存进度，请在离开页面前完成。" : "进度保存在当前浏览器。"}题目做完前不会显示正确答案。</p>
    </div>}
    {session && completed && <AssessmentResult session={session} onExposure={onExposure} onRestart={start} />}
  </section>;
}

export default AssessmentPanel;
