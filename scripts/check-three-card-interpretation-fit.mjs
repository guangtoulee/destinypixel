import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { validateSource, slug, locales } from './validate-three-card-interpretation-fit.mjs';

// Read the public HTTP output with ordinary Node; do not import the app,
// simulate the browser, request an AI reading or use private credentials.
const base = process.argv[2] ?? 'http://127.0.0.1:3058';
const output = process.argv[3] ?? 'docs/qa/tarot-reading-20261107/http-local.json';
const { copies, receipt } = validateSource();
const origin = 'https://www.destinypixel.com';
const languageTags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const href = locale => `/journal/${slug}${locale === 'en' ? '' : `?locale=${locale}`}`;
const normalize = value => value.replace(/\s+/g, ' ').trim();
const decode = value => value.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&nbsp;', '\u00a0').replaceAll('&amp;', '&');
const plain = html => normalize(decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, '')));
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match ? decode(match[1]) : null;
};
const tags = (html, element) => [...html.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'g'))].map(match => match[0]);
const anchors = html => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]);
const report = { base, editions: [], links: [], tools: [], discovery: [], deploymentIds: [] };
const targets = new Set();

async function get(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response.text();
}

const sitemap = await get('/sitemap.xml');
const sitemapBlocks = (sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? []).filter(block => {
  const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
  return loc && new URL(decode(loc)).pathname === `/journal/${slug}`;
});
assert.deepEqual(sitemapBlocks.map(block => decode(block.match(/<loc>([\s\S]*?)<\/loc>/)[1])).sort(), locales.map(locale => origin + href(locale)).sort(), 'exactly four real language pages in sitemap');

for (const locale of locales) {
  const copy = copies[locale];
  const modified = locale === 'en' || locale === 'zh' ? receipt.updatedAt : '2026-10-02';
  const html = await get(href(locale));
  const body = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
  assert.ok(body, `${locale}: complete article element, not a redirect fallback`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${locale}: unique H1`);
  assert.equal(plain(body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), normalize(copy.title));
  assert.ok(plain(body).includes(normalize(copy.introduction)), `${locale}: complete introduction`);
  assert.ok(plain(body).includes(normalize(copy.takeaway)), `${locale}: complete takeaway`);
  const ids = [...body.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, copy.sections.map(section => section.id), `${locale}: exact full section order`);
  let paragraphCount = 0, tableCount = 0, stepCount = 0;
  for (const section of copy.sections) {
    const sectionHtml = body.match(new RegExp(`<section\\b[^>]*\\bid="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
    assert.ok(sectionHtml, `${locale}/${section.id}: section body`);
    assert.equal(plain(sectionHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? ''), normalize(section.title));
    assert.ok(!section.bodyMarkdown && !section.figures && !section.people, `${section.id}: extend the HTTP checker before changing representation`);
    const paragraphs = [...sectionHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(match => plain(match[1]));
    assert.deepEqual(paragraphs, section.paragraphs.map(normalize), `${locale}/${section.id}: every complete paragraph in order`);
    paragraphCount += paragraphs.length;
    const steps = [...sectionHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(match => plain(match[1]));
    assert.deepEqual(steps, (section.steps ?? []).map(normalize), `${locale}/${section.id}: complete ordered steps`);
    stepCount += steps.length;
    const tables = [...sectionHtml.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
    assert.equal(tables.length, section.table ? 1 : 0, `${locale}/${section.id}: table count`);
    if (section.table) {
      const head = tables[0].match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/)?.[1] ?? '';
      assert.deepEqual([...head.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(match => plain(match[1])), section.table.headings.map(normalize), `${locale}/${section.id}: all headings`);
      const tableBody = tables[0].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
      const rows = [...tableBody.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(row => [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(cell => plain(cell[1])));
      assert.deepEqual(rows, section.table.rows.map(row => row.map(normalize)), `${locale}/${section.id}: every full table cell`);
      tableCount += 1;
    }
    for (const link of [...(section.links ?? []), ...(section.sources ?? [])]) {
      assert.ok(anchors(sectionHtml).some(tag => attribute(tag, 'href') === link.href && plain(tag) === normalize(link.text ?? link.label)), `${locale}/${section.id}: complete link text and destination ${link.href}`);
    }
    assert.ok(anchors(body).some(tag => attribute(tag, 'href') === `#${section.id}` && plain(tag) === normalize(section.title)), `${locale}: TOC target and text ${section.id}`);
  }
  assert.ok(anchors(body).some(tag => attribute(tag, 'href') === copy.action.href && plain(tag) === normalize(copy.action.label)), `${locale}: original action`);
  const canonical = origin + href(locale);
  const headLinks = tags(html, 'link');
  assert.ok(headLinks.some(tag => attribute(tag, 'rel') === 'canonical' && attribute(tag, 'href') === canonical), `${locale}: canonical`);
  const alternates = headLinks.filter(tag => attribute(tag, 'rel') === 'alternate' && attribute(tag, 'hrefLang')).map(tag => [attribute(tag, 'hrefLang'), attribute(tag, 'href')]).sort();
  assert.deepEqual(alternates, [...locales.map(language => [languageTags[language], origin + href(language)]), ['x-default', origin + href('en')]].sort(), `${locale}: reciprocal four-language alternates`);
  const meta = tags(html, 'meta');
  assert.ok(meta.some(tag => attribute(tag, 'name') === 'description' && attribute(tag, 'content') === copy.description), `${locale}: description`);
  for (const [name, value] of [['article:published_time', '2026-10-02'], ['article:modified_time', modified]]) assert.ok(meta.some(tag => attribute(tag, 'property') === name && attribute(tag, 'content') === value), `${locale}: ${name}`);
  assert.ok(meta.filter(tag => attribute(tag, 'name') === 'robots').every(tag => !/noindex/i.test(attribute(tag, 'content'))), `${locale}: real edition indexable`);
  const graph = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
  const schema = graph.find(value => value['@type'] === 'Article');
  assert.ok(schema, `${locale}: Article schema`);
  assert.equal(schema.headline, copy.title);
  assert.equal(schema.description, copy.description);
  assert.equal(schema.inLanguage, languageTags[locale]);
  assert.equal(schema.datePublished, '2026-10-02');
  assert.equal(schema.dateModified, modified);
  assert.equal(schema.mainEntityOfPage, canonical);
  assert.equal(schema.isAccessibleForFree, true);
  assert.deepEqual(schema.citation, copy.sections.flatMap(section => (section.sources ?? []).map(source => source.href.startsWith('/') ? origin + source.href : source.href)), `${locale}: complete source list`);
  const sitemapBlock = sitemapBlocks.find(block => decode(block.match(/<loc>([\s\S]*?)<\/loc>/)[1]) === canonical);
  assert.equal(sitemapBlock.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1], modified, `${locale}: sitemap date`);
  if (locale === 'en' || locale === 'zh') {
    const note = receipt.articles[slug].notes[locale];
    assert.ok(plain(body).includes(normalize(note)), `${locale}: precise editorial note`);
  } else assert.ok(!html.includes('data-editorial-update'), `${locale}: untouched edition must not gain an update note`);
  for (const tag of anchors(body)) {
    const destination = attribute(tag, 'href');
    if (destination?.startsWith('/') && !destination.startsWith('//')) targets.add(destination);
  }
  for (const match of html.matchAll(/dpl_[a-zA-Z0-9]+/g)) if (!report.deploymentIds.includes(match[0])) report.deploymentIds.push(match[0]);
  report.editions.push({ locale, sections: ids.length, completeParagraphs: paragraphCount, completeTables: tableCount, completeSteps: stepCount, fullText: true, allOriginalAnchors: true, reciprocalAlternates: true, datePublished: schema.datePublished, dateModified: schema.dateModified });
  console.log(`PASS ${locale}: all ${ids.length} sections, ${paragraphCount} complete paragraphs, ${tableCount} tables, ${stepCount} ordered steps, links, metadata, schema and sitemap`);
}

for (const destination of targets) {
  const url = new URL(destination, base);
  const fragment = url.hash.slice(1);
  url.hash = '';
  const html = await get(url);
  if (fragment) assert.ok([...html.matchAll(/\bid="([^"]*)"/g)].some(match => decode(match[1]) === decodeURIComponent(fragment)), `${destination}: actual fragment target`);
  report.links.push({ href: destination, status: 200, fragment: fragment || null });
}
for (const locale of ['en', 'zh']) {
  const tool = locale === 'en' ? '/tarot' : '/tarot?locale=zh';
  const toolHtml = await get(tool);
  assert.ok(tags(toolHtml, 'main').some(tag => attribute(tag, 'lang') === languageTags[locale]), `${locale}: localized tool main`);
  assert.ok(!/application\/ld\+json[^>]*>\s*\{[^<]*"@type":"Article"/.test(toolHtml), `${locale}: tool route is not an article fallback`);
  const expectedOption = locale === 'en' ? 'Three cards · a path' : '三张牌 · 来路与下一步';
  assert.ok(plain(toolHtml).includes(expectedOption), `${locale}: actual three-card option in public tool HTML`);
  report.tools.push({ locale, href: tool, status: 200, threeCardOption: true, noDrawOrAIRequest: true });
  const catalog = await get(locale === 'en' ? '/journal' : '/journal?locale=zh');
  assert.ok(tags(catalog, 'a').some(tag => attribute(tag, 'href') === href(locale)), `${locale}: article discovery from journal`);
  const topicPath = `/journal?${locale === 'en' ? '' : 'locale=zh&'}topic=tarot-reading#topic-results`;
  const topicHtml = await get(topicPath);
  assert.ok(tags(topicHtml, 'a').some(tag => attribute(tag, 'href') === href(locale)), `${locale}: article discovery from reading topic`);
  assert.ok(topicHtml.includes('data-topic-results="tarot-reading"'), `${locale}: actual topic filter results`);
  report.discovery.push({ locale, journal: true, topic: topicPath });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`PASS all four complete real editions, ${targets.size} internal destinations/fragments, both localized three-card tool entrances and journal/topic discovery`);
