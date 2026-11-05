import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';

const base = process.argv[2] ?? 'http://127.0.0.1:3057';
const output = process.argv[3] ?? 'docs/qa/tarot-reading-20261105/http-local.json';
const slug = 'tarot-king-of-pentacles';
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const tags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const href = locale => `/journal/${slug}${locale === 'en' ? '' : `?locale=${locale}`}`;
const attr = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const plain = html => html.replace(/<[^>]*>/g, '').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replace(/\s+/g, ' ').trim();
const renderText = markdown => plain(renderToStaticMarkup(React.createElement(Markdown, { skipHtml: true }, markdown)));
const report = { base, editions: [], links: [], deploymentIds: [] };
const internalLinks = new Set();
async function get(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response.text();
}
const sitemap = await get('/sitemap.xml');
for (const locale of locales) {
  const authored = locale === 'en' || locale === 'zh';
  const article = JSON.parse(readFileSync(`content/tarot/${locale}/king-of-pentacles.json`, 'utf8'));
  const html = await get(href(locale));
  const body = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
  assert.ok(body, `${locale}: article`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${locale}: unique H1`);
  assert.ok(plain(body).includes(article.title), `${locale}: title`);
  assert.ok(plain(body).includes(article.hook), `${locale}: original opening`);
  for (const value of Object.values(article.quickTake)) assert.ok(plain(body).includes(value), `${locale}: quick take`);
  for (const paragraph of article.openingParagraphs ?? []) assert.ok(plain(body).includes(paragraph), `${locale}: opening paragraph`);
  const ids = [...body.matchAll(/data-learning-section="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, authored ? 13 : 12, `${locale}: expected preserved section count`);
  assert.deepEqual(ids, article.sections.map(section => section.id), `${locale}: exact section order`);
  assert.equal(ids.includes('resources-and-freedom'), authored);
  for (const section of article.sections) {
    const sectionHtml = body.match(new RegExp(`<section[^>]*data-learning-section="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
    assert.ok(sectionHtml, `${locale}/${section.id}`);
    if (section.id === 'resources-and-freedom') {
      assert.ok(sectionHtml.includes('<ol>'), `${locale}: ordered comparison steps`);
      assert.equal((sectionHtml.match(/<li>/g) ?? []).length, 3, `${locale}: all three comparison steps`);
    }
    const withoutHeading = sectionHtml.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, '');
    assert.equal(plain(withoutHeading), renderText(section.bodyMarkdown), `${locale}/${section.id}: complete body`);
    assert.ok(body.includes(`href="#${section.id}"`), `${locale}: TOC ${section.id}`);
    for (const anchor of section.legacyAnchors ?? []) assert.ok(sectionHtml.includes(`id="${anchor}"`), `${locale}: legacy anchor ${anchor}`);
  }
  for (const anchor of [...(article.legacyIntroAnchors ?? []), ...(article.legacyRelatedAnchors ?? [])]) assert.ok(body.includes(`id="${anchor}"`), `${locale}: original anchor ${anchor}`);
  const canonical = 'https://www.destinypixel.com' + href(locale);
  assert.ok(html.includes(`<link rel="canonical" href="${attr(canonical)}"`), `${locale}: canonical`);
  for (const other of locales) assert.ok(html.includes(`hrefLang="${tags[other]}" href="${attr('https://www.destinypixel.com' + href(other))}"`), `${locale}: alternate ${other}`);
  assert.ok(html.includes('hrefLang="x-default" href="https://www.destinypixel.com/journal/tarot-king-of-pentacles"'), `${locale}: x-default`);
  const graphs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
  const schema = graphs.find(item => item['@type'] === 'Article');
  assert.ok(schema, `${locale}: Article schema`);
  assert.equal(schema.headline, article.title);
  assert.equal(schema.inLanguage, tags[locale]);
  assert.equal(schema.datePublished, '2026-10-07');
  assert.equal(schema.dateModified, authored ? '2026-11-05' : '2026-10-08');
  assert.deepEqual(schema.citation, article.sources.map(source => source.url ?? source.title));
  assert.equal((body.match(/data-editorial-update/g) ?? []).length, authored ? 1 : 0);
  const entry = sitemap.match(/<url>[\s\S]*?<\/url>/g)?.find(block => block.includes(`<loc>${attr(canonical)}</loc>`));
  assert.ok(entry?.includes(`<lastmod>${schema.dateModified}</lastmod>`), `${locale}: sitemap date`);
  if (authored) for (const match of body.matchAll(/href="(\/[^"#]*)"/g)) internalLinks.add(match[1].replaceAll('&amp;', '&'));
  for (const id of html.matchAll(/dpl_[a-zA-Z0-9]+/g)) if (!report.deploymentIds.includes(id[0])) report.deploymentIds.push(id[0]);
  report.editions.push({ locale, sections: ids.length, completeBody: true, datePublished: schema.datePublished, dateModified: schema.dateModified, canonical: true, originalAnchors: true });
  console.log(`PASS ${locale}: complete ${ids.length}-section article, opening, sources, anchors and language-specific metadata/dates`);
}
for (const href of internalLinks) {
  const url = new URL(href, base), anchor = url.hash.slice(1);
  const html = await get(href);
  if (anchor) assert.ok(html.includes(`id="${anchor}"`), `${href}: anchor`);
  report.links.push({ href, status: 200, anchor: anchor || null });
}
for (const locale of ['en', 'zh']) {
  const directory = await get(`/journal/tarot-cards${locale === 'en' ? '' : '?locale=zh'}`);
  assert.ok(directory.includes(`href="${attr(href(locale))}"`), `${locale}: card atlas discovery`);
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`PASS 4 complete editions, ${internalLinks.size} internal destinations and both card-atlas entry links`);
