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

Browser evidence and final deployment status are recorded below after final verification. Browser checks allow local calculations only; no paid AI, account, payment or analytics writes are needed.

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
