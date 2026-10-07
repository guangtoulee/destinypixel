# Tarot bottom-deck prototype

Branch: `codex/tarot-bottom-deck-20261007`. Draft [PR17](https://github.com/guangtoulee/destinypixel/pull/17). Integrated main: `ef4ef44dc9260a89edb5860c83e77e2b7c1f245c`.

Main integration was inspected before merging: PR18 (`056d3ee`, nine files) and PR19 (`ef4ef44`, ten files) each had zero overlapping files with this branch. Both merged cleanly. Their biography, images, sources, schema and topic links are preserved unchanged. The released Tarot/Astrology topics and 60 Day Pillar articles in four languages remain intact.

## Current behavior

Free-table mode and all five structured spreads share a compact bottom deck. The workbench fits the dynamic viewport, including phone safe areas and short landscape layouts. Shuffle visibly scatters and gathers the remaining cards; reduced-motion preferences are honored. Tap/Enter deals; dragging onto the table places the current top card. Rotation clamps the actual card corners inside the table. Physical angle and reading orientation remain independent, with an explicit upright/reversed action.

Lifting a card from the bottom deck and returning it onto that deck now tucks it beneath the stack and advances the actual queue once. The next card becomes available without changing the remaining count, orientations, placed cards, question or completed reading. The two-part motion flies toward the stack and tucks behind its front cards. Reduced motion advances immediately. ArrowDown on the focused deck offers the same action and restores focus after motion.

An intentional lift means at least 24px upward travel or more than 36px total travel. The return target is the stack with a 10px touch margin. Tiny drag jitter, outside releases, pointer cancellation, lost capture, resize and pre-release blur preserve order. Interrupting the animation after a valid completed release preserves that one committed action. Empty and single-card queues cannot cycle.

The enlarged viewer has no **Artwork versions / 牌面版本** control or expanded single-edition block. It retains the original card image, meaning/artwork views and compact source attribution. Back/Escape/close, reset, spread changes, reading state and four-language account links remain intact. Any future licensed-deck preference belongs in global settings, not this dialog; no selector, new assets, login requirement or backend was added. All 78 existing RWS images and their provenance are unchanged.

## Verification

Node 22.23.3. Production build and TypeScript pass with 260 generated pages. The full server suite passes 231 tests, plus the separate client-render test: **232 passed**. The initial PR18 biography source assertion also failed on pristine main; PR19 supplied its missing sources, and the final suite passes without any branch-authored biography edit or weakened assertion.

Production-build browser checks:

- **8/8 new cycle cases:** EN/ZH/ZH-TW/RU × normal/reduced motion. Actual mouse and Chromium touch return gestures, full 78-card identity tour, queue uniqueness, behind-stack layers, keyboard focus, repeated drops, cancellation, interruption, jitter, existing-reading preservation, structured dealing and removal of version UI. The reading response is an intercepted local fixture; no paid AI request reaches the server.
- **32/32 Tarot workflow cases:** four languages at 320/390/430/1440, free mode plus all five spreads, real touch cancellation, repeated unique draws, flip/details/Back, return/redraw, reset and orientation.
- **20 layout cases / 480 rotation steps:** 1165×747, 320×568, 390×844, 430×932 and 844×390; keyboard/drag containment, explicit reversal, viewer-state preservation and account locales.
- **3/3 history sizes:** 320/390/1280, native Back/Forward and synchronized spread labels.
- **8/8 tool SEO editions** and **288/288 article editions**, including all 240 Day Pillar editions: canonical, reciprocal language links, schema, sitemap and linked destinations.

The Tarot runtime/browser checks above ran after PR18 integration; PR19 changed only article/product context and guide links. After PR19 integration the full unit suite, build and affected article/tool HTTP checks were rerun. No Tarot runtime code changed between these checks.

[Deck lifted](qa/tarot-bottom-deck-20261007/deck-lift-390.png) · [Tuck motion](qa/tarot-bottom-deck-20261007/deck-tuck-390.png) · [Compact source](qa/tarot-bottom-deck-20261007/card-source-390.png) · [Desktop workbench](qa/tarot-bottom-deck-20261007/workspace-1165.png) · [Small phone](qa/tarot-bottom-deck-20261007/workspace-320.png)

These are locally captured implementation screenshots, inspected during QA. The four Library references resolved to `IMG_3530.jpeg`, `IMG_3531.jpeg`, `IMG_3532.jpeg` and `IMG_3533.png`, but current-helper materialization failed on the initial attempt and one fresh supported retry. No reference pixels were locally inspected. The implementation follows the owner's explicit gesture/queue requirements; the parent's reference observations were supplementary.

## Preview and remaining limits

[Protected Preview](https://destinypixel-git-codex-tarot-bottom-deck-20261007-destinypixel.vercel.app/tarot?locale=zh), on the existing `destinypixel/destinypixel` Vercel project. Final exact-head deployment status is reported in the handoff.

External authenticated Preview QA requires the parent's authorized Vercel session: this environment's protected-fetch connector and network proxy previously returned 403. Protection remains enabled. Native iOS/Safari, Android WebView and WeChat packaging are not validated by Chromium. Double-tap dealing and two-finger rotation remain deferred. No production release, main push, paid AI, account/payment write or unrelated app/algorithm/automation change is included.

Reproduce with Node 22 and Playwright installed separately (`NODE_PATH` if needed):

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-deck-cycle.mjs http://127.0.0.1:3019
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-bottom-deck.mjs http://127.0.0.1:3019
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-review-fixes.mjs http://127.0.0.1:3019
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-history.mjs http://localhost:3019
npx tsx scripts/check-celestial-search.ts http://127.0.0.1:3019
npx tsx scripts/check-journal-search.ts http://127.0.0.1:3019
```

Use `NODE_OPTIONS=--conditions=react-server` only for server-runtime tests, never globally or for build. The separate `components/admin-sandbox-checkout.test.ts` requires the client runtime. Local Astrology POST checks must use Next.js's normalized `localhost` origin; security checks are unchanged.
