import type { ReportLocale } from "@/lib/report-i18n";
import { sectionHref } from "@/lib/section-journeys";
import { siteFunctions, topicCopy, type TopicKey } from "@/lib/topic-journeys";
import styles from "./section-journeys.module.css";

export default function SiteFunctionLinks({ locale, current }: { locale: ReportLocale; current: TopicKey }) {
  const c = topicCopy(locale);
  return (
    <section className={styles.functionLinks} aria-labelledby="site-functions-heading" data-site-functions>
      <h2 id="site-functions-heading">{c.functions}</h2>
      <p className={styles.functionIntro}>{c.functionsIntro}</p>
      <nav aria-label={c.functions}>
        {siteFunctions(locale, current).map(tool => (
          <a key={tool.key} href={`${sectionHref(tool.path, locale)}${tool.fragment}`}>
            {tool.name}<span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
