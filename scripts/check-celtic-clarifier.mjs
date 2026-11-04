import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// Ordinary Node is intentional: inspect the public HTTP result against its
// authored JSON rather than importing the application or its React runtime.
const base = process.argv[2] ?? 'http://127.0.0.1:3056';
const output = process.argv[3] ?? 'docs/qa/tarot-reading-20261104/http-local.json';
const celtic = 'how-to-read-celtic-cross';
const journal = 'how-to-keep-tarot-journal';
const authored = ['en', 'zh'];
const canonicalOrigin = 'https://www.destinypixel.com';
const languageTags = { en: 'en', zh: 'zh-Hans' };
const containers = Object.fromEntries(authored.map(locale => [locale, JSON.parse(readFileSync(`content/tarot-methods/${locale}.json`, 'utf8'))]));
const predecessor = JSON.parse(readFileSync('content/celtic-clarifier-20261104/previous-containers.json', 'utf8'));
const href = (slug, locale) => `/journal/${slug}${locale === 'en' ? '' : `?locale=${locale}`}`;
const normalize = value => value.replace(/\s+/g, ' ').trim();
const decode = value => value
  .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
  .replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&nbsp;', '\u00a0').replaceAll('&amp;', '&');
const plain = html => normalize(decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, '')));
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match ? decode(match[1]) : null;
};
const report = { base, editions: [], redirects: [], links: [], figures: [], discovery: [], deploymentIds: [] };
const targets = new Set();
const figurePaths = new Set();

async function get(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response.text();
}

const sitemap = await get('/sitemap.xml');
const sitemapBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
for (const slug of [celtic, journal]) {
  const expectedModified = slug === celtic ? '2026-11-04' : '2026-10-23';
  const expectedSitemapUrls = authored.map(locale => canonicalOrigin + href(slug, locale)).sort();
  const actualSitemapBlocks = sitemapBlocks.filter(block => {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
    return loc && new URL(decode(loc)).pathname === `/journal/${slug}`;
  });
  assert.deepEqual(actualSitemapBlocks.map(block => decode(block.match(/<loc>([\s\S]*?)<\/loc>/)[1])).sort(), expectedSitemapUrls, `${slug}: sitemap must contain exactly the two authored editions`);

  for (const locale of authored) {
    const copy = containers[locale][slug];
    assert.ok(copy, `${locale}/${slug}: authored source`);
    assert.equal(copy.sections.length, slug === celtic ? 10 : 9, `${locale}/${slug}: complete section count`);
    if (slug === journal) assert.deepEqual(copy, predecessor[locale][journal], `${locale}: neighboring journal source changed`);
    const html = await get(href(slug, locale));
    const body = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
    assert.ok(body, `${locale}/${slug}: article element`);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${locale}/${slug}: unique H1`);
    assert.equal(plain(body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), normalize(copy.title));
    for (const value of [copy.introduction, copy.answer, copy.takeaway, copy.subtitle, ...(copy.openingParagraphs ?? [])].filter(Boolean)) {
      assert.ok(plain(body).includes(normalize(value)), `${locale}/${slug}: complete original opening`);
    }
    const ids = [...body.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(ids, copy.sections.map(section => section.id), `${locale}/${slug}: exact complete section order`);
    if (slug === celtic) {
      for (const section of predecessor[locale][slug].sections) assert.ok(ids.includes(section.id), `${locale}: old anchor ${section.id}`);
      const addition = copy.sections.find(section => section.id === 'clarifier-job');
      assert.ok(addition?.table, `${locale}: new practice table`);
      assert.equal(addition.table.headings.length, 3);
      assert.deepEqual(addition.table.rows.map(row => row.length), [3, 3, 3]);
    }

    let paragraphCount = 0, tableCount = 0, figureCount = 0;
    for (const section of copy.sections) {
      const sectionHtml = body.match(new RegExp(`<section\\b[^>]*\\bid="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1];
      assert.ok(sectionHtml, `${locale}/${slug}/${section.id}: section body`);
      assert.equal(plain(sectionHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? ''), normalize(section.title));
      // Current method articles use explicit authored paragraphs, not Markdown.
      assert.ok(!section.bodyMarkdown, `${section.id}: extend this checker before adding a different content representation`);
      const paragraphs = [...sectionHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(match => plain(match[1]));
      assert.deepEqual(paragraphs, section.paragraphs.map(normalize), `${locale}/${slug}/${section.id}: every complete paragraph in order`);
      paragraphCount += paragraphs.length;
      const steps = [...sectionHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(match => plain(match[1]));
      assert.deepEqual(steps, (section.steps ?? []).map(normalize), `${locale}/${slug}/${section.id}: complete ordered steps`);
      const tables = [...sectionHtml.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
      assert.equal(tables.length, section.table ? 1 : 0, `${locale}/${slug}/${section.id}: table count`);
      if (section.table) {
        const head = tables[0].match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/)?.[1] ?? '';
        assert.deepEqual([...head.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(match => plain(match[1])), section.table.headings.map(normalize), `${locale}/${slug}/${section.id}: table headings`);
        const tableBody = tables[0].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
        const rows = [...tableBody.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(row => [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(cell => plain(cell[1])));
        assert.deepEqual(rows, section.table.rows.map(row => row.map(normalize)), `${locale}/${slug}/${section.id}: every complete table cell`);
        tableCount += 1;
      }
      for (const link of [...(section.links ?? []), ...(section.sources ?? [])]) {
        const candidates = [...sectionHtml.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]);
        assert.ok(candidates.some(tag => attribute(tag, 'href') === link.href && plain(tag) === normalize(link.text ?? link.label)), `${locale}/${slug}/${section.id}: complete linked text and destination ${link.href}`);
      }
      const figures = [...sectionHtml.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/g)].map(match => match[1]);
      assert.equal(figures.length, (section.figures ?? []).length, `${locale}/${slug}/${section.id}: figure count`);
      for (let index = 0; index < figures.length; index += 1) {
        const expected = section.figures[index], image = figures[index].match(/<img\b[^>]*>/)?.[0];
        assert.ok(image, `${locale}/${slug}/${section.id}: figure image`);
        assert.equal(attribute(image, 'alt'), expected.alt);
        assert.equal(Number(attribute(image, 'width')), expected.width);
        assert.equal(Number(attribute(image, 'height')), expected.height);
        assert.ok(decodeURIComponent(attribute(image, 'src')).includes(expected.src), `${locale}/${slug}/${section.id}: original figure path`);
        assert.equal(plain(figures[index].match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? ''), normalize(expected.caption));
        figurePaths.add(expected.src);
        figureCount += 1;
      }
      const toc = [...body.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]);
      assert.ok(toc.some(tag => attribute(tag, 'href') === `#${section.id}` && plain(tag) === normalize(section.title)), `${locale}/${slug}: TOC destination/text ${section.id}`);
    }
    const actionLinks = [...body.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]);
    assert.ok(actionLinks.some(tag => attribute(tag, 'href') === copy.action.href && plain(tag) === normalize(copy.action.label)), `${locale}/${slug}: preserved action link`);
    const canonical = canonicalOrigin + href(slug, locale);
    const headLinks = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]);
    assert.ok(headLinks.some(tag => attribute(tag, 'rel') === 'canonical' && attribute(tag, 'href') === canonical), `${locale}/${slug}: canonical`);
    const alternates = headLinks.filter(tag => attribute(tag, 'rel') === 'alternate' && attribute(tag, 'hrefLang')).map(tag => [attribute(tag, 'hrefLang'), attribute(tag, 'href')]).sort();
    assert.deepEqual(alternates, [['en', canonicalOrigin + href(slug, 'en')], ['zh-Hans', canonicalOrigin + href(slug, 'zh')], ['x-default', canonicalOrigin + href(slug, 'en')]].sort(), `${locale}/${slug}: exactly authored alternates`);
    const robots = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]).filter(tag => attribute(tag, 'name') === 'robots');
    assert.ok(robots.every(tag => !/noindex/i.test(attribute(tag, 'content'))), `${locale}/${slug}: authored edition must not be noindex`);
    const graph = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
    const schema = graph.find(value => value['@type'] === 'Article');
    assert.ok(schema, `${locale}/${slug}: Article schema`);
    assert.equal(schema.headline, copy.title);
    assert.equal(schema.description, copy.description);
    assert.equal(schema.inLanguage, languageTags[locale]);
    assert.equal(schema.datePublished, '2026-10-23');
    assert.equal(schema.dateModified, expectedModified);
    assert.equal(schema.mainEntityOfPage, canonical);
    assert.deepEqual(schema.citation, copy.sections.flatMap(section => (section.sources ?? []).map(source => source.href.startsWith('/') ? canonicalOrigin + source.href : source.href)), `${locale}/${slug}: every source in schema`);
    const sitemapBlock = actualSitemapBlocks.find(block => decode(block.match(/<loc>([\s\S]*?)<\/loc>/)[1]) === canonical);
    assert.equal(sitemapBlock.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1], expectedModified, `${locale}/${slug}: sitemap date`);
    for (const tag of actionLinks) {
      const destination = attribute(tag, 'href');
      if (destination?.startsWith('/') && !destination.startsWith('//')) targets.add(destination);
    }
    for (const id of html.matchAll(/dpl_[a-zA-Z0-9]+/g)) if (!report.deploymentIds.includes(id[0])) report.deploymentIds.push(id[0]);
    report.editions.push({ slug, locale, sections: ids.length, completeParagraphs: paragraphCount, completeTables: tableCount, completeFigures: figureCount, fullText: true, canonical: true, authoredAlternates: true, datePublished: schema.datePublished, dateModified: schema.dateModified });
    console.log(`PASS ${locale}/${slug}: all ${ids.length} sections, ${paragraphCount} complete paragraphs, ${tableCount} complete tables, figures, links, sources and dates`);
  }

  for (const locale of ['ru', 'zh-TW']) {
    const destination = href(slug, locale);
    const response = await fetch(new URL(destination, base), { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    assert.ok([301, 307, 308].includes(response.status), `${slug}/${locale}: unsupported edition must redirect, got ${response.status}`);
    const location = response.headers.get('location');
    assert.ok(location, `${slug}/${locale}: redirect location`);
    const target = new URL(location, base);
    assert.equal(target.pathname, `/journal/${slug}`);
    assert.equal(target.search, '');
    report.redirects.push({ slug, locale, status: response.status, target: target.pathname });
  }
}

for (const destination of targets) {
  const url = new URL(destination, base), fragment = url.hash.slice(1);
  url.hash = '';
  const html = await get(url);
  if (fragment) assert.ok([...html.matchAll(/\bid="([^"]*)"/g)].some(match => decode(match[1]) === decodeURIComponent(fragment)), `${destination}: fragment destination`);
  report.links.push({ href: destination, status: 200, fragment: fragment || null });
}
for (const src of figurePaths) {
  await get(src);
  report.figures.push({ src, status: 200 });
}
for (const locale of authored) {
  const html = await get(locale === 'en' ? '/journal' : '/journal?locale=zh');
  const links = [...html.matchAll(/<a\b[^>]*>/g)].map(match => attribute(match[0], 'href'));
  for (const slug of [celtic, journal]) assert.ok(links.includes(href(slug, locale)), `${locale}/${slug}: journal discovery`);
  report.discovery.push({ locale, celtic: true, adjacentJournal: true });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`PASS 2 complete Celtic editions, 2 unchanged complete journal editions, 4 unsupported-edition redirects, ${targets.size} internal destinations/fragments and ${figurePaths.size} original figures`);
