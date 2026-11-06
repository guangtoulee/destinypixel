# Two of Swords revision: verification scope

Base `d8e059ed1a895e409c625865b64909126566dd82`. One existing card article is revised in English and Simplified Chinese. All eleven prior sections, two cases, original source receipts, opening, title, image, anchors, URLs and links are retained. The new `armed-truce` section and fresh online-source receipt are additive. Only EN/ZH modification dates become November6; publication remains October7, and RU/Traditional Chinese bytes and October8 dates remain unchanged.

## Source and independent review

The complete [online Waite Two of Swords entry](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-swords) was actually read, including its qualification of harmony in an armed state. Wikisource PartIII reproduces the same passage. The historical original.sacred-texts link redirects to the canonical chapter. All four prior source destinations and the new source were opened successfully with the web tool. The unchanged on-site WebP was visually inspected: one blindfolded figure holds both swords. No new image was added.

The mutual-pause checklist, deliberately chosen study card, fictional exhibition-poster case and unanswered-message counterexample are explicitly original editorial applications. No new Pollack book passage, private scan, printed-page claim, substantial quotation or human review certification appears. Personal Context returned unavailable; repository-held historical records remain historical. Independent AI assistant source/copy and technical reviews found no blocker. The final small English wording improvement was applied before the successful final build.

## Automated checks

- `npm run build`: final stable build passes, 427 static paths, with the existing Edge Runtime deprecation/static-generation warnings. `build-initial.log` retains the first successful compilation that produced stale output during concurrent source edits.
- `npx --no-install tsc --noEmit --pretty false --incremental false`: passes. Initial new test projection typing error TS2339 was corrected with an explicit record type; its diagnostic and resolution are preserved in `typecheck-initial.log`.
- Scoped ESLint passes for the changed TypeScript/test/browser files using the existing `eslint.english.config.mjs`. Root `npm run lint` still fails for the missing default ESLint9 config, identical to baseline; no unrelated configuration was added.
- `PYTHONPYCACHEPREFIX=/tmp/two-swords-pycache python3 scripts/validate-two-swords-revision.py`: passes current JSON Schema, independent fixed-base/current file and full-Markdown hashes, strict inverse projection of the complete old records, parallel bilingual paragraph/three-step/link structure and unchanged RU/Traditional Chinese records. Historical provenance is not relabelled as new approval.
- `validate-tarot-learning.py` and `validate-tarot-editorial.py`: pass all312 original records and16 historical editorial editions using separate current-revision checks. The old `validate-tarot-depth-content.py` still fails at its line174 Markdown equality assertion, identically before/after this change; this is the previously documented Chinese Death historical mismatch. It is not claimed green.
- Full tests, `node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts`: baseline376 total /370 passed /6 failed; revised379 /373 /the same6 failures. `test-comparison.json` verifies every failure name and all12 actual/expected values are identical. No frozen expected hash, test assertion or scope was removed to conceal these failures. The full suite is not green.
- `git diff --check`: passes. No dependencies, product logic, routing, account or security settings changed.

## HTTP and real browser checks

`scripts/check-two-swords-revision.mjs` checks all four full article bodies against the actual source Markdown, opening/quick takes, 12/11 sections in exact order, old anchors/TOC, sources/schema citations, self-canonicals/four-language alternates/x-default, original publication and actual language-specific modification/sitemap dates. All17 internal destinations and both atlas entry links pass locally (`local-http.json`).

The first HTTP run correctly rejected stale English wording, and the first browser run rejected an absent editorial-update marker. Both failures remain in the `initial-stale-*` receipts. The server was stopped, all stable source files rebuilt, and the production server restarted at `127.0.0.1:3058` before the final passing checks. The earlier output was never accepted as final.

The first browser run against the stable build also exposed a test expectation error: the shared `lib/document-locale.ts` policy intentionally uses `zh-CN` on the document, while the article's server-localized main and reciprocal hreflang use `zh-Hans`. The browser assertion was aligned with that existing policy, with the original failure retained in `initial-language-tag-expectation.*`; no product code changed. The corrected scripts passed scoped ESLint again (`lint-browser-final.log`).

`scripts/check-two-swords-browser.mjs` uses installed Chromium151 at EN/ZH320×568,390×844 and1440×900. Its evidence records complete section text, loaded card images, horizontal fit, new TOC anchor, language/history metadata, keyboard inline tool entry and ordinary local free draw/reveal/meaning workflows. External/non-GET requests are blocked; these are real browser viewport tests rather than physical-device tests. The final browser report and screenshots define the completed scope.

## Release and remaining limits

The cloud shell and generic web tool cannot access the formal domain: shell received proxy `CONNECT403`, and web open returned inaccessible. No proxy bypass or security setting change was attempted. The authorized official Vercel connection successfully fetched the canonical production page with HTTP200 and exposed the exact active production deployment/commit. Production content verification therefore uses that connector, separately retaining real status/URL/time/deployment evidence, and replays the same full-body assertions against captured HTML. Snapshot replay fails on missing captures and never substitutes a network success claim.

The release receipt is recorded separately after the exact PR head is merged and its production deployment is READY. Direct production browser execution, physical phones, Safari/Firefox, assistive technology, AI generation, login/account persistence, payments and a broad runtime/monitoring audit are not claimed as tested. No indexing, ranking or traffic outcome is claimed.
