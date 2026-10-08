# Local Chinese browser QA

Run against the local production build at `http://127.0.0.1:3040` on 2026-10-08. This is Chinese integration QA only; it does not establish completion of the pending three translated editions, external Preview QA, or publication.

- 77 revised Chinese articles × 390px and 1440px = **154 responsive views** passed. Sun is excluded from this revision set.
- Every title, quick take, hook, section heading and non-list Markdown paragraph was checked against the live local content record. Source lists and their link destinations were separately checked for all 21 major-card appendices.
- Both cases on every view were reached through the table of contents, with their headings in the viewport: **308 case-navigation checks**.
- Every registered old anchor appeared exactly once and could be scrolled into the viewport: **1,330 legacy-anchor checks** across both viewport sizes.
- All images loaded, all article views fitted horizontally, and no page errors occurred.
- Four representative articles passed next/previous-card navigation, Back/Forward in Chinese, Russian language switching, and Back/Forward across the language change. Russian remains the pre-existing edition at this checkpoint.
- Seven screenshots were saved. The Fool mobile and desktop hero, Page of Cups second case on mobile, and Moon source appendix on desktop were visually inspected. The Page of Cups image confirms the corrected wording “现在只有这句简短的反馈”.
- The script enforces a loopback URL and blocks all non-local or non-GET browser requests. No external requests were observed. No push, PR, Preview, or deployment was performed.
- `node --check` and the repository's existing ESLint configuration pass for the new script.

Evidence: `report.json` contains the complete per-card results and screenshot filenames. Reproduce with:

```sh
node scripts/check-tarot-depth-browser.mjs http://127.0.0.1:3040
```

The first test attempt expected the content record's `zh-CN` as the document language. The site correctly uses its configured `zh-Hans` language tag; the test expectation was corrected before the successful full run. No website fix was needed.
