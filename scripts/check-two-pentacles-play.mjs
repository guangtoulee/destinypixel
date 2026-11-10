import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';

// This checker is deliberately local-only. A recorded formal-site access
// denial must be resolved through the permitted channel before live acceptance.
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3062');
assert.ok(base.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Only a loopback HTTP origin is permitted');
assert.equal(base.username + base.password + base.search + base.hash, '', 'No credentials or URL parameters on the base origin');
assert.equal(base.pathname, '/', 'Pass a loopback origin, not a different route');
const output = process.argv[3] ?? 'docs/qa/tarot-two-pentacles-20261110/http-local.json';
const slug = 'tarot-two-of-pentacles';
const cardId = 'two-of-pentacles';
const sectionId = 'play-and-adaptation';
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const languageTags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const formalOrigin = 'https://www.destinypixel.com';
const href = locale => `/journal/${slug}${locale === 'en' ? '' : `?locale=${locale}`}`;
const attr = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const decode = text => text.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const normal = text => text.replace(/\s+/g, ' ').trim();
const plain = html => normal(decode(html.replace(/<[^>]*>/g, '')));
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match ? decode(match[1]) : null;
};
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(match => match[0]);
const renderText = markdown => plain(renderToStaticMarkup(React.createElement(Markdown, { skipHtml: true }, markdown)));
const report = { base: base.origin, localOnly: true, editions: [], links: [], tools: [], discovery: [], deploymentIds: [] };
const internalLinks = new Set();

async function get(path) {
  const url = new URL(path, base);
  assert.equal(url.origin, base.origin, 'Requests must stay on the original loopback origin');
  assert.equal(url.username + url.password, '', 'No credentials');
  assert.ok(!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/account'), `No AI/account endpoint: ${path}`);
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}; redirects are not followed`);
  return response.text();
}

const sitemap = await get('/sitemap.xml');
const blocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
const articleBlocks = blocks.filter(block => {
  const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
  return loc && new URL(decode(loc)).pathname === `/journal/${slug}`;
});
assert.deepEqual(articleBlocks.map(block => decode(block.match(/<loc>([\s\S]*?)<\/loc>/)[1])).sort(), locales.map(locale => formalOrigin + href(locale)).sort(), 'Exactly four real editions in sitemap');

for (const locale of locales) {
  const authored = locale === 'en' || locale === 'zh';
  const article = JSON.parse(readFileSync(`content/tarot/${locale}/${cardId}.json`, 'utf8'));
  const html = await get(href(locale));
  const body = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
  assert.ok(body, `${locale}: article`);
  assert.ok(body.includes(`data-tarot-learning="${cardId}"`), `${locale}: correct full card record`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${locale}: unique H1`);
  assert.equal(plain(body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), article.title, `${locale}: complete H1`);
  assert.equal(plain(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ''), article.title + ' | DestinyPixel', `${locale}: complete title`);
  assert.ok(tags(html, 'main').some(tag => attribute(tag, 'lang') === languageTags[locale]), `${locale}: actual server language`);
  assert.ok(plain(body).includes(normal(article.hook)), `${locale}: unchanged hook`);
  for (const value of Object.values(article.quickTake)) assert.ok(plain(body).includes(normal(value)), `${locale}: original quick take`);
  for (const paragraph of article.openingParagraphs ?? []) assert.ok(plain(body).includes(normal(paragraph)), `${locale}: original opening`);
  if (article.plainLanguageSummary) assert.ok(plain(body).includes(normal(article.plainLanguageSummary)), `${locale}: original summary`);
  const ids = [...body.matchAll(/data-learning-section="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, authored ? 13 : 12, `${locale}: expected preserved section count`);
  assert.deepEqual(ids, article.sections.map(section => section.id), `${locale}: all section IDs and order`);
  assert.equal(ids.includes(sectionId), authored, `${locale}: addition only in edited editions`);
  for (const section of article.sections) {
    const sectionHtml = body.match(new RegExp(`<section[^>]*data-learning-section="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
    assert.ok(sectionHtml, `${locale}/${section.id}`);
    assert.ok(plain(sectionHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '') === normal(section.title), `${locale}/${section.id}: full heading`);
    if (section.id === sectionId) {
      assert.equal((sectionHtml.match(/<ol>/g) ?? []).length, 1, `${locale}: actual ordered exercise`);
      assert.equal((sectionHtml.match(/<li>/g) ?? []).length, 3, `${locale}: all three actual steps`);
    }
    const withoutHeading = sectionHtml.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, '');
    assert.equal(plain(withoutHeading), renderText(section.bodyMarkdown), `${locale}/${section.id}: complete Markdown body`);
    const sectionLinks = [...sectionHtml.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]);
    for (const link of section.bodyMarkdown.matchAll(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g)) {
      assert.ok(sectionLinks.some(tag => attribute(tag, 'href') === link[2] && plain(tag) === renderText(link[1])), `${locale}/${section.id}: full inline link ${link[2]}`);
    }
    assert.ok(body.includes(`href="#${section.id}"`), `${locale}: complete TOC ${section.id}`);
    assert.ok(sectionHtml.includes(`id="${section.id}-title"`), `${locale}: heading anchor`);
    for (const anchor of section.legacyAnchors ?? []) assert.ok(sectionHtml.includes(`id="${anchor}"`), `${locale}: legacy anchor ${anchor}`);
  }
  for (const anchor of [...(article.legacyIntroAnchors ?? []), ...(article.legacyRelatedAnchors ?? [])]) assert.ok(body.includes(`id="${anchor}"`), `${locale}: original anchor ${anchor}`);
  const heroImages = tags(body, 'img');
  assert.ok(heroImages.some(tag => attribute(tag, 'alt') === article.nameLocalized && (attribute(tag, 'src') ?? '').includes(`${cardId}.webp`)), `${locale}: original card image and alt`);
  assert.ok(body.includes('href="/tarot/attribution.json"'), `${locale}: original image credits`);
  const canonical = formalOrigin + href(locale);
  const headLinks = tags(html, 'link');
  assert.ok(headLinks.some(tag => attribute(tag, 'rel') === 'canonical' && attribute(tag, 'href') === canonical), `${locale}: canonical`);
  const alternates = headLinks.filter(tag => attribute(tag, 'rel') === 'alternate').map(tag => [attribute(tag, 'hrefLang'), attribute(tag, 'href')]).sort();
  assert.deepEqual(alternates, [...locales.map(other => [languageTags[other], formalOrigin + href(other)]), ['x-default', formalOrigin + href('en')]].sort(), `${locale}: reciprocal language alternates`);
  const meta = tags(html, 'meta');
  assert.ok(meta.filter(tag => attribute(tag, 'name') === 'robots').every(tag => !/noindex/i.test(attribute(tag, 'content'))), `${locale}: real edition remains indexable`);
  assert.ok(meta.some(tag => attribute(tag, 'name') === 'description' && attribute(tag, 'content') === article.hook), `${locale}: description`);
  assert.ok(meta.some(tag => attribute(tag, 'property') === 'article:published_time' && attribute(tag, 'content') === '2026-10-07'), `${locale}: OpenGraph publication date`);
  const expectedModified = authored ? '2026-11-10' : '2026-10-08';
  assert.ok(meta.some(tag => attribute(tag, 'property') === 'article:modified_time' && attribute(tag, 'content') === expectedModified), `${locale}: OpenGraph modification date`);
  const graphs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
  const schema = graphs.find(item => item['@type'] === 'Article');
  assert.ok(schema, `${locale}: Article schema`);
  assert.equal(schema.headline, article.title);
  assert.equal(schema.description, article.hook);
  assert.equal(schema.inLanguage, languageTags[locale]);
  assert.equal(schema.url, canonical);
  assert.equal(schema.mainEntityOfPage, canonical);
  assert.equal(schema.isAccessibleForFree, true);
  assert.equal(schema.datePublished, '2026-10-07');
  assert.equal(schema.dateModified, expectedModified);
  assert.deepEqual(schema.citation, article.sources.map(source => source.url ?? source.title), `${locale}: every old and new source citation`);
  assert.deepEqual(schema.image, [formalOrigin + `/tarot/rws/${cardId}.webp`]);
  assert.equal((body.match(/data-editorial-update/g) ?? []).length, authored ? 1 : 0);
  const entry = articleBlocks.find(block => block.includes(`<loc>${attr(canonical)}</loc>`));
  assert.ok(entry?.includes(`<lastmod>${expectedModified}</lastmod>`), `${locale}: sitemap date`);
  for (const match of body.matchAll(/href="([^"]+)"/g)) {
    const target = decode(match[1]);
    if (!target.startsWith('/') && !target.startsWith('#')) continue;
    assert.ok(!target.startsWith('//'), 'No protocol-relative request');
    const resolved = new URL(target, new URL(href(locale), base));
    assert.equal(resolved.origin, base.origin);
    internalLinks.add(resolved.pathname + resolved.search + resolved.hash);
  }
  for (const id of html.matchAll(/dpl_[a-zA-Z0-9]+/g)) if (!report.deploymentIds.includes(id[0])) report.deploymentIds.push(id[0]);
  report.editions.push({ locale, sections: ids.length, completeBody: true, originalImage: true, allSources: true, datePublished: schema.datePublished, dateModified: schema.dateModified, canonical: true, originalAnchors: true });
  console.log(`PASS ${locale}: complete ${ids.length}-section body, original opening/image, all sources/anchors and language-specific metadata/schema/sitemap dates`);
}

for (const destination of internalLinks) {
  const url = new URL(destination, base), anchor = url.hash.slice(1);
  const html = await get(destination);
  if (anchor) assert.ok(html.includes(`id="${anchor}"`), `${destination}: complete fragment target`);
  report.links.push({ href: destination, status: 200, anchor: anchor || null });
}
for (const locale of ['en', 'zh']) {
  const suffix = locale === 'en' ? '' : '?locale=zh';
  const tool = `/tarot${suffix}`;
  assert.ok(internalLinks.has(tool), `${locale}: actual localized article-to-tool link`);
  const toolHtml = await get(tool);
  assert.ok(toolHtml.includes(locale === 'en' ? 'Three cards · a path' : '三张牌 · 来路与下一步'), `${locale}: real three-card option`);
  report.tools.push({ locale, href: tool, status: 200, threeCardOption: true, noDrawOrAIRequest: true });
  const directory = await get(`/journal/tarot-cards${suffix}`);
  assert.ok(directory.includes(`href="${attr(href(locale))}"`), `${locale}: card-atlas discovery`);
  report.discovery.push({ locale, cardAtlas: true });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`PASS four complete local editions, ${internalLinks.size} internal targets/fragments, both localized tools and card-atlas entry links; no external requests or draw/AI/account calls`);
