# Celtic clarifier: actual verification scope

One existing EN/ZH article, `how-to-read-celtic-cross`, from main `3eff663caee2965c17139dc78f9e4b345eef1ff6`. Content/source notes, exact previous containers, current hashes and complete readable manuscripts are in `content/celtic-clarifier-20261104/`. All nine old sections, all original fields and the complete neighboring journal are retained. Only the Celtic modification date changes to November4; publication stays October23. Unsupported Russian/Traditional Chinese remain redirects.

## Automated verification

- `npm run build`: final pass, `build.log`.
- `npx --no-install tsc --noEmit --pretty false --incremental false`: final pass, `typecheck-tests.log`.
- `npx --no-install eslint --config eslint.english.config.mjs lib/journal-tarot-methods.ts lib/celtic-significator.test.ts lib/celtic-clarifier.test.ts lib/tarot-suits.test.ts scripts/check-celtic-clarifier.mjs`: pass, `lint-scoped.log`.
- Root `npm run lint` still fails because this repository has no default ESLint9 configuration, `lint-root.log`. No unrelated config was added.
- Focused historical/significator/suit/clarifier tests:13/13 pass, `tests-focused.log`. Original historical hashes, scopes and counts remain immutable. Today's addition and single date are strictly reversed before testing the preceding approved editions; the current complete loader, new source/table/link structure, filled ten-card preset rejecting an eleventh and current language/date boundaries are checked separately.
- Full command: `node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts`. Baseline370 total/364 pass/6 fail; revised373/367/the same six failures. All three new regressions pass. Both complete logs and the exact failure-name comparison are retained. The full suite is not green; old historical-date/receipt expectations were not replaced.
- Initial build/type checks caught type-inference errors in the draft historical test projections. Explicitly typed EN/ZH projections and a typed suit target corrected these; the test agent's first standalone run also required an explicit schema return type. No `any`/`unknown` bypass or weakened assertion was used. Root initial logs remain as `build-initial.log` and `typecheck-initial.log`; `typecheck-tests.log` records final standalone success. Final build was restarted after the test edits completed and passes.
- `node scripts/check-celtic-clarifier.mjs [base] [output]` uses ordinary Node. `http-local.json` checks each complete section/paragraph/table cell, old figures and source links, TOC/anchors, metadata/canonical/two-language alternates/schema/sitemap and dates. Each Celtic edition has10 sections,35 full paragraphs and4 tables. Both unchanged full journal editions, four unsupported-edition redirects,20 internal destinations/fragments, both original SVGs and discovery links pass.
- Separate unrelated card/depth Python validators were not rerun: this change edits no card record or historical approval manifest. Current method preservation and actual full HTTP output have dedicated tests above.

## Actual browser work

Local production build on `127.0.0.1:3056`. English and Chinese each tested at320×568,390×844,1440×900:10 sections, new3×3 decision table, all four tables contained within their wrappers, no horizontal document overflow. `layout-local.json` retains all six observations. English original SVG loaded; Chinese SVG initially remained lazy/offscreen. The actual original-layout TOC was opened, the figure loaded, and all three Chinese sizes were rechecked in `image-recheck-local.json`. This is a completed lazy-load check, not an erased initial observation.

Both new TOC links reach `#clarifier-job`; after scrolling settles the Chinese heading is about30px from the viewport top. English desktop and Chinese mobile screenshots retain the new text. Both new inline tarot-table links actually navigate to the matching-language tool. AX records are in `tool-local-en.txt` and `tool-local-zh.txt`. No fake eleven-card preset, forced draw or mode-switch preservation is claimed. The source and a real filled-ten-state test confirm the ten-slot boundary; switching mode's reset behavior was independently checked in the actual implementation, not exercised with a user's saved table.

These are actual viewport checks, not physical phones, Safari/Firefox, VoiceOver or a full accessibility audit. Back/Forward, a new random draw, AI generation, login/account persistence and payment were not tested. Product implementation is unchanged.

Independent source/copy and test reviews found no remaining blocker after the novice-warning and limit-attribution refinements. The book's actual cited page is PDF348/printed350; the method reading scope is explicitly recorded and is not the entire book. Before/after size, mtime and SHA-256 checks preserve the original source. No book scan or private file is included.

Before commit, terminal/AX trailing whitespace and absolute private repository prefixes are removed from public QA only. Raw local evidence remains outside the repository. Commit identity uses the already verified public GitHub noreply identity. Published receipts and article content are not altered by log cleanup.

## Release

Build/push alone do not establish a live revision. Draft PR, exact-head checks, ordinary merge, final production deployment/commit mapping and full public body/tool-entry checks are recorded separately after completion. No PR approval operation or previously blocked article publication is part of this revision.
