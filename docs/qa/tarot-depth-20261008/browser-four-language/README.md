# Local four-language browser QA

Passed against the completed local production build at `http://127.0.0.1:3041` on 2026-10-08, 10:28–10:32 UTC. No public Preview or production deployment is represented by this local run.

- 77 revised cards × 4 locales (zh, en, zh-TW, ru) × 2 viewport widths (390px and 1440px): **616 article views**.
- Every title, browser title, document language, canonical URL, quick take and opening paragraph matched its integrated locale record. Opening prose contains no repeated quick-take text.
- Every rendered section's complete text (including lists) and ordered links matched its full Markdown. This checks the final reviewed content without generating or altering translations.
- Both cases were opened through the table of contents, with headings visible: **1,232 case-navigation checks**.
- Every registered old anchor appeared exactly once and could be scrolled into view: **5,320 legacy-anchor checks**.
- All 21 major-card source appendices were checked in every locale and viewport: **168 appendix views**, including all localized titles and source links.
- Four representative cards per locale passed next/previous-card navigation and Back/Forward while retaining their language, plus language-switch Back/Forward: **16 history workflows**.
- All images loaded; no horizontal overflow, page errors or external browser requests occurred.
- The test only accepts a loopback base URL and only permits local GET requests. No push, PR, public upload, Preview or deployment was performed.
- The new script passes Node syntax checking and the repository's existing scoped ESLint configuration.

`report.json` records all 616 views, the aggregate totals and all 16 workflows. Eleven screenshots are retained. Visual inspection covered the English mobile Fool hero, Traditional Chinese Page of Cups second case, Russian mobile Fool and long Page of Cups case heading/body, Russian desktop King of Swords long title and quick takes, and Russian Moon source appendix. Titles and paragraphs wrap normally. The Page of Cups case uses the corrected language-independent brief-feedback wording.

Reproduce:

```sh
node scripts/check-tarot-depth-four-language-browser.mjs http://127.0.0.1:3041
```
