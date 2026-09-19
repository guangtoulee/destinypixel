"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowRight, Heart, Loader2, Sparkles } from "lucide-react";
import { cities } from "@/lib/geo/cities";
import { getPillarImagePath } from "@/lib/archetype-assets";
import type { ReportLocale } from "@/lib/report-i18n";
import { signName, type CompatibilityCopy } from "@/lib/compatibility/copy";
import type { CompatibilityResult, PersonInput } from "@/lib/compatibility/model";
import type { PairReading } from "@/lib/compatibility/ai";
import { destinySupportHref } from "@/lib/support-contact";
import CompatibilityBazi from "./compatibility-bazi";
import { baziCopy } from "@/lib/compatibility/bazi-copy";
import { CompatibilityRequestError, requestCompatibilityCalculation } from "@/lib/compatibility/request";
import { trackToolEvent } from "@/lib/analytics";
import styles from "./compatibility.module.css";

export default function CompatibilityExperience({ locale, copy: c }: { locale: ReportLocale; copy: CompatibilityCopy }) {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [reading, setReading] = useState<PairReading | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [error, setError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const latest = useRef(0);
  const submitting = useRef(false);
  const [today, setToday] = useState("2100-12-31");
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); return () => requestRef.current?.abort(); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    trackToolEvent("form_submit", "compatibility");
    requestRef.current?.abort();
    const controller = new AbortController(); requestRef.current = controller;
    const revision = ++latest.current;
    const data = new FormData(event.currentTarget);
    const people = [0, 1].map(i => ({ birthDate: String(data.get(`date${i}`) || ""), birthTime: String(data.get(`time${i}`) || ""), cityId: String(data.get(`city${i}`) || "") })) as [PersonInput, PersonInput];
    const payload = { people, locale, consent: data.get("consent") === "on" };
    setBusy(true); setError(""); setResult(null); setReading(null); setAiState("idle");
    trackToolEvent("tool_start", "compatibility");
    try {
      const calculated = await requestCompatibilityCalculation(payload, controller.signal);
      if (latest.current !== revision || controller.signal.aborted) return;
      setResult(calculated); submitting.current = false; setBusy(false); setAiState("loading");
      trackToolEvent("tool_success", "compatibility");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      try {
        const aiResponse = await fetch("/api/compatibility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, mode: "interpret" }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(55_000)]) });
        const ai = await aiResponse.json();
        if (latest.current !== revision || controller.signal.aborted) return;
        if (aiResponse.ok && ai.status === "ready" && ai.reading) { setReading(ai.reading); setAiState("ready"); }
        else { setAiState("unavailable"); trackToolEvent("tool_fallback", "compatibility"); }
      } catch {
        if (latest.current === revision && !controller.signal.aborted) {
          setAiState("unavailable"); trackToolEvent("tool_fallback", "compatibility");
        }
      }
    } catch (e) {
      if (latest.current === revision && !controller.signal.aborted) {
        trackToolEvent("tool_error", "compatibility");
        setError(e instanceof CompatibilityRequestError && e.code === "limited" ? c.limit
          : e instanceof CompatibilityRequestError && e.code === "invalid" ? e.detail || c.invalid : c.failed);
      }
    } finally { if (latest.current === revision) { submitting.current = false; setBusy(false); } }
  }
  function reset() { ++latest.current; requestRef.current?.abort(); submitting.current = false; setResult(null); setReading(null); setAiState("idle"); setBusy(false); formRef.current?.scrollIntoView({ behavior: "smooth" }); }
  const b = baziCopy(locale);
  const sign = (p: { sign: string; signCn: string }) => signName(p.sign, p.signCn, locale);
  const element = (name: string) => c.elements[name as keyof typeof c.elements] || name;
  return <>
    <form id="compare" ref={formRef} onSubmit={submit} className={styles.form} aria-busy={busy}>
      <div className={styles.formTitle}><span className={styles.eyebrow}>{c.badge}</span><h2>{c.cta}</h2></div>
      <div className={styles.peopleFields}>{c.people.map((name, i) => <fieldset key={i} disabled={busy}><legend><span>{i === 0 ? "01" : "02"}</span>{name}</legend><label>{c.date}<input name={`date${i}`} type="date" required min="1800-01-01" max={today} /></label><label>{c.time}<input name={`time${i}`} type="time" required /></label><label>{c.city}<select aria-label={c.city} name={`city${i}`} defaultValue="" required><option value="" disabled>{c.choose}</option>{cities.map(city => <option key={city.id} value={city.id}>{locale.startsWith("zh") ? city.aliases[0] : city.label}</option>)}</select></label></fieldset>)}</div>
      <p className={styles.timeNote}>{c.timeNote} <a href={destinySupportHref}>{c.contact}</a></p>
      <label className={styles.consent}><input name="consent" type="checkbox" required disabled={busy} /><span>{c.consent}</span></label>
      <button className={styles.button} disabled={busy} type="submit">{busy ? <Loader2 className={styles.spin} size={18} /> : <Heart size={18} />}{busy ? c.loading : c.submit}<ArrowRight size={18} /></button>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.privacy}>{c.privacy} <a href={`/privacy?locale=${locale.startsWith("zh") ? "zh" : "en"}`}>{c.privacyLink}</a></p>
    </form>
    {result && <section ref={resultRef} className={styles.results} aria-labelledby="connection-result"><div className={styles.scorePanel}><div><span className={styles.eyebrow}>{c.result}</span><h2 id="connection-result">{c.score}</h2><p>{c.scoreNote}</p></div><div className={styles.scoreCircle}><strong>{result.score}</strong><span>/ 100</span></div></div>
      <div className={styles.dimensions}>{result.dimensions.map((d, i) => <div key={d.id}><span>{c.dimensions[i]}</span><strong>{d.score}</strong><div className={styles.bar}><i style={{ width: `${d.score}%` }} /></div></div>)}</div>
      <div className={styles.animalHeading}><span className={styles.eyebrow}>{b.character}</span><h2>{b.heading}</h2><p>{b.intro}</p></div>
      <div className={styles.animalPair}>{result.people.map((p, i) => <article key={i}>
        <header><span className={styles.personTag}>{c.people[i]}</span><span>{p.pillars.day} · {element(p.dayElement)}</span></header>
        <div className={styles.animalIdentity}><Image src={getPillarImagePath(p.pillars.day)} alt={p.animal.name} width={180} height={240} sizes="(max-width:760px) 125px, 155px" /><div><span className={styles.animalNo}>0{i + 1}</span><h3>{p.animal.name}</h3><p>{p.animal.headline}</p><span className={styles.animalSky}>{c.bodies.Sun} · {sign(p.planets.find(x => x.body === "Sun")!)}</span></div></div>
        <div className={styles.animalStory}><h4>{b.personality}</h4><p>{p.animal.personality}</p><h4><Heart size={14} />{b.love}</h4><p>{p.animal.love}</p></div>
        <details className={styles.animalPillars}><summary>{c.bazi}</summary><dl className={styles.pillars}>{Object.values(p.pillars).map((v, n) => <div key={n}><dt>{c.pillars[n]}</dt><dd>{v}</dd></div>)}</dl></details>
      </article>)}</div>
      <CompatibilityBazi result={result} locale={locale} copy={c} />
      <section className={styles.aiPanel} aria-labelledby="pair-ai-title"><span className={styles.eyebrow}><Sparkles size={15} />{c.aiReady}</span><h2 id="pair-ai-title">{c.aiTitle}</h2><p role="status" className={styles.aiStatus}>{aiState === "loading" ? c.aiLoading : aiState === "unavailable" ? c.aiFallback : c.notDiagnosis}</p>{reading && <div className={styles.aiGrid}>{(["animalStory", "elementStory", "attraction", "friction", "practice", "question"] as const).map((key, i) => <article key={key}><span>0{i + 1}</span><h3>{[b.animalAI, b.elementAI, ...c.aiSections][i]}</h3><p>{reading[key]}</p></article>)}</div>}</section>
      <h2 className={styles.compareTitle}>{b.sky}</h2><div className={styles.comparisons}>{result.dimensions.map((d, i) => { const body = ["Sun", "Mercury", "Venus", "Moon"][i]; return <article key={d.id}><header><h3>{c.dimensions[i]}</h3><span>{c.tones[d.tone]}</span></header><div className={styles.compareColumns}>{result.people.map((p, n) => { const placement = p.planets.find(x => x.body === body)!; return <div key={n}><span className={styles.personTag}>{c.people[n]}</span><h4>{c.bodies[body as keyof typeof c.bodies]} · {sign(placement)}</h4><p>{c.traits[placement.element][i]}</p></div>; })}</div><p className={styles.action}><Heart size={16} />{c.actions[i]}</p></article>; })}</div>
      <div className={styles.resultActions}><button type="button" onClick={reset}>{c.reset}</button><a href={`/?locale=${locale}#report`}>{c.more}<ArrowRight size={16} /></a></div>
    </section>}
  </>;
}
