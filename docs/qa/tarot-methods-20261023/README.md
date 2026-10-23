# Tarot method guides — pre-release verification, 2026-10-23

Base: `1be7f64ef2e80e22386cab6c7b89c43a543f92ba` on `main`. Independent branch: `codex/tarot-method-guides-20261023`.

## Content and source boundaries

Two independently organized methods articles are authored in English and Simplified Chinese only: `/journal/how-to-read-celtic-cross` and `/journal/how-to-keep-tarot-journal`. The directory, three-card lesson links, canonical/alternate URLs and sitemap expose those actual editions. Existing article bodies, URLs and four-language editions remain intact. Unsupported `ru` and `zh-TW` requests for these two slugs redirect to English.

References were checked against the user's locally provided scan of Rachel Pollack, *78 Degrees of Wisdom*, Sun Meijun translation, 商周, December 2010 first edition. The physical PDF page references identify this scan only. Celtic Cross: PDF 331, 336–348 / printed 333, 338–350; notes/review: PDF 384–385, 405, 409–410 / printed 386–387, 407, 411–412; deliberate rearrangement: PDF 396–402 / printed 398–404. Waite's 1911 online text, Part III §7, is linked separately. Pollack's variant, Waite's sequence, and the site's current ten positions are explicitly distinguished. The examples, four reading groups, record fields, and three-way review categories are original site material. They are not attributed to Pollack or presented as scientific validation, diagnosis or treatment.

Reading scope in this research round: PDF 184–202 and 317–411, 114 unique pages, plus the earlier targeted major-arcana work. No claim to having read every page. No PDF, extracted source text, scan, book illustration, or private reading note is included in this repository. The source PDF was read locally and unchanged. The two SVGs are newly drawn group diagrams using the website's own position labels.

## Checks

- `npm run build`: passed, Next.js 16.3.4 production build. Existing Edge Runtime deprecation warning recorded in `build.log`.
- `npx tsc --noEmit`: passed (`typecheck.log`).
- Scoped ESLint with repository `eslint.english.config.mjs`: passed for all changed TS/TSX files (`lint.log`). This repository has no default `eslint.config.*`; no new lint configuration or dependencies were added.
- 49 relevant Node/tsx tests: passed, zero failures (`tests.log`). Covers journal, tarot editorial, new methods, document locales, historical updates, SEO, topic/section journeys, celestial layout and cycles.
- Existing `scripts/check-journal-search.ts http://127.0.0.1:3047 2026-10-23`: passed. All four new editions' complete paragraph text, H1, canonical, hreflang, Article dates, sitemap entries and product GETs (`http.log`).
- 12 distinct internal article links returned 200; EN/ZH learning index has 5 cards, existing RU/zh-TW index retains 3; four unsupported edition requests returned 308 to English (`links.json`).
- Browser production-server check at 320×740, 390×844, 1440×900 for all four new editions: 12 combinations, no horizontal document overflow, missing images, or broken table-of-contents anchors (`responsive.json`).
- Actual browser interactions: Chinese Celtic → English → related journal → Chinese; journal TOC jump; draw-table link → select Celtic Cross → all ten labels match the new teaching table. No AI submission, account write or paid API call was made.
- Desktop English article and 390 px Chinese diagram/table/text visually inspected. Screenshots are original website previews, not book images.
- Browser console: no captured warning/error after the tested flows. Independent content/code review found no release blockers.
- `git diff --check`: passed.

## Historical test repair

Unmodified main independently reproduced 5 failing tests out of 7 in `editorial-updates.test.ts` (`baseline-editorial-tests.log`): the frozen 75-article/982-URL snapshot predated new articles and the October 23 Queen of Swords revision. The fix explicitly projects that original 75-article historical set, restores only documented later date changes, and separately checks all current authored editions. Original 982 URL, 48/40 update counts and historical SHA-256 receipts remain asserted. The fixed file passes 7/7; the full relevant suite passes 49/49. No historical receipt or product article date was rewritten by this test repair.

## Limits and release stage

These records describe local pre-release verification. A physical iPhone/Android device, Safari/Firefox, account persistence and AI generation were not tested. Mobile checks use actual browser layout at the listed viewport dimensions. Vercel private-project inspection returned a connector scope 403 for the existing project; it was not retried or bypassed. Release tracking will use GitHub checks for the exact commit and public production article verification. Production is not claimed by this pre-release report.
