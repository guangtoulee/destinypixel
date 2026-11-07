import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const folder = 'content/three-card-interpretation-fit-20261107';
export const slug = 'how-to-read-three-card-tarot';
export const locales = ['en', 'zh', 'zh-TW', 'ru'];
export const read = path => readFileSync(resolve(root, path), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');

function parseModule(source) {
  const start = source.indexOf('= {', source.indexOf('const editions')) + 2;
  assert.ok(start > 1, 'literal editions declaration missing');
  const end = source.indexOf('\n};', start) + 2;
  assert.ok(end > start, 'literal editions boundary missing');
  const editions = JSON.parse(source.slice(start, end));
  assert.equal(JSON.stringify(editions, null, 2), source.slice(start, end), 'extend the checker before changing the literal representation');
  return { editions, prefix: source.slice(0, start), suffix: source.slice(end) };
}

export function validateSource() {
  const receipt = JSON.parse(read(`${folder}/revisions.json`));
  const previous = JSON.parse(read(`${folder}/previous-editions.json`));
  const source = read('lib/journal-three-card-tarot.ts');
  const previousSource = read(`${folder}/previous-source.ts`);
  const historicalReceipt = JSON.parse(read('content/three-card-question-scope-20261030/revisions.json'));
  assert.equal(sha(source), receipt.currentSourceSha256, 'current module hash');
  assert.equal(sha(previousSource), receipt.previousSourceSha256, 'previous module hash');
  assert.equal(receipt.previousSourceSha256, historicalReceipt.currentSourceSha256, 'previous module must be the exact already-published October 30 module');
  assert.equal(sha(read(`${folder}/previous-editions.json`)), receipt.previousEditionsSha256, 'previous editions snapshot hash');
  assert.equal(receipt.baseCommit, '52b457f7bf7c6a7e6f7e753407ab26f7b695a08f');
  assert.equal(receipt.updatedAt, '2026-11-07');
  assert.deepEqual(Object.keys(receipt.articles), [slug]);
  assert.deepEqual(Object.keys(receipt.articles[slug].notes).sort(), ['en', 'zh']);
  assert.equal(receipt.newSectionId, 'interpretation-fit');
  assert.deepEqual(receipt.readPages, { pdf: [386, 387, 388], printed: [388, 389, 390] });
  assert.deepEqual(receipt.citedPages, { pdf: [387, 388], printed: [389, 390] });
  const parsed = parseModule(source);
  const before = parseModule(previousSource);
  assert.equal(parsed.prefix, before.prefix, 'imports and type declarations retained');
  assert.equal(parsed.suffix, before.suffix, 'shared publication dates, explicit Traditional Chinese and exports retained');
  const traditional = JSON.parse(read('content/three-card-question-scope-20261030/previous-editions.json'))['zh-TW'];
  const copies = { ...parsed.editions, 'zh-TW': traditional };
  assert.deepEqual(Object.keys(copies).sort(), [...locales].sort());
  for (const locale of locales) {
    const current = copies[locale];
    const old = previous[locale];
    const edited = locale === 'en' || locale === 'zh';
    assert.ok(current && old, `${locale}: complete edition`);
    if (!edited) {
      assert.deepEqual(current, old, `${locale}: unedited full edition retained`);
      continue;
    }
    const expectedIds = old.sections.map(section => section.id);
    expectedIds.splice(expectedIds.indexOf('connect') + 1, 0, receipt.newSectionId);
    assert.deepEqual(current.sections.map(section => section.id), expectedIds, `${locale}: exactly one new anchor in its approved position`);
    const projected = { ...current, sections: current.sections.filter(section => section.id !== receipt.newSectionId) };
    assert.deepEqual(projected, old, `${locale}: every old field, section, paragraph, table, step and link retained`);
    const addition = current.sections.find(section => section.id === receipt.newSectionId);
    assert.equal(addition.paragraphs.length, 7);
    assert.equal(addition.table.headings.length, 3);
    assert.deepEqual(addition.table.rows.map(row => row.length), [3, 3, 3]);
    assert.equal(addition.links.length, 3);
    assert.equal(addition.sources.length, 2);
    assert.ok([...addition.paragraphs, ...addition.table.headings, ...addition.table.rows.flat()].every(value => value.trim()));
    const projectedLiteral = structuredClone(parsed.editions);
    for (const editedLocale of ['en', 'zh']) projectedLiteral[editedLocale].sections = projectedLiteral[editedLocale].sections.filter(section => section.id !== receipt.newSectionId);
    assert.equal(parsed.prefix + JSON.stringify(projectedLiteral, null, 2) + parsed.suffix, previousSource, 'removing only the new section must recover the exact previous module bytes');
  }
  const registry = read('lib/editorial-updates.ts');
  assert.ok(registry.includes(`import interpretationFitRevision from "@/${folder}/revisions.json";`));
  assert.ok(registry.includes('[] = [interpretationFitRevision,'), 'new edition-specific registry must have precedence');
  return { copies, previous, receipt };
}

function manuscript(locale, copy, receipt) {
  const text = [`# ${copy.title}`, '', `URL: https://www.destinypixel.com/journal/${slug}${locale === 'en' ? '' : '?locale=zh'}`, '', `Published: 2026-10-02 · This ${locale} edition updated: ${receipt.updatedAt}`, '', `Description: ${copy.description}`, '', `Topic: ${copy.topic}`, '', copy.introduction, '', `> ${copy.takeaway}`, ''];
  for (const section of copy.sections) {
    text.push(`## ${section.title}`, '', `Anchor: #${section.id}`, '', ...section.paragraphs.flatMap(paragraph => [paragraph, '']));
    assert.ok(!section.bodyMarkdown && !section.figures && !section.people, `${section.id}: extend the exporter before introducing another content representation`);
    if (section.steps) text.push(...section.steps.map((step, index) => `${index + 1}. ${step}`), '');
    if (section.table) {
      const escape = value => value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
      text.push(`| ${section.table.headings.map(escape).join(' | ')} |`, `| ${section.table.headings.map(() => '---').join(' | ')} |`, ...section.table.rows.map(row => `| ${row.map(escape).join(' | ')} |`), '');
    }
    if (section.links?.length) text.push(...section.links.map(link => `- [${link.text}](${link.href})`), '');
    if (section.sources?.length) text.push(...section.sources.map(source => `- [${source.label}](${source.href})`), '');
  }
  text.push(`[${copy.action.label}](${copy.action.href})`, '');
  return text.join('\n');
}

export function exportManuscripts(data = validateSource()) {
  for (const locale of ['en', 'zh']) writeFileSync(resolve(root, `${folder}/manuscript-${locale}.md`), manuscript(locale, data.copies[locale], data.receipt));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const data = validateSource();
  exportManuscripts(data);
  console.log('PASS exact previous/current source and snapshot hashes; removal of only the new EN/ZH section restores every previous module byte.');
  console.log('PASS all old fields, eight sections, anchors, paragraphs, tables, steps and links; complete Russian and Traditional Chinese editions retained.');
  console.log('PASS one new bilingual 3×3 exercise, edition-specific registry scope, verified-page receipt and complete readable manuscript exports.');
}
