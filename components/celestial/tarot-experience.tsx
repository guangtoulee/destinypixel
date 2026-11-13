"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  ArrowDown,
  Check,
  Eye,
  FlipVertical2,
  PenLine,
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
import { createTarotRoundTracker } from "@/lib/celestial/tarot-analytics";
import { CardBack } from "./card-back";
import { BottomDeck, type DeckDropPoint } from "./bottom-deck";
import { TarotCardDialog } from "./tarot-card-dialog";
import { ReadingPanel } from "./reading-panel";
import { TarotKeepsake } from "./tarot-keepsake";
import { tarotWorkspaceCopy } from "@/lib/tarot-workspace-copy";

// The save panel only appears after a card is placed. Keep its translation
// dictionary and account UI out of the initial public card-table bundle.
const SaveCelestialRecord = dynamic(() =>
  import("./save-record").then((module) => module.SaveCelestialRecord),
);

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const readingScrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? ("instant" as const)
    : ("smooth" as const);

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const SPREAD_PILL_ORDER: readonly SpreadId[] = [
  "three",
  "single",
  "relationship",
  "choice",
  "celtic",
];

type CockpitExtraCopy = {
  questionCapsuleEmpty: string;
  questionCapsuleEdit: string;
  questionCapsuleDone: string;
  revealAll: string;
  spreadShort: Record<SpreadId, string>;
};

const COCKPIT_COPY: Record<ReportLocale, CockpitExtraCopy> = {
  en: {
    questionCapsuleEmpty: "+ Write what you'd like to ask (optional — or write after drawing)",
    questionCapsuleEdit: "Edit",
    questionCapsuleDone: "Done",
    revealAll: "Reveal All",
    spreadShort: {
      three: "3 Cards",
      single: "Single",
      relationship: "Relationship",
      choice: "Two Paths",
      celtic: "Celtic Cross",
    },
  },
  zh: {
    questionCapsuleEmpty: "+ 写下你想问的事（选填，也可抽完再写）",
    questionCapsuleEdit: "编辑",
    questionCapsuleDone: "收起",
    revealAll: "一键翻开全部",
    spreadShort: {
      three: "三牌阵",
      single: "单张",
      relationship: "关系牌阵",
      choice: "二选一",
      celtic: "凯尔特十字",
    },
  },
  "zh-TW": {
    questionCapsuleEmpty: "+ 寫下你想問的事（選填，也可抽完再寫）",
    questionCapsuleEdit: "編輯",
    questionCapsuleDone: "收起",
    revealAll: "一鍵翻開全部",
    spreadShort: {
      three: "三牌陣",
      single: "單張",
      relationship: "關係牌陣",
      choice: "二選一",
      celtic: "凱爾特十字",
    },
  },
  ru: {
    questionCapsuleEmpty: "+ Запишите свой вопрос (необязательно — можно и после расклада)",
    questionCapsuleEdit: "Изменить",
    questionCapsuleDone: "Готово",
    revealAll: "Открыть все карты",
    spreadShort: {
      three: "Три карты",
      single: "Одна карта",
      relationship: "Отношения",
      choice: "Два пути",
      celtic: "Кельтский крест",
    },
  },
};

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
  const extra = COCKPIT_COPY[locale];
  const interactive = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady,
  );

  const [boardSize, setBoardSize] = useState({ width: 500, height: 350 });
  const [table, setTable] = useState<TableState>(() => initialTable());
  const [mixes, setMixes] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [recordSession, setRecordSession] = useState(0);
  const [reversals, setReversals] = useState(true);
  const [selected, setSelected] = useState(0);
  const [question, setQuestion] = useState("");
  const [questionCapsuleOpen, setQuestionCapsuleOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [questionError, setQuestionError] = useState(false);
  const [dialogSlot, setDialogSlot] = useState<number | null>(null);
  const [reading, setReading] = useState<CelestialReading | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const controller = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const board = useRef<HTMLDivElement>(null);
  const workbench = useRef<HTMLDivElement>(null);
  const questionInput = useRef<HTMLInputElement>(null);
  const capsuleInput = useRef<HTMLInputElement>(null);
  const suppressCardClick = useRef(false);
  const revealTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const drag = useRef<{
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
  } | null>(null);
  const dragFrame = useRef(0);
  const lastMix = useRef(0);

  const round = useRef<ReturnType<typeof createTarotRoundTracker> | null>(null);
  if (!round.current) round.current = createTarotRoundTracker();

  function clearRevealTimers() {
    revealTimers.current.forEach(clearTimeout);
    revealTimers.current = [];
  }

  useEffect(
    () => () => {
      controller.current?.abort();
      clearRevealTimers();
    },
    [],
  );

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width && height) {
        setBoardSize((previous) =>
          previous.width === width && previous.height === height
            ? previous
            : { width, height },
        );
      }
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
  }

  function mix() {
    if (Date.now() - lastMix.current < 160) return;
    lastMix.current = Date.now();
    setTable((s) => ({ ...s, deck: shuffleDeck(s.deck, reversals) }));
    setMixes((n) => n + 1);
    if (mixes === 0) round.current!.start();
  }

  function reset(mode = table.mode, spread = table.spread) {
    if (table.cards.length && !window.confirm(c.resetCheck)) return;
    clearRevealTimers();
    invalidate();
    round.current!.reset();
    setTable(initialTable(mode, spread));
    setRecordSession((n) => n + 1);
    setMixes(0);
    setSelected(0);
    if (mode === "free") {
      requestAnimationFrame(() =>
        workbench.current?.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    }
  }

  function slotAt(point?: DeckDropPoint) {
    if (!point || table.mode === "free") return selected;
    const slots = board.current?.querySelectorAll<HTMLElement>("[data-drop-slot]");
    const hit = Array.from(slots || []).find((el) => {
      const r = el.getBoundingClientRect();
      return (
        point.x >= r.left &&
        point.x <= r.right &&
        point.y >= r.top &&
        point.y <= r.bottom
      );
    });
    return hit ? Number(hit.dataset.dropSlot) : selected;
  }

  function draw(index: number, point?: DeckDropPoint) {
    const slot =
      table.mode === "spread"
        ? slotAt(point)
        : Array.from({ length: 78 }, (_, i) => i).find(
            (i) => !table.cards.some((card) => card.slot === i),
          );
    if (slot === undefined) return;

    // Zero-friction draw: if the user clicks or drags any card before manually shuffling,
    // perform an instant cryptographic shuffle first and draw that exact chosen card position!
    const sourceTable =
      mixes === 0
        ? { ...table, deck: shuffleDeck(table.deck, reversals) }
        : table;
    const safeIndex = Math.max(0, Math.min(sourceTable.deck.length - 1, index));
    const next = takeCard(sourceTable, safeIndex, slot);
    if (next === sourceTable) return;

    invalidate();
    round.current!.start();
    if (mixes === 0) setMixes(1);

    if (point && table.mode === "free" && board.current) {
      const r = board.current.getBoundingClientRect();
      if (
        point.x >= r.left &&
        point.x <= r.right &&
        point.y >= r.top &&
        point.y <= r.bottom
      ) {
        const width = freeCardWidth(boardSize);
        next.cards = next.cards.map((card) =>
          card.slot === slot
            ? {
                ...card,
                x: Math.max(
                  0,
                  Math.min(
                    100 - (width / r.width) * 100,
                    ((point.x - r.left - width / 2) / r.width) * 100,
                  ),
                ),
                y: Math.max(
                  0,
                  Math.min(
                    100 - ((width * 1.72) / r.height) * 100,
                    ((point.y - r.top - width * 0.86) / r.height) * 100,
                  ),
                ),
              }
            : card,
        );
      }
    }

    setTable(next);

    if (window.matchMedia("(max-width: 740px)").matches) {
      requestAnimationFrame(() => {
        const target =
          table.mode === "spread"
            ? board.current?.querySelector(`[data-drop-slot="${slot}"]`)
            : board.current;
        if (
          target &&
          (target.getBoundingClientRect().top < 0 ||
            target.getBoundingClientRect().bottom > window.innerHeight)
        ) {
          target.scrollIntoView({
            behavior: readingScrollBehavior(),
            block: "center",
          });
        }
      });
    }

    if (table.mode === "spread") {
      const empty = Array.from(
        { length: spreadSizes[table.spread] },
        (_, i) => i,
      ).find((i) => !next.cards.some((card) => card.slot === i));
      setSelected(empty ?? slot);
      if (empty === undefined) {
        board.current?.scrollIntoView({
          behavior: readingScrollBehavior(),
          block: "center",
        });
      }
    } else {
      setSelected(slot);
    }
  }

  function edit(slot: number, patch: Partial<DrawnCard>) {
    invalidate();
    setTable((s) => ({
      ...s,
      cards: s.cards.map((card) =>
        card.slot === slot
          ? {
              ...card,
              ...patch,
              ...(s.mode === "free"
                ? constrainCard(
                    patch.x ?? card.x,
                    patch.y ?? card.y,
                    patch.rotation ?? card.rotation,
                    boardSize,
                  )
                : {}),
            }
          : card,
      ),
    }));
  }

  function revealAll() {
    clearRevealTimers();
    const unrevealedSlots = table.cards
      .filter((card) => !card.revealed)
      .sort((a, b) => a.slot - b.slot)
      .map((card) => card.slot);
    if (!unrevealedSlots.length) return;

    invalidate();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || unrevealedSlots.length === 1) {
      setTable((s) => ({
        ...s,
        cards: s.cards.map((card) =>
          card.revealed ? card : { ...card, revealed: true },
        ),
      }));
      return;
    }

    unrevealedSlots.forEach((slotNum, idx) => {
      const t = setTimeout(() => {
        setTable((s) => ({
          ...s,
          cards: s.cards.map((card) =>
            card.slot === slotNum ? { ...card, revealed: true } : card,
          ),
        }));
      }, idx * 120);
      revealTimers.current.push(t);
    });
  }

  function openCard(slot: number) {
    const card = table.cards.find((item) => item.slot === slot);
    if (card?.revealed) setDialogSlot(slot);
    else if (card) edit(slot, { revealed: true });
    setSelected(slot);
  }

  function putBack() {
    clearRevealTimers();
    invalidate();
    const next = returnCard(table, selected);
    setTable(next);
    if (table.mode === "free") setSelected(next.cards.at(-1)?.slot ?? 0);
  }

  const positions = c.positions[table.spread];
  const focused = table.cards.find((card) => card.slot === selected);
  const dialogCard = table.cards.find((card) => card.slot === dialogSlot);
  const hasUnrevealed = table.cards.some((card) => !card.revealed);
  const ready =
    table.cards.length > 0 &&
    table.cards.every((card) => card.revealed) &&
    (table.mode === "free" ||
      table.cards.length === spreadSizes[table.spread]);

  useEffect(() => {
    if (ready) round.current!.complete();
  }, [ready, table.cards]);

  async function interpret() {
    if (!ready) return;
    if (!question.trim()) {
      setQuestionError(true);
      questionInput.current?.focus();
      questionInput.current?.scrollIntoView({
        behavior: readingScrollBehavior(),
        block: "center",
      });
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
    if (!e.isPrimary) {
      endDrag(false);
      suppressCardClick.current = true;
      return;
    }
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
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) {
      d.moved = true;
      suppressCardClick.current = true;
    }
    if (!d.moved) return;
    const { x, y } = constrainCard(
      d.x + (dx / d.width) * 100,
      d.y + (dy / d.height) * 100,
      d.rotation,
      { width: d.width, height: d.height },
      d.cardWidth,
      d.cardHeight,
    );
    d.nextX = x;
    d.nextY = y;
    cancelAnimationFrame(dragFrame.current);
    dragFrame.current = requestAnimationFrame(() => {
      if (drag.current !== d) return;
      d.element.style.transform = `translate3d(${((d.nextX - d.x) * d.width) / 100}px, ${((d.nextY - d.y) * d.height) / 100}px, 0) rotate(${d.rotation}deg)`;
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
      if (commit) {
        setTable((s) => ({
          ...s,
          cards: s.cards.map((card) =>
            card.slot === d.slot ? { ...card, x: d.nextX, y: d.nextY } : card,
          ),
        }));
      }
    }
  }

  useEffect(() => {
    const cancel = () => endDrag(false);
    window.addEventListener("resize", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("resize", cancel);
      window.removeEventListener("blur", cancel);
      cancelAnimationFrame(dragFrame.current);
    };
  }, []);

  const face = (card: DrawnCard) => {
    const meta = cards.find((item) => item.id === card.id)!;
    return (
      <span className={`tarot-flipper ${card.revealed ? "is-revealed" : ""}`}>
        <span className="tarot-side tarot-back">
          <CardBack />
        </span>
        <span className="tarot-side tarot-face">
          <img
            src={meta.image}
            width={560}
            height={960}
            alt={card.revealed ? meta.name : ""}
            draggable={false}
            style={{
              transform: card.reversed ? "rotate(180deg)" : undefined,
            }}
          />
        </span>
      </span>
    );
  };

  const spreadDeckHelp = hasUnrevealed
    ? workspaceCopy.revealHelp
    : table.cards.length > 0
      ? workspaceCopy.meaningHelp
      : workspaceCopy.deckHelp;

  const deck = (
    <BottomDeck
      compact={table.mode === "free"}
      key={recordSession}
      count={table.deck.length}
      unmixed={!mixes}
      disabled={!interactive || !table.deck.length}
      interactive={interactive}
      locale={locale}
      copy={
        table.mode === "free"
          ? c
          : {
              ...c,
              ribbonStart: workspaceCopy.beforeShuffle,
              ribbonHelp: spreadDeckHelp,
            }
      }
      onDraw={draw}
      onShuffle={mix}
      topCardId={table.deck[0]?.id}
      onCycle={() => setTable(cycleDeck)}
      contains={(point) => {
        const r = board.current?.getBoundingClientRect();
        return Boolean(
          r &&
            point.x >= r.left &&
            point.x <= r.right &&
            point.y >= r.top &&
            point.y <= r.bottom,
        );
      }}
      onPull={(point) => setIncoming(point ? slotAt(point) : null)}
    />
  );

  return (
    <section className="tarot-workspace" id="table" aria-busy={!interactive}>
      <div
        ref={workbench}
        data-has-cards={table.cards.length > 0}
        className={`tarot-workbench ${table.mode === "free" ? "is-free-workbench" : ""}`}
      >
        {/* Inline Collapsible Question Capsule */}
        <div className={`tarot-question-capsule ${questionCapsuleOpen ? "is-open" : ""}`}>
          {!questionCapsuleOpen ? (
            <button
              type="button"
              className="tarot-question-capsule-pill"
              onClick={() => {
                setQuestionCapsuleOpen(true);
                requestAnimationFrame(() => capsuleInput.current?.focus());
              }}
            >
              {question.trim() ? (
                <>
                  <Sparkles size={14} className="tarot-capsule-icon" />
                  <span className="tarot-capsule-value">“{question.trim()}”</span>
                  <span className="tarot-capsule-action">
                    <PenLine size={12} /> {extra.questionCapsuleEdit}
                  </span>
                </>
              ) : (
                <span>{extra.questionCapsuleEmpty}</span>
              )}
            </button>
          ) : (
            <div className="tarot-question-capsule-editor">
              <Sparkles size={15} className="tarot-capsule-icon" />
              <input
                ref={capsuleInput}
                type="text"
                maxLength={500}
                value={question}
                aria-label={c.question}
                placeholder={c.questionPlaceholder}
                onChange={(e) => {
                  invalidate();
                  setQuestion(e.target.value);
                  setQuestionError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    e.preventDefault();
                    setQuestionCapsuleOpen(false);
                  }
                }}
              />
              <button
                type="button"
                className="cel-button-soft tarot-capsule-done"
                onClick={() => setQuestionCapsuleOpen(false)}
              >
                <Check size={14} />
                <span>{extra.questionCapsuleDone}</span>
              </button>
            </div>
          )}
        </div>

        {/* Direct Spread Selector Pill Bar + Inline Controls */}
        <div className="tarot-cockpit-bar" id="tarot-spreads">
          <div className="tarot-spread-pills" role="tablist" aria-label={c.spreadLabel}>
            {SPREAD_PILL_ORDER.map((id) => {
              const active = table.mode === "spread" && table.spread === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  disabled={!interactive}
                  aria-selected={active}
                  title={c.spreads[id]}
                  className={`tarot-spread-pill ${active ? "is-active" : ""}`}
                  onClick={() => {
                    if (!active) reset("spread", id);
                  }}
                >
                  {extra.spreadShort[id]}
                </button>
              );
            })}
            <button
              type="button"
              role="tab"
              disabled={!interactive}
              aria-selected={table.mode === "free"}
              className={`tarot-spread-pill ${table.mode === "free" ? "is-active" : ""}`}
              onClick={() => {
                if (table.mode !== "free") reset("free", table.spread);
              }}
            >
              {c.freeMode}
            </button>
          </div>

          <div className="tarot-cockpit-meta">
            <label className="tarot-check tarot-check-pill">
              <input
                type="checkbox"
                disabled={!interactive}
                checked={reversals}
                onChange={(e) => setReversals(e.target.checked)}
              />
              <span>{c.reversals}</span>
            </label>
            <button
              type="button"
              className="cel-button-text tarot-reset-inline"
              aria-label={c.reset}
              title={c.reset}
              disabled={!interactive}
              onClick={() => reset()}
            >
              <RotateCcw size={14} />
              <span>{c.reset}</span>
            </button>
          </div>
        </div>

        <div className="tarot-play-surface">
          {table.mode === "spread" && deck}
          <div
            className={`tarot-table ${incoming !== null ? "is-receiving" : ""} ${table.mode === "free" ? "tarot-free" : ""} tarot-spread-${table.spread}`}
            ref={board}
            style={
              {
                "--table-card-width": `${freeCardWidth(boardSize)}px`,
              } as CSSProperties
            }
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
                  const card = table.cards.find((item) => item.slot === i);
                  const meta = cards.find((item) => item.id === card?.id);
                  const roman = ROMAN_NUMERALS[i] ?? String(i + 1);
                  return (
                    <div
                      className={`tarot-slot tarot-slot-${i} ${selected === i ? "is-selected" : ""} ${incoming === i ? "is-drop-target" : ""}`}
                      key={i}
                    >
                      <button
                        type="button"
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
                            <i className="tarot-corner tarot-corner-tl" aria-hidden="true">
                              ✦
                            </i>
                            <i className="tarot-corner tarot-corner-tr" aria-hidden="true">
                              ✦
                            </i>
                            <i className="tarot-corner tarot-corner-bl" aria-hidden="true">
                              ✦
                            </i>
                            <i className="tarot-corner tarot-corner-br" aria-hidden="true">
                              ✦
                            </i>
                            <b>{roman}</b>
                            <span className="tarot-empty-sigil" aria-hidden="true">
                              ✧
                            </span>
                            <small>{workspaceCopy.empty}</small>
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="tarot-slot-label"
                        onClick={() => setSelected(i)}
                        aria-pressed={selected === i}
                      >
                        <span>{roman}</span>
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
                    type="button"
                    data-card-id={card.id}
                    className={`tarot-free-card ${selected === card.slot ? "is-selected" : ""}`}
                    style={{
                      left: `${constrainCard(card.x, card.y, card.rotation, boardSize).x}%`,
                      top: `${constrainCard(card.x, card.y, card.rotation, boardSize).y}%`,
                      transform: `rotate(${card.rotation}deg)`,
                      zIndex: selected === card.slot ? 100 : card.slot + 1,
                    }}
                    aria-label={`${c.position} ${card.slot + 1} · ${card.revealed ? cards.find((item) => item.id === card.id)?.name : c.cardBack}`}
                    onPointerDown={(e) => dragStart(e, card)}
                    onPointerMove={dragMove}
                    onPointerUp={(e) => {
                      if (drag.current?.pointer === e.pointerId) endDrag(true);
                    }}
                    onPointerCancel={() => endDrag(false)}
                    onLostPointerCapture={() => endDrag(false)}
                    onClick={(e) => {
                      if (e.detail === 0 || !suppressCardClick.current) {
                        openCard(card.slot);
                      }
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
                        const position = constrainCard(
                          card.x,
                          card.y,
                          card.rotation,
                          boardSize,
                        );
                        edit(card.slot, {
                          x:
                            position.x +
                            (e.key === "ArrowLeft"
                              ? -2
                              : e.key === "ArrowRight"
                                ? 2
                                : 0),
                          y:
                            position.y +
                            (e.key === "ArrowUp"
                              ? -2
                              : e.key === "ArrowDown"
                                ? 2
                                : 0),
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
            <span className="tarot-slot-status-pill">
              {c.selected} <strong>{selected + 1}</strong>
              {table.mode === "spread" ? ` · ${positions[selected]}` : ""}
            </span>

            <div className="tarot-toolbar-actions">
              {hasUnrevealed && (
                <button
                  type="button"
                  className="cel-button tarot-reveal-all-btn"
                  onClick={revealAll}
                >
                  <Sparkles size={15} />
                  <span>{extra.revealAll}</span>
                </button>
              )}

              {ready && (
                <TarotKeepsake
                  locale={locale}
                  copy={c}
                  mode={table.mode}
                  spread={table.spread}
                  drawnCards={table.cards}
                  cardsMeta={cards}
                  question={question}
                />
              )}

              {focused && (
                <>
                  <button
                    type="button"
                    className="cel-button-soft"
                    aria-label={focused.revealed ? c.viewCard : c.reveal}
                    title={focused.revealed ? c.viewCard : c.reveal}
                    onClick={() => openCard(selected)}
                  >
                    <Eye size={15} />
                    <span>{focused.revealed ? c.viewCard : c.reveal}</span>
                  </button>
                  {table.mode === "free" && (
                    <>
                      <button
                        type="button"
                        className="cel-button-soft"
                        aria-label={c.rotatePlacement}
                        title={c.rotationHelp}
                        onClick={() =>
                          edit(selected, {
                            rotation: (focused.rotation + 15) % 360,
                          })
                        }
                      >
                        <RotateCw size={15} />
                        <span>{c.rotatePlacement}</span>
                      </button>
                      <button
                        type="button"
                        className="cel-button-soft tarot-orientation-toggle"
                        aria-label={c.reverseCard}
                        title={c.reverseCard}
                        onClick={() =>
                          edit(selected, { reversed: !focused.reversed })
                        }
                      >
                        <FlipVertical2 size={15} />
                        <span>{c.reverseCard}</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="cel-button-soft"
                    aria-label={c.returnCard}
                    title={c.returnCard}
                    onClick={putBack}
                  >
                    <Undo2 size={15} />
                    <span>{c.returnCard}</span>
                  </button>
                </>
              )}
              {table.mode === "spread" && ready && (
                <button
                  type="button"
                  className="cel-button-soft tarot-complete-reset"
                  onClick={() => reset()}
                >
                  <RotateCcw size={15} />
                  <span>{c.reset}</span>
                </button>
              )}
            </div>
          </div>

          {table.mode === "free" && focused && (
            <p className="tarot-orientation-status" aria-live="polite">
              {focused.reversed ? c.reversed : c.upright} · {c.placementAngle}{" "}
              {focused.rotation}°
            </p>
          )}
          {table.mode === "free" && deck}
        </div>
      </div>

      {table.mode === "free" && (
        <details className="tarot-free-help tarot-free-reading-help">
          <summary>{c.tableHelp}</summary>
          <p>
            {c.freeHelp} {c.rotationHelp}
          </p>
        </details>
      )}

      {table.cards.some((card) => card.revealed) && (
        <div className="tarot-reading-list">
          {table.cards
            .filter((card) => card.revealed)
            .map((card) => {
              const info = cards.find((item) => item.id === card.id)!;
              return (
                <button
                  key={card.id}
                  type="button"
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
        <input
          id="tarot-question-title"
          ref={questionInput}
          required
          maxLength={500}
          value={question}
          aria-invalid={questionError || undefined}
          aria-describedby={
            questionError ? "tarot-question-error" : "tarot-question-note"
          }
          onChange={(e) => {
            invalidate();
            setQuestion(e.target.value);
            setQuestionError(false);
          }}
          placeholder={c.questionPlaceholder}
        />
        {questionError && (
          <p
            id="tarot-question-error"
            className="tarot-question-error"
            role="alert"
          >
            {c.questionRequired}
          </p>
        )}
        <p id="tarot-question-note" className="cel-small cel-muted">
          {c.questionNote}
        </p>
        <label htmlFor="tarot-question-details">{c.details}</label>
        <textarea
          id="tarot-question-details"
          maxLength={3000}
          rows={4}
          value={details}
          aria-describedby="tarot-details-note"
          onChange={(e) => {
            invalidate();
            setDetails(e.target.value);
          }}
          placeholder={c.detailsPlaceholder}
        />
        <p id="tarot-details-note" className="cel-small cel-muted">
          {c.detailsNote}
        </p>
      </section>

      <p className="cel-small cel-muted">
        {ready ? c.allRevealed : c.readyHint}
      </p>

      {table.cards.length > 0 && (
        <SaveCelestialRecord
          key={recordSession}
          snapshot={{
            version: 1,
            kind: "tarot",
            locale,
            table,
            question,
            details,
            reading,
          }}
          disabled={busy}
        />
      )}

      <ReadingPanel
        copy={c}
        reading={reading}
        busy={busy}
        status={status}
        onRead={interpret}
        disabled={!ready}
      />

      <TarotCardDialog
        locale={locale}
        card={
          dialogCard
            ? cards.find((item) => item.id === dialogCard.id) || null
            : null
        }
        reversed={dialogCard?.reversed || false}
        position={
          dialogCard
            ? table.mode === "spread"
              ? positions[dialogCard.slot]
              : `${c.position} ${dialogCard.slot + 1}`
            : ""
        }
        copy={c}
        onClose={() => setDialogSlot(null)}
        onDetailed={() => {
          questionInput.current?.focus({ preventScroll: true });
          questionInput.current?.scrollIntoView({
            behavior: readingScrollBehavior(),
            block: "center",
          });
        }}
      />
    </section>
  );
}
