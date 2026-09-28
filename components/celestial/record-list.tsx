"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2, Orbit, Layers } from "lucide-react";
import type { ReportLocale } from "@/lib/report-i18n";
import type { CelestialRecordSummary } from "@/lib/celestial/records";
import { recordCopy } from "@/lib/celestial/record-copy";
import styles from "./records.module.css";
export function CelestialRecordList({locale,admin=false}: {locale:ReportLocale;admin?:boolean}) {
  const c=recordCopy(locale), endpoint=admin?"/api/admin/celestial-records":"/api/members/celestial-records";
  const [records,setRecords]=useState<CelestialRecordSummary[]>([]),[next,setNext]=useState<number|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(false),[removing,setRemoving]=useState("");
  const load=useCallback(async(offset=0, signal?:AbortSignal)=>{setBusy(true);setError(false);try{const r=await fetch(`${endpoint}?offset=${offset}`,{cache:"no-store",signal});if(!r.ok)throw new Error();const b=await r.json();if(!signal?.aborted){setRecords(old=>offset?[...old,...b.records.filter((r:CelestialRecordSummary)=>!old.some(o=>o.id===r.id&&o.memberId===r.memberId))]:b.records);setNext(b.nextOffset);}}catch{if(!signal?.aborted)setError(true);}finally{if(!signal?.aborted)setBusy(false);}},[endpoint]);
  useEffect(()=>{const a=new AbortController();void load(0,a.signal);return()=>a.abort();},[load]);
  async function remove(record:CelestialRecordSummary) {
    if(removing || !window.confirm(c.deleteConfirm))return;const key=`${record.memberId||""}:${record.id}`;setRemoving(key);setError(false);
    try{const r=await fetch(`${endpoint}/${record.id}${admin?`?memberId=${record.memberId}`:""}`,{method:"DELETE",signal:AbortSignal.timeout(20000)});if(!r.ok&&r.status!==404)throw new Error();await load();}catch{setError(true);}finally{setRemoving("");}
  }
  return <section className={styles.list} id="celestial-records">
    <header><div><h2>{admin?c.adminTitle:c.listTitle}</h2><p>{admin?c.adminNote:c.listNote}</p></div><button type="button" className={styles.secondary} onClick={()=>void load()} disabled={busy}>{c.refresh}</button></header>
    {error&&<p className={styles.error} role="alert">{c.unavailable}</p>}
    {!busy&&!error&&!records.length&&<p>{c.empty}</p>}
    <div>{records.map(r=><article className={styles.row} key={`${r.memberId||""}:${r.id}`}>
      <span className={styles.icon} aria-hidden="true">{r.kind==="astrology"?<Orbit size={22}/>:<Layers size={22}/>}</span>
      <div><h3>{c[r.kind]}</h3><p>{new Date(r.updatedAt).toLocaleString(locale==="zh"?"zh-CN":locale)} · {r.locale} · {r.hasReading?c.ai:c.basic}</p>{admin&&<small>{c.member}: {r.memberId}</small>}</div>
      <div className={styles.rowActions}>{!admin&&<a href={`/account/readings/${r.id}?locale=${r.locale}`}>{c.open} ↗</a>}<button type="button" className={styles.delete} disabled={Boolean(removing)||busy} onClick={()=>void remove(r)} aria-label={`${c.remove} · ${c[r.kind]}`}><Trash2 size={15}/> {removing===`${r.memberId||""}:${r.id}`?c.deleting:c.remove}</button></div>
    </article>)}</div>
    {busy&&<p role="status">{c.loading}</p>}
    {next!==null&&<button type="button" className={styles.secondary} disabled={busy} onClick={()=>void load(next)}>{c.more}</button>}
    {!admin&&<nav className={styles.links}><a href={`/astrology?locale=${locale}`}>{c.astrology} ↗</a><a href={`/tarot?locale=${locale}`}>{c.tarot} ↗</a></nav>}
  </section>;
}
