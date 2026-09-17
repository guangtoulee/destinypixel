import Link from "next/link";
import type { SeoGuide, SeoGuideFaq, SeoGuideLink } from "@/lib/seo-guides";
import { seoGuideCtas, seoGuideFaqSchema, seoGuidePath } from "@/lib/seo-guides";
import styles from "./seo-guide-article.module.css";

function FaqAnswer({ faq }: { faq: SeoGuideFaq }) {
  if (!faq.link) return <>{faq.answer}</>;
  return (
    <>
      {faq.answer}{" "}
      <Link href={faq.link.href}>{faq.link.label}</Link>
    </>
  );
}

function CtaLinks({ items }: { items: SeoGuideLink[] }) {
  return (
    <div className={items.length > 1 ? styles.ctaRow : styles.cta}>
      {items.map((item, index) => (
        <p key={item.href} className={styles.ctaItem}>
          <Link href={item.href} className={index === 0 ? undefined : styles.secondary}>
            {item.label}
          </Link>
          {item.note ? <span className={styles.ctaNote}>{item.note}</span> : null}
        </p>
      ))}
    </div>
  );
}

export function SeoGuideArticle({ guide }: { guide: SeoGuide }) {
  const parent = guide.section === "learn" ? "/learn" : "/insights";
  const parentLabel = guide.section === "learn" ? "Learn" : "Insights";
  const ctas = seoGuideCtas(guide);
  const [openingCta, ...moreCtas] = ctas;
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
        {openingCta ? <CtaLinks items={[openingCta]} /> : null}
        {guide.faqAsH2 ? (
          <div className={styles.qaList}>
            {guide.faqs.map((faq) => (
              <section key={faq.question} className={styles.qa}>
                <h2>{faq.question}</h2>
                <p>
                  <FaqAnswer faq={faq} />
                </p>
              </section>
            ))}
          </div>
        ) : (
          <section className={styles.faq} aria-labelledby="faq-title">
            <h2 id="faq-title">FAQ</h2>
            <dl>
              {guide.faqs.map((faq) => (
                <div key={faq.question} className={styles.faqItem}>
                  <dt>{faq.question}</dt>
                  <dd>
                    <FaqAnswer faq={faq} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {moreCtas.length > 0 ? <CtaLinks items={ctas} /> : null}
        {guide.disclaimer ? <p className={styles.disclaimer}>{guide.disclaimer}</p> : null}
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
