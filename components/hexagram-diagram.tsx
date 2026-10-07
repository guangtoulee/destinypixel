import type { ReportLocale } from "@/lib/report-i18n";
import { hexagramCopy } from "@/lib/hexagram-learning/copy";
import styles from "@/app/journal/hexagram-learning.module.css";
export function hexagramDiagramLabel(bits:readonly number[],locale:ReportLocale) {
 const c=hexagramCopy(locale);
 return `${c.diagram}: ${bits.map((bit,i)=>`${i+1} ${bit?c.yang:c.yin}`).reverse().join("; ")}`;
}
export function HexagramDiagram({bits,locale}:{bits:readonly number[];locale:ReportLocale}) {
 return <div className={styles.diagram} role="img" aria-label={hexagramDiagramLabel(bits,locale)} data-hexagram-diagram>
  {[...bits].reverse().map((bit,i)=><span key={i} className={styles.stroke} data-position={6-i} data-yang={bit===1} aria-hidden="true"><i/><i/></span>)}
 </div>;
}
