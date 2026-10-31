import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getJournalArticle, journalArticleSchema, journalHref, journalAlternates } from '../lib/journal.ts';
import { editorialModifiedAt } from '../lib/editorial-updates.ts';

const base = process.argv[2] ?? 'http://127.0.0.1:3052';
const output = process.argv[3] ?? 'docs/qa/tarot-suit-patterns-20261031/http-local.json';
const article = getJournalArticle('when-one-tarot-suit-dominates');
assert.ok(article);
const report = { base, editions: [], links: [], deploymentIds: [] };
// Text nodes split by inline links may add insignificant HTML whitespace.
const normalize = text => text.replace(/\s+/g, '');
const plain = text => normalize(text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
const attr = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const get = async url => {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return response.text();
};
const targets = new Set();
for (const locale of ['en', 'zh']) {
  const href = journalHref(locale, article.slug);
  const html = await get(new URL(href, base));
  const body = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
  assert.ok(body, `${locale}: article element`);
  const text = plain(body), copy = article.translations[locale];
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(text.includes(normalize(copy.title)), `${locale}: H1`);
  assert.ok(text.includes(normalize(copy.introduction)), `${locale}: original introduction`);
  assert.ok(text.includes(normalize(copy.takeaway)), `${locale}: original takeaway`);
  const sectionIds = [...body.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(sectionIds, copy.sections.map(section => section.id));
  for (const section of copy.sections) {
    const sectionBody = body.match(new RegExp(`<section\\b[^>]*\\bid="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
    assert.ok(sectionBody, `${locale}/${section.id}`);
    const sectionText = plain(sectionBody);
    for (const value of [section.title, ...section.paragraphs, ...(section.steps ?? []), ...(section.table ? [...section.table.headings, ...section.table.rows.flat()] : []), ...(section.sources ?? []).map(source => source.label)]) {
      assert.ok(sectionText.includes(normalize(value)), `${locale}/${section.id}: missing full text ${value.slice(0, 60)}`);
    }
    for (const link of [...(section.links ?? []), ...(section.sources ?? [])]) {
      assert.ok(sectionBody.includes(`href="${attr(link.href)}"`), `${locale}/${section.id}: ${link.href}`);
    }
    assert.ok(body.includes(`href="#${section.id}"`), `${locale}: TOC ${section.id}`);
  }
  const canonical = new URL(href, 'https://www.destinypixel.com').href;
  assert.ok(html.includes(`<link rel="canonical" href="${attr(canonical)}"`), `${locale}: canonical`);
  for (const [language, url] of Object.entries(journalAlternates(article.slug))) {
    const alternate = new URL(url, 'https://www.destinypixel.com').href;
    assert.ok(html.includes(`hrefLang="${language}" href="${attr(alternate)}"`), `${locale}: alternate ${language}`);
  }
  const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1]));
  const schema = jsonLd.find(value => value['@type'] === 'Article');
  const expected = journalArticleSchema(article, locale)[0];
  assert.ok(schema, `${locale}: Article schema`);
  for (const field of ['headline', 'inLanguage', 'datePublished', 'dateModified']) assert.equal(schema[field], expected[field]);
  assert.equal(schema.datePublished, '2026-10-31');
  assert.equal(schema.dateModified, '2026-10-31');
  for (const match of body.matchAll(/href="(\/[^"#]*)"/g)) targets.add(match[1].replace(/&amp;/g, '&'));
  for (const id of html.matchAll(/dpl_[a-zA-Z0-9]+/g)) if (!report.deploymentIds.includes(id[0])) report.deploymentIds.push(id[0]);
  report.editions.push({ locale, href, sections: sectionIds.length, fullText: true, dateModified: schema.dateModified, canonical: true });
  console.log(`PASS ${href}: complete paragraphs/tables/sources, original sections, metadata and language-specific dates`);
}
const sitemap = await get(new URL('/sitemap.xml', base));
for (const locale of ['en', 'zh']) {
  const url = new URL(journalHref(locale, article.slug), 'https://www.destinypixel.com').href;
  const block = sitemap.match(/<url>[\s\S]*?<\/url>/g)?.find(value => value.includes(`<loc>${attr(url)}</loc>`));
  assert.ok(block, `${locale}: sitemap`);
  assert.ok(block.includes(editorialModifiedAt(article.slug, locale, article.updatedAt)), `${locale}: sitemap revision date`);
}
for (const href of targets) {
  const url = new URL(href, base);
  const fragment = url.hash.slice(1);
  url.hash = '';
  const html = await get(url);
  if (fragment) assert.ok(html.includes(`id="${fragment}"`), `${href}: missing anchor`);
  report.links.push({ href, status: 200, fragment: fragment || null });
}
for (const locale of ['ru', 'zh-TW']) {
  const url = new URL(`/journal/${article.slug}?locale=${locale}`, base);
  const response = await fetch(url, { redirect: 'manual' });
  assert.equal(response.status, 308, `${locale}: unsupported edition must redirect`);
  assert.equal(new URL(response.headers.get('location'), base).pathname, `/journal/${article.slug}`);
  assert.equal(new URL(response.headers.get('location'), base).search, '');
}
for (const locale of ['en', 'zh']) {
  const suffix = locale === 'zh' ? '?locale=zh' : '';
  const directory = await get(new URL('/journal' + suffix, base));
  assert.ok(directory.includes(`href="${attr(journalHref(locale, article.slug))}"`), `${locale}: discoverable in journal`);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`PASS two authored editions, two unsupported-edition redirects and ${targets.size} internal destinations/fragments`);
