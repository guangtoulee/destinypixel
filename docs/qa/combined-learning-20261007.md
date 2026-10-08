# Combined Tarot and hexagram libraries

PR22 is explicitly stacked on PR21, with a history-preserving merge on `codex/hexagram-learning-library-20261007`.

- PR21/base dependency: `425593a043139a3b1d079f5ad055b9017fdbac8d` (`codex/tarot-learning-library-20261007`), unchanged and draft.
- Original hexagram parent: `a28ec5fc5e1548ce9cd4e868ca1b11e87c2ada72`.
- Main ancestry retained: `08a43050400818ea9e33622dd6cd7137fc4673c9`. Its `data/prompt-radar.json` blob remains exactly `d4bf97a4a3c3b4810ca1ffd9f590507c492a3d26`; no unrelated-app link or homepage change was introduced.
- PR22 remains draft. This is a combined protected Preview, with no production merge or protection bypass.

## Conflict resolution

The seven overlapping files were `app/journal/[slug]/page.tsx`, `app/journal/page.tsx`, `app/sitemap.ts`, `lib/journal.test.ts`, `lib/seo.test.ts`, `package.json` and `package-lock.json`.

The package changes were identical and merged automatically. The other five files now retain both article families: the slug router dispatches to each complete reader, static parameters include both sets, the journal index links day pillars/Tarot/hexagrams with contiguous schema positions, the sitemap includes both reciprocal language clusters, and metadata tests recognize both families.

Tarot records, readers, metadata and tool components match PR21 exactly. Hexagram records, readers and identity/cast modules match the original PR22 head exactly. No article text or source quotation was rewritten during integration. Casting, seed algorithms, APIs and source assets remain unchanged.

## Combined checks

- Both source validators pass: all 312 Tarot and 256 hexagram editions reconstruct their approved locale collections exactly and satisfy their schema, hash and source checks.
- Full repository unit suite passes: 239 server tests plus one separately run client test, 240 total.
- Fresh Node 22 production build and TypeScript pass: 404 route paths (260 released + 79 Tarot + 65 hexagram).
- `scripts/check-learning-integration.ts` passes all four languages: all three library links coexist, schema positions are contiguous, both tool entry points are present, and the journal sitemap has exactly 872 unique URLs (856 article editions + 16 index/directory editions).
- The initial index check detected stale schema ordering in an earlier build snapshot. The final resolved source was rebuilt and the integration check passes against that final production build.

- Full HTTP checks pass for all 312 Tarot editions, all 256 hexagram editions and all 288 released article editions. Source text, quotations, metadata, canonical/hreflang and sitemap checks all passed on the combined final build.
- Eight Tarot/Astrology tool editions and homepage/guide entry links pass.
- Tarot learning browser checks pass: 48 responsive views and four article/new-tab/cast-preservation workflows.
- Tarot bottom-deck regressions pass all 32 mode/locale/viewport cases, including all five spreads, reset, cancellation, card details/Back, rotation and orientation.
- Eight language/library paragraph samples are absent from all 218 client JavaScript chunks.
- [Combined Chinese journal screenshot](combined-journal-zh.png) was visually reviewed and shows all three directories together.

- Hexagram browser checks pass all 96 responsive views, all 64 directory diagrams, and four mobile Oracle/Back/new-tab flows with correct Tai/Pi/Jiji/Weiji links and retained casts.
- All eight sequential reduced-motion/animated deck-cycle cases pass, including keyboard focus, touch, cancellation and preserved mock readings.
- All combined checks completed successfully on the final production build; no test failure remains.

## Reproduction

Build with Node 22 and run the resulting app on the same host passed to these checks. React-server conditions belong only on server unit tests, never on the build or HTTP checks.

```sh
node --import tsx scripts/check-learning-integration.ts http://127.0.0.1:3027
node --import tsx scripts/check-tarot-learning.tsx http://127.0.0.1:3027
node --import tsx scripts/check-hexagram-learning.tsx http://127.0.0.1:3027
node --import tsx scripts/check-journal-search.ts http://127.0.0.1:3027
node --import tsx scripts/check-celestial-search.ts http://127.0.0.1:3027
node scripts/check-tarot-learning-browser.mjs http://127.0.0.1:3027
node scripts/check-hexagram-learning-browser.mjs http://127.0.0.1:3027
node scripts/check-tarot-bottom-deck.mjs http://127.0.0.1:3027
node scripts/check-tarot-deck-cycle.mjs http://127.0.0.1:3027
```

Browser checks use Playwright/Chromium, block external writes, and use local fixtures when testing existing interpretation UI. No paid AI call is needed. External protected Preview browser QA remains with the parent when a normal authenticated session is available; no bypass links are created.
