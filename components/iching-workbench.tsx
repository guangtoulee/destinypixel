"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, Coins, Hash, ListOrdered, CalendarClock, RotateCcw, ArrowLeft, Undo2 } from "lucide-react";
import { castCoinTosses, castManualLines, castNumbers, castBeijingTime, coinTossToLineValue, tossThreeCoins, CastInputError, MIN_YEAR, MAX_YEAR, type CastResult, type CoinToss, type LineValue, type TrigramKey } from "@/lib/iching/cast";
import type { IChingCopy } from "@/lib/iching/copy";
import type { ReportLocale } from "@/lib/report-i18n";
import { hexagramHref } from "@/lib/hexagram-learning/paths";
import styles from "./iching-workbench.module.css";

type Method = "coins" | "manual" | "time" | "numbers";
type Entry = "values" | "coins";
type CatalogEntry = { kingWenNumber: number; displayName: string; plainSummary: string };
type Props = { locale: ReportLocale; copy: IChingCopy; catalog: CatalogEntry[]; branches: string[]; trigrams: Record<TrigramKey, string> };
type SavedCast = { cast: CastResult; method: Method; counts?: { a: string; b: string; hour: number } };
const hourTimes = ["23:00–00:59", "01:00–02:59", "03:00–04:59", "05:00–06:59", "07:00–08:59", "09:00–10:59", "11:00–12:59", "13:00–14:59", "15:00–16:59", "17:00–18:59", "19:00–20:59", "21:00–22:59"];
const methodIcons = { coins: Coins, manual: ListOrdered, time: CalendarClock, numbers: Hash };
const methodKeys: Method[] = ["coins", "manual", "time", "numbers"];
const emptyCoinInputs = () => Array.from({ length: 6 }, () => ["", "", ""]);

function currentBeijingTime() {
  // Always fixed UTC+8, including historical dates; never inherit browser timezone.
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
function stateLabel(value: number, c: IChingCopy) { return value === 6 ? c.oldYin : value === 7 ? c.youngYang : value === 8 ? c.youngYin : c.oldYang; }

function LineMark({ yang, moving = false, pending = false }: { yang: boolean; moving?: boolean; pending?: boolean }) {
  return <span className={styles.lineMark} data-yang={yang} data-moving={moving} data-pending={pending} aria-hidden="true"><i /><i />{moving && <b>○</b>}</span>;
}

export function IChingWorkbench({ locale, copy: c, catalog, branches, trigrams }: Props) {
  const [method, setMethod] = useState<Method>("coins");
  const [question, setQuestion] = useState("");
  const [tosses, setTosses] = useState<CoinToss[]>([]);
  const [busy, setBusy] = useState(false);
  const [lastCoins, setLastCoins] = useState<CoinToss | undefined>();
  const [entry, setEntry] = useState<Entry>("values");
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const [coinInputs, setCoinInputs] = useState<string[][]>(emptyCoinInputs);
  const [dateTime, setDateTime] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [hour, setHour] = useState(1);
  const [saved, setSaved] = useState<SavedCast>();
  const [error, setError] = useState("");
  const generation = useRef(0);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  const methodsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => () => { generation.current += 1; if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!saved) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, [saved]);

  function cancelToss() {
    generation.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = undefined;
    locked.current = false;
    setBusy(false);
  }
  function clearResult() { setSaved(undefined); setError(""); }
  function resetCast() {
    cancelToss(); clearResult(); setTosses([]); setLastCoins(undefined); setValues(Array(6).fill("")); setCoinInputs(emptyCoinInputs()); setA(""); setB("");
  }
  function chooseMethod(next: Method) {
    if (next === method) return;
    cancelToss(); clearResult();
    if (next !== method) { setTosses([]); setLastCoins(undefined); }
    setMethod(next);
    if (next === "time" && !dateTime) setDateTime(currentBeijingTime());
  }
  function back() { resetCast(); methodsHeading.current?.focus(); methodsHeading.current?.scrollIntoView({ block: "start", behavior: "instant" }); }
  function reportError(cause: unknown) {
    setError(cause instanceof CastInputError ? cause.code === "crypto-unavailable" ? c.noCrypto : cause.code === "unsupported-year" ? c.unsupported : cause.code === "invalid-numbers" || cause.code === "invalid-hour-branch" ? c.invalidCount : c.invalid : c.invalid);
  }
  function toss(all: boolean) {
    // Ref lock covers repeated clicks before React has rendered the disabled button.
    if (locked.current || (!all && tosses.length >= 6)) return;
    locked.current = true;
    const token = ++generation.current;
    setBusy(true); clearResult();
    try {
      const next = all ? Array.from({ length: 6 }, () => tossThreeCoins()) : [...tosses, tossThreeCoins()];
      const finish = () => {
        if (token !== generation.current) return;
        setTosses(next); setLastCoins(next[next.length - 1]); setBusy(false);
        // Keep the lock through the React commit, including reduced-motion casts.
        timer.current = setTimeout(() => { if (token === generation.current) { locked.current = false; timer.current = undefined; } }, 0);
        if (next.length === 6) setSaved({ cast: castCoinTosses(next), method: "coins" });
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
      else timer.current = setTimeout(finish, 420);
    } catch (cause) { locked.current = false; setBusy(false); reportError(cause); }
  }
  function undo() {
    cancelToss(); clearResult();
    const next = tosses.slice(0, -1); setTosses(next); setLastCoins(next[next.length - 1]);
  }
  const manualComplete = entry === "values" ? values.every(value => value !== "") : coinInputs.every(coins => coins.every(coin => coin !== ""));
  function submit(event: FormEvent) {
    event.preventDefault(); cancelToss(); clearResult();
    try {
      let cast: CastResult;
      if (method === "manual") cast = entry === "values" ? castManualLines(values.map(Number)) : castCoinTosses(coinInputs.map(coins => coins.map(Number) as unknown as CoinToss));
      else if (method === "time") cast = castBeijingTime(dateTime);
      else {
        if (!/^[1-9]\d*$/.test(a) || !/^[1-9]\d*$/.test(b)) throw new CastInputError("invalid-numbers", "Use positive decimal integers.");
        cast = castNumbers({ upperNumber: Number(a), lowerNumber: Number(b), hourBranch: hour });
      }
      setSaved({ cast, method, ...(method === "numbers" ? { counts: { a, b, hour } } : {}) });
    } catch (cause) { reportError(cause); }
  }

  return <section className={styles.workbench} data-iching-workbench>
    <div className={styles.methodHeader}><h2 id="iching-methods" tabIndex={-1} ref={methodsHeading}>{c.methods}</h2><span>0{methodKeys.indexOf(method) + 1} / 04</span></div>
    <div className={styles.methods} role="group" aria-labelledby="iching-methods">{methodKeys.map((key, i) => {
      const Icon = methodIcons[key];
      return <button type="button" key={key} className={styles.method} data-iching-method={key} aria-pressed={method === key} onClick={() => chooseMethod(key)}><Icon size={21} strokeWidth={1.45} aria-hidden="true" /><span><strong>{c[key]}</strong><small>{c[(key + "Sub") as "coinsSub" | "manualSub" | "timeSub" | "numbersSub"]}</small></span><em>0{i + 1}</em></button>;
    })}</div>
    <div className={styles.workspace}>
      <aside className={styles.question}><label htmlFor="iching-question">{c.question}<span>{c.optional}</span></label><textarea id="iching-question" maxLength={500} rows={4} value={question} onChange={event => setQuestion(event.target.value)} placeholder={c.questionPlaceholder} /><p>{c.privacy}</p><div className={styles.sidebarRule}><span>☰</span><p>{c.lineRule}</p></div></aside>
      <div className={styles.panel} data-iching-panel={method}>
        <header className={styles.panelHeader}><p className={styles.eyebrow}>{method === "coins" || method === "manual" ? "06 · 02 / 03" : "08 · 06"}</p><h3>{c[(method + "Title") as "coinsTitle" | "manualTitle" | "timeTitle" | "numbersTitle"]}</h3><p>{c[(method + "Intro") as "coinsIntro" | "manualIntro" | "timeIntro" | "numbersIntro"]}</p></header>
        {method === "coins" ? <div>
          <div className={styles.coinStage} data-busy={busy} aria-busy={busy}><div className={styles.coins} aria-hidden="true">{[0,1,2].map(i => <span key={i} className={styles.coin} data-face={lastCoins?.[i]}>{lastCoins?.[i] ?? "?"}<i /></span>)}</div><p className={styles.coinLegend}>{c.face2}<span> / </span>{c.face3}</p></div>
          <details className={styles.probability}><summary>{c.probabilityTitle}</summary><p>{c.probability}</p></details><div className={styles.progress}><span>{c.progress}</span><strong data-iching-progress>{tosses.length} / 6</strong></div>
          <div className={styles.castLines} aria-label={c.raw}>{[5,4,3,2,1,0].map(index => {
            const coins = tosses[index], value = coins ? coinTossToLineValue(coins) : undefined;
            return <div key={index} className={styles.castLine} data-iching-line={index + 1} data-value={value ?? ""}><span>{index === 0 ? c.bottom : index === 5 ? c.top : c.line + " " + (index + 1)}</span><LineMark yang={value === 7 || value === 9} moving={value === 6 || value === 9} pending={!coins} /><small>{coins ? coins.join(" + ") + " = " + value : "—"}</small><span className={styles.visuallyHidden}>{value ? stateLabel(value, c) : c.pending}</span></div>;
          })}</div>
          <p className={styles.live} role="status" aria-live="polite">{busy ? c.tossing : c.progress + ": " + tosses.length + " / 6"}</p>
          <div className={styles.actions}><button type="button" className={styles.primary} data-iching-action="toss" disabled={busy || tosses.length === 6} onClick={() => toss(false)}><Coins size={17} aria-hidden="true" />{busy ? c.tossing : c.toss}</button><button type="button" className={styles.secondary} data-iching-action="all" disabled={busy} onClick={() => toss(true)}>{c.all}<ArrowRight size={16} aria-hidden="true" /></button></div>
          <button type="button" className={styles.textButton} data-iching-action="undo" disabled={tosses.length === 0 && !busy} onClick={undo}><Undo2 size={14} aria-hidden="true" />{c.undo}</button>
        </div> : <form onSubmit={submit}>
          {method === "manual" && <div>
            <div className={styles.entrySwitch} role="group" aria-label={c.manualTitle}><button type="button" data-iching-entry="values" aria-pressed={entry === "values"} onClick={() => { setEntry("values"); clearResult(); }}>{c.valueEntry}</button><button type="button" data-iching-entry="coins" aria-pressed={entry === "coins"} onClick={() => { setEntry("coins"); clearResult(); }}>{c.coinEntry}</button></div>
            <div className={styles.manualLines}>{values.map((value, index) => <div className={styles.manualLine} key={index}><label htmlFor={"iching-line-" + (index + 1)}><strong>{index + 1}</strong><span>{index === 0 ? c.bottom : index === 5 ? c.top : c.line + " " + (index + 1)}</span></label>{entry === "values" ? <select id={"iching-line-" + (index + 1)} data-iching-manual-line={index + 1} required value={value} onChange={event => { setValues(previous => previous.map((v, i) => i === index ? event.target.value : v)); clearResult(); }}><option value="">—</option>{([6,7,8,9] as LineValue[]).map(v => <option key={v} value={v}>{stateLabel(v,c)}</option>)}</select> : <div className={styles.coinSelects}>{coinInputs[index].map((coin, coinIndex) => <select key={coinIndex} id={coinIndex === 0 ? "iching-line-" + (index + 1) : undefined} data-iching-manual-coin={(index + 1) + "-" + (coinIndex + 1)} aria-label={c.line + " " + (index + 1) + " · " + c.coin + " " + (coinIndex + 1)} required value={coin} onChange={event => { setCoinInputs(previous => previous.map((coins, i) => i === index ? coins.map((v, j) => j === coinIndex ? event.target.value : v) : coins)); clearResult(); }}><option value="">—</option><option value="2">2</option><option value="3">3</option></select>)}</div>}</div>)}</div>
            {entry === "coins" && <p className={styles.hint}>{c.face2} / {c.face3}</p>}{!manualComplete && <p className={styles.hint}>{c.missing}</p>}
          </div>}
          {method === "time" && <div>
            <label className={styles.field} htmlFor="iching-datetime"><span>{c.datetime}</span><input id="iching-datetime" data-iching-datetime type="datetime-local" min={MIN_YEAR + "-01-01T00:00"} max={MAX_YEAR + "-12-31T23:59"} required value={dateTime} onChange={event => { setDateTime(event.target.value); clearResult(); }} /></label>
            <button type="button" className={styles.textButton} data-iching-action="now" onClick={() => { setDateTime(currentBeijingTime()); clearResult(); }}><CalendarClock size={14} aria-hidden="true" />{c.now}</button><p className={styles.convention}>{c.timeRules}</p><p className={styles.classicalExample}>{c.timeExample}</p>
          </div>}
          {method === "numbers" && <div>
            <div className={styles.numberFields}><label className={styles.field} htmlFor="iching-count-a"><span>{c.first}</span><input id="iching-count-a" data-iching-count="a" inputMode="numeric" type="text" pattern="[1-9][0-9]*" maxLength={10} required value={a} onChange={event => { setA(event.target.value); clearResult(); }} /></label><label className={styles.field} htmlFor="iching-count-b"><span>{c.second}</span><input id="iching-count-b" data-iching-count="b" inputMode="numeric" type="text" pattern="[1-9][0-9]*" maxLength={10} required value={b} onChange={event => { setB(event.target.value); clearResult(); }} /></label></div>
            <label className={styles.field} htmlFor="iching-hour"><span>{c.hour}</span><select id="iching-hour" data-iching-hour value={hour} onChange={event => { setHour(Number(event.target.value)); clearResult(); }}>{branches.map((branch, index) => <option key={branch} value={index + 1}>{branch} · {index + 1} · {hourTimes[index]}</option>)}</select></label><p className={styles.hint}>{c.countRule}</p><p className={styles.classicalExample}>{c.numberExample}</p><button type="button" className={styles.textButton} data-iching-action="example" onClick={() => { setA("1"); setB("5"); setHour(10); clearResult(); }}>{c.example}<ArrowDown size={14} aria-hidden="true" /></button>
          </div>}
          <button className={styles.primary} data-iching-action="submit" type="submit" disabled={method === "manual" && !manualComplete}>{method === "manual" ? c.enter : c.calculate}<ArrowRight size={17} aria-hidden="true" /></button>
        </form>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.utility}><button type="button" data-iching-action="reset" onClick={resetCast}><RotateCcw size={14} aria-hidden="true" />{c.reset}</button><button type="button" data-iching-action="back" onClick={back}><ArrowLeft size={14} aria-hidden="true" />{c.back}</button></div>
      </div>
    </div>
    {saved && <section className={styles.result} data-iching-result aria-labelledby="iching-result">
      <div className={styles.resultHeading}><div><p className={styles.eyebrow}>{c[saved.method]}</p><h2 id="iching-result" ref={heading} tabIndex={-1}>{c.result}</h2></div><p data-iching-moving>{saved.cast.movingLines.length ? c.moving + " · " + saved.cast.movingLines.join(", ") : c.noChange}</p></div>
      <div className={styles.resultCards}>{(["base", "changed"] as const).map(key => {
        const hexagram = saved.cast[key], article = catalog.find(item => item.kingWenNumber === hexagram.number)!;
        return <article key={key} className={styles.hexagramCard} data-iching-hexagram={key} data-number={hexagram.number}><div className={styles.hexagramTop}><span>{key === "base" ? c.base : c.changed}</span><b>{String(hexagram.number).padStart(2, "0")}</b></div><div className={styles.resultDiagram} role="img" aria-label={hexagram.bitsBottomUp.map((bit,i) => c.line + " " + (i + 1) + ": " + (bit ? c.yang : c.yin)).join("; ")}>{[...hexagram.bitsBottomUp].reverse().map((bit, index) => <LineMark key={index} yang={bit === 1} moving={key === "base" && saved.cast.movingLines.includes(6 - index)} />)}</div><h3>{article.displayName}</h3><p className={styles.trigramPair}>{c.upper}: {trigrams[hexagram.upperTrigram.key]}<br />{c.lower}: {trigrams[hexagram.lowerTrigram.key]}</p><p className={styles.summary}>{article.plainSummary}</p><a href={hexagramHref(hexagram.number, locale)} target="_blank" rel="noopener noreferrer" aria-label={c.read + " · " + article.displayName + " (" + c.newTab + ")"}>{c.read}<span className={styles.visuallyHidden}> · {c.newTab}</span><ArrowRight size={15} aria-hidden="true" /></a></article>;
      })}</div>
      <details className={styles.record} open><summary>{c.record}</summary><p>{c.raw}: <strong data-iching-raw>{saved.cast.lines.map(line => line.value).join(" · ")}</strong></p>
        {saved.cast.lines.some(line => line.coins) && <ol className={styles.rawCoins}>{saved.cast.lines.map(line => <li key={line.index}>{c.line} {line.index}: {line.coins?.join(" + ")} = <strong>{line.value}</strong> · {stateLabel(line.value,c)}</li>)}</ol>}
        {saved.cast.calendar && <div className={styles.calendar} data-iching-calendar><p>{c.datetime}: <strong>{saved.cast.calendar.solarDateTime.replace("T", " ")} · UTC+8</strong></p><p>{c.lunar}: <strong>{saved.cast.calendar.lunarYear} · {c.month} {saved.cast.calendar.lunarMonth} · {c.day} {saved.cast.calendar.lunarDay} · {saved.cast.calendar.isLeapMonth ? c.leap : c.normalMonth}</strong></p><p>{c.yearBranch}: <strong>{branches[saved.cast.calendar.yearBranch-1]} · {saved.cast.calendar.yearBranch}</strong> / {c.hour}: <strong>{branches[saved.cast.calendar.hourBranch-1]} · {saved.cast.calendar.hourBranch}</strong></p></div>}
        {saved.counts && <p>{c.first}: <strong>{saved.counts.a}</strong> / {c.second}: <strong>{saved.counts.b}</strong> / {c.hour}: <strong>{branches[saved.counts.hour-1]} · {saved.counts.hour}</strong></p>}
        {saved.cast.calculation && <div className={styles.formulas} data-iching-formula><h3>{c.formula}</h3>
          <p>{c.upper}: R8({saved.cast.calendar ? [saved.cast.calendar.yearBranch, saved.cast.calendar.lunarMonth, saved.cast.calendar.lunarDay].join(" + ") : saved.counts?.a}) = R8({saved.cast.calculation.upperSum}) = <strong>{saved.cast.calculation.upperRemainder}</strong></p>
          <p>{c.lower}: R8({saved.cast.calendar ? [saved.cast.calendar.yearBranch, saved.cast.calendar.lunarMonth, saved.cast.calendar.lunarDay, saved.cast.calendar.hourBranch].join(" + ") : saved.counts?.b}) = R8({saved.cast.calculation.lowerSum}) = <strong>{saved.cast.calculation.lowerRemainder}</strong></p>
          <p>{c.moving}: R6({saved.cast.calendar ? [saved.cast.calendar.yearBranch, saved.cast.calendar.lunarMonth, saved.cast.calendar.lunarDay, saved.cast.calendar.hourBranch].join(" + ") : [saved.counts?.a, saved.counts?.b, saved.counts?.hour].join(" + ")}) = R6({saved.cast.calculation.movingSum}) = <strong>{saved.cast.calculation.movingRemainder}</strong></p><small>{c.remainder}</small>
        </div>}
      </details><aside className={styles.reflection}><h3>{c.nextStep}</h3><p>{c.reflection}</p></aside>
    </section>}
  </section>;
}
