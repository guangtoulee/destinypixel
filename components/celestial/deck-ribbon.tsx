"use client";

import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import type { CelestialCopy } from "@/lib/celestial/copy";
import { CardBack } from "./card-back";

/** A single overlapping row. Pointer scrubbing gives even a narrow phone
 * access to every card; the arrow controls offer precise one-card steps. */
export function DeckRibbon({ count, disabled, copy: c, onDraw }: {
  count: number;
  disabled: boolean;
  copy: CelestialCopy;
  onDraw: (index: number) => void;
}) {
  const [peek, setPeek] = useState<number | null>(null);
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const ribbon = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointer: number; index: number; x: number; y: number;
    repeated: boolean; moved: boolean; pulling: boolean;
  } | null>(null);
  const helpId = useId();
  const clamp = (index: number) => Math.max(0, Math.min(count - 1, index));

  function indexAt(clientX: number, clientY: number, useLifted = true) {
    const root = ribbon.current!;
    const bounds = root.getBoundingClientRect();
    const card = root.querySelector<HTMLButtonElement>(".tarot-deck-card")!;
    const cardWidth = card.offsetWidth;
    // A lifted card stays a full-size tap/drag target. Horizontal scrubbing
    // ignores that overlay so adjacent cards remain easy to reach.
    if (useLifted && peek !== null) {
      const lifted = root.children[peek].getBoundingClientRect();
      if (clientY >= lifted.top && clientY <= lifted.bottom &&
          clientX >= lifted.left && clientX <= lifted.right) return peek;
    }
    const step = (bounds.width - cardWidth) / Math.max(1, count - 1);
    return step > 0 ? clamp(Math.floor((clientX - bounds.left) / step)) : 0;
  }

  function endGesture() {
    gesture.current = null;
    setPull({ x: 0, y: 0 });
  }

  function choose(index: number) {
    endGesture();
    setPeek(null);
    onDraw(index);
  }

  function stepCard(delta: number, focus = false) {
    const index = clamp((peek ?? Math.floor(count / 2)) + delta);
    setPeek(index);
    if (focus) ribbon.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
  }

  return (
    <div className="tarot-ribbon-picker">
      <p className="cel-muted cel-small tarot-ribbon-help" id={helpId}>
        {disabled ? c.ribbonStart : c.ribbonHelp}
      </p>
      <div
        ref={ribbon}
        className={`tarot-deck-ribbon ${disabled ? "is-disabled" : ""} ${pull.y < 0 ? "is-pulling" : ""}`}
        role="group"
        aria-label={c.deckTitle}
        aria-describedby={helpId}
        onPointerDown={(e) => {
          if (disabled || !count || e.button !== 0 || gesture.current) return;
          e.preventDefault();
          const index = indexAt(e.clientX, e.clientY);
          gesture.current = {
            pointer: e.pointerId, index, x: e.clientX, y: e.clientY,
            repeated: peek === index, moved: false, pulling: false,
          };
          setPeek(index);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const g = gesture.current;
          if (!g || g.pointer !== e.pointerId) return;
          const dx = e.clientX - g.x, dy = e.clientY - g.y;
          if (Math.abs(dx) + Math.abs(dy) > 7) g.moved = true;
          if (!g.pulling && dy < -14 && Math.abs(dy) > Math.abs(dx) * .7) g.pulling = true;
          if (g.pulling) {
            const root = ribbon.current!;
            const cardWidth = (root.children[g.index] as HTMLElement).offsetWidth;
            const left = count === 1 ? (root.clientWidth - cardWidth) / 2 :
              g.index / (count - 1) * (root.clientWidth - cardWidth);
            setPull({
              x: Math.max(-left, Math.min(root.clientWidth - cardWidth - left, dx)),
              y: Math.min(0, dy),
            });
          } else if (g.moved) {
            g.index = indexAt(e.clientX, e.clientY, false);
            setPeek(g.index);
          }
        }}
        onPointerUp={(e) => {
          const g = gesture.current;
          if (!g || g.pointer !== e.pointerId) return;
          const shouldDraw = (g.pulling && e.clientY - g.y < -48) || (g.repeated && !g.moved);
          e.currentTarget.releasePointerCapture(e.pointerId);
          endGesture();
          if (shouldDraw) choose(g.index);
        }}
        onPointerCancel={endGesture}
        onLostPointerCapture={endGesture}
      >
        {Array.from({ length: count }, (_, i) => {
          const p = count === 1 ? .5 : i / (count - 1);
          const active = i === peek;
          return (
            <button
              key={i}
              disabled={disabled}
              tabIndex={i === (peek ?? 0) ? 0 : -1}
              aria-label={`${c.cardBack} ${i + 1}`}
              aria-pressed={active}
              aria-describedby={helpId}
              className={`tarot-deck-card ${active ? "is-peeking" : ""}`}
              style={{
                left: `${p * 100}%`,
                transform: `translateX(-${p * 100}%) translate(${active ? pull.x : 0}px, ${active ? -28 + pull.y : 0}px)`,
                zIndex: active ? 100 : i + 1,
              }}
              onFocus={() => setPeek(i)}
              onClick={(e) => { if (e.detail === 0) choose(i); }}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(e.key)) {
                  e.preventDefault();
                  if (e.key === "Escape") setPeek(null);
                  else if (e.key === "Home" || e.key === "End") {
                    const index = e.key === "Home" ? 0 : count - 1;
                    setPeek(index);
                    ribbon.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
                  } else stepCard(e.key === "ArrowLeft" ? -1 : 1, true);
                }
              }}
            >
              <CardBack />
              <span aria-hidden="true">{i + 1}</span>
            </button>
          );
        })}
      </div>
      <div className="tarot-ribbon-actions">
        <div className="tarot-ribbon-stepper">
          <button type="button" aria-label={c.previousCard} disabled={disabled || !count || peek === 0} onClick={() => stepCard(-1)}>
            <ArrowLeft size={16} />
          </button>
          <span aria-live="polite">{peek === null ? "—" : String(peek + 1).padStart(2, "0")} <small>/ {count}</small></span>
          <button type="button" aria-label={c.nextCard} disabled={disabled || !count || peek === count - 1} onClick={() => stepCard(1)}>
            <ArrowRight size={16} />
          </button>
        </div>
        <button type="button" className="cel-button-soft" disabled={disabled || peek === null} onClick={() => { if (peek !== null) choose(peek); }}>
          <ArrowUp size={16} />{c.drawSelected}
        </button>
      </div>
    </div>
  );
}
