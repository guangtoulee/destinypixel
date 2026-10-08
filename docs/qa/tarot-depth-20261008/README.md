# Tarot depth revision: 77 cards · intake and validation plan

Baseline: `3656f3f0d2d66190cd0af457230e51e945683059` (merged PR23).
Branch: `codex/tarot-depth-77-20261008`.

This round excludes the revised Sun, the three editorial articles and every hexagram.
Complete manuscripts are archived under `incoming/`; independently retained translations
are under `translations/`. See `checkpoint.json` for exact counts at the saved checkpoint.
No placeholder article is installed or published.
Release remains **Preview only** until the parent confirms the batch release scope
and external browser QA. PR23's completed release is not permission to merge this round.

## Receiving complete source

Task-message batches should contain **2–3 complete cards**, ideally preserving the
author's suit/order. A confirmed downloadable package may contain a complete suit
(14 cards) or all 21 remaining major cards; translation/integration still advances in
2–3-card checkpoints. Do not divide an individual article unless message limits require
it. For split text, retain numbered parts and assemble/check the complete article before intake.

Accepted JSON envelope: `records` or `articles` array (a plain array also works).
Each item needs `cardId` and complete `articleMarkdown` or `bodyMarkdown`.
Keep all supplied titles, quick takes, sections, source links, review notes and metadata.
An optional item `sha256` means the UTF-8 Markdown hash. An optional confirmed package
hash is passed with `--sha256`; no reformatting is permitted before package hash verification.
`articleSlug: null` is valid. Identity resolves through the existing registered card map,
for example `wheel` → `/journal/tarot-wheel`, `judgement` → `/journal/tarot-judgement`.
Never generate alternate names or overwrite a received batch silently.

```sh
python3 scripts/tarot-depth-batches.py receive major-01 /tmp/confirmed-source.json --origin 'parent task message: batch identifier'
python3 scripts/tarot-depth-batches.py status
python3 scripts/tarot-depth-batches.py check-scope
```

Intake saves the received local JSON bytes and a receipt containing package/article hashes,
characters, section counts and resolved routes under `content/tarot-depth-20261008/incoming/`.
For task-message deliveries, JSON file formatting is reconstructed; every supplied field is
retained and the exact delivered `bodyMarkdown` is verified against its supplied `bodySha256`.
A local package hash identifies the saved file, not the whitespace of the original message.
Intake does not publish or declare the source reviewed. The minimum structure check detects
obviously short/incomplete delivery; it cannot certify editorial quality or distinct cases.
If the author's package uses another envelope, retain it unchanged and adapt intake after
reading the first real package. Never ask the author to replace full prose with a summary.

## Current runtime schema and integration

- Live records: `content/tarot/{zh,zh-TW,en,ru}/{cardId}.json`, schema
  `destinypixel.tarot.article.v3`. Chinese runtime locale is `zh-CN`.
- Stable fields: card identity/order/number/arcana, existing `/tarot/rws/{cardId}.webp`
  and image provenance, original route, original publication date.
- Editorial fields: `title`, `quickTake.{upright,reversed}`, `hook`, `keywords`, optional
  `openingParagraphs`/`plainLanguageSummary`, complete `articleMarkdown`,
  `sections[{id,role,title,bodyMarkdown}]`, `sources[{title,url,...}]`,
  `relatedCards[{cardId,reason,...}]`, provenance and review metadata.
- Current schema requires at least seven sections outside the Sun; adapt only after
  seeing real approved manuscripts, without padding or dropping sections to fit a count.
- The renderer uses structured sections, not `articleMarkdown` directly. Validation must
  reconstruct/compare the full manuscript and verify every rendered section. Sync the
  lightweight catalog's title/quick takes/hook with the live records.
- Source manuscripts stay unmodified. Build translated editions separately; preserve
  section/paragraph/list/source structure and all card-specific reasoning. Each card needs
  at least two substantively different concrete reading cases, reviewed for question,
  context, image reasoning, interpretive limits and plausible next steps. Counting headings
  alone does not meet this requirement.
- Existing section IDs/roles are frozen in the manifest. Keep them where semantics match;
  otherwise add explicit per-card legacy-anchor aliases. Do not assign old anchors by raw
  section position. Retain the existing Sun aliases without changing its text or data.
- Archive each replaced original record in `content/tarot/revisions/2026-10-08/` before
  replacement. Generalize original-collection validation to use these archives, preserving
  the original collection hashes. Keep a separate manifest of new full-text hashes.
- Extend the current Sun-specific modification-date logic to revised cards only. Unreceived
  or unreleased cards retain their old dates and text. Canonical/hreflang/tool paths remain.

## Batch checkpoint and regression

For each received batch: archive → review Chinese completeness/cases → fully translate
Traditional Chinese, English and Russian → compare complete text/structure/sources →
integrate all four editions → run affected validation → commit and report card IDs and
per-language counts. Manifest states distinguish `received`, `translated`, `reviewed`,
`integrated`, `validated`; only advance when that work actually passes. Do not equate receipt
with completed translation. No native-human certification is claimed for model review.

Before Preview: source integrity + scope checks, JSON schema, per-edition full-text hashes,
old-anchor coverage, catalog/related-card identity, dates, internal links, build, types,
applicable unit tests and changed-file lint. The root ESLint config remains a baseline issue.

Run the existing 312 tarot, 256 hexagram and 300 journal HTTP checks, editorial/Sun checks,
884-URL integration sitemap checks and tool entry checks. Browser coverage includes desktop
and mobile layouts, four languages, language-preserving links, Back/Forward, drawing/casting
and return-to-learning flows. Exercise representative long case sections and all rewritten
card bodies. The Sun/editorial validators remain active, not weakened to accommodate scope.

The scope checker compares with the frozen base and rejects changes outside a narrow list
of content/renderer/catalog/test files. It separately verifies all 77 cards' identity and image
provenance. This guard complements full HTTP/browser tests; it is not a substitute for them.
