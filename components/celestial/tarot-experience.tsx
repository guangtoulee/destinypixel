"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  ArrowDown,
  Eye,
  FlipVertical2,
  RotateCcw,
  RotateCw,
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
  cycleDeck,
  spreadSizes,
  takeCard,
  returnCard,
  type TableState,
  type SpreadId,
  type DrawnCard,
} from "@/lib/celestial/tarot";
import { constrainCard, freeCardWidth } from "@/lib/celestial/tarot-layout";
import { trackToolEvent } from "@/lib/analytics";
import { CardBack } from "./card-back";
import { BottomDeck, type DeckDropPoint } from "./bottom-deck";
import { SaveCelestialRecord } from "./save-record";
import { TarotCardDialog } from "./tarot-card-dialog";
import { ReadingPanel } from "./reading-panel";
import { tarotWorkspaceCopy } from "@/lib/tarot-workspace-copy";
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const readingScrollBehavior = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" as const : "smooth" as const;

export default function TarotExperience({
  locale,
  copy: c,
  cards,
}: {
  locale: ReportLocale;
  copy: CelestialCopy;
  cards: CardInfo[];
}) {
  const workspaceCopy = tarotWorkspaceCopy(locale);
  const interactive = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const [boardSize, setBoardSize] = useState({width: 500, height: 350});
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
    workbench = useRef<HTMLDivElement>(null),
    questionInput = useRef<HTMLInputElement>(null),
    suppressCardClick = useRef(false),
    drag = useRef<{
      pointer: number;
      element: HTMLButtonElement;
      rotation: number;
      nextX: number;
      nextY: number;
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
    dragFrame = useRef(0),
    lastMix = useRef(0),
    completed = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth, height = element.clientHeight;
      if (width && height) setBoardSize(previous => previous.width === width && previous.height === height ? previous : {width, height});
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
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
    if (mode === "free") requestAnimationFrame(() => workbench.current?.scrollIntoView({block: "start", behavior: "instant"}));
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
        const width = freeCardWidth(boardSize);
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
        if (target && (target.getBoundingClientRect().top < 0 || target.getBoundingClientRect().bottom > window.innerHeight)) target.scrollIntoView({ behavior: readingScrollBehavior(), block: "center" });
      });
    }
    if (table.mode === "spread") {
      const empty = Array.from(
        { length: spreadSizes[table.spread] },
        (_, i) => i,
      ).find((i) => !next.cards.some((c) => c.slot === i));
      setSelected(empty ?? slot);
      if (empty === undefined)
        board.current?.scrollIntoView({ behavior: readingScrollBehavior(), block: "center" });
    } else setSelected(slot);
  }
  function edit(slot: number, patch: Partial<DrawnCard>) {
    invalidate();
    setTable((s) => ({
      ...s,
      cards: s.cards.map((card) =>
        card.slot === slot ? { ...card, ...patch, ...(s.mode === "free" ? constrainCard(patch.x ?? card.x, patch.y ?? card.y, patch.rotation ?? card.rotation, boardSize) : {}) } : card,
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
      questionInput.current?.scrollIntoView({behavior: readingScrollBehavior(), block: "center"});
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
    if (!e.isPrimary) { endDrag(false); suppressCardClick.current = true; return; }
    if (table.mode !== "free" || e.button !== 0 || drag.current) return;
    const b = board.current?.getBoundingClientRect();
    if (!b) return;
    setSelected(card.slot);
    suppressCardClick.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      pointer: e.pointerId,
      element: e.currentTarget,
      rotation: card.rotation,
      nextX: (e.currentTarget.offsetLeft / board.current!.clientWidth) * 100,
      nextY: (e.currentTarget.offsetTop / board.current!.clientHeight) * 100,
      slot: card.slot,
      startX: e.clientX,
      startY: e.clientY,
      x: (e.currentTarget.offsetLeft / board.current!.clientWidth) * 100,
      y: (e.currentTarget.offsetTop / board.current!.clientHeight) * 100,
      width: board.current!.clientWidth,
      height: board.current!.clientHeight,
      cardWidth: e.currentTarget.offsetWidth,
      cardHeight: e.currentTarget.offsetHeight,
      moved: false,
    };
  }
  function dragMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const dx = e.clientX - d.startX,
      dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) { d.moved = true; suppressCardClick.current = true; }
    if (!d.moved) return;
    const {x, y} = constrainCard(d.x + dx / d.width * 100, d.y + dy / d.height * 100, d.rotation,
      {width: d.width, height: d.height}, d.cardWidth, d.cardHeight);
    d.nextX = x;
    d.nextY = y;
    cancelAnimationFrame(dragFrame.current);
    dragFrame.current = requestAnimationFrame(() => {
      if (drag.current !== d) return;
      d.element.style.transform = `translate3d(${(d.nextX - d.x) * d.width / 100}px, ${(d.nextY - d.y) * d.height / 100}px, 0) rotate(${d.rotation}deg)`;
    });
  }
  function endDrag(commit: boolean) {
    const d = drag.current;
    drag.current = null;
    cancelAnimationFrame(dragFrame.current);
    if (!d) return;
    d.element.style.transform = `rotate(${d.rotation}deg)`;
    if (d.moved) {
      suppressCardClick.current = true;
      if (commit) setTable(s => ({...s, cards: s.cards.map(card => card.slot === d.slot ? {...card, x: d.nextX, y: d.nextY} : card)}));
    }
  }
  useEffect(() => {
    const cancel = () => endDrag(false);
    window.addEventListener("resize", cancel);
    window.addEventListener("blur", cancel);
    return () => { window.removeEventListener("resize", cancel); window.removeEventListener("blur", cancel); cancelAnimationFrame(dragFrame.current); };
  }, []);
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
  const deck = <BottomDeck compact={table.mode === "free"} key={recordSession} count={table.deck.length} disabled={!mixes} interactive={interactive} copy={table.mode === "free" ? c : { ...c, ribbonStart: workspaceCopy.beforeShuffle, ribbonHelp: workspaceCopy.deckHelp }}
        onDraw={draw} onShuffle={mix}
        topCardId={table.deck[0]?.id} onCycle={() => setTable(cycleDeck)}
        contains={point => {
          const r = board.current?.getBoundingClientRect();
          return Boolean(r && point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom);
        }}
        onPull={point => setIncoming(point ? slotAt(point) : null)} />;
  return (
    <section className="tarot-workspace" id="table" aria-busy={!interactive}>
      <ol className="tarot-journey" aria-label={workspaceCopy.nav}>{workspaceCopy.steps.map((step, i) => <li key={step} aria-current={i === (!mixes ? 0 : !table.cards.length ? 1 : !table.cards.some(card => card.revealed) ? 2 : 3) ? "step" : undefined}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{step}</li>)}</ol>
      <div ref={workbench} className={`tarot-workbench ${table.mode === "free" ? "is-free-workbench" : ""}`}>
      <div className="tarot-controls" id="tarot-spreads">
        <div className="cel-tabs" role="tablist" aria-label={c.tarot}>
          {(["spread", "free"] as const).map((mode) => (
            <button
              role="tab"
              disabled={!interactive}
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
                disabled={!interactive}
                // History must not restore the select independently of the table state.
                autoComplete="off"
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
              disabled={!interactive}
              checked={reversals}
              onChange={(e) => setReversals(e.target.checked)}
            />
            {c.reversals}
          </label>
          <button className="cel-button-text" aria-label={c.reset} title={c.reset} disabled={!interactive} onClick={() => reset()}>
            <RotateCcw size={15} />
            <span>{c.reset}</span>
          </button>
        </div>
      </div>
      {table.mode === "free" ? <details className="tarot-free-help"><summary>{c.tableHelp}</summary><p>{c.freeHelp} {c.rotationHelp}</p></details> : <details className="tarot-free-help tarot-spread-help"><summary>{c.tableHelp}</summary><p>{workspaceCopy.help}</p></details>}
      <div className="tarot-play-surface">
      {table.mode === "spread" && deck}
      <div
        className={`tarot-table ${incoming !== null ? "is-receiving" : ""} ${table.mode === "free" ? "tarot-free" : ""} tarot-spread-${table.spread}`}
        ref={board}
        style={{"--table-card-width": `${freeCardWidth(boardSize)}px`} as CSSProperties}
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
                        <small>{workspaceCopy.empty}</small>
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
                data-card-id={card.id}
                className={`tarot-free-card ${selected === card.slot ? "is-selected" : ""}`}
                style={{
                  left: `${constrainCard(card.x, card.y, card.rotation, boardSize).x}%`,
                  top: `${constrainCard(card.x, card.y, card.rotation, boardSize).y}%`,
                  transform: `rotate(${card.rotation}deg)`,
                  zIndex: selected === card.slot ? 100 : card.slot + 1,
                }}
                aria-label={`${c.position} ${card.slot + 1} · ${card.revealed ? cards.find((c) => c.id === card.id)?.name : c.cardBack}`}
                onPointerDown={(e) => dragStart(e, card)}
                onPointerMove={dragMove}
                onPointerUp={e => { if (drag.current?.pointer === e.pointerId) endDrag(true); }}
                onPointerCancel={() => endDrag(false)}
                onLostPointerCapture={() => endDrag(false)}
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
                    const position = constrainCard(card.x, card.y, card.rotation, boardSize);
                    edit(card.slot, {
                      x: position.x + (e.key === "ArrowLeft" ? -2 : e.key === "ArrowRight" ? 2 : 0),
                      y: position.y + (e.key === "ArrowUp" ? -2 : e.key === "ArrowDown" ? 2 : 0),
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
                aria-label={focused.revealed ? c.viewCard : c.reveal}
                title={focused.revealed ? c.viewCard : c.reveal}
                onClick={() => openCard(selected)}
              >
                <Eye size={15}/><span>{focused.revealed ? c.viewCard : c.reveal}</span>
              </button>
              {table.mode === "free" && (
                <>
                <button
                  className="cel-button-soft"
                  aria-label={c.rotatePlacement} title={c.rotationHelp}
                  onClick={() =>
                    edit(selected, { rotation: (focused.rotation + 15) % 360 })
                  }
                >
                  <RotateCw size={15} />
                  <span>{c.rotatePlacement}</span>
                </button>
                <button className="cel-button-soft tarot-orientation-toggle" aria-label={c.reverseCard} title={c.reverseCard}
                  onClick={() => edit(selected, {reversed: !focused.reversed})}><FlipVertical2 size={15}/><span>{c.reverseCard}</span></button>
                </>
              )}
              <button className="cel-button-soft" aria-label={c.returnCard} title={c.returnCard} onClick={putBack}>
                <Undo2 size={15} />
                <span>{c.returnCard}</span>
              </button>
            </>
          )}
        </div>
      </div>
      {table.mode === "free" && focused && <p className="tarot-orientation-status" aria-live="polite">{focused.reversed ? c.reversed : c.upright} · {c.placementAngle} {focused.rotation}°</p>}
      {table.mode === "free" && deck}
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
      <TarotCardDialog locale={locale} card={dialogCard ? cards.find(c => c.id === dialogCard.id) || null : null}
        reversed={dialogCard?.reversed || false}
        position={dialogCard ? (table.mode === "spread" ? positions[dialogCard.slot] : `${c.position} ${dialogCard.slot + 1}`) : ""}
        copy={c} onClose={() => setDialogSlot(null)}
        onDetailed={() => {questionInput.current?.focus({preventScroll:true}); questionInput.current?.scrollIntoView({behavior:readingScrollBehavior(),block:"center"});}}/>
    </section>
  );
}
