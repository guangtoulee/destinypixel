# Tarot accessibility and narrow-screen regression — 2026-11-16

Base: `783d4e4310b5a28cd2d7c57809a1a8cd6b3dda47` (`main`). Compared with the previous QA commit `3e22812`, only prompt-radar data had changed. The six existing open PRs did not overlap this implementation.

## Changes

- Keep the free-table action panel and restart controls within narrow viewports. The mountain-lake artwork, parallax, animated card fan, table gestures and existing page structure are preserved.
- Give reveal-all and keepsake icon buttons localized accessible names even when mobile CSS hides their visible text.
- Implement manually activated spread tabs: Left/Right wrap focus, Home/End move focus, Enter/Space select, one roving Tab stop, and an associated labelled board panel. Cancelling a reset keeps the cards/selection and returns focus to the selected tab.
- Return focus to the optional-question capsule after Enter, Escape and Done, after the replacement button commits.
- Correct the selected-language, meaning-dialog position, dark reading-section and homepage manuscript-caption colors. Shared reading styles preserve their existing defaults outside the tarot theme.

No route, article, account, API, payment, permission, paid-service setting or production dependency changes. The paused editorial task was not touched.

## Validation and limits

The replay script is `scripts/check-tarot-a11y.mjs`. It requires Playwright 1.62.1 and axe-core 4.12.1 from an isolated tools directory; neither is added to production dependencies. Example against a local production server:

```sh
QA_TOOLS_DIR=/absolute/isolated-tools \
QA_EVIDENCE_DIR=/absolute/evidence \
CHROMIUM_PATH=/usr/bin/chromium \
node scripts/check-tarot-a11y.mjs http://127.0.0.1:3049
```

The script permits only loopback GET requests, blocks API/third-party/telemetry/WebSocket traffic, and does not open/export keepsakes or submit account/AI actions. It captures raw axe violations and incomplete results as well as functional assertions and screenshots. Default motion is retained for the primary EN/ZH × 1440×900/390×844 run; `QA_MOTION=reduce` is available for an additional run.

- Node 24.19.0 / npm 11.9.0; Chromium 151.0.7922.173. Playwright's expected browser patch differs (151.0.7922.34); this system-browser limitation is retained.
- Production webpack build and standalone TypeScript pass.
- Full unit suite before and after: 385 tests, 379 pass, the identical six existing historical article/date receipt failures, no skips. The full suite is not green; no assertion was removed or weakened.
- Root lint already fails because the repository has no default ESLint 9 config. Scoped lint uses the existing config: the prior round-tracker refs error is resolved; the keepsake component's existing `setCanShareFile` effect error remains, plus an existing image warning. No lint rule is suppressed.
- The browser replay fails against the old UI at capsule focus restoration; its earlier navigation and background checks succeed. This establishes a meaningful before/after regression rather than a source-only assertion.

Final primary replay: **60 functional checks pass across 56 scanned states, zero violations, zero scanner errors, zero functional failures, no page exceptions or failed HTTP responses**. Remaining incomplete rule occurrences: color-contrast 54 (2294 repeated nodes), video-caption 3, link-in-text-block 10. These are not unique defect counts. All 64 blocked requests were telemetry; console messages from that intentional blocking are retained separately. Exact counts and per-state summaries are in `validation-summary.json`; selected final-code screenshots are adjacent. CSV evidence paths refer to the full task run. Raw logs, those complete scans and full screenshots remain in the task workspace; a large evidence archive is not committed.

Real production browser verification was attempted first at `https://www.destinypixel.com/?analytics_test=1` and failed with `net::ERR_TUNNEL_CONNECTION_FAILED` before an HTTP response. This is an environment access failure, not evidence of a site 403 or a product defect. No alternate route or proxy bypass was attempted. Separately, authenticated deployment metadata identified production READY `dpl_p6aUNdmJPkRfHtG9KkdxpezHbzRc`, commit `783d4e4`, with both public domain aliases. Deployment metadata does not establish live interactive behavior.

Physical devices, screen readers, Safari/Firefox, zoom audits, all 78 cards/all spread combinations, AI, account persistence, payment and export actions are untested. Incomplete contrast/background, video-caption or link checks remain manual-review items. Zero reported violations in tested states is not a claim of complete WCAG conformance.

## Selected final screenshots

- [English free table after draw](en-390-final-free-drawn.png) / [Chinese](zh-390-final-free-drawn.png)
- [English after ordinary pointer reset](en-390-final-after-reset.png) / [Chinese](zh-390-final-after-reset.png)
- [English meaning dialog](en-390-meaning.png) / [Chinese](zh-390-meaning.png)
