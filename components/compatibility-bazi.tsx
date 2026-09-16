import { Heart, Sprout } from "lucide-react";
import type { CompatibilityResult } from "@/lib/compatibility/model";
import { fiveElements } from "@/lib/compatibility/elements";
import { baziCopy, connectionText } from "@/lib/compatibility/bazi-copy";
import type { CompatibilityCopy } from "@/lib/compatibility/copy";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./compatibility.module.css";

export default function CompatibilityBazi({ result, locale, copy }: { result: CompatibilityResult; locale: ReportLocale; copy: CompatibilityCopy }) {
  const c = baziCopy(locale), relation = result.baziConnection;
  const relationVerb = relation.kind === "same" ? "=" : relation.kind === "nourishes" ? c.feeds : c.tempers;
  const interpolate = (text: string) => connectionText(text, relation, copy.people, copy.elements);
  return <section className={styles.baziPanel} aria-labelledby="bazi-connection-title">
    <span className={styles.eyebrow}><Sprout size={16} />{c.relationship}</span>
    <h2 id="bazi-connection-title">{c[relation.kind]}</h2>
    <div className={styles.elementConnection}>
      {[relation.source, relation.target].map((person, index) => <div key={index} className={styles.elementSide}><span>{copy.people[person]}</span><strong data-element={result.people[person].dayElement}>{copy.elements[result.people[person].dayElement as keyof typeof copy.elements]}</strong><small>{result.people[person].animal.name}</small></div>)}
      <span className={styles.elementVerb}>{relationVerb}<small>{relation.kind === "same" ? "" : "→"}</small></span>
    </div>
    <h3>{c.between}</h3><p>{interpolate(c.stories[relation.kind])}</p>
    <div className={styles.baziPractice}><Heart size={17} /><div><h3>{c.practice}</h3><p>{interpolate(c.actions[relation.kind])}</p></div></div>
    <details className={styles.elementDetails}><summary>{c.balance}</summary><div className={styles.elementChart}>
      <div className={styles.elementChartLegend}><span>{copy.people[0]}</span><span>{copy.people[1]}</span></div>
      {fiveElements.map(element => <div className={styles.elementRow} key={element}><strong>{copy.elements[element]}</strong>{result.people.map((p, i) => { const percent = Math.round(p.elements[element] / Object.values(p.elements).reduce((a, b) => a + b, 0) * 1000) / 10; return <div key={i}><div><i data-element={element} style={{ width: `${percent}%` }} /></div><span>{percent}%</span></div>; })}</div>)}
      <p>{c.balanceNote}</p></div></details><p className={styles.baziNote}>{c.boundary}</p>
  </section>;
}
