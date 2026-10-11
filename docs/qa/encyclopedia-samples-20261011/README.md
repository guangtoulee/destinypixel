# Four existing encyclopedia samples — 2026-10-11

Base: `179c14e1f6d5bf19a244adeaef84d13ba79ce4b1` (main after PR29). This revision edits Simplified Chinese and English on four existing article routes. Traditional Chinese and Russian retain their published text, images, links and dates. No routes, accounts, analytics events, external services or dependencies are added.

| Existing route | Before | Change |
| --- | --- | --- |
| `/journal/ding-you-day-pillar` | Rich portrait and fictional situations; terminology did not directly explain the male-personality query or distinguish sitting on Indirect Wealth from an Indirect Wealth structure. | Direct answer, Yin Fire/hidden Xin/Indirect Wealth explanation, named chapters and distinctions between classical terminology and modern examples. Original artwork and fictional relationship examples remain. |
| `/journal/hexagram-11` | Literary title and a complete six-line article. | Searchable Tai / hexagram 11 title with the literary subtitle retained; structure, plain Judgment explanation, Wings versus core text, and a sourced second-line commentary comparison. All six classical lines, Legge references, historical caveat, fictional reading group and exercises remain. |
| `/journal/tarot-sun` | Complete illustrated Sun article with a worked example. | RWS XIX identity and direct answer, modern-reading label, Waite's reversed meaning, chapter-specific source roles. Existing image, six sections and worked example remain. The historical comparison says “two children”, as the primary text does. |
| `/journal/tarot-moon` | Complete illustrated Moon article with two fictional cases and an ambiguous self-titled reference. | RWS XVIII identity and direct answer, modern-reading label, a scoped older-design comparison and specific Waite/image references. Both fictional cases and original image remain. Visible self-citation removed. |

The new Sun/Moon answer initially sat below the 220px illustration on mobile: Moon English at 320×740 started at 1281px. Moving this optional answer immediately below the title brought it to 421px in development; the production report records the final measurements. The illustration, quick meanings and full text remain. The new revision notes use a scoped 12px darker text style; no existing metadata style was changed.

The initial production browser run also found Tai's identity facts after the table of contents. The final renderer shows the existing `identityText` below the subtitle for the two edited Tai editions. Full manuscript paragraphs remain. `initial-production-layout-failure.json` preserves the discovery; `browser-report.json` is the passing final run. “Within the first viewport” means the answer begins there; the complete English answer can extend below a 320×740 viewport.

## Sources and scope

- Ding You: HKO calendar conventions; *Di Tian Sui Chan Wei*, Heavenly Stems and Knowing Destiny; *San Ming Tong Hui* and the cited traditional compilations. The text distinguishes the base saying from Ren Tieqiao's commentary, notes school differences, and does not present a day pillar as a verified personality or relationship diagnosis.
- Tai: [Zhou Yi / Tai, pinned revision](https://zh.wikisource.org/w/index.php?title=周易/泰&oldid=2106138), [Zhou Yi Zheng Yi / Tai, pinned revision](https://zh.wikisource.org/w/index.php?title=周易正義/02泰&oldid=2000742), [Jin Si Lu, volume 8](https://zh.wikisource.org/wiki/近思錄_(四庫全書本)/卷08), [Xu Gua](https://zh.wikisource.org/zh/易傳/序卦). These support the explicitly attributed classical readings, not a forecast of outcomes.
- Sun/Moon: Waite's [Part I §2](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_1) for older designs, [Part II §2](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_2) for image descriptions and his interpretation, and [Part III §3](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_3) for divinatory entries. The [Morgan Library's particular Sun object](https://ica.themorgan.org/manuscript/page/13/158525) and Wikimedia image records support the specific objects and images, not all historical deck families. Modern quick readings and examples are labelled as this site's writing.

No native expert certification or new human-language-review status is claimed. Old review and provenance fields stay historical. The separate `content/encyclopedia-samples-20261011/revisions.json` records current file/Markdown hashes, previous file hashes, actual edited languages and visible change notes. Six exact previous JSON files allow the old source/archive validators to continue checking their original receipts; current revisions receive separate structural and hash checks. Ding You's previous automatically generated Traditional Chinese text is now preserved explicitly, with a serialized-hash guard for it and Russian.

## Verification

See `browser-report.json`, the selected screenshots and `checks.log`. The browser script is included as `check-samples.cjs`.

- Production Next.js build and TypeScript checks.
- Scoped ESLint and `git diff --check`.
- Journal, tarot editorial, tarot learning, hexagram learning and edition-date tests (16 passing in the learning/date suite; 9 passing in the journal/editorial suite, including two repeated editorial checks).
- Full legacy hexagram, tarot editorial and tarot-depth validators, plus the exact six-record revision validator. Original receipts and current receipts are checked separately.
- 16 no-JavaScript editions: four articles in four languages; canonical, reciprocal language links, Article author/free/date fields and visible revision-note scope. Eight retained language editions are compared with the baseline production server's rendered text, images and links.
- 24 browser cases: eight edited editions at 320×740, 390×844 and 1440×900; direct answer starts within the first viewport, no horizontal overflow, loaded article images, zero runtime errors, unique working TOC targets, source links and existing tool destinations returning 200.
- Sitemap test: 982 unique URLs; exactly eight last-modified dates change. Publication dates and every other URL/date retain the baseline hash.

External paid interpretation endpoints were not invoked. Source URLs were reviewed as primary references; the browser checks their rendered destinations rather than asserting every external provider's availability. This environment's public-site proxy returns CONNECT 403, so the local production checks and GitHub/Vercel commit status do not establish a public runtime visit. The parent independently verified PR29's deployed desktop tool flow; this content revision needs a separate public browser check after deployment. Search traffic and ranking effects are unverified.
