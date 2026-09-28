"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import { recordCopy, memberAccountHref } from "@/lib/celestial/record-copy";
import styles from "./records.module.css";
export function RecordAuthDialog({locale, open, onClose, onAuthenticated, saving=true}: {locale:ReportLocale; open:boolean; onClose:()=>void; onAuthenticated:()=>void|Promise<void>; saving?:boolean}) {
  const c=recordCopy(locale), ref=useRef<HTMLDialogElement>(null), titleId=useId();
  const [mode,setMode]=useState<"login"|"register">("login"), [busy,setBusy]=useState(false), [error,setError]=useState("");
  useEffect(()=>{if(open && !ref.current?.open) ref.current?.showModal(); else if(!open) ref.current?.close();},[open]);
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if(busy) return;
    const form=e.currentTarget, fields=new FormData(form), password=String(fields.get("password")), passwordConfirm=String(fields.get("confirm")||"");
    if(mode==="register" && password!==passwordConfirm){setError(c.mismatch);return;}
    setBusy(true);setError("");
    try {
      const response=await fetch(`/api/members/auth/${mode}`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fields.get("email"),password,...(mode==="register"?{passwordConfirm}:{})}),signal:AbortSignal.timeout(25000)});
      const body=await response.json();
      if(!response.ok || !body.member) {setError(response.status===429?c.limited:/INVALID_CREDENTIALS|LOGIN_INVALID/.test(body.code||"")?c.invalidCredentials:/EMAIL_EXISTS|EMAIL_TAKEN|MEMBER_EXISTS/.test(body.code||"")?c.emailTaken:c.authError);return;}
      form.reset();onClose();await onAuthenticated();
    } catch {setError(c.authError);} finally {setBusy(false);}
  }
  return <dialog className={styles.dialog} ref={ref} aria-labelledby={titleId} onCancel={e=>{if(busy)e.preventDefault();else onClose();}} onClose={onClose}>
    <button type="button" className={styles.close} onClick={onClose} disabled={busy} aria-label={c.close}>×</button>
    <span className={styles.mark} aria-hidden="true">✧</span><h2 id={titleId}>{c.authTitle}</h2><p>{saving?c.authNote:c.loginToView}</p>
    <div className={styles.tabs}>{(["login","register"] as const).map(m=><button key={m} type="button" aria-pressed={mode===m} disabled={busy} onClick={()=>{setMode(m);setError("");}}>{c[m]}</button>)}</div>
    <form onSubmit={submit}>
      <label>{c.email}<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
      <label>{c.password}<input name="password" type="password" autoComplete={mode==="register"?"new-password":"current-password"} required minLength={mode==="register"?8:1} maxLength={128}/></label>
      {mode==="register" && <label>{c.confirmPassword}<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/></label>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button type="submit" className={styles.primary} disabled={busy}>{busy?c.submitting:c[mode]}</button>
    </form>
    <a href={memberAccountHref(locale)} target="_blank" rel="noopener noreferrer">{c.recovery}</a>
    <p className={styles.small}><a href={`/service?locale=${locale}`} target="_blank" rel="noopener noreferrer">{c.terms}</a> · <a href={`/privacy?locale=${locale}`} target="_blank" rel="noopener noreferrer">{c.privacy}</a></p>
  </dialog>;
}
