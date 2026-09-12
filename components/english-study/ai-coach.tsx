"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, LoaderCircle, Sparkles, X } from "lucide-react";
import type { Grade } from "@/lib/english-study/types";
import { getWord, WORD_CATALOG } from "@/lib/english-study/catalog";
import styles from "./study.module.css";

export type TutorReply = {
  message: string;
  correction?: string;
  example?: { en: string; zh: string };
  practice?: { question: string; options: string[]; answerIndex: number; explanation: string };
  sentence?: { communicates: boolean; targetUsed: boolean; acceptable: boolean; reason: string };
  source: "deepseek";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isReplyText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

/** Treat network responses and device saves as unknown until every renderable field is checked. */
export function isTutorReply(value: unknown): value is TutorReply {
  if (!isRecord(value) || value.source !== "deepseek" || !isReplyText(value.message, 3000)) return false;
  if (value.correction !== undefined && !isReplyText(value.correction, 1600)) return false;
  if (value.example !== undefined) {
    if (!isRecord(value.example) || !isReplyText(value.example.en, 700) || !isReplyText(value.example.zh, 700)) return false;
  }
  if (value.practice !== undefined) {
    const practice = value.practice;
    if (!isRecord(practice)
      || !isReplyText(practice.question, 1800)
      || !isReplyText(practice.explanation, 1000)
      || !Array.isArray(practice.options)
      || practice.options.length < 2
      || practice.options.length > 4
      || !Array.from(practice.options).every((option: unknown) => isReplyText(option, 400))
      || typeof practice.answerIndex !== "number"
      || !Number.isInteger(practice.answerIndex)
      || practice.answerIndex < 0
      || practice.answerIndex >= practice.options.length) return false;
    if (new Set(practice.options.map((option: string) => option.trim().toLowerCase())).size !== practice.options.length) return false;
  }
  if (value.sentence !== undefined) {
    const sentence = value.sentence;
    if (!isRecord(sentence)
      || typeof sentence.communicates !== "boolean"
      || typeof sentence.targetUsed !== "boolean"
      || typeof sentence.acceptable !== "boolean"
      || !isReplyText(sentence.reason, 1400)
      || (sentence.acceptable && !sentence.communicates)) return false;
  }
  return true;
}

export type TutorRequest = {
  mode: "ask" | "explain" | "sentence" | "summary";
  exercise?: "recall" | "cloze";
  grade: Grade;
  wordId?: string;
  answer?: string;
  question?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  sessionEvidence?: { reviewed?: number; correct?: number; assisted?: number; weakWordIds?: string[]; notes?: string[] };
};

export async function askTutor(payload: TutorRequest, signal?: AbortSignal): Promise<TutorReply> {
  const response = await fetch("/api/english/study/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok || !isTutorReply(body)) {
    throw new Error(isRecord(body) && typeof body.error === "string" ? body.error : "AI 老师暂时没连上，请稍后再试。你的回答已保留。");
  }
  return body;
}

export function CoachAnswer({ reply }: { reply: TutorReply }) {
  const [selection, setSelection] = useState<{ question: string; index: number } | null>(null);
  const questionKey = JSON.stringify(reply.practice ?? null);
  const selected = selection?.question === questionKey ? selection.index : null;
  return (
    <div className={styles.coachAnswer}>
      <div className={styles.coachLabel}><Sparkles size={15} /> AI 老师 · DeepSeek</div>
      <p className={styles.coachMessage}>{reply.message}</p>
      {reply.correction && <div className={styles.correction}><span>这样说更合适</span><p lang="en">{reply.correction}</p></div>}
      {reply.example && <div className={styles.example}><p lang="en">{reply.example.en}</p><span>{reply.example.zh}</span></div>}
      {reply.practice && <div className={styles.followPractice}>
        <span className={styles.eyebrow}>换个情境，试一下</span>
        <p>{reply.practice.question}</p>
        <div className={styles.practiceOptions}>
          {reply.practice.options.map((option, index) => <button
            type="button" key={`${index}-${option}`} disabled={selected !== null}
            onClick={() => setSelection({ question: questionKey, index })}
            className={selected === index ? styles.optionSelected : ""}
          >{option}{selected === index && (index === reply.practice!.answerIndex ? <Check size={17} /> : <X size={17} />)}</button>)}
        </div>
        {selected !== null && <p className={styles.practiceExplanation} role="status">{selected === reply.practice.answerIndex ? "对，这次理解了。" : "一起看一下："} {reply.practice.explanation}</p>}
      </div>}
    </div>
  );
}

export function CoachDrawer({ grade, wordId, onClose, onExposure }: {
  grade: Grade;
  wordId?: string;
  onClose: () => void;
  onExposure: (wordId: string) => void;
}) {
  const word = wordId ? getWord(wordId) : undefined;
  const [question, setQuestion] = useState(word ? `怎么记住 ${word.word}，做题时又该怎么用？` : "");
  const [turns, setTurns] = useState<{ question: string; reply: TutorReply }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const disclosedTarget = useRef(false);
  useEffect(() => {
    if (wordId && !disclosedTarget.current) { disclosedTarget.current = true; onExposure(wordId); }
  }, [wordId, onExposure]);
  const close = () => { controller.current?.abort(); onClose(); };
  async function send() {
    if (loading || !question.trim()) return;
    setLoading(true); setError("");
    controller.current = new AbortController();
    const original = question.trim();
    try {
      const history = turns.slice(-3).flatMap((turn) => [{ role: "user" as const, content: turn.question }, { role: "assistant" as const, content: turn.reply.message }]);
      const reply = await askTutor({ mode: "ask", grade, wordId, question: original, history }, controller.current.signal);
      const displayed = JSON.stringify(reply).toLowerCase();
      for (const entry of WORD_CATALOG) {
        if (new RegExp(`\\b${entry.word}\\b`, "i").test(displayed)) onExposure(entry.id);
      }
      setTurns((previous) => [...previous, { question: original, reply }]);
      setQuestion((current) => current.trim() === original ? "" : current);
    } catch (cause) {
      if (!(cause instanceof Error && cause.name === "AbortError")) setError(cause instanceof Error ? cause.message : "暂时没连上，请再试一次。");
    } finally { setLoading(false); }
  }
  return <div className={styles.drawerBackdrop} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="coach-title" onKeyDown={(event) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, a[href], input:not(:disabled)'));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <header className={styles.drawerHeader}>
        <div><div className={styles.coachLabel}><Sparkles size={16} /> 随时问一句</div><h2 id="coach-title">哪里没想明白？</h2></div>
        <button className={styles.iconButton} onClick={close} aria-label="关闭 AI 老师"><X size={21} /></button>
      </header>
      <div className={styles.drawerBody} aria-live="polite">
        {turns.length === 0 && <div className={styles.coachWelcome}>
          <span className={styles.coachMark}><Sparkles size={28} /></span>
          <h3>把不懂的，变简单。</h3><p>单词记不住、句子看不懂，或者不知道自己错在哪，都可以直接问。</p>
          {!word && <div className={styles.questionSuggestions}>
            {["borrow 和 lend 到底怎么区分？", "为什么 enjoy 后面要用 doing？", "阅读里遇到生词，怎么猜意思？"].map((text) => <button key={text} onClick={() => setQuestion(text)}>{text}</button>)}
          </div>}
        </div>}
        {turns.map((turn, index) => <div className={styles.chatTurn} key={index}><p className={styles.userQuestion}>{turn.question}</p><CoachAnswer reply={turn.reply} /></div>)}
        {loading && <p className={styles.loading}><LoaderCircle size={17} className={styles.spin} /> 正在帮你想一个好懂的解释…</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
      <form className={styles.coachForm} onSubmit={(event) => { event.preventDefault(); void send(); }}>
        <label className={styles.srOnly} htmlFor="coach-question">问 AI 老师</label>
        <textarea id="coach-question" autoFocus maxLength={1200} rows={2} placeholder="直接说你的问题，中文也可以" value={question} onChange={(event) => setQuestion(event.target.value)} />
        <button className={styles.sendButton} disabled={loading || !question.trim()} aria-label="发送问题"><ArrowUp size={22} /></button>
      </form>
      <p className={styles.drawerFoot}>只聊英语学习 · 不需要提供姓名、学校或联系方式</p>
    </section>
  </div>;
}
