# Tarot bottom-deck prototype

Base: `d88beddb979836766d38167fc964d7bedc10bcf8` (`origin/main`). Branch: `codex/tarot-bottom-deck-20261007`. Latest-main fetch confirmed the same base; no integration overlaps. PR16's released topic pages and 60 Day Pillar articles in four languages are inherited intact.

## Result

Both free-table mode and all five structured spreads now share a compact bottom deck. The phone table is larger; the former two-row picker and its CSS are removed. Shuffle visibly scatters, mixes and gathers the remaining cards, with a reduced-motion alternative. Tap/Enter deals a face-down card; dragging follows the pointer and releases onto the table. Outside releases, pointer cancellation, resize and blur cancel transient movement safely. Free cards commit their coordinates on release, avoiding React state updates on every pointer move. Rotation remains an explicit 15-degree control; keyboard arrows remain available.

Tap a card to flip, then tap again for the simple localized explanation. The dialog adds a large artwork view and attribution, and Back/Escape/close retain the reading. Its optional detailed-reading action closes the dialog before focusing the question field. Reset and mode/spread changes still ask before discarding placed cards. Initial controls wait for hydration, including after document-history navigation.

The 78 existing RWS face files and own card back are unchanged. `lib/celestial/tarot-decks.ts` separates an artwork manifest from stable IDs and localized meanings. `public/tarot/attribution.json` continues to contain each Commons source (Pamela Colman Smith, Pam-A, TaionWC, accessed 2026-09-28). No new deck, uploader, notes backend or account requirement is introduced.

The reference images could not be materialized in this environment after a bounded retry. Implementation used the parent's documented observations from inspecting the screenshots; it does not copy their textures, icons or interpretation text.

## Verification

Node 22.23.3. Production build and TypeScript pass, with 259 generated pages. Existing Edge Runtime warnings remain.

228 repository tests pass when separated by runtime: 227 under `NODE_OPTIONS=--conditions=react-server`, plus the existing client-render test without that condition. The initial all-in-one command incorrectly applied the server condition to `react-dom/server`; rerunning that file in its required client runtime passed. Two new tests verify complete attributed artwork coverage and that custom artwork cannot change stable IDs or meanings.

Final production-build browser results:

- **32/32** Tarot mode/locale/viewport cases: free plus all five structured spreads, EN/ZH/ZH-TW/RU at 320/390/430/1440. Covers actual pointer dragging, real Chromium touch cancellation, outside release, repeated unique draws, flip/details/artwork/Back/Escape, return/redraw, 15-degree rotation, rejected/accepted reset and orientation changes. No browser runtime errors or horizontal overflow.
- **32/32** Tarot/Astrology topic cases, **16** focused-homepage cases and **84** unique linked destinations. Astrology uses synthetic inputs and the real local calculation API.
- **3/3** history sizes (320/390/1280), including native Back/Forward and synchronized spread/select labels.
- **8/8** celestial SEO editions, original canonical/hreflang/schema/sitemap; **284/284** journal article editions, including the 240 Day Pillar editions.
- Explicit detailed-reading CTA check: dialog closes and the question field receives focus. Original assets, article sources, homepage, page metadata and lockfile have no diff against the base.
- One final production-build headless Chromium 390×844 drag sample: 98 rAF intervals, median 16.7 ms, p95/max 16.8 ms, zero above 50 ms. This is a cloud-browser observation, not native-device performance certification.

Browser checks allow local calculations only; no paid AI, account, payment or analytics writes were made. The initial history harness exposed controls available before hydration; the final implementation fixes this and all history checks pass. Celtic Cross crossed positions are exercised through their visible labels and toolbar rather than forcing clicks through an overlapping card.

[Before](qa/tarot-bottom-deck-20261007/before-390.png) · [After](qa/tarot-bottom-deck-20261007/after-390.png) · [Free table](qa/tarot-bottom-deck-20261007/free-390.png) · [Shuffle](qa/tarot-bottom-deck-20261007/shuffle-390.png) · [Meaning](qa/tarot-bottom-deck-20261007/meaning-390.png) · [Artwork](qa/tarot-bottom-deck-20261007/artwork-390.png)

Draft PR: https://github.com/guangtoulee/destinypixel/pull/17

Preview: https://destinypixel-git-codex-tarot-bottom-deck-20261007-destinypixel.vercel.app/tarot?locale=zh

The Vercel GitHub status confirms successful deployment of implementation commit `a272e7d0f6ac138502f2126ca9f233f31d75f026` to the existing `destinypixel/destinypixel` project. This validation-note commit changes no runtime code. External authenticated Preview QA is blocked here: the protected-fetch connector returns 403 `forbidden` at `read_protection_bypass` because it lacks project/team authorization. The parent can use its authorized Vercel session. No protection setting was changed.

Reproduce with Playwright installed separately:

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-bottom-deck.mjs http://127.0.0.1:3012
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-topic-pages.mjs http://localhost:3012
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-tarot-history.mjs http://localhost:3012
npx tsx scripts/check-celestial-search.ts http://127.0.0.1:3012
npx tsx scripts/check-journal-search.ts http://127.0.0.1:3012
```

Use `NODE_PATH` if Playwright is installed outside the repo. Set `QA_EVIDENCE_DIR` for matrix screenshots. The local Astrology API expects Next.js's normalized `localhost` origin; using `127.0.0.1` for that POST correctly receives 403. No origin checks were relaxed.

## Deliberate limits

Double-tap dealing/revealing and two-finger rotation are staged; explicit tap/drag/rotation controls avoid gesture conflicts. There is no new deck-selection UI; the manifest is the extension point. Native iOS/Safari, Android WebView and WeChat packaging are not validated by Chromium. No production release, main push, protection change or unrelated app/algorithm/automation change is included.

## External QA corrections and artwork versions

The free table, bottom deck and essential controls now form one workbench sized to the available dynamic viewport, including safe-area space. This fixes the previous 650px desktop table pushing its deck offscreen. Phone reset controls and short-landscape deck instructions are compact; full instructions remain in a disclosure. The public topic/SEO content stays outside this workbench.

Card placement clamps the actual rotated rectangle with an 8px margin, including drag, keyboard movement, rotation and viewport changes. Card size adapts to the table's dimensions. A pure geometry test checks all corners for every 15-degree step at multiple table sizes and out-of-range positions.

Placement angle deliberately remains independent of reading orientation. The toolbar explicitly labels the angle, displays the current upright/reversed state, and provides a separate localized **Switch upright / reversed** action that updates the displayed face and meaning. A small tilt does not change interpretation; users can deliberately reverse the selected card without changing its ID or drawing again.

The enlarged viewer now has an **Artwork versions / 牌面版本** disclosure backed by the artwork manifest. It shows the current TaionWC historical RWS scan and its attribution. Only one sourced edition is currently registered; no commercial aliases, unavailable choices, recolored duplicates or advertising placeholders are presented. The component's artwork choice is local to the viewer and does not change the drawing deck or table. A second historical 1909 scan set remains deferred until all 78 individual sources and mappings are verified. No modern U.S. Games, Before/After/New Vision imagery was imported, and no historical articles were added.

The shared account-link helper now preserves `zh-TW` and `ru` rather than reducing them to `zh`/English. The saved-record viewer receives its actual locale too; no account operations were performed.

Additional QA script: `scripts/check-tarot-review-fixes.mjs`. It checks all four languages at 1165×747, 320×568, 390×844, 430×932 and 844×390; actual rotated bounds at all 24 steps; keyboard/drag containment; explicit reversal; artwork-view state preservation; and lower account-link locales.

Production-build correction checks passed in four languages: **20 viewport cases**, **480 actual rotation steps**, keyboard/drag bounds, selected-card reversal, single-edition viewer state preservation and account locales. The full repository test count is now **230** (229 server-runtime tests plus the separate client-render test). Updated evidence: [desktop workspace](qa/tarot-bottom-deck-20261007/workspace-1165.png), [phone workspace](qa/tarot-bottom-deck-20261007/workspace-390.png), [small phone](qa/tarot-bottom-deck-20261007/workspace-320.png), [edition/source disclosure](qa/tarot-bottom-deck-20261007/artwork-versions-390.png). Programmatic reading scrolls also honor reduced-motion preferences.
