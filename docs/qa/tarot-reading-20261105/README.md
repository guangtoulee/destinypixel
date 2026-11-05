# King of Pentacles: actual verification scope

Base `c06f5d96327a59ad65f441fa4d012e209839fc54`; scope is one existing EN/ZH card article. Exact original records, separate current receipts, source/copy decisions and complete readable manuscripts are in `content/king-pentacles-update-20261105/`. All twelve original sections, two cases, fields, sources and links remain. Russian/Traditional Chinese bytes and October8 dates remain; only EN/ZH receive a thirteenth section and November5 modification date. Publication remains October7.

## Checks actually completed

- `npm run build`: pass, `build.log`.
- `npx --no-install tsc --noEmit --pretty false --incremental false`: pass, `typecheck-tests.log`.
- `npx --no-install eslint --config eslint.english.config.mjs lib/editorial-updates.ts lib/editorial-updates.test.ts lib/tarot-learning/learning.test.ts lib/king-pentacles-update.test.ts scripts/check-king-pentacles-revision.mjs`: pass, `lint-scoped.log`.
- Root `npm run lint`: still fails because no default ESLint9 configuration exists, `lint-root.log`. No unrelated config was added.
- Focused tests:11/14 pass, with the three already existing historical-date/receipt failures; their actual hashes as well as failure names match today's baseline. New3 regressions, the real all-card loader and current language/date checks pass, `tests-focused.log`. Old scopes/counts/hashes are not replaced.
- Full command `node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts`: baseline373 total/367 pass/6 fail; revised376/370/the same6 failures. Complete logs and `test-comparison.json` retain the comparison. The full suite is not green.
- With the existing isolated real jsonschema4.25.1 path: `PYTHONPATH=/tmp/dpx-editorial-validation-20261103 python3 scripts/validate-king-pentacles-revision.py` passes. It checks current JSON Schema, fixed previous/current file and complete-Markdown hashes, strict inverse projection of all12 old sections/fields/order/anchors, source-prefix preservation, one local-only null-URL book source, actual page pairs, three steps, manuscripts and unchanged RU/Traditional Chinese bytes/dates. No new dependency was installed.
- `validate-tarot-learning.py` and `validate-tarot-editorial.py` with the same Python path pass for all312 original card records and16 historical editorial editions. Existing Temperance, Celtic and other revisions remain intact; old approval receipts are immutable.
- Initial `py_compile` default-cache creation was blocked by the local filesystem boundary, not by a syntax error. Setting `PYTHONPYCACHEPREFIX=/tmp/tarot-king-validation-20261105/pycache` completed syntax verification successfully, without writing outside the task's allowed roots. Unrelated historical depth validators were not rerun or claimed as fresh passes.
- `node scripts/check-king-pentacles-revision.mjs [base] [output]` uses ordinary Node. `http-local.json` verifies all4 complete bodies against actual Markdown, all original sections/opening/quick takes, sources/schema citations, old anchors/TOC, canonical/four-language alternates, Article/sitemap dates and authored update notices. Actual `<ol>` plus3 `<li>` elements are checked in the new section. All13 internal destinations/fragments and both atlas entry links pass.

## Actual local browser work

Local production server `127.0.0.1:3057`. English and Chinese each tested at320×568,390×844,1440×900:13 sections, all3 ordered comparison steps, loaded original card image, no horizontal article/document overflow. `layout-local.json` contains all six observations. Both new TOC links reach `#resources-and-freedom`, with the visible heading about30px from the top once scrolling settles. English desktop and Chinese mobile screenshots show the source-attributed addition.

Both new inline tarot-table links actually navigate to the matching-language tool; AX receipts are `tool-local-en.txt` and `tool-local-zh.txt`. The exercise deliberately chooses two study images and does not promise that pair as a tool result. No forced draw, new preset or user account data was used. Product code is unchanged.

These are actual browser viewport checks, not physical mobile devices, Safari/Firefox, VoiceOver or a complete accessibility audit. Back/Forward, a new random draw, AI, login/account persistence and payments were not tested. Production runtime/monitoring audits are outside these checks.

The source book was read only at actualPDF286–287/printed287–288 this round; no whole chapter/book reading is claimed. The beginner-skill exercise is explicitly our own application, not equivalent to Pollack's inward freedom or her crossed-spread/two-person examples. Independent AI assistant source/copy and test reviews were used; no human expert review is claimed. The original PDF remains unchanged and unuploaded.

Before commit, public logs are made repository-relative and trailing terminal whitespace is removed; raw evidence remains outside the repository. No book scan, private path, credential or account state belongs in the public change. Production release evidence separately identifies the PR, exact merge/deployment mapping and complete public bodies/tool-entry clicks; local success alone is not a live release.
