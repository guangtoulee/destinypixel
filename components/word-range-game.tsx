"use client";

import {
  Check,
  Crosshair,
  Delete,
  Headphones,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  Volume2,
  Zap,
} from "lucide-react";
import { CSSProperties, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./word-range-game.module.css";

export type RangeWord = readonly [string, string, string, string, string];
export type RangeMode = "meaning" | "audio" | "reverse" | "spelling";

export type RangeAnswer = {
  word: RangeWord;
  chosen: string;
  correct: boolean;
  mode: RangeMode;
};

type RangeStats = {
  score: number;
  rounds: number;
  streak: number;
  bestStreak: number;
};

type WordRangeGameProps = {
  deck: RangeWord[];
  levelLabel: string;
  reviewWords: string[];
  stats: RangeStats;
  onAnswer: (answer: RangeAnswer) => void;
  onSpeak: (text: string, rate?: number) => void;
};

type GameScreen = "briefing" | "playing" | "summary";

type ShotState = {
  id: number;
  x: number;
  y: number;
  targetIndex: number;
  correct: boolean;
};

type FeedbackState = {
  correct: boolean;
  title: string;
  detail: string;
} | null;

const missionPlan: { mode: RangeMode; slot: number }[] = [
  { mode: "meaning", slot: 0 },
  { mode: "meaning", slot: 1 },
  { mode: "audio", slot: 2 },
  { mode: "meaning", slot: 3 },
  { mode: "reverse", slot: 0 },
  { mode: "audio", slot: 1 },
  { mode: "spelling", slot: 2 },
  { mode: "spelling", slot: 3 },
];

const modeLabels: Record<RangeMode, string> = {
  meaning: "识义拦截",
  audio: "声纹追踪",
  reverse: "反向锁定",
  spelling: "拼写破盾",
};

const distractorLetters = "aeiourstnlcdmpghbyfvkw";
let sharedAudioContext: AudioContext | null = null;

function seededShuffle<T>(items: readonly T[], seed: number) {
  const next = [...items];
  let state = (seed || 1) >>> 0;

  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [next[index], next[target]] = [next[target], next[index]];
  }

  return next;
}

function buildMissionWords(deck: RangeWord[], reviewWords: string[], seed: number) {
  const reviewSet = new Set(reviewWords.map((word) => word.toLowerCase()));
  const weak = seededShuffle(deck.filter(([word]) => reviewSet.has(word.toLowerCase())), seed + 17);
  const fresh = seededShuffle(deck.filter(([word]) => !reviewSet.has(word.toLowerCase())), seed + 31);
  const chosen: RangeWord[] = [];

  [...weak.slice(0, 2), ...fresh, ...weak].forEach((entry) => {
    if (chosen.length < 4 && !chosen.some(([word]) => word === entry[0])) chosen.push(entry);
  });

  return chosen;
}

function buildChoiceWords(current: RangeWord, missionWords: RangeWord[], deck: RangeWord[], seed: number) {
  const pool = seededShuffle(
    [...missionWords, ...deck].filter(([word]) => word !== current[0]),
    seed + 73,
  );
  const unique: RangeWord[] = [current];

  for (const entry of pool) {
    if (unique.length >= 4) break;
    if (!unique.some(([word]) => word === entry[0])) unique.push(entry);
  }

  return seededShuffle(unique, seed + 101);
}

function buildLetterTiles(word: string, seed: number) {
  const letters = word.toLowerCase().replace(/[^a-z]/g, "").split("");
  const extras: string[] = [];
  let cursor = seed % distractorLetters.length;

  while (extras.length < Math.min(3, Math.max(2, Math.ceil(letters.length / 3)))) {
    const letter = distractorLetters[cursor % distractorLetters.length];
    cursor += 7;
    if (!extras.includes(letter) || letters.filter((item) => item === letter).length > 1) extras.push(letter);
  }

  return seededShuffle(
    [...letters, ...extras].map((letter, index) => ({ id: `${letter}-${index}`, letter })),
    seed + 211,
  );
}

function normalizedWord(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function playGameSound(kind: "hit" | "miss" | "start" | "complete" | "tick") {
  try {
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = sharedAudioContext ?? new AudioContextClass();
    sharedAudioContext = context;
    if (context.state === "suspended") void context.resume();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(kind === "tick" ? 0.045 : 0.12, context.currentTime + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (kind === "tick" ? 0.12 : 0.34));
    master.connect(context.destination);

    const notes = kind === "tick"
      ? [720]
      : kind === "hit"
      ? [440, 660, 880]
      : kind === "miss"
        ? [150, 105]
        : kind === "complete"
          ? [392, 523, 659, 784]
          : [220, 330, 440];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === "miss" ? "sawtooth" : "square";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.055);
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + index * 0.055 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.055 + 0.11);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(context.currentTime + index * 0.055);
      oscillator.stop(context.currentTime + index * 0.055 + 0.13);
    });
  } catch {
    // The visual and haptic feedback still work when Web Audio is unavailable.
  }
}

export default function WordRangeGame({
  deck,
  levelLabel,
  reviewWords,
  stats,
  onAnswer,
  onSpeak,
}: WordRangeGameProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const [screen, setScreen] = useState<GameScreen>("briefing");
  const [missionWords, setMissionWords] = useState<RangeWord[]>(() => buildMissionWords(deck, reviewWords, stats.rounds + 1));
  const [runSeed, setRunSeed] = useState(stats.rounds + 1);
  const [wave, setWave] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [shield, setShield] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [shot, setShot] = useState<ShotState | null>(null);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const plan = missionPlan[wave] ?? missionPlan[0];
  const currentWord = missionWords[plan.slot] ?? missionWords[0] ?? deck[0];
  const missionSeed = runSeed + wave * 47 + 1;
  const choices = useMemo(
    () => currentWord ? buildChoiceWords(currentWord, missionWords, deck, missionSeed) : [],
    [currentWord, deck, missionSeed, missionWords],
  );
  const letterTiles = useMemo(
    () => currentWord ? buildLetterTiles(currentWord[0], missionSeed) : [],
    [currentWord, missionSeed],
  );
  const spelledWord = selectedTiles
    .map((tileId) => letterTiles.find((tile) => tile.id === tileId)?.letter ?? "")
    .join("");
  const accuracy = stats.rounds ? Math.round((stats.score / stats.rounds) * 100) : 0;
  const runAccuracy = Math.round((correctCount / missionPlan.length) * 100);
  const isOverdrive = combo >= 3;

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (screen !== "playing" || locked || !currentWord) return;
    if (plan.mode === "audio" || plan.mode === "meaning") {
      const timer = window.setTimeout(() => onSpeak(currentWord[0], 0.72), 240);
      return () => window.clearTimeout(timer);
    }
  }, [currentWord, locked, onSpeak, plan.mode, screen, wave]);

  function startMission() {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    const nextSeed = stats.rounds + Date.now() % 100000;
    setRunSeed(nextSeed);
    setMissionWords(buildMissionWords(deck, reviewWords, nextSeed));
    setWave(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setShield(3);
    setCorrectCount(0);
    setLocked(false);
    setFeedback(null);
    setShot(null);
    setSelectedTiles([]);
    setScreen("playing");
    playGameSound("start");
    navigator.vibrate?.(24);
  }

  function finishAnswer(correct: boolean, chosen: string, targetIndex = -1, point?: { x: number; y: number }) {
    if (locked || !currentWord) return;

    const nextCombo = correct ? combo + 1 : 0;
    const nextShield = correct ? shield : Math.max(0, shield - 1);
    const comboBonus = correct ? Math.min(240, combo * 35) : 0;
    const wordScore = correct ? 120 + comboBonus + (plan.mode === "spelling" ? 180 : 0) : 0;

    setLocked(true);
    setCombo(nextCombo);
    setBestCombo((current) => Math.max(current, nextCombo));
    setShield(nextShield);
    setScore((current) => current + wordScore);
    if (correct) setCorrectCount((current) => current + 1);
    setFeedback({
      correct,
      title: correct ? (plan.mode === "spelling" ? "核心击穿" : nextCombo >= 3 ? `超载连击 ×${nextCombo}` : "目标击落") : nextShield === 0 ? "护盾重启" : "锁定偏移",
      detail: correct
        ? `${currentWord[0]} · ${currentWord[1]}`
        : `${currentWord[0]} = ${currentWord[1]}，已送入复习队列`,
    });

    if (point) {
      setShot({ id: Date.now(), x: point.x, y: point.y, targetIndex, correct });
    }

    onAnswer({ word: currentWord, chosen, correct, mode: plan.mode });
    playGameSound(correct ? "hit" : "miss");
    navigator.vibrate?.(correct ? [22, 30, 36] : [70, 40, 70]);

    advanceTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      setShot(null);
      setSelectedTiles([]);
      if (nextShield === 0) setShield(2);

      if (wave >= missionPlan.length - 1) {
        setScreen("summary");
        setLocked(false);
        playGameSound("complete");
        return;
      }

      setWave((current) => current + 1);
      setLocked(false);
    }, correct ? 820 : nextShield === 0 ? 1500 : 1120);
  }

  function fireAt(entry: RangeWord, targetIndex: number, event: PointerEvent<HTMLButtonElement>) {
    if (locked || !currentWord) return;
    const arenaRect = arenaRef.current?.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();
    const point = arenaRect
      ? {
          x: targetRect.left + targetRect.width / 2 - arenaRect.left,
          y: targetRect.top + targetRect.height / 2 - arenaRect.top,
        }
      : undefined;
    const correct = entry[0] === currentWord[0];
    const chosen = plan.mode === "meaning" ? entry[1] : entry[0];
    finishAnswer(correct, chosen, targetIndex, point);
  }

  function submitSpelling() {
    const expected = normalizedWord(currentWord?.[0] ?? "");
    finishAnswer(spelledWord === expected, spelledWord || "未作答", -1, {
      x: (arenaRef.current?.clientWidth ?? 500) / 2,
      y: (arenaRef.current?.clientHeight ?? 500) * 0.45,
    });
  }

  function selectLetter(id: string) {
    if (locked || selectedTiles.includes(id)) return;
    setSelectedTiles((current) => [...current, id]);
    playGameSound("tick");
    navigator.vibrate?.(12);
  }

  function removeLetter() {
    if (locked) return;
    setSelectedTiles((current) => current.slice(0, -1));
  }

  function trackAim(event: PointerEvent<HTMLDivElement>) {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect || !arenaRef.current) return;
    arenaRef.current.style.setProperty("--aim-x", `${event.clientX - rect.left}px`);
    arenaRef.current.style.setProperty("--aim-y", `${event.clientY - rect.top}px`);
  }

  async function toggleFullscreen() {
    if (!rootRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  }

  if (!currentWord) return null;

  return (
    <div ref={rootRef} className={styles.gameShell} data-screen={screen}>
      <div className={styles.worldBackdrop} aria-hidden="true" />
      <div className={styles.scanlines} aria-hidden="true" />

      {screen === "briefing" ? (
        <section className={styles.briefing}>
          <div className={styles.briefingTopline}>
            <span><Crosshair size={16} /> RANGE 07</span>
            <span className={styles.onlineSignal}><i /> ONLINE</span>
          </div>
          <div className={styles.briefingCopy}>
            <p>LEXICAL DEFENSE PROTOCOL</p>
            <h2>单词空港防线</h2>
            <div className={styles.briefingRule}>
              <span>8 波拦截</span>
              <span>4 个核心词</span>
              <span>最终拼写破盾</span>
            </div>
            <button type="button" className={styles.launchButton} onClick={startMission}>
              <Play size={20} fill="currentColor" />
              启动任务
            </button>
          </div>
          <div className={styles.briefingStats}>
            <div><span>当前词库</span><strong>{levelLabel}</strong></div>
            <div><span>历史命中率</span><strong>{accuracy}%</strong></div>
            <div><span>最高连击</span><strong>{stats.bestStreak}</strong></div>
            <div><span>待复习信号</span><strong>{reviewWords.length}</strong></div>
          </div>
        </section>
      ) : null}

      {screen === "playing" ? (
        <section
          ref={arenaRef}
          className={`${styles.arena} ${feedback?.correct ? styles.hitState : ""} ${feedback && !feedback.correct ? styles.missState : ""} ${isOverdrive ? styles.overdrive : ""}`}
          onPointerMove={trackAim}
        >
          <header className={styles.hud}>
            <div className={styles.missionId}>
              <span>MISSION</span>
              <strong>{String(wave + 1).padStart(2, "0")} / {String(missionPlan.length).padStart(2, "0")}</strong>
            </div>
            <div className={styles.progressTrack} aria-label={`任务进度 ${wave + 1}/${missionPlan.length}`}>
              {missionPlan.map((_, index) => <i key={index} className={index < wave ? styles.done : index === wave ? styles.current : ""} />)}
            </div>
            <div className={styles.scoreBlock}>
              <span>SCORE</span>
              <strong>{score.toString().padStart(5, "0")}</strong>
            </div>
            <button type="button" className={styles.fullscreenButton} onClick={toggleFullscreen} aria-label={isFullscreen ? "退出全屏" : "全屏游戏"} title={isFullscreen ? "退出全屏" : "全屏游戏"}>
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </header>

          <div className={styles.sideHud}>
            <div className={styles.shieldMeter} aria-label={`护盾 ${shield}/3`}>
              <Shield size={17} />
              {[0, 1, 2].map((index) => <i key={index} className={index < shield ? styles.shieldOn : ""} />)}
            </div>
            <div className={`${styles.comboMeter} ${isOverdrive ? styles.comboHot : ""}`}>
              <Zap size={17} />
              <span>COMBO</span>
              <strong>×{combo}</strong>
            </div>
          </div>

          <div className={styles.commandPanel}>
            <span className={styles.modeChip}>
              {plan.mode === "audio" ? <Headphones size={14} /> : plan.mode === "spelling" ? <Sparkles size={14} /> : <Target size={14} />}
              {modeLabels[plan.mode]}
            </span>
            {plan.mode === "meaning" ? (
              <>
                <strong>{currentWord[0]}</strong>
                <small>{currentWord[2]}</small>
              </>
            ) : null}
            {plan.mode === "audio" ? (
              <>
                <button type="button" onClick={() => onSpeak(currentWord[0], 0.68)} aria-label="重播目标单词">
                  <Volume2 size={22} />
                </button>
                <small>重播声纹，锁定听到的单词</small>
              </>
            ) : null}
            {plan.mode === "reverse" ? (
              <>
                <strong>{currentWord[1]}</strong>
                <small>锁定对应的英文信号</small>
              </>
            ) : null}
            {plan.mode === "spelling" ? (
              <>
                <strong>{currentWord[1]}</strong>
                <small>{currentWord[2].replace(new RegExp(currentWord[0], "ig"), "______")}</small>
              </>
            ) : null}
          </div>

          {plan.mode !== "spelling" ? (
            <div className={styles.droneField}>
              {choices.map((entry, index) => {
                const label = plan.mode === "meaning" ? entry[1] : entry[0];
                const selected = shot?.targetIndex === index;
                return (
                  <button
                    key={`${wave}-${entry[0]}`}
                    type="button"
                    className={`${styles.drone} ${selected ? shot.correct ? styles.destroyed : styles.deflected : ""}`}
                    style={{ "--drift-delay": `${index * -0.43}s`, "--drift-speed": `${2.8 + index * 0.35}s` } as CSSProperties}
                    onPointerDown={(event) => fireAt(entry, index, event)}
                    disabled={locked}
                    aria-label={`锁定 ${label}`}
                  >
                    <span className={styles.droneWing} aria-hidden="true" />
                    <span className={styles.droneCore} aria-hidden="true"><i /></span>
                    <strong>{label}</strong>
                    <small>SIGNAL {String.fromCharCode(65 + index)}</small>
                    {selected && shot.correct ? (
                      <span className={styles.particleBurst} aria-hidden="true">
                        {Array.from({ length: 10 }).map((_, particleIndex) => <i key={particleIndex} style={{ "--particle": particleIndex } as CSSProperties} />)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.bossField}>
              <div className={styles.bossCore} aria-hidden="true">
                <span />
                <i>LEX</i>
              </div>
              <div className={styles.spellConsole}>
                <div className={styles.spellSlots} aria-label={`已拼写 ${spelledWord || "空"}`}>
                  {normalizedWord(currentWord[0]).split("").map((_, index) => (
                    <span key={index} className={spelledWord[index] ? styles.filledSlot : ""}>{spelledWord[index] ?? ""}</span>
                  ))}
                </div>
                <div className={styles.letterRack}>
                  {letterTiles.map((tile) => (
                    <button key={tile.id} type="button" disabled={locked || selectedTiles.includes(tile.id)} onClick={() => selectLetter(tile.id)}>
                      {tile.letter}
                    </button>
                  ))}
                  <button type="button" className={styles.deleteKey} disabled={locked || selectedTiles.length === 0} onClick={removeLetter} aria-label="删除最后一个字母" title="删除">
                    <Delete size={19} />
                  </button>
                </div>
                <div className={styles.spellActions}>
                  <button type="button" onClick={() => onSpeak(currentWord[0], 0.64)} aria-label="听单词" title="听单词"><Volume2 size={18} /></button>
                  <button type="button" className={styles.fireButton} disabled={locked || selectedTiles.length === 0} onClick={submitSpelling}>
                    <Crosshair size={18} /> 发射
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.aimReticle} aria-hidden="true"><span /><i /></div>
          {shot ? (
            <span
              key={shot.id}
              className={`${styles.tracer} ${shot.correct ? "" : styles.tracerMiss}`}
              style={{ "--shot-x": `${shot.x}px`, "--shot-y": `${shot.y}px` } as CSSProperties}
              aria-hidden="true"
            />
          ) : null}
          {feedback ? (
            <div className={`${styles.combatFeedback} ${feedback.correct ? styles.feedbackGood : styles.feedbackBad}`} role="status">
              {feedback.correct ? <Check size={22} /> : <RotateCcw size={22} />}
              <div><strong>{feedback.title}</strong><span>{feedback.detail}</span></div>
            </div>
          ) : null}
          <footer className={styles.arenaFooter}>
            <span>{levelLabel}</span>
            <span>{plan.mode === "spelling" ? "点击字母完成拼写" : "点击移动目标开火"}</span>
            <span>{isOverdrive ? "OVERDRIVE ACTIVE" : "WEAPON READY"}</span>
          </footer>
        </section>
      ) : null}

      {screen === "summary" ? (
        <section className={styles.summary}>
          <div className={styles.rankSeal}>
            <Sparkles size={28} />
            <strong>{runAccuracy >= 88 ? "S" : runAccuracy >= 75 ? "A" : runAccuracy >= 60 ? "B" : "C"}</strong>
            <span>RANK</span>
          </div>
          <p>MISSION COMPLETE</p>
          <h2>{runAccuracy >= 75 ? "空港防线稳住了" : "信号已记录，下一局重点回收"}</h2>
          <div className={styles.summaryGrid}>
            <div><span>任务得分</span><strong>{score}</strong></div>
            <div><span>命中率</span><strong>{runAccuracy}%</strong></div>
            <div><span>最高连击</span><strong>×{bestCombo}</strong></div>
          </div>
          <div className={styles.wordLoot}>
            {missionWords.map(([word, meaning]) => <span key={word}><b>{word}</b>{meaning}</span>)}
          </div>
          <button type="button" className={styles.launchButton} onClick={startMission}>
            <RotateCcw size={19} /> 再来一局
          </button>
          <button type="button" className={styles.exitButton} onClick={() => setScreen("briefing")}>返回任务舱</button>
        </section>
      ) : null}
    </div>
  );
}
