# One suit dominates: QA, 2026-10-31

New slug **when-one-tarot-suit-dominates**, base main `f9eead1d7df1089e18a35bd74a3e155d1b8c8fe2`, branch `codex/tarot-suit-patterns-20261031`. This is a new, independently justified cross-card method; it does not reopen the October26 connection draft, PR44 journal or October29 Four Fours branch. Existing published content is preserved, not replaced by another court-card identity tutorial. Only the new EN/ZH article is registered; one existing-topic assignment makes it discoverable. No product, layout, package/lockfile, account/security, share-image or unrelated-project change.

## Passed on final content

- Production Next build passes (build.log). Initial review found ambiguous English “Three Swords”/Chinese description wording; corrected to explicitly mean three cards of the Swords suit, then rebuilt before final UI/HTTP checks. Content is frozen at the final version.
- Standalone TypeScript passes (typecheck.log), after build. Scoped existing `eslint.english.config.mjs` passes for lib/journal-tarot-suits.ts, lib/journal.ts, lib/journal-topics.ts, lib/journal.test.ts, lib/tarot-suits.test.ts and scripts/check-tarot-suit-patterns.mjs (lint-scoped.log). No disabled rules.
- Five new meaningful regressions pass: EN/ZH authored scope/canonical/reciprocal URLs/schema/sitemap; synchronized six-section content structure; three actual tool position labels in case order and localized links to the three existing card articles; topic directory discovery/unsupported-edition exclusion; exact bytes of18 previous published files and verified source page pairs. Old-file hashes independently checked against the pinned base.
- Full JSON-schema/source validator passes all16 retained complete editorial editions and original hashes (editorial-validation.log), using actual jsonschema4.25.1 in a new isolated /tmp target. This checks the preserved editorial collection; new article data is independently typed and has the regressions/HTTP checks above.
- Complete EN/ZH Markdown manuscripts match every current JSON paragraph, section title, table cell, step and authored link (manuscript-validation.log); file hashes recorded in source-review.json.
- Final local production HTTP: both complete authored editions, all six section/TOC anchors, every paragraph/table/step/source/link, uniqueH1, canonical, only reciprocal EN/ZH plusx-default, Article and sitemap October31 dates, two permanent unsupported RU/TW redirects, both journal-directory listings and **14 internal destinations/fragments** pass (http-local.json/log).
- Actual IAB EN/ZH at320×568,390×844,1440×900: six sections, complete3-column/3-data-row scale table, no document horizontal overflow or broken images (responsive-local.json). Desktop EN and mobile ZH table screenshots were visually inspected and are legible without clipping. EN/BackZH/ForwardEN shows correct H1/main language.
- Actual mobile ZH new-article action link→localized tarot table→shuffle→place3→reveal3→free Eight of Cups meaning dialog, at390px without overflow. The random draw is not the prearranged teaching example. Question remained empty; no AI request, account save or payment.
- Actual desktop EN new-article action link→/tarot: defaultthree and all three real position labels/order, no overflow. This was an entry/position check; a second desktop full draw is not claimed.
- Root and source agent visually reread all4 local PDF pages193–196 and verified printed194–197. Original source size, mtime and full SHA256 match the prior ledger. No book/scan uploaded or tracked. Writing/translation and independent source/copy review are model-assisted, not native-human/expert certification.
- Independent review found only the card-name ambiguity above, corrected in JSON and readable manuscripts. No remaining source/copy blocker. `git diff --check` passes.

## Baseline failures, recovered checks and untested scope

- **Full suite is not green.** Baseline346 passed/6 failed/352 total; current351 passed/6 failed/357 total; both zero skipped. Exact six historical failure names match (baseline-comparison.json). No historical failing assertion, expected hash or case was removed/rewritten/skipped.
- Initial current run had an extra failure: the old bilingual-inventory guard listed only the three older bilingual articles. Its explicit allowlist now includes only this newly authored two-language slug; the existing “all other editions remain four” assertion is retained, and the new article's authored scope is independently tested. Initial result retained (tests-initial-language-inventory.log).
- Root npm run lint still exits2 because main lacks default eslint.config.* (root-lint.log). Relevant scoped lint passes. No unrelated lint migration performed.
- The old October26 temporary jsonschema directory imported an incomplete namespace with no validate function. Initial dependency error retained (editorial-validation-initial-dependency.log). Restored known jsonschema4.25.1 in /tmp/dpx-editorial-validation-20261031, then reran the entire validator successfully. No project/system package modification and no validation skip (validation-dependency.log).
- Browser viewport tests are not physical phones or native Safari/Firefox. No drag gesture, AI, account persistence or paid flow test. Private Vercel access previously denied in other work is not retried. Public source web extraction failed internally for the site's existing pages; actual Mac IAB successfully verified the representative existing Page of Pentacles page. Waite's three primary entries were read successfully via web.
- The source supports a symbolic discussion of present experience; it does not establish personality measurement, predictive accuracy or missing-suit diagnosis. Count/absence rules, scale table and exhibition case are original site teaching. No paper claims human review.
- Exact branch CI/deployment and public production acceptance are subsequent steps, recorded in the final release report/PR. A local build or push is not called live.

## Replay

```sh
npm run build
npx --no-install tsc --noEmit --pretty false --incremental false
npx --no-install eslint --config eslint.english.config.mjs lib/journal-tarot-suits.ts lib/journal.ts lib/journal-topics.ts lib/journal.test.ts lib/tarot-suits.test.ts scripts/check-tarot-suit-patterns.mjs
node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts
PYTHONPATH=/tmp/dpx-editorial-validation-20261031 python3 scripts/validate-tarot-editorial.py
node --import tsx scripts/check-tarot-suit-patterns.mjs http://127.0.0.1:3052
```

For public production, reuse the HTTP checker with the formal origin and an output file outside the repository. Correlate its HTML deployment ID to the exact merge SHA's successful status; also verify actual EN/ZH article-to-tool entries. Save release evidence outside the git tree to avoid another deployment just for evidence.
