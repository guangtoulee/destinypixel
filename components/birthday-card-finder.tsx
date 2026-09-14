"use client";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Copy, Loader2 } from "lucide-react";
import type { DayPillarCard } from "@/lib/day-pillar-cards";
import type { DiscoveryCopy } from "@/lib/discovery";
import type { ReportLocale } from "@/lib/report-i18n";
import { trackToolEvent } from "@/lib/analytics";
import { dayPillarSharePath } from "@/lib/day-pillar-share";
import styles from "./discovery.module.css";

export default function BirthdayCardFinder({locale,copy,cards}:{locale:ReportLocale;copy:DiscoveryCopy["finder"];cards:DayPillarCard[]}) {
 const [card,setCard]=useState<DayPillarCard|null>(null);
 const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [share,setShare]=useState("");const [shareMessage,setShareMessage]=useState("");
 const resultRef=useRef<HTMLDivElement>(null);
 async function reveal(event:FormEvent<HTMLFormElement>) {
  event.preventDefault(); if(busy)return;
  const date=String(new FormData(event.currentTarget).get("birthday")??"");
  setBusy(true);setError("");setCard(null);setShare("");setShareMessage("");
  try { const {calculateDateDayPillar}=await import("@/lib/day-pillar");const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
   const result=calculateDateDayPillar(date,today);
   if(!result.ok){setError(copy.error);trackToolEvent("tool_error","day_pillar");return;}
   const found=cards.find(c=>c.pillar===result.pillar);if(!found)throw new Error("Missing card");
   setCard(found);trackToolEvent("tool_success","day_pillar");resultRef.current?.focus({preventScroll:true});
  }catch{setError(copy.unavailable);trackToolEvent("tool_error","day_pillar");}finally{setBusy(false);}
 }
 async function shareCard(){if(!card)return;const url=new URL(dayPillarSharePath(locale==="zh"||locale==="zh-TW"?"zh":"en",card.slug),window.location.origin).href;setShare(url);try{await navigator.clipboard.writeText(url);setShareMessage(copy.copied);trackToolEvent("tool_share","day_pillar");}catch{setShareMessage(copy.manual);}}
 const home=locale==="en"?"/":`/?locale=${locale}`;
 return <section className={styles.finder} id="find-your-card" aria-label={copy.label}>
  <form onSubmit={reveal} className={styles.form} data-analytics-form="day_pillar" noValidate><label htmlFor="discovery-birthday">{copy.label}</label><div className={styles.formRow}><input id="discovery-birthday" name="birthday" type="date" min="1800-01-01" max="2100-12-31" required aria-invalid={Boolean(error)} aria-describedby={error?"discovery-error":"discovery-privacy"}/><button disabled={busy} type="submit">{busy?<Loader2 size={16} className={styles.spin}/>:<Sparkles size={16}/>}<span>{busy?copy.busy:copy.button}</span><ArrowRight size={16}/></button></div>{error&&<p className={styles.error} id="discovery-error" role="alert">{error}</p>}<p className={styles.privacy} id="discovery-privacy"><ShieldCheck size={13}/>{copy.privacy}</p></form>
  <div ref={resultRef} tabIndex={-1} className={styles.result} aria-live="polite">
   {card?<><p className={styles.label}>{copy.result}</p><div className={styles.revealed} lang={locale==="ru"?"en":undefined}><Image src={card.image} alt={card.name} width={896} height={1200} sizes="(max-width:650px) 160px, 190px"/><div><h2>{card.name}</h2><p>{card.essence}</p><h3>{copy.growth}</h3><p>{card.growth}</p></div></div><div className={styles.resultActions}><button type="button" onClick={()=>void shareCard()}><Copy size={14}/>{copy.share}</button><a href={`${home}#report`}>{copy.full}<ArrowRight size={14}/></a></div>{card.pillar==="甲子"&&<a className={styles.storyLink} href={`/journal/jia-zi-day-pillar${locale==="en"?"":`?locale=${locale}`}`}>{copy.read}<ArrowRight size={15}/></a>}{share&&<div className={styles.share}><p role="status">{shareMessage}</p><input aria-label={copy.share} value={share} readOnly onFocus={e=>e.target.select()}/></div>}<p className={styles.note}>{copy.note}</p></>:<div className={styles.empty}><Sparkles size={25}/><h2>{copy.prompt}</h2><p>{copy.promptBody}</p></div>}
  </div>
 </section>;
}
