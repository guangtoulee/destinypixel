# Tarot tactile table — local review

Baseline: `6302f4d58a57fb5df0c9ebe20e32ee494ace7367` (latest fetched `origin/main`, 2026-10-08).
Branch: `codex/tarot-tactile-table-20261008`.
Local production build: `http://127.0.0.1:3042/tarot?locale=zh`.

## Review the result

- [360px table](zh-360-table.png), [390px table](zh-390-table.png), [430px table](zh-430-table.png), [desktop table](zh-1440-table.png)
- [Revealed cards](zh-390-revealed.png), [meaning dialog](zh-390-meaning.png), [Russian mobile table](ru-360-table.png)
- [Mobile atlas](zh-390-atlas.png), [desktop atlas](zh-1440-atlas.png)
- [Mobile article](zh-390-article.png), [desktop article](zh-1440-article.png), [mobile contents](zh-390-contents.png), [desktop reading](zh-1440-reading.png)
- [Russian basics article](ru-390-guide.png)

The actual deck, card selection, reveal and meaning dialog form the main interaction. On phones the deck and explicit Shuffle/Place controls precede the spread. The desktop places the deck beside the spread. Drawing brings an offscreen position into view. Free-table dragging, rotation, reversal, card return and deck cycling retain their existing state logic.

The four-language navigation connects the table, 78-card atlas and existing three-card reading guide. The three educational articles share the tarot header and quiet reading surface. Other tools remain reachable through secondary navigation. New visual work uses scoped CSS and existing artwork/SVG; no new dependencies, backend or AI calls.

## Verification

- Production build and standalone TypeScript: passed.
- Changed-file lint: no errors; one existing `no-img-element` warning for the interactive card face.
- Existing unit/API tests: 243 passed; account sandbox checkout test: 1 passed.
- New interaction check: all 16 locale/viewport combinations at 360, 390, 430 and 1440px passed. Includes touch, keyboard focus, primary 44px targets, reduced motion, unique draws, reshuffle preserving results, reset cancellation/confirmation, meaning-to-full-article, atlas/guide links and Back/Forward. See [interaction-report.json](interaction-report.json).
- Existing deck checks: 32 free/spread combinations; all five spreads in all four languages at those widths. Deck cycling checked in both motion preferences. Additional 320px and short landscape checks passed, including 480 rotation steps, keyboard/drag boundaries, explicit reversal, source viewer and account locale links.
- Full HTTP content regression: 312 tarot learning editions, 256 hexagram editions and 300 original journal editions. Canonical, hreflang, sitemap, source text and internal links passed. Combined journal sitemap has 884 unique article/index editions. The revised 308 card editions and all 16 Sun/education editions also passed exact-content checks.
- Eight astrology/tarot tool editions retained server-rendered guides, schema, metadata and working entry links. The search check now expects the new localized tarot heading; other assertions remain intact.
- Complete long-article browser results are recorded in [articles/report.json](articles/report.json): 77 cards × four languages × mobile/desktop, with exact full sections, both cases, sources, legacy anchors and history workflows.

HTTP checks inspect server-rendered content directly. Browser checks block non-GET requests; no AI generation, account write, payment or analytics write is needed to exercise the learning flow. Screenshots were visually inspected for full card faces, clipping, mobile navigation and reading layout.

## Reproduce

```sh
npm run build
npx tsc --noEmit --incremental false
npm run start -- -p 3042
node scripts/check-tarot-tactile-browser.mjs http://127.0.0.1:3042
QA_WIDTHS=360,390,430,1440 node scripts/check-tarot-bottom-deck.mjs http://127.0.0.1:3042
node scripts/check-tarot-deck-cycle.mjs http://127.0.0.1:3042
node scripts/check-tarot-review-fixes.mjs http://127.0.0.1:3042
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-history.mjs http://127.0.0.1:3042
QA_EVIDENCE_DIR=docs/qa/tarot-tactile-20261008/articles node scripts/check-tarot-depth-four-language-browser.mjs http://127.0.0.1:3042
node --import tsx scripts/check-tarot-depth-http.tsx http://127.0.0.1:3042
node --import tsx scripts/check-tarot-learning.tsx http://127.0.0.1:3042
node --import tsx scripts/check-tarot-editorial.tsx http://127.0.0.1:3042
node --import tsx scripts/check-hexagram-learning.tsx http://127.0.0.1:3042
node --import tsx scripts/check-journal-search.ts http://127.0.0.1:3042
node --import tsx scripts/check-learning-integration.ts http://127.0.0.1:3042
node --import tsx scripts/check-celestial-search.ts http://127.0.0.1:3042
node --conditions=react-server --import tsx --test 'lib/**/*.test.ts' 'app/**/*.test.ts'
node --import tsx --test components/admin-sandbox-checkout.test.ts
```

## Scope and release boundary

No article content files, cases, source appendices, URL mappings, locale mappings, metadata generators, sitemap logic, draw algorithms, oracle logic, account/payment/analytics code, dependencies, environment variables or deployment settings changed. Shared rendering edits are conditional on tarot/education; the other journal and astrology rendering paths are retained.

This is a local reviewable change only. The branch has not been pushed, no public Preview/PR was created, and production was not merged or deployed. A public review would require pushing this branch and creating a PR/Preview under the user's next authorization. Production release remains outside this round's scope.

The build reports existing Edge Runtime deprecation warnings. Browser verification here uses Chromium; it is not an external browser QA or a real-device Safari pass.
