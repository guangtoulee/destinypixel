import assert from "node:assert/strict";
import test from "node:test";
import { getWord, getWordsForGrade, WORD_CATALOG } from "./catalog";
import { buildAssessment, emptyProgress, getStudyStats, getWordStatus, gradeAnswer, makeSession, recordAnswer, restoreProgress, studyDateKey } from "./engine";
import type { AnswerRecord, StudyProgress, StudySession } from "./types";

const NOW = "2026-09-12T04:00:00.000Z";
const TOMORROW = "2026-09-13T04:00:00.000Z";
const WORD_ID = "7-borrow";
const answer = (eventId: string, overrides: Partial<AnswerRecord> = {}) => ({
  eventId, wordId: WORD_ID, mode: "recall" as const, correct: true, at: NOW, ...overrides,
});

test("starter catalog has distinct ids, complete teaching content and one exact answer per cloze", () => {
  assert.equal(WORD_CATALOG.length, 48);
  assert.equal(new Set(WORD_CATALOG.map((word) => word.id)).size, WORD_CATALOG.length);
  for (const grade of ["7", "8", "9"] as const) assert.equal(getWordsForGrade(grade).length, 12);
  assert.equal(getWordsForGrade("general").length, 48);
  for (const word of WORD_CATALOG) {
    for (const field of [word.word, word.meaning, word.phonetic, word.topic, word.example, word.translation, word.tip, word.cloze.explanation]) assert.ok(field.trim());
    assert.equal(word.cloze.sentence.split("___").length, 2, `${word.id}: exactly one blank`);
    assert.equal(word.cloze.options.length, 4);
    assert.equal(new Set(word.cloze.options.map((option) => option.toLowerCase())).size, 4, word.id);
    assert.equal(word.cloze.options.filter((option) => gradeAnswer(word, option, "cloze")).length, 1, word.id);
    assert.ok(word.cloze.options.includes(word.cloze.answer));
    assert.equal(getWord(word.id), word);
  }
});

test("spelling normalizes presentation and explicit regional variants without accepting misspellings or inflections", () => {
  const borrow = getWord(WORD_ID)!;
  assert.ok(gradeAnswer(borrow, "  BORROW.  "));
  assert.ok(gradeAnswer(borrow, '“borrow”'));
  assert.ok(gradeAnswer(getWord("7-practice")!, "practise"));
  assert.ok(gradeAnswer(getWord("7-favourite")!, "favorite"));
  assert.ok(gradeAnswer(getWord("general-prioritize")!, "prioritise"));
  for (const wrong of ["borow", "borrowed", "I borrow", "bor row", "lend", ""]) assert.equal(gradeAnswer(borrow, wrong), false, wrong);
});

test("hinted answers count as supported evidence and cannot advance a recall stage", () => {
  const progress = recordAnswer(emptyProgress(), answer("hinted", { hintShown: true }));
  const memory = progress.memories[WORD_ID];
  assert.equal(memory.modes.recall.correct, 1);
  assert.equal(memory.modes.recall.supportedCorrect, 1);
  assert.equal(memory.modes.recall.independentCorrect, 0);
  assert.equal(memory.stage, 0);
  assert.equal(memory.lastIndependentRecallAt, null);
  assert.equal(getWordStatus(memory), "supported");
});

test("a recently displayed answer cannot turn into independent recall just by omitting a flag on retry", () => {
  const exposed = recordAnswer(emptyProgress(), answer("exposed", { mode: "sentence", answerShown: true }));
  const retry = recordAnswer(exposed, answer("retry", { at: "2026-09-12T04:02:00.000Z" }));
  assert.equal(retry.memories[WORD_ID].modes.recall.independentCorrect, 0);
  assert.equal(retry.memories[WORD_ID].modes.recall.supportedCorrect, 1);
  assert.equal(retry.events[1].answerShown, true);
  const later = recordAnswer(retry, answer("later", { at: "2026-09-12T05:00:00.000Z" }));
  assert.equal(later.memories[WORD_ID].modes.recall.independentCorrect, 1);
  assert.equal(later.memories[WORD_ID].stage, 1);
});

test("same-day repetitions do not count as delayed memory or push the scheduled review back", () => {
  let progress = recordAnswer(emptyProgress(), answer("first"));
  const nextReviewAt = progress.memories[WORD_ID].nextReviewAt;
  for (let index = 1; index <= 6; index += 1) {
    progress = recordAnswer(progress, answer(`repeat-${index}`, { at: `2026-09-12T0${4 + Math.floor(index / 4)}:0${index}:00.000Z` }));
  }
  assert.equal(progress.memories[WORD_ID].stage, 1);
  assert.equal(progress.memories[WORD_ID].nextReviewAt, nextReviewAt);
  assert.deepEqual(progress.memories[WORD_ID].delayedRecallDays, []);
  assert.equal(getStudyStats(progress, "7", NOW).delayed, 0);
});

test("crossing midnight alone does not establish delayed recall", () => {
  const first = recordAnswer(emptyProgress(), answer("late", { at: "2026-09-12T15:59:00.000Z" }));
  const next = recordAnswer(first, answer("midnight", { at: "2026-09-12T16:01:00.000Z" }));
  assert.notEqual(studyDateKey(first.events[0].at), studyDateKey(next.events[1].at));
  assert.equal(next.memories[WORD_ID].stage, 1);
  assert.equal(getWordStatus(next.memories[WORD_ID]), "independent");
});

test("only independent due recall advances the review interval; choice and AI sentence evidence remain separate", () => {
  let progress = recordAnswer(emptyProgress(), answer("recall"));
  progress = recordAnswer(progress, answer("cloze", { mode: "cloze", at: TOMORROW }));
  progress = recordAnswer(progress, answer("sentence", { mode: "sentence", at: TOMORROW }));
  assert.equal(progress.memories[WORD_ID].stage, 1);
  assert.equal(progress.memories[WORD_ID].modes.cloze.independentCorrect, 1);
  assert.equal(progress.memories[WORD_ID].modes.sentence.independentCorrect, 1);
  progress = recordAnswer(progress, answer("delayed", { at: TOMORROW }));
  assert.equal(progress.memories[WORD_ID].stage, 2);
  assert.equal(progress.memories[WORD_ID].nextReviewAt, "2026-09-16T04:00:00.000Z");
  assert.deepEqual(progress.memories[WORD_ID].delayedRecallDays, ["2026-09-13"]);
  assert.equal(getWordStatus(progress.memories[WORD_ID]), "delayed");
  assert.equal(getStudyStats(progress, "7", TOMORROW).delayed, 1);
});

test("a wrong recall demotes current confidence even after a delayed success", () => {
  let progress = recordAnswer(emptyProgress(), answer("initial"));
  progress = recordAnswer(progress, answer("delayed", { at: TOMORROW }));
  progress = recordAnswer(progress, answer("forgot", { at: "2026-09-16T04:00:00.000Z", correct: false }));
  assert.equal(progress.memories[WORD_ID].stage, 0);
  assert.equal(getWordStatus(progress.memories[WORD_ID]), "supported");
  assert.equal(getStudyStats(progress, "7", "2026-09-16T04:00:00.000Z").delayed, 0);
  assert.equal(progress.memories[WORD_ID].delayedRecallDays.length, 1, "retain historical evidence without claiming current confidence");
});

test("correcting a later context attempt resolves current weakness without erasing the earlier error", () => {
  let progress = recordAnswer(emptyProgress(), answer("recall"));
  progress = recordAnswer(progress, answer("context-wrong", { mode: "cloze", correct: false }));
  assert.equal(getStudyStats(progress, "7", NOW).needsReview, 1);
  progress = recordAnswer(progress, answer("context-fixed", { mode: "cloze" }));
  assert.equal(getStudyStats(progress, "7", NOW).needsReview, 0);
  assert.equal(progress.memories[WORD_ID].modes.cloze.attempts, 2);
});

test("due items come before weak items, which come before unseen items", () => {
  let progress = recordAnswer(emptyProgress(), answer("due", { at: "2026-09-10T04:00:00.000Z" }));
  progress = recordAnswer(progress, answer("weak", { wordId: "7-return", correct: false }));
  const session = makeSession({ grade: "7", progress, now: NOW });
  assert.equal(session.wordIds.length, 6);
  assert.equal(session.clozeWordIds.length, 3);
  assert.deepEqual(session.wordIds.slice(0, 2), [WORD_ID, "7-return"]);
  assert.ok(session.wordIds.slice(2).every((id) => !progress.memories[id]));
});

test("today's session resumes in its original order, removing duplicate and foreign ids before filling gaps", () => {
  const progress = emptyProgress();
  const original = makeSession({ grade: "7", progress, now: NOW });
  const restarted = makeSession({ grade: "7", progress, now: NOW });
  assert.notEqual(restarted.id, original.id, "a new session cannot reuse prior answer event ids");
  assert.deepEqual(restarted.wordIds, original.wordIds, "selection remains stable with unchanged evidence");
  assert.deepEqual(restarted.clozeWordIds, original.clozeWordIds);
  const resumed = makeSession({ grade: "7", progress, now: "2026-09-12T05:00:00.000Z", previous: original });
  assert.deepEqual(resumed, original);
  const broken: StudySession = { ...original, wordIds: [WORD_ID, WORD_ID, "9-avoid", "missing"], clozeWordIds: ["missing", WORD_ID, WORD_ID] };
  const repaired = makeSession({ grade: "7", progress, now: NOW, previous: broken });
  assert.equal(repaired.wordIds[0], WORD_ID);
  assert.equal(repaired.wordIds.length, 6);
  assert.equal(new Set(repaired.wordIds).size, 6);
  assert.equal(new Set(repaired.clozeWordIds).size, 3);
  assert.ok(repaired.clozeWordIds.every((id) => repaired.wordIds.includes(id)));
  const tomorrow = makeSession({ grade: "7", progress, now: TOMORROW, previous: original });
  assert.notEqual(tomorrow.id, original.id);
});

test("two sessions on one day record distinct attempts even when they select the same words", () => {
  const first = makeSession({ grade: "7", progress: emptyProgress(), now: NOW });
  const second = makeSession({ grade: "7", progress: emptyProgress(), now: NOW });
  assert.equal(first.wordIds[0], second.wordIds[0]);
  let progress = recordAnswer(emptyProgress(), answer(`${first.id}-recall-0`, { wordId: first.wordIds[0] }));
  progress = recordAnswer(progress, answer(`${second.id}-recall-0`, { wordId: second.wordIds[0] }));
  assert.equal(progress.events.length, 2);
  assert.equal(progress.memories[first.wordIds[0]].modes.recall.attempts, 2);
  assert.equal(progress.memories[first.wordIds[0]].stage, 1, "new sessions still cannot manufacture delayed memory");
});

test("recording is immutable and event ids make double submission idempotent", () => {
  const initial = emptyProgress();
  const next = recordAnswer(initial, answer("same"));
  assert.equal(initial.events.length, 0);
  assert.equal(Object.keys(initial.memories).length, 0);
  const before = JSON.stringify(next);
  const after = recordAnswer(next, answer("next", { mode: "cloze" }));
  assert.equal(JSON.stringify(next), before);
  assert.equal(after.events.length, 2);
  assert.equal(recordAnswer(after, answer("same")), after);
  assert.equal(recordAnswer(after, answer("unknown", { wordId: "__proto__" })), after);
  assert.equal(recordAnswer(after, answer("past", { at: "2020-01-01T00:00:00.000Z" })), after);
});

test("restoring a save rebuilds validated evidence, sorts events, and drops duplicates and fabricated mastery", () => {
  let progress = recordAnswer(emptyProgress(), answer("one"));
  progress = recordAnswer(progress, answer("two", { at: TOMORROW }));
  assert.deepEqual(restoreProgress(JSON.stringify(progress)), progress);
  const damaged = { version: 1, memories: { fake: { stage: 999 } }, events: [
    progress.events[1], progress.events[0], progress.events[0],
    { ...progress.events[0], eventId: "unknown", wordId: "fake" },
    { ...progress.events[0], eventId: "bad-time", at: "yesterday" },
    { ...progress.events[0], eventId: "bad-boolean", correct: "true" },
    null,
  ] };
  assert.deepEqual(restoreProgress(damaged), progress);
  assert.deepEqual(restoreProgress("broken json"), emptyProgress());
  assert.deepEqual(restoreProgress({ memories: { [WORD_ID]: { stage: 4 } } }), emptyProgress());
});

test("recognizing every choice does not get reported as independent spelling or delayed memory", () => {
  const progress = getWordsForGrade("7").reduce<StudyProgress>((state, word) =>
    recordAnswer(state, answer(`choice-${word.id}`, { wordId: word.id, mode: "cloze" })), emptyProgress());
  const stats = getStudyStats(progress, "7", NOW);
  assert.equal(stats.seen, 12);
  assert.equal(stats.independent, 0);
  assert.equal(stats.delayed, 0);
  assert.equal(stats.todayAnswers, 12);
});

test("assessment gives a balanced reproducible sample with unique options and no vocabulary estimate", () => {
  const assessment = buildAssessment("general", 12, "student-a");
  assert.equal(assessment.length, 12);
  assert.equal(new Set(assessment.map((item) => item.wordId)).size, 12);
  for (const level of ["7", "8", "9", "general"]) {
    assert.equal(assessment.filter((item) => getWord(item.wordId)?.grade === level).length, 3);
  }
  for (const item of assessment) {
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options).size, 4);
    assert.equal(item.options.filter((option) => option === item.answer).length, 1);
    assert.equal(item.answer, getWord(item.wordId)!.meaning);
  }
  assert.deepEqual(buildAssessment("general", 12, "student-a"), assessment);
  assert.notDeepEqual(buildAssessment("general", 12, "student-b"), assessment);
  assert.equal(buildAssessment("7", 99).length, 12);
  assert.deepEqual(buildAssessment("general", 0), []);
});
