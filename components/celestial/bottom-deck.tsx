"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Shuffle } from "lucide-react";
import type { CelestialCopy } from "@/lib/celestial/copy";
import { CardBack } from "./card-back";

export type DeckDropPoint = { x: number; y: number };
/** Only transient transforms change while dragging; the deck changes on release. */
export function BottomDeck({ count, disabled, interactive, copy: c, onDraw, onPull, onShuffle, contains }: {
  count: number;
  disabled: boolean;
  interactive: boolean;
  copy: CelestialCopy;
  onDraw: (index: number, point?: DeckDropPoint) => void;
  onPull: (point: DeckDropPoint | null) => void;
  onShuffle: () => void;
  contains: (point: DeckDropPoint) => boolean;
}) {
  const [shuffling, setShuffling] = useState(false);
  const ghost = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ pointer: number; x: number; y: number; moved: boolean } | null>(null);
  const frame = useRef(0), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = useRef(false);
  const helpId = useId();
  function cancel() {
    gesture.current = null;
    cancelAnimationFrame(frame.current);
    if (ghost.current) ghost.current.style.visibility = "hidden";
    onPull(null);
  }
  useEffect(() => {
    const interrupt = () => { suppressClick.current = true; cancel(); };
    window.addEventListener("resize", interrupt);
    window.addEventListener("blur", interrupt);
    return () => {
      window.removeEventListener("resize", interrupt);
      window.removeEventListener("blur", interrupt);
      cancelAnimationFrame(frame.current);
      if (timer.current) clearTimeout(timer.current);
    };
    // Gesture handlers use the current props; interruption only clears transient UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function shuffle() {
    if (shuffling || !count) return;
    cancel();
    onShuffle();
    setShuffling(true);
    timer.current = setTimeout(() => setShuffling(false), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 850);
  }
  return <div className={`tarot-bottom-deck ${shuffling ? "is-shuffling" : ""}`} aria-busy={shuffling}>
    <div className="tarot-deck-stack">
      <div className="tarot-stack-layers" aria-hidden="true">
        {Array.from({length: Math.min(count, 7)}, (_, i) => <div key={i} style={{"--layer": i, "--scatter-x": `${62 + (i % 2 ? 1 : -1) * (20 + i * 7)}px`, "--scatter-y": `${-100 - (i % 3) * 30}px`, "--scatter-angle": `${(i - 3) * 17}deg`} as CSSProperties}><CardBack/></div>)}
      </div>
      <button type="button" className="tarot-deck-top" disabled={disabled || shuffling || !count}
        aria-label={c.drawSelected} aria-describedby={helpId}
        onPointerDown={e => {
          if (!e.isPrimary) { suppressClick.current = true; cancel(); return; }
          if (e.button !== 0 || gesture.current) return;
          suppressClick.current = false;
          gesture.current = {pointer: e.pointerId, x: e.clientX, y: e.clientY, moved: false};
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          const g = gesture.current;
          if (!g || g.pointer !== e.pointerId) return;
          if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 8) g.moved = true;
          if (!g.moved) return;
          suppressClick.current = true;
          const point = {x: e.clientX, y: e.clientY};
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
          cancel();
          if (g.moved && contains(point)) onDraw(0, point);
        }}
        onPointerCancel={() => { suppressClick.current = true; cancel(); }}
        onLostPointerCapture={cancel}
        onClick={e => {
          if (e.detail === 0 || !suppressClick.current) onDraw(0);
          suppressClick.current = false;
        }}><CardBack/></button>
    </div>
    <div className="tarot-deck-actions">
      <div className="tarot-deck-label"><h2>{c.deckShortTitle}</h2><span aria-live="polite">{count} {c.remaining}</span></div>
      <button type="button" className="cel-button" onClick={shuffle} disabled={!interactive || shuffling || !count}><Shuffle size={16}/>{c.shuffleShort}</button>
      <p id={helpId}>{disabled ? c.ribbonStart : c.ribbonHelp}</p>
      <span className="tarot-deck-status" role="status">{shuffling ? c.shuffle : disabled ? "" : c.shuffled}</span>
    </div>
    <div ref={ghost} className="tarot-drag-ghost" aria-hidden="true"><CardBack/></div>
  </div>;
}
