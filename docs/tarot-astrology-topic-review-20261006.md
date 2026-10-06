# Tarot and Astrology topic pages — 2026-10-06

## Integration and scope

Recovered the work from GitHub, with a clean working tree:

- Fetched main: `204a2bfa6c935949c0663a337e01001fccf84e58`.
- Original PR16 head: `884b2441027f202bdebfe8bcc8a29db1160b21dd`.
- Common ancestor: `e72bf852c35fb23a25e74f8686b83c6e552fa2a6`.
- Main changed only `data/prompt-radar.json`; the PR changed 86 separate files. File overlap: **none**. `git merge-tree` reported no conflicts; integration commit `a8a21f1` preserves both sides.
- No repository `AGENTS.md` or `.agents/skills` exists in the fetched branch.

The existing `/tarot` and `/astrology` routes now participate in the shared topic navigation. Each page keeps its primary interactive tool, existing detailed usage explanations and FAQs, adds a localized primary-tool anchor and three relevant guide cards, and places links to all other main-site functions below. Navigation includes all six topics; the homepage still has its original four editorial cards.

New copy supports English, Simplified Chinese, Traditional Chinese and Russian. Traditional Chinese follows the existing conversion helper. The all-function links use the existing main-site directory, plus the Day Pillar editorial hub, exclude the current tool, retain the full birth-report `#report` anchor, and preserve locale parameters. Prompt Radar, script/image/English apps are not included.

The Day Pillar article sources, algorithms, Tarot/Astrology tool components, account/history/reset implementations, original route metadata and canonical/hreflang definitions have no diff against `884b244`. No PR11/12/14 content was imported. No production release, main push, new Vercel project, database, account/payment write, paid AI request or automation change is part of this work.

## Validation

Node `22.23.3`; installed repository dependencies and lockfile retained. Temporary browser tooling was installed outside the repository with the official npm registry.

- 221 unit/content/security tests passed. `NODE_OPTIONS=--conditions=react-server` was scoped to the test command only. The new link-contract test was rerun after correcting its TypeScript fixture.
- Final production build, TypeScript and 259 generated pages passed. After the button-contrast and directory-spacing fixes, all 32 final layout checks passed; 48 final screenshots were captured and representative desktop/mobile screenshots were visually inspected.
- Chromium: **32/32** cases — Tarot/Astrology × EN/ZH/ZH-TW/RU × 320/390/430/1440. Checks cover tool anchors, six-topic navigation/current state, guide cards, all 11 other-function links, language retention, actual cross-topic clicks, page overflow and runtime errors.
- Tarot: select a spread; shuffle; draw/reveal; open/close card detail; return/reset; native history return; select another spread after restoration.
- Astrology: submit synthetic birth data to the real local calculation API; verify ten placements; switch houses/aspects/planets; select a planet.
- 16 homepage viewport/language checks retain four feature cards. 84 unique linked destinations return HTTP 200.
- Existing `check-tarot-history.mjs`: 3/3 sizes (320/390/1280), including Back/Forward.
- Existing search checks: all 8 celestial editions, canonical/hreflang/schema/sitemap and usage text; all 4 homepage editions; all **284 article editions**, including **240 Day Pillar editions**; 4 pillar collections and all 60 live JPEG cards.
- `git diff --check` passed. There is no repository-wide ESLint configuration; no claim of a global lint pass is made.

Browser mutation interception permits only same-origin astrology calculation requests. AI interpretation, account and payment writes are blocked. Next.js normalizes the local request origin to `localhost`; the harness uses that hostname. Cross-origin requests remain rejected with 403. No security checks were weakened.

Reproducible browser check (with Playwright available through `NODE_PATH` if installed separately):

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/check-topic-pages.mjs http://localhost:3002
```

Set `QA_EVIDENCE_DIR` to save screenshots. The full test includes final button-contrast and directory-spacing assertions.

## Preview and review boundaries

Push only the existing `codex/day-pillar-editorial-20261005` branch to trigger the existing `destinypixel/destinypixel` Preview. Keep PR16 a draft. The branch alias is:

https://destinypixel-git-codex-day-pillar-editorial-8bb4d1-destinypixel.vercel.app

The connected Vercel API returned 403 for the `destinypixel` team scope. Direct Preview access from this environment also failed at the outbound CONNECT proxy with 403 (no HTTP response from the application). Protected external Preview QA needs the parent's authorized Vercel login; deployment protection remains enabled. Chromium coverage does not establish Safari/WebKit coverage. Russian text has not had an independent native-speaker review.

Recorded results: [QA evidence](tarot-astrology-qa-20261006.txt). Screenshots are retained under `/tmp/destinypixel-evidence` in the execution environment.
