# I Ching casting and trigram learning

Base: current `main` at `b752fc58a3df766754764f3bae6106ac57ce4dd1`.
Branch: `codex/iching-workbench-20261011`.

## Audit and scope

The existing site already provides `/oracle`, `/journal/hexagrams`, and 64 complete
hexagram articles in en/zh/zh-TW/ru (256 editions). The original Oracle uses a
repeatable seed from the question, time, optional birth context and topic; it pairs
a six-line figure with Tarot. It is not conventional coin consultation or a full
Najia chart. Its algorithm and released seeds remain intact.

The imported manuscripts have complete classical quotations, line explanations,
modern examples, misreading notes and sources. Their source hashes and original
provenance are retained. No new copies of the 64 articles are created. The actual
gaps are a dedicated casting workspace, a clear main-site entrance, and separate
three-line trigram articles. `/iching` fills the tool gap; eight trigram articles
use `/journal/trigram-<id>` and four existing query-locales. This adds 32 original
language editions and one directory, without duplicating the hexagram routes.

Neither the repository nor `/workspace/.agents` provided an applicable
`AGENTS.md` or `.agents/skills`. Existing validation instructions were read in
`docs/qa/hexagram-learning-20261007/README.md`. The Tarot header, navigation,
casting/deck engine and independent article family are preserved. No Guanyin
draft PR14 changes, analytics data, accounts, database or paid AI calls are added.

## Reproducible methods

- Three coins: inscribed face 2, reverse 3, three independent unbiased bits per
  toss. Totals 6/7/8/9 have probabilities 1/8, 3/8, 3/8, 1/8. All eighteen raw
  values are recorded; six tosses are numbered from the bottom upward.
- Manual: either the three individual coin faces or 6/7/8/9 per line. Only 6 and
  9 change. Lower trigram is the first three lines; upper trigram the last three.
  King Wen names use the existing explicit verified 8×8 table.
- Plum Blossom date and time: upper R8(Y+M+D); lower R8(Y+M+D+H); moving
  R6(Y+M+D+H). Y is lunar-year branch 1–12; M/D are lunar month/day; H is hour
  branch 1–12. Exact multiples map to 8 or 6.
- Plum Blossom two counts and hour: upper R8(A); lower R8(B); moving R6(A+B+H).
  Original A/B are retained, with positive integer bounds 1–1,000,000,000.

The time tool explicitly uses fixed Beijing UTC+8. Its documented site
conventions are Lunar New Year as year boundary, 00:00 as day boundary, late Zi
at 23:00 on the same date, and leap months using the regular month number.
Supported civil years are bounded to 1900–2100. These conventions are not
presented as the only interpretation across all traditions. Time and number
methods are labelled Meihua Yishu; no Najia, host/response or six-relatives chart
is claimed. Traditional yarrow division is described separately, not replaced
with a coin animation. Randomness is not evidence of predictive accuracy.

## Research and regression vectors

Primary cultural source: [Meihua Yishu, volume 1](https://zh.wikisource.org/wiki/梅花易數/卷一),
sections 年月日時起例, 觀梅占, 鄰夜扣門借物占, 卦以八除 and 爻以六除.
The observing-plum example is Y5/M12/D17/H9 → Ge49, line1 → Xian31.
The evening-knock example is A1/B5/H10 → Gou44, line4 → Xun57.

[Hong Kong Observatory stems and branches](https://www.hko.gov.hk/tc/gts/time/stemsandbranches.htm)
provides the hour-branch reference;
[calendar conversion tables](https://www.hko.gov.hk/tc/gts/time/conversion.htm)
and the [2026 table](https://www.hko.gov.hk/tc/gts/time/calendar/pdf/files/2026.pdf)
and [2023 table](https://www.hko.gov.hk/tc/gts/time/calendar/pdf/files/2023.pdf)
provide independent conversion vectors. The PDFs were opened and screenshots
requested during the audit. 2026-02-16 is lunar 2025/12/29 (Si6);
2026-02-17 is lunar 2026/1/1 (Wu7). 2023-03-22 is leap month2/day1.

[Three-coin teaching handout](https://people.willamette.edu/~rloftus/Asia%20201/AS%20201%203CoinCasting.pdf)
supports the four line states.
[Zeng Shan Bu Yi](https://zh.wikisource.org/zh/增刪卜易)
provides context for the broader Liuyao tradition.
[Shuo Gua](https://zh.wikisource.org/wiki/易傳/說卦)
supports the trigram imagery;
[Xi Ci, upper commentary](https://zh.wikisource.org/wiki/易傳/繫辭上)
chapter9 describes yarrow division. Short received-text quotations are
distinguished from original editorial translations, explanations and examples.

The new algorithm tests also exhaust all 4^6 = 4096 four-state inputs against the
existing verified identity ledger for both figures, all 64 stable patterns, and
the mixed cast [6,7,8,9,7,8] → Kun/困47 with lines1/4 moving → Jie/節60.

## Validation

The server suite passes 270 tests; the client/admin suites pass three more tests.
This includes exhaustive 4,096-input casting and 64-identity regression checks,
the classical Meihua examples, invalid input and lunar/calendar boundaries.
`tsc --noEmit` and scoped Next.js ESLint pass. The new pages/components also pass
the unchanged Next.js lint rules. The existing legacy Oracle component has three
pre-existing lint findings (one synchronous effect and two HTML-anchor rules),
reproduced from the base commit in `legacy-lint-baseline.log`. Those two rules are
disabled only for the scoped changed-file invocation; no repository lint
configuration or dependencies are changed.

The production HTTP checks pass all 256 existing full hexagram manuscripts,
classical quotations, six line notes, diagrams, metadata and citations. The
combined journal check passes all four libraries, contiguous schema positions,
and 920 unique journal editions (900 articles and 20 directories/indexes).
The legacy browser regression passes all four languages at 320, 390, 430 and
1440 pixels, correct Tai/Pi/Jiji/Weiji seed fixtures, keyboard/Back/language
navigation and new-tab article links that preserve the cast. It records zero
application errors and API writes.

The first new browser run found the empty framework `#__next-route-announcer__`
with `role="alert"` outside the workbench. The test's global error selector
incorrectly counted it. The application-error assertions are now scoped to the
workbench, retaining the route announcer. The original failure log remains in
`browser-initial-fixture-failure.log`; the final full run is recorded separately.

Full new articles remain server-only;
the client receives the chosen locale's interface copy and small identity summaries.
The manuscripts have automated and independent model review, not native-human
or classical-studies expert certification. Search indexing and post-release
traffic measurement belong to the separate analytics task.

## External access limitation

The Vercel GitHub integration deployed the existing linked `destinypixel` project
successfully for implementation commit
`641862dd67b7509e256ff99acb3a15670ab8fd8d`. Its initial ready preview is
https://destinypixel-git-codex-iching-workbench-20261011-destinypixel.vercel.app.
This is a branch preview; the final checked head and production release evidence
are recorded below after completion.

In this execution environment, Python HTTP and Chromium requests to both the
preview and `www.destinypixel.com` fail before an HTTP response: proxy tunnel 403
and `net::ERR_TUNNEL_CONNECTION_FAILED`, respectively. The supported Vercel
deployment fetch also returns project/team authorization 403. No protection,
proxy or access-control setting was changed. Local production screenshots and
interactions do not constitute direct online interaction verification.

## Final local acceptance

Application source: `19fd4f7db48a791821f40c0e5d97de4214df3767`.
Its Vercel preview check is successful:
https://vercel.com/destinypixel/destinypixel/H7XR3Z6GeUvppKdgoawSutPiZzng.
The final production build generates all 417 pages successfully. The full final
browser run uses that exact application source and records **175 passed checks,
104 views, 37 workflow groups and 87 driver screenshots**, including four languages at
320/390/430/1440 pixels, all 32 complete trigram editions and 40 Googlebot SSR
editions. The sitemap contains all 40 new tool/trigram editions and 982 unique
URLs overall. All application page errors, failed same-origin HTTP resources,
attempted API writes and failures are zero.

The report retains 308 `net::ERR_FAILED` console messages from deliberately
blocked Vercel telemetry. These are test isolation messages, not unreported
application errors. See `browser-final/report.json`, `browser-final.log` and
`browser-README.md` for the driver, complete matrix and visual acceptance notes.
Representative screenshots are committed; the remaining generated screenshots
are retained locally and excluded by this QA directory's `.gitignore`.
An additional complete Chinese result screenshot shows both hexagrams and the
entire original coin record in one image.

Both the primary agent and browser reviewer inspected the four-language Qian
article body screenshots, the recorded coin faces and the narrow Russian line
record. Classical Chinese quotations are clearly labelled and separated from
original explanations in each actual reading language. The final narrow Chinese
heading fits without an orphan character; learning-link arrows use SVG to avoid
missing glyphs. Cast record/result reading text has measured contrast of
approximately 4.71–5.54:1 on the relevant backgrounds.

Reproduce the primary checks after installing the existing lockfile dependencies:

```sh
python scripts/validate-hexagram-learning.py
NODE_OPTIONS=--conditions=react-server node --import tsx --test lib/iching/cast.test.ts lib/trigram-learning/learning.test.ts
npx tsc --noEmit
npm run build
npm run start -- -p 3035
node --import tsx scripts/check-hexagram-learning.tsx http://127.0.0.1:3035
node --import tsx scripts/check-learning-integration.ts http://127.0.0.1:3035
node scripts/check-hexagram-learning-browser.mjs http://127.0.0.1:3035
QA_EVIDENCE_DIR=docs/qa/iching-20261011/browser-final node scripts/check-iching-browser.mjs http://127.0.0.1:3035
```
