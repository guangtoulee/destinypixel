import Link from "next/link";
import type { SeoGuide } from "@/lib/seo-guides";
import { seoGuideFaqSchema, seoGuidePath } from "@/lib/seo-guides";
import styles from "./seo-guide-article.module.css";

export function SeoGuideArticle({ guide }: { guide: SeoGuide }) {
  const parent = guide.section === "learn" ? "/learn" : "/insights";
  const parentLabel = guide.section === "learn" ? "Learn" : "Insights";
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoGuideFaqSchema(guide)).replace(/</g, "\\u003c"),
        }}
      />
      <article className={styles.article}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          <Link href={parent}>{parentLabel}</Link>
          <span aria-hidden>/</span>
          <span>{guide.h1}</span>
        </nav>
        <h1>{guide.h1}</h1>
        {guide.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title">FAQ</h2>
          <dl>
            {guide.faqs.map((faq) => (
              <div key={faq.question} className={styles.faqItem}>
                <dt>{faq.question}</dt>
                <dd>{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
        <p className={styles.cta}>
          <Link href={guide.cta.href}>{guide.cta.label}</Link>
        </p>
        <aside className={styles.related}>
          <span>Also read</span>
          <ul>
            {guide.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </aside>
        <p className={styles.back}>
          <Link href={parent}>← Back to {parentLabel}</Link>
          <span aria-hidden> · </span>
          <Link href={seoGuidePath(guide)} className={styles.muted}>
            {seoGuidePath(guide)}
          </Link>
        </p>
      </article>
    </main>
  );
}
