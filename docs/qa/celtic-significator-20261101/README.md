# Celtic Cross revision: verification record

Scope: existing `how-to-read-celtic-cross`, English and Simplified Chinese. One added section; every previous section and the separate journal article preserved. Independent source/bilingual review found no required prose changes. Full source and manuscript receipts are in `content/celtic-significator-20261101/`.

Committed command logs remove terminal carriage returns and trailing whitespace only. Raw originals remain in the local task's `tarot-celtic-qa-raw-20261101` directory; failures, counts and diagnostics are retained here.

## Automated evidence

- Production build: `npm run build`; see `build.log`.
- TypeScript: `npx --no-install tsc --noEmit --pretty false --incremental false` passes. Initial new-test inference errors are retained in `typecheck-initial.log`; explicit type annotations fixed them without changing assertions or product content.
- Scoped lint: `npx --no-install eslint --config eslint.english.config.mjs lib/journal-tarot-methods.ts lib/celtic-significator.test.ts lib/tarot-suits.test.ts scripts/check-celtic-significator.mjs` passes. No root lint configuration is invented for this content task.
- Root `npm run lint` does **not** pass: ESLint 9 cannot find `eslint.config.(js|mjs|cjs)`. The repository already supplies only the scoped configuration; see `root-lint.log`.
- Full test command: `node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts`. Unedited main baseline: **357 / 351 pass / 6 fail**. Revised tree: **362 / 356 pass / the same 6 fail**, compared by exact test names in `test-comparison.json`. These six historical people/date receipts are not fixed or hidden by this revision. Do not call the full suite green.
- After the final type-only annotations, the focused four-file method/journal/suit/Celtic subset passes **18/18**, including all five new regression tests; see `tests-focused.log`.
- The first revised run had one additional historical receipt failure because the suit-guide preservation test froze the whole methods containers forever. `tests-current-initial.log` preserves it. The test now verifies the original immutable receipt, unchanged other files, and a strict inverse projection of this separately recorded later section/date update. No receipt hash, baseline prose or product expectation was weakened.
- `editorial-schema.log`: all 16 preserved historical editorial editions pass schema, full-text and provenance checks. The real `jsonschema` package was loaded from the existing isolated temporary validation directory; no dependency manifest changed.
- `http-local.json`: both complete article editions (all paragraphs, titles, tables, sources, answer and TOC), canonical, language alternates, publication/modification dates, Article schema and sitemap pass. Both directory listings find the article, Russian/Traditional Chinese return 308 to English, and all **14 distinct internal destinations/fragments** pass HTTP/anchor checks.
- Full manuscript exports were compared against all 100 authored strings per language (title, opening answer, introduction, section prose, tables and source labels). Published file hashes match `revision.json`. `git diff --check` passes.

## Actual browser checks

Local production server at `127.0.0.1:3053`, using the in-app browser, not a dev build. Both languages were inspected at **320×568, 390×844 and 1440×900**. Every view has nine article sections, three tables (4, 11 and 3 rows including headers; three columns), and no article element outside the viewport horizontally. See `layout-local.json`; screenshots show the new table in Chinese mobile and English desktop views.

Actual TOC click reaches `#significator-and-positions`; English/Chinese language switching and browser Back return to the right article. Each article's existing action opens its matching-language tarot tool. That action retains the tool's default three-card choice; selecting the actual Celtic option reveals exactly ten named positions, with no separate significator slot. See `tool-local-en.json` and `tool-local-zh.json`. The Chinese mobile free flow also shuffled, placed and revealed one card, and opened its short meaning and detailed-article link. The AI button remained disabled. No question, personal data, account save, login, credit-based AI interpretation or purchase was submitted.

The browser's immediate snapshots occasionally lagged React animation; stable DOM observations and a subsequent snapshot were used before recording state. This was not treated as a content failure or a reason to change assertions.

## Boundaries and release status

These are actual browser viewport checks, not a physical iPhone, Android, Safari, VoiceOver or full accessibility audit. No paid/credit-based AI or account persistence flow was tested. Historical full-suite failures and root lint remain as listed above. This revision does not claim to fix them or measure traffic/revenue.

Branch/production deployment results are recorded separately after release, tied to the exact remote commit and public deployment ID. A successful local build or push alone is not production acceptance.
