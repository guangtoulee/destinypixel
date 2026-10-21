import { TarotHeader, TarotNavigation } from "@/components/tarot-navigation";
import learn from "../tarot-learning.module.css";
import HexagramLearningArticle from "@/components/hexagram-learning-article";
import { hexagramNumber,hexagramIds } from "@/lib/hexagram-learning/identity";
import { hexagramMetadata } from "@/lib/hexagram-learning/metadata";
import TrigramLearningArticle from "@/components/trigram-learning-article";
import { trigramIds, trigramIdFromSlug, trigramSlug } from "@/lib/trigram-learning/identity";
import { trigramMetadata } from "@/lib/trigram-learning/metadata";
import TarotLearningArticle from "@/components/tarot-learning-article";
import { tarotLearningId,tarotLearningIds,tarotLearningSlug } from "@/lib/tarot-learning/paths";
import { tarotLearningMetadata } from "@/lib/tarot-learning/metadata";
import type { Metadata } from "next";
import { editorialUpdate, editorialModifiedAt } from "@/lib/editorial-updates";
import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import ArticlePillarImage from "@/components/article-pillar-image";
import Markdown from "react-markdown";
import DayPillarPeople from "@/components/day-pillar-people";
import TarotEditorialCards from "@/components/tarot-editorial-cards";
import TarotEditorialLinks from "@/components/tarot-editorial-links";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { dayPillarCycle, pillarName, pillarArticleHref, pillarCardHref, pillarCrossLinkCopy, pillarLibraryHref, pillarLibraryCopy, pillarEditionLabel } from "@/lib/day-pillar-library";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { JournalFooter, JournalHeader } from "@/components/journal-chrome";
import { type JournalSection, getJournalArticle, journalArticleLocale, journalArticleLocales, journalArticles, journalArticleSchema, journalHref, journalMetadata, normalizeJournalLocale } from "@/lib/journal";
import { journalUi, journalLanguageTags, journalHomeHref } from "@/lib/journal-locales";
import styles from "../journal.module.css";

type PageProps = { params: Promise<{ slug: string }>; searchParams?: Promise<{ locale?: string }> };

export const dynamicParams = false;

type ArticleFigureData = NonNullable<JournalSection["figures"]>[number];

function ArticleFigure({ figure }: { figure: ArticleFigureData }) {
  return <figure className={styles.articleFigure}><Image src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} sizes="(max-width:650px) 92vw, 640px" /><figcaption>{figure.caption}{figure.src.startsWith("/journal/tai-sui/") && <> <a href={figure.src} target="_blank" rel="noreferrer">{figure.caption.includes("原创") ? "查看完整图解" : "Open full-size diagram"}</a></>}</figcaption></figure>;
}

// Wraps the first occurrence of each link text; the paragraph text itself is unchanged.
function withLinks(paragraph: string, links?: JournalSection["links"]): ReactNode {
  if (!links?.length) return paragraph;
  let parts: ReactNode[] = [paragraph];
  for (const link of links) {
    parts = parts.flatMap((part, index): ReactNode[] => {
      if (typeof part !== "string" || !part.includes(link.text)) return [part];
      const at = part.indexOf(link.text);
      return [part.slice(0, at), <a key={`${link.href}-${index}`} href={link.href}>{link.text}</a>, part.slice(at + link.text.length)];
    });
  }
  return parts;
}

export function generateStaticParams() {
  return [...journalArticles.map((article) => ({ slug: article.slug })), ...tarotLearningIds.map(id => ({slug:tarotLearningSlug(id)})), ...hexagramIds.map(slug => ({slug})), ...trigramIds.map(id => ({slug:trigramSlug(id)}))];
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const slug=(await params).slug, number=hexagramNumber(slug), cardId=tarotLearningId(slug);
  const locale=normalizeJournalLocale((await searchParams)?.locale);
  const trigram=trigramIdFromSlug(slug);
  if(trigram) return trigramMetadata(locale,trigram);
  if(number) return hexagramMetadata(locale,number);
  if(cardId) return tarotLearningMetadata(locale,cardId);
  const article = getJournalArticle(slug);
  if (!article) return { robots: { index: false, follow: false } };
  return journalMetadata(normalizeJournalLocale((await searchParams)?.locale), article);
}

export default async function JournalArticlePage({ params, searchParams }: PageProps) {
  const slug=(await params).slug, number=hexagramNumber(slug), cardId=tarotLearningId(slug);
  const resolvedLocale=normalizeJournalLocale((await searchParams)?.locale);
  const trigram=trigramIdFromSlug(slug);
  if(trigram) return <TrigramLearningArticle id={trigram} locale={resolvedLocale}/>;
  if(number) return <HexagramLearningArticle number={number} locale={resolvedLocale}/>;
  if(cardId) return <TarotLearningArticle id={cardId} locale={resolvedLocale}/>;
  const article = getJournalArticle(slug);
  if (!article) notFound();
  const locale = normalizeJournalLocale((await searchParams)?.locale);
  const authoredLocale = journalArticleLocale(locale, article);
  if (locale !== authoredLocale) permanentRedirect(journalHref(authoredLocale, article.slug));
  const ui = journalUi[locale];
  const copy = article.translations[locale];
  const updatedAt = editorialModifiedAt(article.slug, locale, article.updatedAt);
  const update = editorialUpdate(article.slug, locale);
  const library = pillarLibraryCopy(locale);
  const crossLink = pillarCrossLinkCopy(locale);
  const tarotGuide = article.kind === "education" || ["how-to-read-three-card-tarot", "pamela-colman-smith-tarot-artist"].includes(article.slug);
  const related = journalArticles.find((candidate) => candidate.slug === article.relatedSlug && journalArticleLocales(candidate).includes(locale))
    ?? journalArticles.find((candidate) => candidate.slug !== article.slug && candidate.slug !== "ben-ming-nian-tai-sui" && candidate.kind !== "education" && journalArticleLocales(candidate).includes(locale));
  return (
    <main className={`${styles.page}${tarotGuide ? ` ${learn.page}` : ""}${article.slug === "ben-ming-nian-tai-sui" ? ` ${styles.taiSuiArticle}` : ""}`} lang={journalLanguageTags[locale]} data-server-localized>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(journalArticleSchema(article, locale)).replace(/</g, "\\u003c") }} />
      {tarotGuide ? <><TarotHeader locale={locale} path={`/journal/${article.slug}`} /><TarotNavigation locale={locale} current="guide" /></> : <JournalHeader locale={locale} slug={article.slug} />}
      <article>
        <header className={styles.articleHero}>
          <nav className={styles.breadcrumb} aria-label={ui.breadcrumb}><a href={journalHomeHref(locale)}>{ui.home}</a><span aria-hidden="true">/</span><a href={journalHref(locale)}>{ui.journal}</a><span aria-hidden="true">/</span><span>{copy.topic}</span></nav>
          <p className={styles.eyebrow}>{copy.topic}</p>
          {article.pillar && <p className={styles.portraitEdition}>{pillarEditionLabel(locale, article.portraitDepth === "full")}</p>}
          <div className={article.pillar ? styles.portraitHero : undefined}>
          <div>
          <h1>{copy.title}</h1>
          {copy.subtitle && <p className={styles.subtitle}>{copy.subtitle}</p>}
          {copy.answer && <p className={styles.directAnswer}>{copy.answer}</p>}
          <p className={styles.introduction}>{copy.introduction}</p>
          {copy.openingParagraphs?.map((paragraph, index) => <p key={index} className={styles.introduction}>{paragraph}</p>)}
          <div className={styles.byline}><span>DestinyPixel</span><span aria-hidden="true">·</span><span>{ui.published} <time dateTime={article.publishedAt}>{article.publishedAt}</time></span>{updatedAt !== article.publishedAt && <span>{ui.updated} <time dateTime={updatedAt}>{updatedAt}</time></span>}</div>
          {update && <p className={styles.byline} data-editorial-update>{update.note}</p>}
          {article.pillar && <a className={styles.libraryTextLink} href={pillarLibraryHref(locale)}>{library.browse}<ArrowRight size={16} aria-hidden="true" /></a>}
          </div>
          {article.pillar && <figure className={styles.portraitArt}><ArticlePillarImage src={getPillarImagePath(article.pillar)} alt={`${article.pillar} · ${pillarName(article.pillar, locale)} · ${library.art}`} locale={locale} /><figcaption>{library.art}</figcaption></figure>}
          </div>
        </header>
        <div className={`${styles.readingLayout}${tarotGuide ? ` ${learn.reading}` : ""}`}>
          <aside className={`${styles.contents}${tarotGuide ? ` ${learn.contents}` : ""}`}><p>{ui.contents}</p><nav aria-label={ui.sections}>{copy.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav></aside>
          <div className={`${styles.articleBody}${tarotGuide ? ` ${learn.prose}` : ""}`}>
            {article.kind === "education" && <TarotEditorialCards slug={article.slug} locale={locale} />}
            {copy.takeaway && <div className={styles.takeaway}><span>{ui.takeaway}</span><p>{copy.takeaway}</p></div>}
            {copy.sections.map((section) => <section className={styles.section} id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.bodyMarkdown && <div className={styles.markdown} data-editorial-section={section.id}><Markdown skipHtml>{section.bodyMarkdown}</Markdown></div>}
              {section.figures?.filter((figure) => figure.afterParagraph < 0).map((figure) => <ArticleFigure figure={figure} key={figure.src} />)}
              {section.paragraphs.map((paragraph, index) => <Fragment key={index}><p>{withLinks(paragraph, section.links)}</p>{section.figures?.filter((figure) => figure.afterParagraph === index).map((figure) => <ArticleFigure figure={figure} key={figure.src} />)}</Fragment>)}
              {section.steps && <ol>{section.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}
              {section.table && <div className={styles.tableWrap} role="region" aria-label={section.title} tabIndex={0}><table><thead><tr>{section.table.headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{section.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
              {section.people && <DayPillarPeople people={section.people} locale={locale} additional={Boolean(section.table)} />}
              {!section.bodyMarkdown && section.sources && <div className={styles.sources}><span>{ui.sources}</span>{section.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>}
            </section>)}
            <div className={styles.articleAction}><p>{article.pillar ? crossLink.note : ui.try}</p><a data-pillar-card-link={article.pillar || undefined} href={article.pillar ? pillarCardHref(article.pillar, locale) : copy.action.href}>{article.pillar ? `${crossLink.card} · ${pillarName(article.pillar, locale)}` : copy.action.label}<ArrowRight size={17} aria-hidden="true" /></a></div>
            {article.pillar && <nav className={styles.pillarRelated} aria-label={library.related}><h2>{library.same}</h2>{dayPillarCycle.filter(p => p[0] === article.pillar![0] && p !== article.pillar).map(p => <a key={p} href={pillarArticleHref(p, locale)}>{p} · {pillarName(p, locale)}<ArrowRight size={14} aria-hidden="true" /></a>)}<a href={pillarLibraryHref(locale)}>{library.browse}</a></nav>}
            <TarotEditorialLinks slug={article.slug} locale={locale} />
            {article.kind !== "education" && related && <aside className={styles.related}><span>{ui.related}</span><a href={journalHref(locale, related.slug)}>{related.translations[locale].title}<ArrowRight size={18} aria-hidden="true" /></a></aside>}
          </div>
        </div>
      </article>
      <JournalFooter locale={locale} />
    </main>
  );
}
