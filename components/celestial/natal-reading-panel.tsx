"use client";
import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { NatalChart } from "@/lib/celestial/astrology";
import type { CelestialCopy } from "@/lib/celestial/copy";
import type { ReportLocale } from "@/lib/report-i18n";
import { natalGroups, natalReadingCopy, natalReadingTargets, type NatalReading } from "@/lib/celestial/natal-reading";

export function NatalReadingPanel({ chart, copy: c, locale, reading, busy, status, disabled, savedView=false, onRead }: {
  chart: NatalChart; copy: CelestialCopy; locale: ReportLocale; reading: NatalReading | null;
  busy: boolean; status: string; disabled?: boolean; savedView?: boolean; onRead: () => void;
}) {
  const d = natalReadingCopy(locale);
  const targets = natalReadingTargets(chart, c, locale);
  const [open, setOpen] = useState<Set<string>>(() => new Set(["planet-Sun", "planet-Moon", "ascendant"]));
  const allOpen = open.size === targets.length;
  return <section className="cel-reading cel-natal-reading" aria-busy={busy}>
    <div className="cel-reading-head">
      <span className="cel-orb"><Sparkles size={25} /></span>
      <div><p className="cel-kicker">DEEPSEEK · AI</p><h2>{d.title}</h2></div>
      {!savedView && <button type="button" className="cel-button" disabled={busy || disabled || Boolean(reading)} onClick={onRead}>
        {busy ? d.busy : reading ? c.aiReady : status ? c.retry : d.cta}<Sparkles size={16} />
      </button>}
    </div>
    <p className="cel-muted">{d.intro}</p>
    {!savedView && <p className="cel-muted cel-small">{c.aiNote}</p>}
    <div role="status" aria-live="polite">
      {busy && <><p className="cel-notice">{d.wait}</p><div className="cel-skeleton"><i/><i/><i/></div></>}
      {status && <p className="cel-notice">{status === "limited" ? c.aiLimited : c.aiUnavailable}</p>}
    </div>
    <section className="cel-natal-guide">
      <h3>{d.guide}</h3>
      {d.glossary.map(([title, body],i)=><details key={title} open={i===0}><summary>{title}<ChevronDown size={16}/></summary><p>{body}</p></details>)}
    </section>
    {reading && <div className="cel-reading-content">
      <p className="cel-reading-summary">{reading.summary}</p>
      <nav className="cel-natal-contents" aria-label={d.contents}>
        {natalGroups.map((group,i)=><a key={group} href={`#natal-${group}`}><span>0{i+1}</span>{d.groups[i]}</a>)}
      </nav>
      <div className="cel-natal-expand"><button type="button" className="cel-button-soft" onClick={()=>setOpen(allOpen ? new Set() : new Set(targets.map(t=>t.id)))}>{allOpen ? d.collapse : d.expand}</button></div>
      {natalGroups.map((group,i)=><section className="cel-natal-chapter" id={`natal-${group}`} key={group}>
        <h3><span>0{i+1}</span>{d.groups[i]}</h3>
        {group === "aspects" && <p className="cel-muted cel-small">{d.allAspects}</p>}
        {group === "aspects" && !chart.aspects.length && <p>{c.noAspects}</p>}
        {targets.filter(t=>t.group===group).map(target=>{
          const entry = reading.entries.find(e=>e.id===target.id);
          if (!entry) return null;
          return <details className="cel-natal-entry" key={target.id} open={open.has(target.id)}>
            <summary onClick={e=>{ e.preventDefault(); setOpen(old=>{const next=new Set(old); if(next.has(target.id)) next.delete(target.id); else next.add(target.id); return next;}); }}>
              <span><strong>{target.title}</strong><small>{target.basis}</small></span><ChevronDown size={18}/>
            </summary>
            <div className="cel-natal-entry-body">
              <div><h4>{d.meaning}</h4><p>{entry.meaning}</p></div>
              <div><h4>{d.reading}</h4><p>{entry.reading}</p></div>
              <aside><h4>{d.practice}</h4><p>{entry.practice}</p></aside>
            </div>
          </details>;
        })}
      </section>)}
      <blockquote>{reading.reflection}</blockquote>
    </div>}
    <p className="cel-muted cel-small">{c.reflection}</p>
  </section>;
}
