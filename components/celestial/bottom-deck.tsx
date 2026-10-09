"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Shuffle } from "lucide-react";
import type { CelestialCopy } from "@/lib/celestial/copy";
import { CardBack } from "./card-back";

export type DeckDropPoint = { x: number; y: number };
/** Transient transforms follow the pointer; only a completed drop changes order. */
export function BottomDeck({ count, topCardId, disabled, interactive, compact = false, copy: c, onDraw, onCycle, onPull, onShuffle, contains }: {
  count: number;
  topCardId?: string;
  disabled: boolean;
  interactive: boolean;
  compact?: boolean;
  copy: CelestialCopy;
  onDraw: (index: number, point?: DeckDropPoint) => void;
  onCycle: () => void;
  onPull: (point: DeckDropPoint | null) => void;
  onShuffle: () => void;
  contains: (point: DeckDropPoint) => boolean;
}) {
  const [shuffling, setShuffling] = useState(false), [cycling, setCycling] = useState(false);
  const [lifted, setLifted] = useState(false), [tucking, setTucking] = useState(false);
  const [returnTarget, setReturnTarget] = useState(false), [cycles, setCycles] = useState(0);
  const stack = useRef<HTMLDivElement>(null), ghost = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLButtonElement>(null), restoreKeyboardFocus = useRef(false);
  const gesture = useRef<{ pointer: number; x: number; y: number; moved: boolean; lifted: boolean } | null>(null);
  const frame = useRef(0), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flight = useRef<Animation | null>(null), locked = useRef(false), suppressClick = useRef(false);
  const helpId = useId(), cycleHelpId = useId();
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function overDeck(point: DeckDropPoint) {
    const r = stack.current?.getBoundingClientRect();
    return Boolean(r && point.x >= r.left - 10 && point.x <= r.right + 10 && point.y >= r.top - 10 && point.y <= r.bottom + 10);
  }
  function endGesture() {
    gesture.current = null;
    cancelAnimationFrame(frame.current);
    if (ghost.current) ghost.current.style.visibility = "hidden";
    setLifted(false);
    setReturnTarget(false);
    onPull(null);
  }
  function finishMotion() {
    flight.current?.cancel(); flight.current = null;
    if (timer.current) clearTimeout(timer.current);
    if (ghost.current) ghost.current.style.visibility = "hidden";
    locked.current = false;
    setShuffling(false); setCycling(false); setTucking(false);
    if (restoreKeyboardFocus.current) {
      restoreKeyboardFocus.current = false;
      requestAnimationFrame(() => top.current?.focus({preventScroll: true}));
    }
  }
  useEffect(() => {
    const interrupt = () => { suppressClick.current = true; restoreKeyboardFocus.current = false; endGesture(); finishMotion(); };
    window.addEventListener("resize", interrupt);
    window.addEventListener("blur", interrupt);
    return () => {
      window.removeEventListener("resize", interrupt);
      window.removeEventListener("blur", interrupt);
      cancelAnimationFrame(frame.current);
      flight.current?.cancel();
      if (timer.current) clearTimeout(timer.current);
    };
    // These interruption callbacks only clear refs/transient UI and the drop hint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function cycle(point?: DeckDropPoint) {
    if (!interactive || disabled || locked.current || count < 2) return;
    const r = stack.current?.getBoundingClientRect();
    endGesture();
    // Commit once, at the intentional release. Interrupting its visual completion
    // cannot duplicate/undo this already completed action.
    onCycle();
    setCycles(n => n + 1);
    if (reducedMotion() || !r || !ghost.current) return;
    locked.current = true;
    restoreKeyboardFocus.current = !point;
    setCycling(true);
    const scale = r.width / 84;
    const target = `translate3d(${r.left + 28}px, ${r.top - 24}px, 0) scale(${scale}) rotate(-12deg)`;
    ghost.current.style.visibility = "visible";
    const animation = ghost.current.animate([
      {transform: point ? `translate3d(${point.x - 42}px, ${point.y - 106}px, 0) rotate(-5deg)` : `translate3d(${r.left}px, ${r.top}px, 0) scale(${scale})`},
      {transform: target},
    ], {duration: 150, easing: "ease-out", fill: "forwards"});
    flight.current = animation;
    void animation.finished.then(() => {
      if (flight.current !== animation) return;
      animation.cancel(); flight.current = null;
      if (ghost.current) ghost.current.style.visibility = "hidden";
      setTucking(true);
      timer.current = setTimeout(finishMotion, 240);
    }).catch(() => { /* resize, blur or unmount cancels only the visual flight */ });
  }
  function shuffle() {
    if (!interactive || locked.current || !count) return;
    endGesture();
    locked.current = true;
    onShuffle(); setCycles(0); setShuffling(true);
    timer.current = setTimeout(finishMotion, reducedMotion() ? 80 : 850);
  }
  return <div className={`tarot-bottom-deck ${disabled ? "is-unmixed" : ""} ${shuffling ? "is-shuffling" : ""} ${cycling ? "is-cycling" : ""} ${lifted ? "is-lifting" : ""}`} aria-busy={shuffling || cycling}>
    <div ref={stack} className={`tarot-deck-stack ${returnTarget ? "is-return-target" : ""}`}>
      {tucking && <div className="tarot-tucking-card" aria-hidden="true"><CardBack/></div>}
      <div className="tarot-stack-layers" aria-hidden={compact ? true : undefined}>
        {Array.from({length: Math.min(Math.max(count - 1, 0), 6)}, (_, i) => <div key={i} style={{"--layer": i < 3 ? i : i + 1, "--scatter-x": `${62 + (i % 2 ? 1 : -1) * (20 + i * 7)}px`, "--scatter-y": `${-100 - (i % 3) * 30}px`, "--scatter-angle": `${(i - 3) * 17}deg`} as CSSProperties}>
          {compact ? <CardBack/> : <button type="button" className="tarot-fan-choice" aria-label={`${c.drawSelected} · ${i + 2}`} disabled={!interactive || disabled || shuffling || cycling}
            onClick={() => { if (!locked.current) onDraw(i + 1); }}><CardBack/></button>}
        </div>)}
      </div>
      <button ref={top} type="button" className="tarot-deck-top" data-card-id={topCardId} disabled={disabled || shuffling || cycling || !count}
        aria-label={c.drawSelected} aria-describedby={`${helpId} ${cycleHelpId}`} aria-keyshortcuts="ArrowDown"
        onKeyDown={e => { if (e.key === "ArrowDown") { e.preventDefault(); cycle(); } }}
        onPointerDown={e => {
          if (!e.isPrimary) { suppressClick.current = true; endGesture(); return; }
          if (e.button !== 0 || gesture.current || locked.current) return;
          suppressClick.current = false;
          gesture.current = {pointer: e.pointerId, x: e.clientX, y: e.clientY, moved: false, lifted: false};
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          const g = gesture.current;
          if (!g || g.pointer !== e.pointerId) return;
          const distance = Math.hypot(e.clientX - g.x, e.clientY - g.y);
          if (distance > 8) g.moved = true;
          if (e.clientY - g.y <= -24 || distance > 36) g.lifted = true;
          if (!g.moved) return;
          suppressClick.current = true;
          setLifted(true);
          const point = {x: e.clientX, y: e.clientY};
          setReturnTarget(g.lifted && count > 1 && overDeck(point));
          cancelAnimationFrame(frame.current);
          frame.current = requestAnimationFrame(() => {
            if (!gesture.current || !ghost.current) return;
            ghost.current.style.visibility = "visible";
            ghost.current.style.transform = `translate3d(${point.x - 42}px, ${point.y - 106}px, 0) rotate(-5deg)`;
            onPull(contains(point) ? point : null);
          });
        }}
        onPointerUp={e => {
          const g = gesture.current;
          if (!g || g.pointer !== e.pointerId) return;
          const point = {x: e.clientX, y: e.clientY};
          endGesture();
          if (g.moved && contains(point)) onDraw(0, point);
          else if (g.lifted && overDeck(point)) cycle(point);
        }}
        onPointerCancel={() => { if (gesture.current) { suppressClick.current = true; endGesture(); } }}
        onLostPointerCapture={() => { if (gesture.current) { suppressClick.current = true; endGesture(); } }}
        onClick={e => {
          if (locked.current) return;
          if (e.detail === 0 || !suppressClick.current) onDraw(0);
          suppressClick.current = false;
        }}><CardBack/></button>
    </div>
    <div className="tarot-deck-actions">
      <div className="tarot-deck-label"><h2>{c.deckShortTitle}</h2><span aria-live="polite">{count} {c.remaining}</span></div>
      <button type="button" className="cel-button" onClick={shuffle} disabled={!interactive || shuffling || cycling || !count}><Shuffle size={16}/>{c.shuffleShort}</button>
      <button type="button" className="cel-button-soft tarot-draw-action" disabled={!interactive || disabled || shuffling || cycling || !count} onClick={() => { if (!locked.current) onDraw(0); }}>{c.drawSelected}<span aria-hidden="true">↑</span></button>
      <p id={helpId}>{disabled ? c.ribbonStart : compact ? c.dropHint : c.ribbonHelp}</p>
      <span id={cycleHelpId} className="tarot-deck-key-help">{c.cycleKeyHelp}</span>
      <span className="tarot-deck-status" role="status">{shuffling ? c.shuffle : cycles ? `${c.cycled} · ${cycles}` : disabled ? "" : c.shuffled}</span>
    </div>
    <div ref={ghost} className="tarot-drag-ghost" aria-hidden="true"><CardBack/></div>
  </div>;
}
