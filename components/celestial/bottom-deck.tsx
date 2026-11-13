"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Shuffle, Sparkles } from "lucide-react";
import type { CelestialCopy } from "@/lib/celestial/copy";
import type { ReportLocale } from "@/lib/report-i18n";
import { CardBack } from "./card-back";

export type DeckDropPoint = { x: number; y: number };

type ArcCardGeometry = {
  x: number;
  y: number;
  angle: number;
  deckIndex: number;
};

const AUTO_SHUFFLE_HINT: Record<ReportLocale, string> = {
  en: "Pick any card in the arc to auto-shuffle & draw, or tap Shuffle anytime.",
  zh: "直接点选弧形牌阵中的任意一张即可自动洗牌抽取，也可随时点「洗牌」。",
  "zh-TW": "直接點選弧形牌陣中的任意一張即可自動洗牌抽取，也可隨時點「洗牌」。",
  ru: "Выберите любую карту в дуге (автотасование) или нажмите «Тасовать».",
};

/** 60fps Curved Arc Ribbon Fan — transient pointer wave transforms update DOM directly via rAF with zero React re-renders. */
export function BottomDeck({
  count,
  topCardId,
  disabled = false,
  unmixed = false,
  interactive,
  compact = false,
  locale = "zh",
  copy: c,
  onDraw,
  onCycle,
  onPull,
  onShuffle,
  contains,
}: {
  count: number;
  topCardId?: string;
  disabled?: boolean;
  unmixed?: boolean;
  interactive: boolean;
  compact?: boolean;
  locale?: ReportLocale;
  copy: CelestialCopy;
  onDraw: (index: number, point?: DeckDropPoint) => void;
  onCycle: () => void;
  onPull: (point: DeckDropPoint | null) => void;
  onShuffle: () => void;
  contains: (point: DeckDropPoint) => boolean;
}) {
  const [shuffling, setShuffling] = useState(false);
  const [cycling, setCycling] = useState(false);
  const [liftedIndex, setLiftedIndex] = useState<number | null>(null);
  const [returnTarget, setReturnTarget] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [stageInfo, setStageInfo] = useState<{ width: number; mobile: boolean }>({
    width: 680,
    mobile: false,
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseGeomRef = useRef<ArcCardGeometry[]>([]);
  const waveRafRef = useRef<number>(0);
  const dragRafRef = useRef<number>(0);
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);
  const gestureRef = useRef<{
    pointer: number;
    fanIdx: number;
    deckIndex: number;
    startX: number;
    startY: number;
    moved: boolean;
    draggingToTable: boolean;
  } | null>(null);

  const helpId = useId();
  const cycleHelpId = useId();

  const reducedMotion = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Observe fan container width + mobile breakpoint for responsive arc geometry
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 680;
      const mobile = window.matchMedia("(max-width: 740px)").matches;
      setStageInfo((prev) =>
        prev.width === w && prev.mobile === mobile ? prev : { width: w, mobile },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxCards = compact ? (stageInfo.mobile ? 9 : 14) : stageInfo.mobile ? 15 : 28;
  const visibleCount = Math.min(count, maxCards);

  const arcCards = useMemo<ArcCardGeometry[]>(() => {
    if (visibleCount <= 0) return [];
    const cardW = compact ? (stageInfo.mobile ? 52 : 60) : stageInfo.mobile ? 64 : 86;
    const maxSpan = compact
      ? Math.min(220, Math.max(80, stageInfo.width - cardW - 16))
      : stageInfo.mobile
        ? Math.min(286, Math.max(120, stageInfo.width - cardW - 12))
        : Math.min(594, Math.max(200, stageInfo.width - cardW - 24));
    const halfSpan = visibleCount === 1 ? 0 : maxSpan / 2;
    const maxAngle = compact
      ? visibleCount > 1
        ? 11
        : 0
      : stageInfo.mobile
        ? Math.min(16, visibleCount * 1.15)
        : Math.min(22, visibleCount * 0.85);
    const arcDrop = compact ? 10 : stageInfo.mobile ? 18 : 34;

    return Array.from({ length: visibleCount }, (_, i) => {
      const t = visibleCount === 1 ? 0 : (i / (visibleCount - 1)) * 2 - 1;
      const x = t * halfSpan;
      const y = t * t * arcDrop;
      const angle = t * maxAngle;
      const deckIndex =
        i === 0
          ? 0
          : Math.min(count - 1, Math.max(i, Math.floor((i * count) / visibleCount)));
      return { x, y, angle, deckIndex };
    });
  }, [visibleCount, count, compact, stageInfo.width, stageInfo.mobile]);

  baseGeomRef.current = arcCards;

  const safeFocusedIdx = visibleCount > 0 ? Math.min(focusedIdx, visibleCount - 1) : 0;

  const applyBaseTransforms = useCallback((highlightIdx: number | null = null) => {
    const geom = baseGeomRef.current;
    for (let i = 0; i < geom.length; i++) {
      const btn = cardRefs.current[i];
      if (!btn) continue;
      const g = geom[i];
      if (highlightIdx === i) {
        btn.style.transform = `translate3d(${g.x.toFixed(1)}px, ${(g.y - 22).toFixed(1)}px, 0) rotate(${(g.angle * 0.55).toFixed(2)}deg) scale(1.05)`;
        btn.style.zIndex = "60";
        btn.style.setProperty("--card-glow", "0.95");
      } else {
        btn.style.transform = `translate3d(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px, 0) rotate(${g.angle.toFixed(2)}deg) scale(1)`;
        btn.style.zIndex = String(i + 1);
        btn.style.setProperty("--card-glow", "0");
      }
    }
  }, []);

  const applyPointerWave = useCallback(
    (clientX: number) => {
      const stage = stageRef.current;
      const geom = baseGeomRef.current;
      if (!stage || geom.length === 0) return;

      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const relX = clientX - centerX;

      const firstX = geom[0].x;
      const lastX = geom[geom.length - 1].x;
      const span = lastX - firstX;
      const cursorIdx =
        span > 1
          ? Math.max(
              -0.6,
              Math.min(
                geom.length - 0.4,
                ((relX - firstX) / span) * (geom.length - 1),
              ),
            )
          : 0;

      const peakLift = compact ? -16 : -26;
      const spreadPush = compact ? 3.2 : 5.6;

      for (let i = 0; i < geom.length; i++) {
        const btn = cardRefs.current[i];
        if (!btn) continue;
        const g = geom[i];
        const dist = Math.abs(i - cursorIdx);
        const wave = Math.exp(-(dist * dist) / 3.1);
        const part = (i - cursorIdx) * spreadPush * Math.exp(-(dist * dist) / 4.8);
        const liftY = peakLift * wave;
        const scale = 1 + 0.06 * wave;
        const dampedAngle = g.angle * (1 - 0.36 * wave);
        const z = wave > 0.68 ? 70 : Math.round(i + 1 + wave * 30);

        btn.style.transform = `translate3d(${(g.x + part).toFixed(2)}px, ${(g.y + liftY).toFixed(2)}px, 0) rotate(${dampedAngle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        btn.style.zIndex = String(z);
        btn.style.setProperty("--card-glow", wave > 0.12 ? wave.toFixed(3) : "0");
      }
    },
    [compact],
  );

  // Sync base transforms whenever card count or stage dimensions change
  useEffect(() => {
    applyBaseTransforms(null);
  }, [arcCards, applyBaseTransforms]);

  const overDeck = useCallback((point: DeckDropPoint) => {
    const r = stageRef.current?.getBoundingClientRect();
    return Boolean(
      r &&
        point.x >= r.left - 12 &&
        point.x <= r.right + 12 &&
        point.y >= r.top - 12 &&
        point.y <= r.bottom + 12,
    );
  }, []);

  const endGesture = useCallback(() => {
    gestureRef.current = null;
    cancelAnimationFrame(dragRafRef.current);
    if (ghostRef.current) ghostRef.current.style.visibility = "hidden";
    setLiftedIndex(null);
    setReturnTarget(false);
    onPull(null);
  }, [onPull]);

  const interruptShuffle = useCallback(() => {
    if (shuffleTimerRef.current) {
      clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }
    setShuffling(false);
  }, []);

  useEffect(() => {
    const handleInterrupt = () => {
      suppressClickRef.current = true;
      endGesture();
      interruptShuffle();
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      setCycling(false);
      applyBaseTransforms(null);
    };
    window.addEventListener("resize", handleInterrupt);
    window.addEventListener("blur", handleInterrupt);
    return () => {
      window.removeEventListener("resize", handleInterrupt);
      window.removeEventListener("blur", handleInterrupt);
      cancelAnimationFrame(waveRafRef.current);
      cancelAnimationFrame(dragRafRef.current);
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [endGesture, interruptShuffle, applyBaseTransforms]);

  function cycle() {
    if (!interactive || disabled || count < 2) return;
    interruptShuffle();
    endGesture();
    onCycle();
    setCycles((n) => n + 1);
    if (reducedMotion()) return;
    setCycling(true);
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = setTimeout(() => setCycling(false), 260);
  }

  function shuffle() {
    if (!interactive || !count) return;
    endGesture();
    if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    onShuffle();
    setCycles(0);
    if (reducedMotion()) {
      setShuffling(false);
      return;
    }
    setShuffling(true);
    // Fast, interruptible 420ms cascading wave across all fanned cards
    shuffleTimerRef.current = setTimeout(() => {
      shuffleTimerRef.current = null;
      setShuffling(false);
    }, 420);
  }

  function commitDraw(deckIndex: number, point?: DeckDropPoint) {
    if (!interactive || disabled || !count) return;
    interruptShuffle();
    onDraw(deckIndex, point);
  }

  return (
    <div
      className={`tarot-bottom-deck ${compact ? "is-compact-deck" : "is-arc-deck"} ${unmixed ? "is-unmixed" : ""} ${shuffling ? "is-shuffling" : ""} ${cycling ? "is-cycling" : ""} ${liftedIndex !== null ? "is-lifting" : ""}`}
      aria-busy={shuffling}
    >
      <div
        ref={stageRef}
        className={`tarot-arc-stage ${returnTarget ? "is-return-target" : ""}`}
        onPointerMove={(e) => {
          if (!interactive || disabled || gestureRef.current?.draggingToTable) return;
          if (reducedMotion()) return;
          const x = e.clientX;
          cancelAnimationFrame(waveRafRef.current);
          waveRafRef.current = requestAnimationFrame(() => applyPointerWave(x));
        }}
        onPointerLeave={() => {
          if (gestureRef.current?.draggingToTable) return;
          cancelAnimationFrame(waveRafRef.current);
          waveRafRef.current = requestAnimationFrame(() => applyBaseTransforms(null));
        }}
      >
        <div className="tarot-arc-guide" aria-hidden="true" />
        <div className="tarot-arc-cards" role="group" aria-label={c.deckShortTitle}>
          {arcCards.map((cardGeom, idx) => {
            const isLifted = liftedIndex === idx;
            const isPrimaryFocus = idx === safeFocusedIdx;
            return (
              <button
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                type="button"
                data-card-id={idx === 0 ? topCardId : undefined}
                data-fan-index={idx}
                tabIndex={isPrimaryFocus ? 0 : -1}
                disabled={!interactive || disabled}
                aria-label={`${c.drawSelected} · ${idx + 1} / ${visibleCount}`}
                aria-describedby={isPrimaryFocus ? `${helpId} ${cycleHelpId}` : undefined}
                aria-keyshortcuts="ArrowLeft ArrowRight ArrowDown"
                className={`tarot-arc-card ${isLifted ? "is-lifted-origin" : ""}`}
                style={
                  {
                    "--card-order": idx,
                    "--base-x": `${cardGeom.x.toFixed(1)}px`,
                    "--base-y": `${cardGeom.y.toFixed(1)}px`,
                    "--base-angle": `${cardGeom.angle.toFixed(2)}deg`,
                    transform: `translate3d(${cardGeom.x.toFixed(1)}px, ${cardGeom.y.toFixed(1)}px, 0) rotate(${cardGeom.angle.toFixed(2)}deg)`,
                    zIndex: idx + 1,
                  } as CSSProperties
                }
                onFocus={(e) => {
                  setFocusedIdx(idx);
                  if (e.currentTarget.matches(":focus-visible") && !reducedMotion()) {
                    applyBaseTransforms(idx);
                  }
                }}
                onBlur={() => {
                  applyBaseTransforms(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    cycle();
                    return;
                  }
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const delta = e.key === "ArrowRight" ? 1 : -1;
                    const next =
                      (idx + delta + arcCards.length) % Math.max(1, arcCards.length);
                    setFocusedIdx(next);
                    cardRefs.current[next]?.focus({ preventScroll: true });
                    if (!reducedMotion()) applyBaseTransforms(next);
                  }
                }}
                onPointerDown={(e) => {
                  if (!e.isPrimary || e.button !== 0 || !interactive || disabled) {
                    suppressClickRef.current = true;
                    endGesture();
                    return;
                  }
                  suppressClickRef.current = false;
                  setFocusedIdx(idx);
                  gestureRef.current = {
                    pointer: e.pointerId,
                    fanIdx: idx,
                    deckIndex: cardGeom.deckIndex,
                    startX: e.clientX,
                    startY: e.clientY,
                    moved: false,
                    draggingToTable: false,
                  };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  const g = gestureRef.current;
                  if (!g || g.pointer !== e.pointerId) return;
                  const dx = e.clientX - g.startX;
                  const dy = e.clientY - g.startY;
                  const dist = Math.hypot(dx, dy);

                  // Allow horizontal touch scrubbing across the arc before lifting upward
                  if (!g.draggingToTable && e.pointerType !== "mouse" && Math.abs(dx) > 10 && dy > -24) {
                    g.moved = true;
                    if (!reducedMotion()) {
                      const cx = e.clientX;
                      cancelAnimationFrame(waveRafRef.current);
                      waveRafRef.current = requestAnimationFrame(() => applyPointerWave(cx));
                    }
                    return;
                  }

                  if (dist > 9) g.moved = true;
                  if (dy <= -22 || (e.pointerType === "mouse" && dist > 18)) {
                    g.draggingToTable = true;
                  }
                  if (!g.draggingToTable) return;

                  suppressClickRef.current = true;
                  setLiftedIndex(g.fanIdx);
                  const point = { x: e.clientX, y: e.clientY };
                  setReturnTarget(count > 1 && overDeck(point));

                  cancelAnimationFrame(dragRafRef.current);
                  dragRafRef.current = requestAnimationFrame(() => {
                    if (!gestureRef.current || !ghostRef.current) return;
                    ghostRef.current.style.visibility = "visible";
                    ghostRef.current.style.transform = `translate3d(${point.x - 42}px, ${point.y - 98}px, 0) rotate(-4deg) scale(1.04)`;
                    onPull(contains(point) ? point : null);
                  });
                }}
                onPointerUp={(e) => {
                  const g = gestureRef.current;
                  if (!g || g.pointer !== e.pointerId) return;
                  const point = { x: e.clientX, y: e.clientY };
                  const wasDragging = g.draggingToTable;
                  const wasTouchScrub = g.moved && !wasDragging && e.pointerType !== "mouse";
                  const targetDeckIndex = g.deckIndex;
                  endGesture();

                  if (wasDragging) {
                    if (contains(point)) {
                      commitDraw(targetDeckIndex, point);
                    } else if (overDeck(point) && count > 1) {
                      cycle();
                    }
                    applyBaseTransforms(null);
                    return;
                  }

                  if (wasTouchScrub) {
                    // Find which card finger released over so touch-scrubbing & releasing selects that card
                    const stage = stageRef.current;
                    const geom = baseGeomRef.current;
                    if (stage && geom.length > 0) {
                      const rect = stage.getBoundingClientRect();
                      if (
                        point.y >= rect.top - 36 &&
                        point.y <= rect.bottom + 24 &&
                        point.x >= rect.left - 16 &&
                        point.x <= rect.right + 16
                      ) {
                        const relX = point.x - (rect.left + rect.width / 2);
                        let nearest = 0;
                        let best = Infinity;
                        for (let k = 0; k < geom.length; k++) {
                          const d = Math.abs(geom[k].x - relX);
                          if (d < best) {
                            best = d;
                            nearest = k;
                          }
                        }
                        suppressClickRef.current = true;
                        commitDraw(geom[nearest].deckIndex);
                      }
                    }
                    applyBaseTransforms(null);
                  }
                }}
                onPointerCancel={() => {
                  if (gestureRef.current) {
                    suppressClickRef.current = true;
                    endGesture();
                    applyBaseTransforms(null);
                  }
                }}
                onLostPointerCapture={() => {
                  if (gestureRef.current) {
                    suppressClickRef.current = true;
                    endGesture();
                    applyBaseTransforms(null);
                  }
                }}
                onClick={(e) => {
                  if (e.detail === 0 || !suppressClickRef.current) {
                    commitDraw(cardGeom.deckIndex);
                  }
                  suppressClickRef.current = false;
                }}
              >
                <CardBack />
              </button>
            );
          })}
        </div>
      </div>

      <div className="tarot-deck-actions">
        <div className="tarot-deck-label">
          <h2>{c.deckShortTitle}</h2>
          <span aria-live="polite">
            {count} {c.remaining}
          </span>
        </div>

        <button
          type="button"
          className="cel-button tarot-shuffle-btn"
          onClick={shuffle}
          disabled={!interactive || !count}
        >
          <Shuffle size={15} />
          <span>{c.shuffleShort}</span>
        </button>

        <button
          type="button"
          className="cel-button-soft tarot-draw-action"
          disabled={!interactive || disabled || !count}
          onClick={() => {
            const chosen =
              arcCards[safeFocusedIdx]?.deckIndex ??
              arcCards[Math.floor(arcCards.length / 2)]?.deckIndex ??
              0;
            commitDraw(chosen);
          }}
        >
          <Sparkles size={14} />
          <span>{c.drawSelected}</span>
          <span aria-hidden="true">↑</span>
        </button>

        <p id={helpId}>
          {unmixed ? AUTO_SHUFFLE_HINT[locale] : compact ? c.dropHint : c.ribbonHelp}
        </p>
        <span id={cycleHelpId} className="tarot-deck-key-help">
          {c.cycleKeyHelp}
        </span>
        <span className="tarot-deck-status" role="status">
          {shuffling
            ? c.shuffle
            : cycles
              ? `${c.cycled} · ${cycles}`
              : unmixed
                ? ""
                : c.shuffled}
        </span>
      </div>

      <div ref={ghostRef} className="tarot-drag-ghost" aria-hidden="true">
        <CardBack />
      </div>
    </div>
  );
}
