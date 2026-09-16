import Image from "next/image";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { compatibilityCopy, compatibilityHref } from "@/lib/compatibility/copy";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./compatibility.module.css";

export function ConnectionVisual({ labels }: { labels: { spark: string; space: string; together: string } }) {
  return <div className={styles.connectionVisual} aria-hidden="true">
    <div className={styles.loveHalo} /><div className={styles.loveHaloInner} />
    <svg className={styles.loveThread} viewBox="0 0 480 390" fill="none"><path d="M45 245C-20 140 200 165 215 215S385 335 439 197" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7"/><path d="M232 85C219 61 185 72 199 94L232 123L265 94C279 72 245 61 232 85Z" stroke="currentColor" strokeWidth="1.2"/></svg>
    <div className={styles.loveCardA}><Image src={getPillarImagePath("乙卯")} width={240} height={320} sizes="(max-width:760px) 34vw, 190px" alt="" /></div>
    <div className={styles.loveCardB}><Image src={getPillarImagePath("癸丑")} width={240} height={320} sizes="(max-width:760px) 34vw, 190px" alt="" /></div>
    <span className={styles.loveSeal}><Heart size={24} fill="currentColor" strokeWidth={1} /></span>
    <Heart className={styles.floatingHeartA} size={18} /><Sparkles className={styles.floatingHeartB} size={22} />
    <span className={styles.loveCaption}>{labels.together}</span>
  </div>;
}
export default function CompatibilityHome({ locale }: { locale: ReportLocale }) {
  const c = compatibilityCopy(locale);
  return <section data-server-localized id="compatibility" className={styles.homeWrap} aria-labelledby="compatibility-heading"><div className={styles.homePanel}><div className={styles.homeText}><span className={styles.eyebrow}><Heart size={15} /> {c.badge}</span><h2 id="compatibility-heading">{c.homeTitle}</h2><p>{c.homeIntro}</p><a className={styles.button} href={compatibilityHref(locale)}>{c.cta}<ArrowUpRight size={18} /></a><span className={styles.homeCaption}>{c.preview}</span></div><ConnectionVisual labels={c} /></div></section>;
}
