# Sourced day-pillar birthday matches — 2026-10-11

Independent [PR33](https://github.com/guangtoulee/destinypixel/pull/33), based on main `89d660da23c29366e39b0844302874c1b541b436` after the separate PR32 browser-history fix. Runtime source verified: `cf5064f8ca646b59c02e537f48f5d0397b83d17f`; later evidence commits change documentation only.

## Data and scope

`content/day-pillar-people/verified-people.json` contains exactly the 22 institution-backed birthday records supplied and approved by the parent research task. Each record retains names and fields in Chinese/English, published Gregorian date, date-based Day Pillar, source publisher/URL, paraphrased evidence, evidence type, source-access date, birthplace, explicit unknown birth time, internal audit notes and optional reader-facing historical-date caveats. The two WTA records include the verified one-based PDF page and printed-page locator. No portrait or biographical relationship claim is added.

All 22 dates reproduce the independently supplied assignments and `calculateDateDayPillar`, covering 20 distinct pillars. They share no names or birthdays with the ten already published people. The four existing birthday sections keep all 32 multilingual table rows, their original sources and prose. English and Simplified Chinese each have 30 people across 22/60 pillars (eight legacy people plus 22 new records); there are 32 distinct people across the different language selections. Traditional Chinese/Russian retain the original four birthday-covered pillars and receive no new people panel. The other 38 pillars have no invented or empty new famous-person block.

People are attached only after the published Traditional Chinese and Russian translations are assembled. In the two overlapping existing sections, structured records are additive; all old paragraphs, tables, titles and sources remain. The other 18 affected articles receive a sourced birthday section on the existing URL. Original content is preserved for every one of the 75 articles, and the original animal-card link continues to identify a separate creative experience.

The public panel explains the local Gregorian civil-date / midnight convention, absence of birth-time and timezone/solar-time corrections, historical-calendar review limits and why accomplishments or relationships are not evidence for a BaZi interpretation. It does not supply a full birth chart. Source caveats remain visible for the approved historical cases; internal line-number and access troubleshooting notes stay in the registry rather than the reader flow.

Only the 20 affected article editions and the collection coverage statement receive zh/en revision notes. Since Ding You was already revised on the same day, the actual sitemap date changes are 40 URLs from the main baseline: 19 article slugs × two languages plus two collection editions. All publication/shared article dates and all Traditional Chinese/Russian dates remain unchanged. The previous four-sample registry and Sun/Moon/Tai records are not rewritten.

## Verification

`checks.log` records 43 relevant passing tests, scoped Next/TypeScript ESLint and a successful production Next build with TypeScript. The preservation fixture `content/day-pillar-people/previous-editions.json` independently hashes all 75 × four original translations and their effective dates from main after PR31; PR32 changed only card history, so that content baseline is also unchanged in the PR33 base. Tests restore the additive people fields/sections before comparing original editions, reject unsafe source schemes/credentials, check deduplication and idempotent assembly, preserve old citation order/duplicates while adding only unique birthday sources, and check the actual revision/date scope.

`production/report.json` reports PASS with zero failures: 240 article editions, 44 new person occurrences (22 once per zh/en), 40 rendered Traditional Chinese/Russian baseline comparisons, 32 retained old birthday-table rows, four directories, 30 article viewport cases and six directory viewport cases. Viewports are 320×740, 390×844 and 1440×900. Ten cropped screenshots show the new material at readable scale. Source links match the approved receipts, use HTTPS with `target=_blank` and `rel=noopener noreferrer`, and point the WTA PDFs to pages 86 and 88. Tests verify canonical/locale/TOC behavior, matching original-card destinations, no empty panels, no horizontal overflow and no additional portrait images.

Re-run the compact browser companion against a production server:

```sh
BASE_URL=http://127.0.0.1:3053 node docs/qa/day-pillar-people-20261011/check-people.cjs
```

Birthday source-page research was supplied by the parent and its source workers; this implementation verifies receipt correspondence, local date reproduction and safe rendered link behavior. It does not claim that every external provider was re-fetched during browser QA, nor that public-domain runtime was visited through this environment's CONNECT-403 proxy. The parent performs independent public browser verification after the exact Vercel production commit is confirmed.

No dependency, security setting, original URL, original article manuscript, Tarot/Tai content, Guanyin-sign work, account, AI endpoint or birthday-storage behavior changes here. No checkout `.agents/skills` or AGENTS.md were available initially; the relevant packaged Next/Vercel implementation and verification guidance was used. Existing lockfile-matched temporary node modules from the earlier validation task were reused without changing package files.
