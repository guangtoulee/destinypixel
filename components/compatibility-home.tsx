import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { compatibilityCopy, compatibilityHref } from "@/lib/compatibility/copy";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./compatibility.module.css";

export function ConnectionVisual({ labels }: { labels: { spark: string; space: string; together: string } }) {
  return <div className={styles.connectionVisual} aria-hidden="true"><div className={styles.orbitOne} /><div className={styles.orbitTwo} /><span className={styles.orbA}><Sparkles size={32} /></span><span className={styles.orbB}><Heart size={32} /></span><span className={styles.orbLabelA}>{labels.spark}</span><span className={styles.orbLabelB}>{labels.space}</span><span className={styles.orbTogether}>{labels.together}</span></div>;
}
export default function CompatibilityHome({ locale }: { locale: ReportLocale }) {
  const c = compatibilityCopy(locale);
  return <section data-server-localized id="compatibility" className={styles.homeWrap} aria-labelledby="compatibility-heading"><div className={styles.homePanel}><div className={styles.homeText}><span className={styles.eyebrow}><Heart size={15} /> {c.badge}</span><h2 id="compatibility-heading">{c.homeTitle}</h2><p>{c.homeIntro}</p><a className={styles.button} href={compatibilityHref(locale)}>{c.cta}<ArrowUpRight size={18} /></a><span className={styles.homeCaption}>{c.preview}</span></div><ConnectionVisual labels={c} /></div></section>;
}
