import type { ReportLocale } from "@/lib/report-i18n";
import { journeyCopy, sectionKeys, sectionHref, type SectionKey } from "@/lib/section-journeys";
import styles from "./section-journeys.module.css";
export default function SectionNavigation({locale,current}:{locale:ReportLocale;current?:SectionKey}){
 const c=journeyCopy(locale);
 return <nav className={styles.sectionNav} aria-label={c.nav} data-section-navigation>{sectionKeys.map(key=><a key={key} href={sectionHref('/'+key,locale)} aria-current={current===key?'page':undefined}>{c.sections[key].name}</a>)}<a href={sectionHref('/tools',locale)}>{c.more} ↗</a></nav>;
}
