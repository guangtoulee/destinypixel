import type { ReportLocale } from "@/lib/report-i18n";
import { trigramCopy } from "./copy";
import { trigramIdentities, type TrigramId } from "./identity";
import styles from "@/app/journal/trigram-learning.module.css";
export function TrigramDiagram({ id, locale, labelled = false }: { id: TrigramId; locale: ReportLocale; labelled?: boolean }) {
  const c = trigramCopy(locale), bits = trigramIdentities[id].bits;
  const description = `${c.figure}: ${bits.map((bit, position) => `${c.positions[position]} ${bit ? c.yang : c.yin}`).reverse().join("; ")}`;
  return <div className={styles.diagram} role="img" aria-label={description} data-trigram-diagram={id}>
    {[...bits].reverse().map((bit, index) => <div className={styles.line} key={index} data-position={3 - index} data-yang={bit === 1} aria-hidden="true"><span className={styles.stroke}><i /><i /></span>{labelled && <span className={styles.lineLabel}>{c.positions[2 - index]} · {bit ? c.yang : c.yin}</span>}</div>)}
  </div>;
}
