# I Ching and trigram browser acceptance · 2026-10-11

Run against the production build from the repository root:

```sh
QA_EVIDENCE_DIR=docs/qa/iching-20261011/browser-local \
  node scripts/check-iching-browser.mjs http://127.0.0.1:3035
```

Public deployment verification requires the explicit `QA_ALLOW_PUBLIC=1` flag and a separate evidence directory. A local result does not establish which commit is deployed publicly.

The browser driver uses installed Playwright and `/usr/bin/chromium`. It checks English, Simplified Chinese, Traditional Chinese and Russian at 320, 390, 430 and 1440 px. Reports retain each check, viewport dimensions, workflows, Googlebot SSR metadata, sitemap coverage, screenshots, page errors, console errors and failed HTTP resources.

Coin interaction checks inject deterministic browser-only cryptographic bytes for three-byte coin requests. The application code remains unchanged. The six recorded coin triples are `222, 322, 332, 333, 322, 332`, giving `6, 7, 8, 9, 7, 8` from bottom to top: hexagram 47, changing lines 1 and 4, then hexagram 60. The driver counts requests to distinguish a genuine six-toss sequence from a single arbitrary outcome. It checks synchronous repeated clicks under reduced motion and interrupted animated actions separately.

Checks also cover manual four-state and 18 individual-coin inputs; all-yang, all-yin and all-changing lines; the classical number example 1/5/Rooster 10 (44, line 4, then 57); invalid and maximum inputs; Beijing time conversion across Lunar New Year, midnight, the 23:00 and 01:00 hour boundaries and a leap month; browser timezone independence; keyboard focus; article tabs retaining the original cast; homepage and tools-directory entry points; and the existing separate Tarot navigation.

All 32 trigram editions are checked against their complete source paragraphs, quotation/gloss, reflections, related trigrams and hexagrams. Every diagram is checked against independent bottom-up bit fixtures. Forty Googlebot SSR editions and 40 sitemap destinations cover the four-language tool, directory and articles.

External requests and API writes are blocked. Vercel analytics and speed-insights scripts are deliberately disabled during QA; resulting `ERR_FAILED` console messages are retained as expected test isolation output. Application `pageerror` events, failed same-origin resources and attempted API writes fail the run.

The first run was interrupted after a QA selector error: a global `[role=alert]` query counted Next.js's empty `DIV#__next-route-announcer__`, outside `main`. Actual DOM inspection confirmed that no product error was present. The preserved `browser-initial-fixture-failure.json` and `.log` show the failed assertions and diagnosis. The corrected driver scopes error assertions to `[data-iching-workbench] [role=alert]`; it still checks genuine invalid-input alerts. The final complete run uses that corrected selector.

For a CSS-only initial-view follow-up, `QA_PHASE=responsive` runs the 16 locale/viewport tool views without repeating the functional workflows. Use a separate evidence directory.

Execution status and visual review are recorded in the generated `browser-local/report.json` and subsequent acceptance notes.
