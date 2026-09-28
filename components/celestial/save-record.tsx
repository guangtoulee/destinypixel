"use client";
import { useRef, useState } from "react";
import { BookmarkCheck, Save } from "lucide-react";
import type { CelestialSnapshot } from "@/lib/celestial/records";
import { recordCopy, memberAccountHref } from "@/lib/celestial/record-copy";
import { RecordAuthDialog } from "./record-auth-dialog";
import styles from "./records.module.css";
export function SaveCelestialRecord({snapshot,disabled=false}: {snapshot:CelestialSnapshot;disabled?:boolean}) {
  const c=recordCopy(snapshot.locale), id=useRef<string|null>(null), pending=useRef<CelestialSnapshot|null>(null), locked=useRef(false);
  const [busy,setBusy]=useState(false),[auth,setAuth]=useState(false),[error,setError]=useState(false),[saved,setSaved]=useState("");
  const serialized=JSON.stringify(snapshot), unchanged=saved===serialized;
  async function save(value=snapshot) {
    if(locked.current) return; locked.current=true;setBusy(true);setError(false);
    id.current ||= crypto.randomUUID();
    try {
      const r=await fetch("/api/members/celestial-records",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id.current,snapshot:value}),signal:AbortSignal.timeout(25000)});
      if(r.status===401){pending.current=value;setAuth(true);return;}
      if(!r.ok)throw new Error();
      setSaved(JSON.stringify(value));pending.current=null;
    }catch{setError(true);}finally{locked.current=false;setBusy(false);}
  }
  return <section className={styles.saveBar} aria-busy={busy}>
    <div><span className={styles.mark} aria-hidden="true">✧</span><h3>{c.title}</h3><p>{c.note}</p>{!snapshot.reading && <p className={styles.small}>{c.withoutAi}</p>}</div>
    <div className={styles.actions}>
      <button className={styles.primary} type="button" disabled={disabled||busy||unchanged} onClick={()=>void save()}>{unchanged?<BookmarkCheck size={17}/>:<Save size={17}/>} {busy?c.busy:unchanged?c.saved:saved?c.update:c.save}</button>
      {saved && <a href={`/account/readings/${id.current}?locale=${snapshot.locale}`}>{c.open} ↗</a>}
      <a href={memberAccountHref(snapshot.locale)}>{c.account} →</a>
      {error && <p role="alert" className={styles.error}>{c.error}</p>}
    </div>
    <RecordAuthDialog locale={snapshot.locale} open={auth} onClose={()=>setAuth(false)} onAuthenticated={()=>save(pending.current||snapshot)} />
  </section>;
}
