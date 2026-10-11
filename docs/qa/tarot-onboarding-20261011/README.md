# Tarot first-visit onboarding, 2026-10-11

Baseline: main `9319be921929c8e1327850afb9328ff7e73fdfa2`. Browser evidence uses a local production build, fresh contexts, actual Chromium with phone/touch viewports. Non-GET/HEAD, external requests and analytics scripts were blocked. No AI, account, save or payment backend was exercised.

## Findings and bounded changes

| Observed issue | Before | After |
| --- | --- | --- |
| Start action below the fold on a narrow phone | English 320×740 Shuffle y=757.27–801.27; Chinese y=724.77–768.77 | English y=677.88–721.88; Chinese y=645.38–689.38, both fully visible |
| Free/no-account scope absent from the visible hero | Decorative introductory line; free card meanings explained farther down | One existing hero line now says cards and meanings are free without sign-up, with equivalent copy in four languages |
| Completed spread restart hidden in settings | All three cards revealed, settings closed, reset not visible | Existing confirmed reset exposed beside card controls only for a complete revealed spread |

The existing deck helper now names revealing and reading a card after placement. This is a clarity improvement, not a previously broken draw function. The same reset function still asks for confirmation. Declining preserves all card identities; accepting restores all 78 cards and disables drawing until another shuffle.

Only short-phone **empty spread** spacing/fan dimensions change (width ≤740px, height ≤760px). The illustrated mountain/lake scene, full fan, ambient animation, independent tarot navigation, card artwork/source links and PR26 lazy-loaded save panel remain. The 390×844 and desktop fan sizing stays unchanged. A 320×568 screen still requires scrolling; this PR does not promise every control fits every viewport.

## Validation

- Production build and TypeScript: pass, 417 generated pages.
- Scoped ESLint: zero errors; one pre-existing `no-img-element` warning for card artwork.
- Existing celestial/deck/layout tests: 17/17 pass; AI parsing tests use local fixtures, not the provider.
- `check-onboarding.cjs`: 14/14 production browser cases (four languages × 320×740, 390×844, 1440×900; English/Chinese 1280×720). Each checks visible start/free scope, loaded landscape, three navigation links, state-specific helper, three unique cards, corresponding card article HTTP 200, dialog Back, cancelled reset, confirmed reset, and zero horizontal overflow/runtime errors.
- Reduced-motion and normal-motion browser contexts are included. No tracking or API payload changed.
- The existing bottom-deck test's return selector now selects titled card controls, so the newly visible restart is not mistaken for Return to deck.

Reproduce the focused check with an installed Playwright at the recorded environment path:

```sh
node docs/qa/tarot-onboarding-20261011/check-onboarding.cjs http://127.0.0.1:3041 /tmp/tarot-onboarding-qa
```

## Existing rapid-input issue, explicitly unresolved

The broader bottom-deck check hit its rapid free-table `Enter → click → click` assertion (expected 3 cards, received 2). Serial diagnosis reproduced this on baseline main as well as the candidate. Event logs show the inputs reaching an enabled deck before the previous React state commit; `draw()` reads the previous rendered table, so a very fast second input may replace the first state update. Waiting for each card to appear yields 1→2→3 on both versions. Waiting is **not** a fix for lost rapid input.

This small PR leaves the pre-existing free-table state update mechanism intact. The evidence is in `free-rapid-input.json`. Ordinary card-by-card operations, meanings/Back and confirmed reset pass; no claim is made that the rapid-input check passed or that all AI/account functionality was tested.

## Release verification

The exact PR/main Vercel status and public verification limitation will be recorded in the PR after merge. This environment's proxy rejects public DestinyPixel and preview URLs with CONNECT 403; local production checks alone do not prove the live release. The parent thread can independently check the deployed page.
