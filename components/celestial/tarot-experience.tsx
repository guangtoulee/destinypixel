"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  RotateCcw,
  RotateCw,
  Shuffle,
  Sparkles,
  Undo2,
} from "lucide-react";
import type { ReportLocale } from "@/lib/report-i18n";
import type { CelestialCopy } from "@/lib/celestial/copy";
import type { CardInfo } from "@/lib/celestial/tarot-meanings";
import type { CelestialReading } from "@/lib/celestial/ai";
import {
  initialTable,
  shuffleDeck,
  spreadSizes,
  takeCard,
  returnCard,
  type TableState,
  type SpreadId,
  type DrawnCard,
} from "@/lib/celestial/tarot";
import { trackToolEvent } from "@/lib/analytics";
import { CardBack } from "./card-back";
import { DeckRibbon, type DeckDropPoint } from "./deck-ribbon";
import { SaveCelestialRecord } from "./save-record";
import { TarotCardDialog } from "./tarot-card-dialog";
import { ReadingPanel } from "./reading-panel";
export default function TarotExperience({
  locale,
  copy: c,
  cards,
}: {
  locale: ReportLocale;
  copy: CelestialCopy;
  cards: CardInfo[];
}) {
  const [table, setTable] = useState<TableState>(() => initialTable()),
    [mixes, setMixes] = useState(0),
    [incoming, setIncoming] = useState<number | null>(null),
    [recordSession,setRecordSession] = useState(0),
    [reversals, setReversals] = useState(true),
    [selected, setSelected] = useState(0),
    [question, setQuestion] = useState(""),
    [details, setDetails] = useState(""),
    [questionError, setQuestionError] = useState(false),
    [dialogSlot, setDialogSlot] = useState<number | null>(null),
    [reading, setReading] = useState<CelestialReading | null>(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  const controller = useRef<AbortController | null>(null),
    revision = useRef(0),
    board = useRef<HTMLDivElement>(null),
    questionInput = useRef<HTMLInputElement>(null),
    suppressCardClick = useRef(false),
    drag = useRef<{
      slot: number;
      startX: number;
      startY: number;
      x: number;
      y: number;
      width: number;
      height: number;
      cardWidth: number;
      cardHeight: number;
      moved: boolean;
    } | null>(null),
    mixGesture = useRef<number | null>(null),
    lastMix = useRef(0),
    completed = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  function invalidate() {
    revision.current++;
    controller.current?.abort();
    setReading(null);
    setStatus("");
    setBusy(false);
    completed.current = false;
  }
  function mix() {
    if (Date.now() - lastMix.current < 260) return;
    lastMix.current = Date.now();
    setTable((s) => ({ ...s, deck: shuffleDeck(s.deck, reversals) }));
    setMixes((n) => n + 1);
    if (mixes === 0) trackToolEvent("tool_start", "tarot");
  }
  function reset(mode = table.mode, spread = table.spread) {
    if (table.cards.length && !window.confirm(c.resetCheck)) return;
    invalidate();
    setTable(initialTable(mode, spread));
    setRecordSession(n=>n+1);
    setMixes(0);
    setSelected(0);
  }
  function slotAt(point?: DeckDropPoint) {
    if (!point || table.mode === "free") return selected;
    const slots = board.current?.querySelectorAll<HTMLElement>("[data-drop-slot]");
    const hit = Array.from(slots || []).find(el => {
      const r = el.getBoundingClientRect();
      return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
    });
    return hit ? Number(hit.dataset.dropSlot) : selected;
  }
  function draw(index: number, point?: DeckDropPoint) {
    if (!mixes) return;
    invalidate();
    const slot =
      table.mode === "spread"
        ? slotAt(point)
        : Array.from({ length: 78 }, (_, i) => i).find(
            (i) => !table.cards.some((c) => c.slot === i),
          );
    if (slot === undefined) return;
    const next = takeCard(table, index, slot);
    if (point && table.mode === "free" && board.current) {
      const r = board.current.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        const width = parseFloat(getComputedStyle(board.current).getPropertyValue("--free-card-width")) || 82;
        next.cards = next.cards.map(card => card.slot === slot ? { ...card,
          x: Math.max(0, Math.min(100 - width / r.width * 100, (point.x - r.left - width / 2) / r.width * 100)),
          y: Math.max(0, Math.min(100 - width * 1.72 / r.height * 100, (point.y - r.top - width * .86) / r.height * 100)),
        } : card);
      }
    }
    setTable(next);
    // Keep the selected card and nearby deck visible after a phone draw.
    if (window.matchMedia("(max-width: 740px)").matches) {
      requestAnimationFrame(() => {
        const target = table.mode === "spread" ? board.current?.querySelector(`[data-drop-slot="${slot}"]`) : board.current;
        if (target && target.getBoundingClientRect().top < 0) target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    if (table.mode === "spread") {
      const empty = Array.from(
        { length: spreadSizes[table.spread] },
        (_, i) => i,
      ).find((i) => !next.cards.some((c) => c.slot === i));
      setSelected(empty ?? slot);
      if (empty === undefined)
        board.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else setSelected(slot);
  }
  function edit(slot: number, patch: Partial<DrawnCard>) {
    invalidate();
    setTable((s) => ({
      ...s,
      cards: s.cards.map((card) =>
        card.slot === slot ? { ...card, ...patch } : card,
      ),
    }));
  }
  function openCard(slot: number) {
    const card = table.cards.find((c) => c.slot === slot);
    if (card?.revealed) setDialogSlot(slot);
    else if (card) edit(slot, { revealed: true });
    setSelected(slot);
  }
  function putBack() {
    invalidate();
    const next = returnCard(table, selected);
    setTable(next);
    if (table.mode === "free") setSelected(next.cards.at(-1)?.slot ?? 0);
  }
  const positions = c.positions[table.spread],
    focused = table.cards.find((card) => card.slot === selected),
    dialogCard = table.cards.find((card) => card.slot === dialogSlot),
    ready =
      table.cards.length > 0 &&
      table.cards.every((c) => c.revealed) &&
      (table.mode === "free" ||
        table.cards.length === spreadSizes[table.spread]);
  useEffect(() => {
    if (ready && !completed.current) {
      trackToolEvent("tool_success", "tarot");
      completed.current = true;
    }
  }, [ready]);
  async function interpret() {
    if (!ready) return;
    if (!question.trim()) {
      setQuestionError(true);
      questionInput.current?.focus();
      questionInput.current?.scrollIntoView({behavior: "smooth", block: "center"});
      return;
    }
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const rev = revision.current;
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          mode: table.mode,
          spread: table.spread,
          question,
          details,
          cards: table.cards.map(({ id, reversed, slot }) => ({
            id,
            reversed,
            slot,
          })),
        }),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(50000)]),
      });
      const b = await r.json();
      if (rev !== revision.current) return;
      if (b.reading) setReading(b.reading);
      else {
        setStatus(b.status || "unavailable");
        trackToolEvent("tool_fallback", "tarot");
      }
    } catch {
      if (!abort.signal.aborted) setStatus("unavailable");
    } finally {
      if (rev === revision.current) setBusy(false);
    }
  }
  function dragStart(
    e: React.PointerEvent<HTMLButtonElement>,
    card: DrawnCard,
  ) {
    if (table.mode !== "free" || e.button !== 0) return;
    const b = board.current?.getBoundingClientRect();
    if (!b) return;
    setSelected(card.slot);
    suppressCardClick.current = false;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      slot: card.slot,
      startX: e.clientX,
      startY: e.clientY,
      x: (e.currentTarget.offsetLeft / b.width) * 100,
      y: (e.currentTarget.offsetTop / b.height) * 100,
      width: b.width,
      height: b.height,
      cardWidth: r.width,
      cardHeight: r.height,
      moved: false,
    };
  }
  function dragMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX,
      dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) { d.moved = true; suppressCardClick.current = true; }
    if (!d.moved) return;
    const x = Math.max(
        0,
        Math.min(
          100 - (d.cardWidth / d.width) * 100,
          d.x + (dx / d.width) * 100,
        ),
      ),
      y = Math.max(
        0,
        Math.min(
          100 - (d.cardHeight / d.height) * 100,
          d.y + (dy / d.height) * 100,
        ),
      );
    setTable((s) => ({
      ...s,
      cards: s.cards.map((c) => (c.slot === d.slot ? { ...c, x, y } : c)),
    }));
  }
  const face = (card: DrawnCard) => {
    const meta = cards.find((c) => c.id === card.id)!;
    return (
      <span className={`tarot-flipper ${card.revealed ? "is-revealed" : ""}`}>
        <span className="tarot-side tarot-back">
          <CardBack />
        </span>
        <span className="tarot-side tarot-face">
          {card.revealed && (
            <img
              src={meta.image}
              width={560}
              height={960}
              alt={meta.name}
              draggable={false}
              style={{
                transform: card.reversed ? "rotate(180deg)" : undefined,
              }}
            />
          )}
        </span>
      </span>
    );
  };
  return (
    <section className="tarot-workspace" id="table">
      <div className="tarot-controls">
        <div className="cel-tabs" role="tablist" aria-label={c.tarot}>
          {(["spread", "free"] as const).map((mode) => (
            <button
              role="tab"
              aria-selected={table.mode === mode}
              key={mode}
              onClick={() => mode !== table.mode && reset(mode)}
            >
              {mode === "free" ? c.freeMode : c.spreadMode}
            </button>
          ))}
        </div>
        <div className="tarot-settings">
          {table.mode === "spread" && (
            <label className="tarot-select">
              <span>{c.spreadLabel}</span>
              <select
                aria-label={c.spreadLabel}
                value={table.spread}
                onChange={(e) => reset("spread", e.target.value as SpreadId)}
              >
                {Object.entries(c.spreads).map(([id, name]) => (
                  <option value={id} key={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="tarot-check">
            <input
              type="checkbox"
              checked={reversals}
              onChange={(e) => setReversals(e.target.checked)}
            />
            {c.reversals}
          </label>
          <button className="cel-button-text" onClick={() => reset()}>
            <RotateCcw size={15} />
            {c.reset}
          </button>
        </div>
      </div>
      <p className="tarot-instructions">
        {table.mode === "free" ? c.freeHelp : c.spreadHelp}
      </p>
      <div className="tarot-play-surface">
      <div
        className={`tarot-table ${incoming !== null ? "is-receiving" : ""} ${table.mode === "free" ? "tarot-free" : ""} tarot-spread-${table.spread}`}
        ref={board}
        id="tarot-board"
      >
        <div className="tarot-table-ornament" aria-hidden="true">
          <span>✦</span>
        </div>
        <div className="tarot-table-caption">
          DESTINYPIXEL <span>✧</span>{" "}
          {table.mode === "free" ? c.freeMode : c.spreads[table.spread]}
        </div>
        {table.mode === "spread" ? (
          <div className={`tarot-slots tarot-slots-${table.spread}`}>
            {positions.map((label, i) => {
              const card = table.cards.find((c) => c.slot === i),
                meta = cards.find((c) => c.id === card?.id);
              return (
                <div
                  className={`tarot-slot tarot-slot-${i} ${selected === i ? "is-selected" : ""} ${incoming === i ? "is-drop-target" : ""}`}
                  key={i}
                >
                  <button
                    className="tarot-slot-card"
                    data-drop-slot={i}
                    aria-label={
                      card
                        ? card.revealed
                          ? `${meta?.name} · ${c.viewCard}`
                          : `${c.reveal} · ${label}`
                        : `${c.pick} · ${label}`
                    }
                    onClick={() => (card ? openCard(i) : setSelected(i))}
                  >
                    {card ? (
                      face(card)
                    ) : (
                      <span className="tarot-empty-slot">
                        <b>{String(i + 1).padStart(2, "0")}</b>
                        <span>✧</span>
                        <small>{c.empty}</small>
                      </span>
                    )}
                  </button>
                  <button
                    className="tarot-slot-label"
                    onClick={() => setSelected(i)}
                    aria-pressed={selected === i}
                  >
                    <span>{i + 1}</span>
                    {label}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {!table.cards.length && (
              <div className="tarot-blank">
                <Sparkles size={32} />
                <h2>{c.emptyTable}</h2>
                <p>{c.emptyTableHint}</p>
                <ArrowDown size={20} />
              </div>
            )}
            {table.cards.map((card) => (
              <button
                key={card.id}
                className={`tarot-free-card ${selected === card.slot ? "is-selected" : ""}`}
                style={{
                  left: `min(${card.x}%, calc(100% - var(--free-card-width)))`,
                  top: `min(${card.y}%, calc(100% - var(--free-card-height)))`,
                  transform: `rotate(${card.rotation}deg)`,
                  zIndex: selected === card.slot ? 100 : card.slot + 1,
                }}
                aria-label={`${c.position} ${card.slot + 1} · ${card.revealed ? cards.find((c) => c.id === card.id)?.name : c.cardBack}`}
                onPointerDown={(e) => dragStart(e, card)}
                onPointerMove={dragMove}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onClick={(e) => {
                  if (e.detail === 0 || !suppressCardClick.current) openCard(card.slot);
                  suppressCardClick.current = false;
                }}
                onKeyDown={(e) => {
                  if (
                    [
                      "ArrowUp",
                      "ArrowDown",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                    const width = board.current?.clientWidth || 500,
                      height = board.current?.clientHeight || 600;
                    edit(card.slot, {
                      x: Math.max(
                        0,
                        Math.min(
                          100 - (e.currentTarget.offsetWidth / width) * 100,
                          card.x +
                            (e.key === "ArrowLeft"
                              ? -2
                              : e.key === "ArrowRight"
                                ? 2
                                : 0),
                        ),
                      ),
                      y: Math.max(
                        0,
                        Math.min(
                          100 - (e.currentTarget.offsetHeight / height) * 100,
                          card.y +
                            (e.key === "ArrowUp"
                              ? -2
                              : e.key === "ArrowDown"
                                ? 2
                                : 0),
                        ),
                      ),
                    });
                  }
                }}
              >
                {face(card)}
                <span className="tarot-free-number">{card.slot + 1}</span>
              </button>
            ))}
          </>
        )}
      </div>
      <div className="tarot-table-toolbar">
        <span>
          {c.selected} <strong>{selected + 1}</strong>
          {table.mode === "spread" ? ` · ${positions[selected]}` : ""}
        </span>
        <div>
          {focused && (
            <>
              <button
                className="cel-button-soft"
                onClick={() => openCard(selected)}
              >
                {focused.revealed ? c.viewCard : c.reveal}
              </button>
              {table.mode === "free" && (
                <button
                  className="cel-button-soft"
                  onClick={() =>
                    edit(selected, { rotation: (focused.rotation + 15) % 360 })
                  }
                >
                  <RotateCw size={15} />
                  {c.rotate}
                </button>
              )}
              <button className="cel-button-soft" onClick={putBack}>
                <Undo2 size={15} />
                {c.returnCard}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="tarot-deck-zone">
        <div className="tarot-deck-compact">
          <div><h2>{c.deckShortTitle}</h2><span>{table.deck.length} {c.remaining}</span></div>
          <button className="cel-button" onClick={mix} disabled={!table.deck.length}><Shuffle size={16}/>{c.shuffleShort}</button>
        </div>
        <div className="tarot-draw-cue"><ArrowUp size={16}/><span>{c.dropHint}</span></div>
        <div className="tarot-deck-head">
          <div
            className="tarot-shuffle-object"
            role="button"
            tabIndex={0}
            aria-label={c.shuffle}
            onPointerDown={(e) => {
              mixGesture.current = e.clientX;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (
                mixGesture.current !== null &&
                Math.abs(e.clientX - mixGesture.current) > 35
              ) {
                mix();
                mixGesture.current = e.clientX;
              }
            }}
            onPointerUp={() => {
              mixGesture.current = null;
            }}
            onPointerCancel={() => {
              mixGesture.current = null;
            }}
            onClick={mix}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                mix();
              }
            }}
          >
            <div key={mixes} className={mixes ? "tarot-shuffling" : ""}>
              <CardBack />
              <CardBack />
              <CardBack />
            </div>
          </div>
          <div>
            <p className="cel-kicker">{c.free} · 78</p>
            <h2>{c.deckTitle}</h2>
            <p className="cel-muted cel-small">{c.shuffleTouch}</p>
            <button
              className="cel-button"
              onClick={mix}
              disabled={table.deck.length === 0}
            >
              <Shuffle size={17} />
              {c.shuffle}
            </button>
            {table.cards.length > 0 && (
              <button
                className="cel-button-text tarot-return-table"
                onClick={() =>
                  board.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
              >
                {c.backToTable} · {table.cards.length} ↑
              </button>
            )}
            <span className="tarot-mix-count" aria-live="polite">
              {mixes ? `${c.shuffled} · ${mixes}` : ""}
            </span>
          </div>
          <span className="tarot-count">
            <strong>{table.deck.length}</strong>
            {c.remaining}
          </span>
        </div>
        <p className="cel-muted cel-small tarot-deck-long-help">{c.deckHelp}</p>
        <DeckRibbon
          key={`${mixes}-${table.mode}-${table.spread}-${table.deck.map((card) => card.id).join(",")}`}
          count={table.deck.length}
          disabled={!mixes}
          copy={c}
          onDraw={draw}
          onPull={point => setIncoming(point ? slotAt(point) : null)}
        />
      </div>
      </div>
      {table.cards.some((card) => card.revealed) && (
        <div className="tarot-reading-list">
          {table.cards
            .filter((card) => card.revealed)
            .map((card) => {
              const info = cards.find((c) => c.id === card.id)!;
              return (
                <button
                  key={card.id}
                  onClick={() => openCard(card.slot)}
                  className={selected === card.slot ? "is-active" : ""}
                >
                  <span className="cel-kicker">
                    {card.slot + 1} ·{" "}
                    {table.mode === "spread"
                      ? positions[card.slot]
                      : c.position}
                  </span>
                  <strong>
                    {info.name}{" "}
                    <small>{card.reversed ? c.reversed : c.upright}</small>
                  </strong>
                  <span className="tarot-card-link">{c.viewCard} ↗</span>
                </button>
              );
            })}
        </div>
      )}
      <section className="tarot-question" id="tarot-question">
        <h2>{c.detailTitle}</h2>
        <label htmlFor="tarot-question-title">{c.question}</label>
        <input id="tarot-question-title" ref={questionInput} required maxLength={500} value={question}
          aria-invalid={questionError || undefined} aria-describedby={questionError ? "tarot-question-error" : "tarot-question-note"}
          onChange={(e) => {invalidate(); setQuestion(e.target.value); setQuestionError(false);}}
          placeholder={c.questionPlaceholder}/>
        {questionError && <p id="tarot-question-error" className="tarot-question-error" role="alert">{c.questionRequired}</p>}
        <p id="tarot-question-note" className="cel-small cel-muted">{c.questionNote}</p>
        <label htmlFor="tarot-question-details">{c.details}</label>
        <textarea id="tarot-question-details" maxLength={3000} rows={4} value={details}
          aria-describedby="tarot-details-note" onChange={(e) => {invalidate(); setDetails(e.target.value);}}
          placeholder={c.detailsPlaceholder}/>
        <p id="tarot-details-note" className="cel-small cel-muted">{c.detailsNote}</p>
      </section>
      <p className="cel-small cel-muted">
        {ready ? c.allRevealed : c.readyHint}
      </p>
      {table.cards.length > 0 && <SaveCelestialRecord key={recordSession} snapshot={{version:1,kind:"tarot",locale,table,question,details,reading}} disabled={busy}/>}
      <ReadingPanel
        copy={c}
        reading={reading}
        busy={busy}
        status={status}
        onRead={interpret}
        disabled={!ready}
      />
      <TarotCardDialog card={dialogCard ? cards.find(c => c.id === dialogCard.id) || null : null}
        reversed={dialogCard?.reversed || false}
        position={dialogCard ? (table.mode === "spread" ? positions[dialogCard.slot] : `${c.position} ${dialogCard.slot + 1}`) : ""}
        copy={c} onClose={() => setDialogSlot(null)}
        onDetailed={() => {questionInput.current?.focus({preventScroll:true}); questionInput.current?.scrollIntoView({behavior:"smooth",block:"center"});}}/>
    </section>
  );
}
