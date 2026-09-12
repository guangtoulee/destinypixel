export type Grade = "7" | "8" | "9" | "general";
export type StudyMode = "recall" | "cloze" | "sentence";

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  phonetic: string;
  grade: Grade;
  topic: string;
  example: string;
  translation: string;
  tip: string;
  /** Explicitly accepted spellings; never fuzzy-match a misspelling. */
  variants: string[];
  cloze: { sentence: string; answer: string; options: string[]; explanation: string };
}

export interface ModeEvidence {
  attempts: number;
  correct: number;
  independentCorrect: number;
  supportedCorrect: number;
  lastAttemptAt: string | null;
  lastCorrect: boolean | null;
}

export interface WordMemory {
  wordId: string;
  stage: number;
  nextReviewAt: string;
  firstSeenAt: string;
  lastAnsweredAt: string;
  lastIndependentRecallAt: string | null;
  lastReviewDay: string | null;
  delayedRecallDays: string[];
  modes: Record<StudyMode, ModeEvidence>;
}

export interface AnswerRecord {
  eventId: string;
  wordId: string;
  mode: StudyMode;
  correct: boolean;
  hintShown?: boolean;
  answerShown?: boolean;
  at: string;
}

export interface StudyProgress {
  version: 1;
  memories: Record<string, WordMemory>;
  events: AnswerRecord[];
}

export interface StudySession {
  id: string;
  dateKey: string;
  grade: Grade;
  wordIds: string[];
  clozeWordIds: string[];
  createdAt: string;
}

export interface AssessmentItem {
  id: string;
  wordId: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}
