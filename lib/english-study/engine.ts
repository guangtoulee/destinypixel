import { getWord, getWordsForGrade, WORD_CATALOG } from "./catalog";
import type { AnswerRecord, AssessmentItem, Grade, ModeEvidence, StudyMode, StudyProgress, StudySession, WordItem, WordMemory } from "./types";

const DAY_MS = 86_400_000;
const EXPOSURE_WINDOW_MS = 10 * 60_000;
const REVIEW_DAYS = [1, 1, 3, 7, 14];
const MODES: StudyMode[] = ["recall", "cloze", "sentence"];
const GRADES: Grade[] = ["7", "8", "9", "general"];

/** All study-day boundaries use China time; timestamps remain portable ISO dates. */
export function studyDateKey(at: string = new Date().toISOString()): string {
  return new Date(new Date(at).getTime() + 8 * 3_600_000).toISOString().slice(0, 10);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function timestamp(value?: string): string {
  return validTimestamp(value) ? new Date(value).toISOString() : new Date().toISOString();
}

function blankEvidence(): ModeEvidence {
  return { attempts: 0, correct: 0, independentCorrect: 0, supportedCorrect: 0, lastAttemptAt: null, lastCorrect: null };
}

export function emptyProgress(): StudyProgress {
  return { version: 1, memories: {}, events: [] };
}

function newMemory(wordId: string, at: string): WordMemory {
  return {
    wordId, stage: 0, firstSeenAt: at, lastAnsweredAt: at,
    nextReviewAt: new Date(Date.parse(at) + DAY_MS).toISOString(),
    lastIndependentRecallAt: null, lastReviewDay: null, delayedRecallDays: [],
    modes: { recall: blankEvidence(), cloze: blankEvidence(), sentence: blankEvidence() },
  };
}

function normalizeAnswer(answer: string): string {
  // Ignore presentation only: case, surrounding whitespace/quotes and final punctuation.
  // Do not remove internal letters, hyphens, or spaces, and never fuzzy-match.
  return answer.normalize("NFKC").trim().toLocaleLowerCase("en-US")
    .replace(/^["'“‘]+|["'”’]+$/g, "").replace(/[.!?。！？]+$/, "").trim();
}

export function gradeAnswer(word: WordItem, answer: string, mode: "recall" | "cloze" = "recall"): boolean {
  const expected = mode === "cloze" ? word.cloze.answer : word.word;
  const accepted = [expected, ...(normalizeAnswer(expected) === normalizeAnswer(word.word) ? word.variants : [])];
  const normalized = normalizeAnswer(answer);
  return normalized.length > 0 && accepted.some((variant) => normalizeAnswer(variant) === normalized);
}

export function recordAnswer(
  progress: StudyProgress,
  input: Omit<AnswerRecord, "at"> & { at?: string },
): StudyProgress {
  if (!input.eventId || !getWord(input.wordId) || !MODES.includes(input.mode) || typeof input.correct !== "boolean") return progress;
  if (progress.events.some((event) => event.eventId === input.eventId)) return progress;
  const at = timestamp(input.at);
  // A persisted answer cannot be inserted into the past and rewrite a later review.
  const previous = progress.memories[input.wordId];
  if (previous && Date.parse(at) < Date.parse(previous.lastAnsweredAt)) return progress;
  const recentlyExposed = progress.events.some((event) => event.wordId === input.wordId && event.answerShown &&
    Date.parse(at) >= Date.parse(event.at) && Date.parse(at) - Date.parse(event.at) <= EXPOSURE_WINDOW_MS);
  const record: AnswerRecord = {
    eventId: input.eventId, wordId: input.wordId, mode: input.mode, correct: input.correct,
    hintShown: input.hintShown === true, answerShown: input.answerShown === true || recentlyExposed, at,
  };
  const memory: WordMemory = previous ? {
    ...previous, delayedRecallDays: [...previous.delayedRecallDays],
    modes: { recall: { ...previous.modes.recall }, cloze: { ...previous.modes.cloze }, sentence: { ...previous.modes.sentence } },
  } : newMemory(input.wordId, at);
  const independent = record.correct && !record.hintShown && !record.answerShown;
  const evidence = memory.modes[record.mode];
  evidence.attempts += 1;
  evidence.correct += Number(record.correct);
  evidence.independentCorrect += Number(independent);
  evidence.supportedCorrect += Number(record.correct && !independent);
  evidence.lastAttemptAt = at;
  evidence.lastCorrect = record.correct;
  memory.lastAnsweredAt = at;

  if (record.mode === "recall") {
    const day = studyDateKey(at);
    if (independent) {
      const delayed = memory.lastIndependentRecallAt !== null && memory.lastReviewDay !== day &&
        Date.parse(at) - Date.parse(memory.lastIndependentRecallAt) >= 20 * 3_600_000 &&
        Date.parse(at) >= Date.parse(memory.nextReviewAt);
      if (delayed) {
        memory.stage = Math.min(4, memory.stage + 1);
        if (!memory.delayedRecallDays.includes(day)) memory.delayedRecallDays.push(day);
        memory.nextReviewAt = new Date(Date.parse(at) + REVIEW_DAYS[memory.stage] * DAY_MS).toISOString();
      } else if (memory.lastIndependentRecallAt === null || memory.stage === 0) {
        memory.stage = 1;
        memory.nextReviewAt = new Date(Date.parse(at) + DAY_MS).toISOString();
      }
      // Repeating today must not reset tomorrow's review, or count as delayed evidence.
      if (memory.lastReviewDay !== day) memory.lastIndependentRecallAt = at;
      memory.lastReviewDay = day;
    } else {
      memory.stage = 0;
      // Failure or help should bring the next review forward, never postpone a due word.
      const nextDay = Date.parse(at) + DAY_MS;
      memory.nextReviewAt = new Date(Math.min(Date.parse(memory.nextReviewAt), nextDay)).toISOString();
    }
  } else if (!record.correct) {
    // Meaning/context mistakes matter, but a choice question cannot advance spelling recall.
    memory.nextReviewAt = new Date(Math.min(Date.parse(memory.nextReviewAt), Date.parse(at) + DAY_MS)).toISOString();
  }

  return {
    version: 1, memories: { ...progress.memories, [record.wordId]: memory },
    events: [...progress.events, record],
  };
}

/** Rebuild evidence from validated events; never trust a cached "mastered" label. */
export function restoreProgress(value: unknown): StudyProgress {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return emptyProgress(); }
  }
  if (!value || typeof value !== "object" || !("events" in value) || !Array.isArray(value.events)) return emptyProgress();
  const events: AnswerRecord[] = [];
  const seenIds = new Set<string>();
  for (const item of value.events) {
    if (!item || typeof item !== "object") continue;
    const event = item as Record<string, unknown>;
    if (typeof event.eventId !== "string" || event.eventId.length === 0 || event.eventId.length > 200 || seenIds.has(event.eventId) ||
      typeof event.wordId !== "string" || !getWord(event.wordId) || !MODES.includes(event.mode as StudyMode) ||
      typeof event.correct !== "boolean" || !validTimestamp(event.at)) continue;
    seenIds.add(event.eventId);
    events.push({ eventId: event.eventId, wordId: event.wordId, mode: event.mode as StudyMode,
      correct: event.correct, hintShown: event.hintShown === true, answerShown: event.answerShown === true, at: timestamp(event.at) });
  }
  events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return events.reduce((progress, event) => recordAnswer(progress, event), emptyProgress());
}

export function getWordStatus(memory?: WordMemory): "new" | "supported" | "independent" | "delayed" {
  if (!memory) return "new";
  // Historical successes do not hide a later failed or supported recall.
  if (memory.stage === 0) return "supported";
  if (memory.stage >= 2 && memory.delayedRecallDays.length > 0) return "delayed";
  return "independent";
}

function isWeak(memory: WordMemory): boolean {
  return memory.stage === 0 || MODES.some((mode) => memory.modes[mode].lastCorrect === false);
}

export function getStudyStats(progress: StudyProgress, grade: Grade = "general", now?: string) {
  const at = timestamp(now);
  const words = getWordsForGrade(grade);
  const ids = new Set(words.map((word) => word.id));
  const memories = words.map((word) => progress.memories[word.id]).filter((memory): memory is WordMemory => Boolean(memory));
  return {
    total: words.length,
    seen: memories.length,
    due: memories.filter((memory) => Date.parse(memory.nextReviewAt) <= Date.parse(at)).length,
    independent: memories.filter((memory) => memory.stage >= 1).length,
    delayed: memories.filter((memory) => getWordStatus(memory) === "delayed").length,
    needsReview: memories.filter(isWeak).length,
    todayAnswers: progress.events.filter((event) => ids.has(event.wordId) && studyDateKey(event.at) === studyDateKey(at)).length,
  };
}

function hash(value: string): number {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

export function makeSession({ grade, progress, now, size = 6, previous }: {
  grade: Grade; progress: StudyProgress; now?: string; size?: number; previous?: StudySession | null;
}): StudySession {
  const at = timestamp(now);
  const dateKey = studyDateKey(at);
  const words = getWordsForGrade(GRADES.includes(grade) ? grade : "7");
  const count = Math.max(1, Math.min(words.length, Math.floor(Number.isFinite(size) ? size : 6)));
  const allowed = new Set(words.map((word) => word.id));
  const previousIds = previous && previous.dateKey === dateKey && previous.grade === grade && Array.isArray(previous.wordIds)
    ? [...new Set(previous.wordIds.filter((id) => allowed.has(id)))].slice(0, count) : [];
  const rank = (wordId: string) => {
    const memory = progress.memories[wordId];
    if (memory && Date.parse(memory.nextReviewAt) <= Date.parse(at)) return 0;
    if (memory && isWeak(memory)) return 1;
    if (!memory) return 2;
    return 3;
  };
  const ranked = [...words].sort((a, b) => {
    const priority = rank(a.id) - rank(b.id);
    if (priority) return priority;
    const aMemory = progress.memories[a.id];
    const bMemory = progress.memories[b.id];
    if (aMemory && bMemory) return Date.parse(aMemory.nextReviewAt) - Date.parse(bMemory.nextReviewAt);
    return hash(`${dateKey}:${a.id}`) - hash(`${dateKey}:${b.id}`);
  });
  const wordIds = [...previousIds, ...ranked.map((word) => word.id).filter((id) => !previousIds.includes(id))].slice(0, count);
  const validPreviousCloze = previousIds.length && Array.isArray(previous?.clozeWordIds)
    ? [...new Set(previous.clozeWordIds.filter((id) => wordIds.includes(id)))].slice(0, 3) : [];
  const clozeWordIds = [...validPreviousCloze, ...wordIds.filter((id) => !validPreviousCloze.includes(id))].slice(0, Math.min(3, count));
  return {
    id: previousIds.length && typeof previous?.id === "string" && previous.id.length > 0
      ? previous.id : `study-${dateKey}-${grade}-${globalThis.crypto.randomUUID()}`,
    dateKey, grade, wordIds, clozeWordIds,
    createdAt: previousIds.length && validTimestamp(previous?.createdAt) ? previous.createdAt : at,
  };
}

/** A small recognition sample. This never estimates a person's total vocabulary size. */
export function buildAssessment(grade: Grade = "general", size = 12, seed = "default"): AssessmentItem[] {
  const pool = getWordsForGrade(grade);
  const count = Math.max(0, Math.min(pool.length, Math.floor(Number.isFinite(size) ? size : 12)));
  const byLevel = GRADES.map((level) => pool.filter((word) => word.grade === level)
    .sort((a, b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`)));
  const selected: WordItem[] = [];
  for (let index = 0; selected.length < count; index += 1) {
    for (const words of byLevel) {
      if (words[index] && selected.length < count) selected.push(words[index]);
    }
  }
  return selected.map((word) => {
    // Prefer the same part of speech so the label itself does not give away the answer.
    const partOfSpeech = word.meaning.split(".")[0];
    const distractors = [...new Set(WORD_CATALOG.filter((other) => other.id !== word.id).map((other) => other.meaning))]
      .filter((meaning) => meaning !== word.meaning)
      .sort((a, b) => Number(b.split(".")[0] === partOfSpeech) - Number(a.split(".")[0] === partOfSpeech) ||
        hash(`${seed}:${word.id}:${a}`) - hash(`${seed}:${word.id}:${b}`)).slice(0, 3);
    return {
      id: `assessment-${word.id}`, wordId: word.id, prompt: `“${word.word}” 的常见意思是？`,
      options: [word.meaning, ...distractors].sort((a, b) => hash(`${seed}:option:${word.id}:${a}`) - hash(`${seed}:option:${word.id}:${b}`)),
      answer: word.meaning, explanation: `${word.word}：${word.meaning}。${word.example}（${word.translation}）`,
    };
  });
}
