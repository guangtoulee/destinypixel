# Four-section review — 2026-10-05

The homepage is now a short gateway to Day Pillars (`/discover`), fortune sticks (`/sticks`), relationships (`/compatibility`) and bracelet design (`/atelier`). Existing routes remain in place. The large inline character card keeps the existing accessible viewer and Back/Forward behavior. The birth-report form is retained in an expandable section, including the existing `#report` date handoff and validation.

Each section has localized cross-section navigation and three focused article links, with `/tools`, `/journal` and `/learn` retained. Day Pillar results link to their full portrait and the 60-article collection. The 60 complete portraits / 240 language editions are preserved from article commit `d1feebb`; latest main was integrated at `08beb91` (main `e72bf85`, Prompt Radar data only).

Atelier language links now refresh server content and metadata while retaining the current bracelet in memory. Traditional Chinese is rendered on the server and advertised in reciprocal hreflang/sitemap entries. The previously inert completion control was removed in favor of the working image download. A prominent link jumps to the bead palette. Home cards and birth-report previews use the current pillar-name source of truth.

## Validation

- Node 22.23.3 / npm 11.9.0. All 220 unit/content tests passed with `react-server` set for tests only. Production build passed; no `react-server` build condition.
- 80 browser combinations: homepage plus four sections × EN / Simplified / Traditional / RU × 320 / 390 / 430 / 1280 pixels, no failures after correcting the test harness and local origin.
- Interactions: card modal / Back / Forward / Escape; report disclosure and invalid-form focus; date-only card calculation and full-article link; tradition selection, draw and sign-number lookup; unknown-time compatibility calculation and reset; add/remove beads, size, PNG download, language switch preserving beads, reset.
- AI interpretation requests were intercepted as unavailable in the browser test. No paid AI, checkout, account write or private user data was exercised. Dates/questions were synthetic.
- SSR checks: four-language homepage text, offers, canonical/hreflang and sitemap; 284 journal language editions (240 pillars plus existing guides); four-language collection and 60 live JPEG cards.
- Initial browser failures included hidden dialog images incorrectly counted as visible, an ambiguous language selector, and `INVALID_ORIGIN` from the local Next host normalization. Tests were corrected and run against `localhost`; security checks and calculation algorithms were not weakened.
- The final atelier-only run passed 16/16 combinations after the anchor and spacing adjustment.

## Review boundaries

No production release or main-branch push. PR11/12 stay unmerged; the independent 甲辰/乙亥 drafts overlap PR12 and require later integration review. PR14's Guanyin text is not imported or replaced; sticks changes are only section navigation and reading links. No database migration, new domain/repository, automation duplication or unrelated-app edits.

Russian copy is agent-edited, not independently reviewed by a native human. Browser results are Chromium, not Safari/WebKit. `/day-pillar` share parameter behavior is unchanged. Article baseline exceptions remain documented in the article review. Review through the existing project's Vercel Preview, not production.
