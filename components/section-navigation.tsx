import type { ReportLocale } from "@/lib/report-i18n";
import { sectionHref } from "@/lib/section-journeys";
import { topicCopy, topicKeys, type TopicKey } from "@/lib/topic-journeys";
import styles from "./section-journeys.module.css";
export default function SectionNavigation({locale,current}:{locale:ReportLocale;current?:TopicKey}){
 const c=topicCopy(locale);
 return <nav className={styles.sectionNav} aria-label={c.nav} data-section-navigation>{topicKeys.map(key=><a key={key} href={sectionHref('/'+key,locale)} aria-current={current===key?'page':undefined}>{c.sections[key].name}</a>)}<a href={sectionHref('/tools',locale)}>{c.more} ↗</a></nav>;
}
