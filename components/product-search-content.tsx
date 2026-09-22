import { getProductSearchContent, type SearchProduct } from "@/lib/product-search-content";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./product-search-content.module.css";
import { journalArticles, journalHref } from "@/lib/journal";

export type ProductSearchContentProps = {
  product: SearchProduct;
  locale: ReportLocale;
};

export function ProductSearchContent({ product, locale }: ProductSearchContentProps) {
  const content = getProductSearchContent(product, locale);
  const headingId = `${product}-reading-guide`;
  const articleSlugs = product === "compatibility"
    ? ["bazi-vs-chinese-zodiac-compatibility", "compatibility-without-birth-time"]
    : ["yuelao-love-fortune-conversation", "how-to-ask-fortune-sticks", "fortune-stick-number-and-edition"];
  const readingLinks = articleSlugs.flatMap(slug => {
    const article = journalArticles.find(item => item.slug === slug);
    return article ? [{ title: article.translations[locale].title, description: article.translations[locale].description, href: journalHref(locale, slug) }] : [];
  });

  return (
    <section className={styles.guide} data-product={product} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <header className={styles.heading}>
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h2 id={headingId}>{content.title}</h2>
          <div className={styles.intro}>
            {content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </header>

        <div className={styles.sections}>
          {content.sections.map((section, index) => (
            <article className={styles.section} key={section.title}>
              <span className={styles.number} aria-hidden="true">0{index + 1}</span>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
              {section.items && (section.ordered ? (
                <ol className={styles.steps}>
                  {section.items.map((item) => <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>)}
                </ol>
              ) : (
                <ul className={styles.items}>
                  {section.items.map((item) => <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>)}
                </ul>
              ))}
            </article>
          ))}
        </div>

        <p className={styles.note}>{content.note}</p>

        <div className={styles.bottom}>
          <section className={styles.faqs} aria-labelledby={`${headingId}-questions`}>
            <h3 id={`${headingId}-questions`}>{content.faqTitle}</h3>
            {content.faqs.map((faq) => (
              <details className={styles.faq} key={faq.question}>
                <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </section>
          <nav className={styles.related} aria-labelledby={`${headingId}-related`}>
            <h3 id={`${headingId}-related`}>{content.relatedTitle}</h3>
            {[...readingLinks, ...content.related].map((link) => (
              <a href={link.href} key={link.href}>
                <span><strong>{link.title}</strong><small>{link.description}</small></span>
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
