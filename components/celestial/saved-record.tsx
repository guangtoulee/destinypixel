"use client";
import { useCallback, useEffect, useState } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import type { CelestialSnapshot, CelestialRecordSummary } from "@/lib/celestial/records";
import { recordCopy, memberAccountHref } from "@/lib/celestial/record-copy";
import { celestialCopy } from "@/lib/celestial/copy";
import { tarotCards } from "@/lib/celestial/tarot-meanings";
import { ChartWheel, type ChartSelection } from "./chart-wheel";
import { NatalReadingPanel } from "./natal-reading-panel";
import { ReadingPanel } from "./reading-panel";
import { CardBack } from "./card-back";
import { RecordAuthDialog } from "./record-auth-dialog";
import styles from "./records.module.css";
type Saved = CelestialRecordSummary & {snapshot:CelestialSnapshot};
export function SavedCelestialRecord({id,locale:initialLocale}: {id:string;locale:ReportLocale}) {
  const [record,setRecord]=useState<Saved|null>(null),[state,setState]=useState("loading"),[auth,setAuth]=useState(false),[pinned,setPinned]=useState<ChartSelection>(null),[preview,setPreview]=useState<ChartSelection>(null),[flipped,setFlipped]=useState<Set<string>>(new Set());
  const locale=record?.snapshot.locale||initialLocale,c=recordCopy(locale),copy=celestialCopy(locale);
  const load=useCallback(async(signal?:AbortSignal)=>{setState("loading");setRecord(null);try{const r=await fetch(`/api/members/celestial-records/${id}`,{cache:"no-store",signal});if(signal?.aborted)return;if(r.status===401){setState("auth");return;}if(r.status===404){setState("missing");return;}if(!r.ok)throw new Error();const b=await r.json();if(!signal?.aborted){setRecord(b.record);setState("ready");}}catch{if(!signal?.aborted)setState("error");}},[id]);
  useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[load]);
  const s=record?.snapshot,target=preview||pinned;
  return <main className="cel-page" lang={locale}><div className="cel-shell">
    <header className="cel-header"><a className="cel-brand" href={`/?locale=${locale}`}>✧ DestinyPixel</a><a href={memberAccountHref(locale)}>{c.account} →</a></header>
    <section className="cel-hero"><div><p className="cel-kicker">{c.private}</p><h1>{s?c[s.kind]:c.title}</h1>{record&&<p>{c.savedDate} · {new Date(record.updatedAt).toLocaleString(locale==="zh"?"zh-CN":locale)}</p>}</div>{s&&<a className="cel-button-soft" href={`/${s.kind}?locale=${locale}`}>{c.newReading} ↗</a>}</section>
    {state!=="ready"&&<section className={styles.list}><p role="status">{state==="loading"?c.loading:state==="auth"?c.loginToView:state==="missing"?c.missing:c.unavailable}</p>{state==="auth"?<button className={styles.primary} onClick={()=>setAuth(true)}>{c.login} / {c.register}</button>:state==="error"?<button className={styles.secondary} onClick={()=>void load()}>{c.refresh}</button>:null}</section>}
    {s?.kind==="astrology"&&<>
      <div className="cel-saved-chart"><ChartWheel chart={s.chart} copy={copy} selection={target} pinned={pinned} onSelect={v=>{setPinned(JSON.stringify(v)===JSON.stringify(pinned)?null:v);setPreview(null);}} onPreview={setPreview}/></div>
      <div className="cel-saved-placements">{s.chart.placements.map((p,i)=><button type="button" key={p.body} className="cel-button-soft" aria-pressed={target?.kind==="planet"&&target.body===p.body} onClick={()=>{setPreview(null);setPinned({kind:"planet",body:p.body});}}>{copy.planetNames[i]} · {copy.signs[Math.floor(p.longitude/30)]} {(p.longitude%30).toFixed(2)}° · {copy.house} {p.house}</button>)}</div>
      {!s.reading&&<p className="cel-notice">{c.noReading}</p>}
      <NatalReadingPanel chart={s.chart} copy={copy} locale={locale} reading={s.reading} busy={false} status="" disabled savedView onRead={()=>{}}/>
    </>}
    {s?.kind==="tarot"&&<>
      {s.question&&<section className={styles.list}><h2>{c.question}</h2><p>{s.question}</p></section>}
      <h2>{s.table.mode==="free"?copy.freeMode:copy.spreads[s.table.spread]}</h2>
      <div className={s.table.mode==="free"?"cel-saved-free":`cel-saved-spread tarot-slots tarot-slots-${s.table.spread}`} data-spread={s.table.spread}>
        {s.table.cards.map(card=>{const info=tarotCards(locale).find(c=>c.id===card.id)!;const visible=card.revealed||flipped.has(card.id);return <article key={card.id} className={s.table.mode==="free"?"cel-saved-free-card":`tarot-slot tarot-slot-${card.slot}`} data-slot={card.slot} style={s.table.mode==="free"?{left:`min(${card.x}%, calc(100% - var(--saved-card-width)))`,top:`min(${card.y}%, calc(100% - var(--saved-card-height)))`,transform:`rotate(${card.rotation}deg)`}:s.table.spread!=="celtic"?{gridColumn:card.slot+1}:undefined}>
          <button type="button" className="tarot-slot-card" onClick={()=>setFlipped(old=>new Set([...old,card.id]))} aria-label={visible?info.name:c.flip}>
            {visible?<img src={info.image} alt={info.name} loading="lazy" style={{transform:card.reversed?"rotate(180deg)":undefined}}/>:<CardBack/>}
          </button><p className="cel-small">{card.slot+1} · {s.table.mode==="spread"?copy.positions[s.table.spread][card.slot]:""}<br/>{visible?`${info.name} · ${card.reversed?copy.reversed:copy.upright}`:c.emptyCard}</p>
        </article>;})}
      </div>
      <div className="cel-saved-card-guide">{s.table.cards.map(card=>{const info=tarotCards(locale).find(c=>c.id===card.id)!;return (card.revealed||flipped.has(card.id))&&<article key={card.id}><h3>{card.slot+1}. {info.name} · {card.reversed?copy.reversed:copy.upright}</h3><p>{card.reversed?info.reversed:info.upright}</p></article>;})}</div>
      {s.reading?<ReadingPanel copy={copy} reading={s.reading} busy={false} status="" disabled savedView onRead={()=>{}}/>:<p className="cel-notice">{c.noReading}</p>}
    </>}
    <RecordAuthDialog locale={locale} open={auth} onClose={()=>setAuth(false)} onAuthenticated={()=>load()} saving={false}/>
  </div></main>;
}
