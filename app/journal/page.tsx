import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { JournalFooter, JournalHeader } from "@/components/journal-chrome";
import { journalArticles, journalHref, journalMetadata, normalizeJournalLocale } from "@/lib/journal";
import { absoluteUrl, siteName } from "@/lib/seo";
import styles from "./journal.module.css";

type PageProps = { searchParams?: Promise<{ locale?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return journalMetadata(normalizeJournalLocale((await searchParams)?.locale));
}

export default async function JournalPage({ searchParams }: PageProps) {
  const locale = normalizeJournalLocale((await searchParams)?.locale);
  const zh = locale === "zh";
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `${siteName} Journal`, url: absoluteUrl(journalHref(locale)), inLanguage: zh ? "zh-Hans" : "en",
    mainEntity: { "@type": "ItemList", numberOfItems: journalArticles.length, itemListElement: journalArticles.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.translations[locale].title, url: absoluteUrl(journalHref(locale, article.slug)) })) },
  };
  return (
    <main className={styles.page} lang={zh ? "zh-Hans" : "en"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <JournalHeader locale={locale} />
      <section className={styles.indexHero}>
        <p className={styles.eyebrow}><BookOpen size={16} aria-hidden="true" />{zh ? "DESTINYPIXEL 原创文章" : "THE DESTINYPIXEL JOURNAL"}</p>
        <h1>{zh ? "让每一次探索，\n多一点理解。" : "A little more understanding.\nA more thoughtful next step."}</h1>
        <p className={styles.introduction}>{zh ? "从出生资料到五行配色，读懂工具怎样工作，再决定怎样使用结果。中英文原创指南，附可核对的来源与实际操作步骤。" : "From birth details to five-element color palettes: understand how the tools work, then decide how to use the results. Original guides in English and Chinese, with sources and steps you can check."}</p>
      </section>
      <section className={styles.articleGrid} aria-label={zh ? "原创文章列表" : "Original articles"}>
        {journalArticles.map((article, index) => {
          const copy = article.translations[locale];
          return <article className={styles.articleCard} key={article.slug}>
            <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><p>{copy.topic}</p></div>
            <h2><Link href={journalHref(locale, article.slug)}>{copy.title}</Link></h2>
            <p className={styles.cardDescription}>{copy.description}</p>
            <div className={styles.cardFooter}><time dateTime={article.publishedAt}>{article.publishedAt}</time><Link href={journalHref(locale, article.slug)}>{zh ? "阅读文章" : "Read the guide"}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          </article>;
        })}
      </section>
      <aside className={styles.editorialNote}>
        <span>{zh ? "我们怎样写这些文章" : "HOW THESE GUIDES ARE MADE"}</span>
        <p>{zh ? "操作步骤根据当前工具逐项核对；天文计时和宝石养护等事实链接到相关原始来源。象征性解释会明确标注，不用它代替计算或现实证据。" : "Instructions are checked against the current tools. Factual background, such as timekeeping and gemstone care, links to relevant primary sources. Symbolic interpretations are identified as such."}</p>
      </aside>
      <JournalFooter locale={locale} />
    </main>
  );
}
