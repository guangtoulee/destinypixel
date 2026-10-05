import type { ReportLocale } from "@/lib/report-i18n";
import { journeyCopy, sectionGuides, sectionHref, type SectionKey } from "@/lib/section-journeys";
import { journalArticles, journalHref } from "@/lib/journal";
import styles from "./section-journeys.module.css";
export default function SectionReading({locale,section}:{locale:ReportLocale;section:SectionKey}){
 const c=journeyCopy(locale),s=c.sections[section];
 return <section className={styles.reading} aria-labelledby={`${section}-next-heading`} data-section-reading><div className={styles.readingIntro}><p className={styles.kicker}>{s.name}</p><h2 id={`${section}-next-heading`}>{c.guides}</h2><p>{s.next}</p></div><div className={styles.guideGrid}>{sectionGuides[section].map(slug=>{const a=journalArticles.find(a=>a.slug===slug);if(!a)throw new Error(`Missing section guide: ${slug}`);const t=a.translations[locale];return <a key={slug} href={journalHref(locale,slug)}><h3>{t.title}</h3><p>{t.description}</p><span aria-hidden>↗</span></a>;})}</div><nav className={styles.footerLinks} aria-label={c.guides}>{section==='discover'&&<a href={sectionHref('/journal/day-pillars',locale)}>{locale==='en'?'All 60 portraits':locale==='ru'?'Все 60 портретов':locale==='zh-TW'?'完整六十日柱圖文':'完整六十日柱图文'} →</a>}<a href={sectionHref('/journal',locale)}>{c.journal}</a><a href={sectionHref('/learn',locale)}>{c.learn}</a><a href={sectionHref('/tools',locale)}>{c.more}</a></nav></section>;
}
