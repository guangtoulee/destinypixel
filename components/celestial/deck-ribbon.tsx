"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import type { CelestialCopy } from "@/lib/celestial/copy";
import { CardBack } from "./card-back";

/** One desktop ribbon, two balanced phone rows. Each pointer maps within its
 * own row; lifted cards and the 44px controls remain full-size targets. */
export type DeckDropPoint = { x: number; y: number };
export function DeckRibbon({ count, disabled, copy: c, onDraw, onPull }: {
  count: number;
  disabled: boolean;
  copy: CelestialCopy;
  onDraw: (index: number, point?: DeckDropPoint) => void;
  onPull: (point: DeckDropPoint | null) => void;
}) {
  const [peek, setPeek] = useState<number | null>(null);
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const ribbon = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointer: number; index: number; x: number; y: number;
    repeated: boolean; moved: boolean; pulling: boolean;
  } | null>(null);
  const helpId = useId();
  const split = Math.ceil(count / 2);
  const cardAt = (index: number) => ribbon.current?.querySelector<HTMLButtonElement>(`[data-card-index="${index}"]`);
  const clamp = (index: number) => Math.max(0, Math.min(count - 1, index));

  function indexAt(clientX: number, clientY: number, useLifted = true) {
    const root = ribbon.current!;
    let bounds = root.getBoundingClientRect();
    let start = 0, rowCount = count;
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".tarot-deck-row"));
    if (rows[0]?.offsetHeight) {
      // The desktop rows use display:contents and have no box. On phones,
      // use the nearest actual row, including space above a lifted card.
      const row = rows.reduce((a, b) => {
        const distance = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return Math.max(r.top - clientY, 0, clientY - r.bottom); };
        return distance(b) < distance(a) ? b : a;
      });
      bounds = row.getBoundingClientRect();
      start = Number(row.dataset.start);
      rowCount = row.querySelectorAll("button").length;
    }
    const card = root.querySelector<HTMLButtonElement>(".tarot-deck-card")!;
    const cardWidth = card.offsetWidth;
    // Only the protruding top edge is exposed; the body stays under its
    // neighbours. Do not let its hidden rectangle steal adjacent taps.
    if (useLifted && peek !== null) {
      const lifted = cardAt(peek)!.getBoundingClientRect();
      if (clientY >= lifted.top && clientY <= lifted.top + 18 &&
          clientX >= lifted.left && clientX <= lifted.right) return peek;
    }
    const step = (bounds.width - cardWidth) / Math.max(1, rowCount - 1);
    return start + (step > 0 ? Math.max(0, Math.min(rowCount - 1, Math.floor((clientX - bounds.left) / step))) : 0);
  }

  function endGesture() {
    gesture.current = null;
    setPull({ x: 0, y: 0 });
    onPull(null);
  }

  function choose(index: number, point?: DeckDropPoint) {
    endGesture();
    setPeek(null);
    onDraw(index, point);
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
            const card = cardAt(g.index)!;
            const cardWidth = card.offsetWidth;
            const mobile = card.parentElement!.offsetHeight > 0;
            const start = mobile ? Number(card.parentElement!.dataset.start) : 0;
            const rowCount = mobile ? card.parentElement!.querySelectorAll("button").length : count;
            const left = rowCount === 1 ? (root.clientWidth - cardWidth) / 2 :
              (g.index - start) / (rowCount - 1) * (root.clientWidth - cardWidth);
            onPull({ x: e.clientX, y: e.clientY });
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
          if (shouldDraw) choose(g.index, g.pulling ? { x: e.clientX, y: e.clientY } : undefined);
        }}
        onPointerCancel={endGesture}
        onLostPointerCapture={endGesture}
      >
        {[0, split].filter((start, row) => row === 0 || start < count).map((start, row) => (
          <div className="tarot-deck-row" data-start={start} key={row}>
          <span className="tarot-row-range" aria-hidden="true">{start + 1}—{row === 0 ? split : count}</span>
          {Array.from({ length: row === 0 ? split : count - split }, (_, offset) => {
          const i = start + offset;
          const rowCount = row === 0 ? split : count - split;
          const mobileP = rowCount === 1 ? .5 : offset / (rowCount - 1);
          const p = count === 1 ? .5 : i / (count - 1);
          const active = i === peek;
          return (
            <button
              key={i}
              type="button"
              data-card-index={i}
              disabled={disabled}
              tabIndex={i === (peek ?? 0) ? 0 : -1}
              aria-label={`${c.cardBack} ${i + 1}`}
              aria-pressed={active}
              aria-describedby={helpId}
              className={`tarot-deck-card ${active ? "is-peeking" : ""}`}
              style={{
                "--card-position": `${p * 100}%`,
                "--card-offset": `${-p * 100}%`,
                "--mobile-position": `${mobileP * 100}%`,
                "--mobile-offset": `${-mobileP * 100}%`,
                "--pull-x": `${active ? pull.x : 0}px`,
                "--pull-y": `${active ? -18 + pull.y : 0}px`,
                zIndex: active && pull.y < 0 ? 100 : i + 1,
              } as CSSProperties}
              onFocus={() => setPeek(i)}
              onClick={(e) => { if (e.detail === 0) choose(i); }}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(e.key)) {
                  e.preventDefault();
                  if (e.key === "Escape") setPeek(null);
                  else if (e.key === "Home" || e.key === "End") {
                    const index = e.key === "Home" ? 0 : count - 1;
                    setPeek(index);
                    ribbon.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
                  } else stepCard(e.key === "ArrowUp" ? -split : e.key === "ArrowDown" ? split : e.key === "ArrowLeft" ? -1 : 1, true);
                }
              }}
            >
              <CardBack />
              <span aria-hidden="true">{i + 1}</span>
            </button>
          );
          })}
          </div>
        ))}
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
