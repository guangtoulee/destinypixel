import type { Metadata } from "next";
import { currentProductCatalog } from "@/lib/product-facts-server";
import { productFactsCopy, productFactsHref, productFactsAlternates, productFactsLocales } from "@/lib/product-facts";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { journalLanguageTags } from "@/lib/journal-locales";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
type Props = { searchParams?: Promise<{ locale?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en"), c = productFactsCopy(locale);
  return { title: { absolute: c.title }, description: c.intro, alternates: { canonical: productFactsHref(locale), languages: productFactsAlternates() } };
}
export default async function ProductFactsPage({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en"), c = productFactsCopy(locale), catalog = currentProductCatalog();
  return <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
    <header className={styles.header}><a href={locale === "en" ? "/" : `/?locale=${locale}`}>DestinyPixel <span> / Product facts</span></a><nav aria-label="Language">{productFactsLocales.map(l => <a key={l} href={productFactsHref(l)} aria-current={l === locale ? "page" : undefined}>{({ en: "EN", zh: "简", "zh-TW": "繁", ru: "RU" })[l]}</a>)}</nav></header>
    <section className={styles.hero}><p className={styles.eyebrow}>DESTINYPIXEL · PRODUCT FACTS</p><h1>{c.title}</h1><p>{c.intro}</p><small>{c.reviewed} · <time dateTime={catalog.updatedAt}>{catalog.updatedAt}</time></small></section>
    <div className={styles.products}>{catalog.products.map(p => { const t = p.translations[locale], offer = "completeReport" in p.pricing ? p.pricing.completeReport : undefined; return <article key={p.id} id={p.id}>
      <p className={styles.tag}>{p.pricing.model === "free" ? c.free : c.paid}</p><h2><a href={t.url}>{t.name} <span aria-hidden="true">↗</span></a></h2><p>{t.purpose}</p>
      <dl><dt>{c.input}</dt><dd>{t.inputs}</dd><dt>{c.ai}</dt><dd>{t.ai}</dd><dt>{c.saving}</dt><dd>{t.saving}</dd></dl>
      {offer ? <aside>{offer.available ? <><strong>{c.offer}: {offer.amount} {offer.currency}</strong><p>{c.priceNote}</p></> : c.unavailable}</aside> : null}
      <a className={styles.cta} href={t.url}>{c.open} →</a>
    </article>; })}</div>
    <section className={styles.notes}><h2>{c.sources}</h2><p>{c.sourceNote}</p><a href={`/journal/fortune-stick-number-and-edition${locale === "en" ? "" : `?locale=${locale}`}`}>{locale === "zh" || locale === "zh-TW" ? "签号与版本说明" : locale === "ru" ? "Номера и версии жребиев" : "Stick numbers and editions"} →</a><h2>{c.limits}</h2><p>{c.boundary}</p><p>{c.privacy}</p></section>
    <footer className={styles.footer}><p>{c.scope}</p><nav aria-label="Machine-readable facts"><a href="/api/products.json">products.json</a><a href="/api/ai-profile.json">ai-profile.json</a><a href="/.well-known/agent-products.json">agent-products.json</a><a href="/llms.txt">llms.txt</a></nav></footer>
  </main>;
}
