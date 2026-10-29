# Tarot journal source and feedback revision — 2026-10-28

One existing article is expanded in English and Simplified Chinese: `/journal/how-to-keep-tarot-journal`. Base: `714b08e2e319bb3e2ab0df624800ff4f1aab2ec1`. Content head: `3410c03084f9b379d939323169208e15ae9c623f`. Draft PR: [#44](https://github.com/guangtoulee/destinypixel/pull/44).

## Editorial value and preservation

Two new sections distinguish image observation, a named book source, a situational interpretation and information still to obtain; then show how to review unanswered messages, an unperformed action, cancellation and dated late feedback. They continue the existing invented board-game-night example. The organizing decision occurs before Saturday's event; Sunday is the review date. The source record, scenarios and review steps are original editorial exercises, explicitly distinct from either author's methods or scientific evidence of prediction.

All original section IDs and relative order, paragraphs, tables, eight-field template, title, description, answer, action, links and topic metadata are preserved. The adjacent Celtic Cross article is identical to the base. Only the journal article's shared modification date becomes October 28; publication remains October 23 and only EN/ZH editions are advertised. Product code, three-card articles, card-name search and topic implementation are unchanged. Unrelated file hashes and exact test failure names are recorded in [validation.json](validation.json).

The previously declined local commit `9925c12716d2953c6da88fabcf3bf1a0f10ebe33` was not retrieved, rebuilt, rewritten or cherry-picked. The new branch starts at the main commit above. Open PRs were checked before selecting this article; none covered this revision. No repository or ancestor `AGENTS.md` or relevant local `SKILL.md` was present in the selected environment.

## Sources and page boundaries

- [Waite, Three of Pentacles, Part III §2](https://sacred-texts.com/tarot/pkt/pktpe03.htm): craft and occupational skill, alongside other historical meanings. The proposed welcoming help is explicitly a contemporary inference for the invented organizer's question.
- [Waite, Part III §4, concluding discussion](https://sacred-texts.com/tarot/pkt/pkt0304.htm): collected meanings can disagree and sequence can modify meaning. The text also retains historical intuition/second-sight claims, which the article does not endorse as scientific validation.
- Public William Rider & Son **1922 reprint**: [printed p. 276](https://en.wikisource.org/wiki/Page:The_Pictorial_Key_to_the_Tarot.pdf/289), [p. 293](https://en.wikisource.org/wiki/Page:The_Pictorial_Key_to_the_Tarot.pdf/306), [p. 294](https://en.wikisource.org/wiki/Page:The_Pictorial_Key_to_the_Tarot.pdf/307); [bibliographic index](https://en.wikisource.org/wiki/Index:The_Pictorial_Key_to_the_Tarot.pdf). These are separate from the existing online 1911-edition citation and from Pollack's pagination.
- [Red Wheel/Weiser's Pollack listing](https://redwheelweiser.com/book/seventy-eight-degrees-of-wisdom-9781578636655/) provides modern psychological framing and identifies its 2019 English edition as 368 pages. It does not verify the pagination of the Chinese edition.

Existing Pollack references are retained from the repository's [October 23 source-review receipt](../tarot-methods-20261023/README.md): Rachel Pollack, Sun Meijun translation, 商周, December 2010, user-identified 422-page edition. Notes: PDF 384–385 / print 386–387; mechanical templates: PDF 405 / print 407; mistaken readings: PDF 409 / print 411; comparison: PDF 410 / print 412; mandala: PDF 396–402 / print 398–404. Those page references describe the earlier documented scan only. No private PDF was available or read in this cloud revision, no new Pollack pages are claimed, and no PDF, scan, book illustration, extended quotation or extracted private source text is included. There is no claim to reading the whole book. Independent model-assisted content/source review found no remaining blocker; this is not human or expert certification.

## Verification status

Node 24.19.0 / npm 11.9.0 / Next.js 16.3.4; no dependency or lockfile changes.

- Baseline and current full Node/tsx suite: **342 passed, 6 failed, 348 total**, with identical six historical snapshot failures. No test assertions were edited or omitted. The full suite is not green.
- Scoped ESLint with existing `eslint.english.config.mjs`: passed. Root `npm run lint` still fails because the baseline lacks a root `eslint.config.*`.
- Content invariants: both languages preserve every original paragraph, section, table and link; the Celtic Cross article and unrelated product files match the base.
- `npm run build`: passed on the final content, with TypeScript and 426 static paths. Existing Edge Runtime warnings remain. Standalone `npx tsc --noEmit --incremental false`: passed.
- `scripts/check-journal-search.ts http://127.0.0.1:3047 how-to-keep-tarot-journal`: both full article editions, H1, canonical/alternates, original publication and actual modification date, Article schema, sitemap and product GETs pass.
- `scripts/check-tarot-journal-revision.mjs`: actual Chromium 151 at 320×568, 390×844 and 1440×900 in both languages (6 states). All 11 sections, both complete tables, source links, TOC anchors and overflow checks pass. EN/ZH switching, Back/Forward, keyboard topic navigation and all 16 internal-link GETs pass.
- Article → tool → Free table → disable reversals → shuffle → draw → reveal → meaning passes in desktop EN and mobile ZH. Actual random cards were Four of Swords and Death, with their respective localized names, upright orientation, visible meaning and card-library links. No synthetic card state or forced clicks are used. No captured page exceptions. The article does not claim that the example cards can be requested as a preset.
- Screenshots of the mobile source table, review text and desktop article were visually inspected by both the authoring agent and an independent model-assisted reviewer. No readability blocker was found. Screenshots are website previews, not book images.
- `git diff --check`: passed.

Machine-readable browser evidence: [browser-local.json](browser-local.json). Full command logs and screenshots remain in `/tmp/tarot-journal-20261028` in this saved cloud environment. Re-run the browser script with `QA_EVIDENCE_DIR` to choose an evidence directory, or pass the production origin as its first argument.

An initial browser/HTTP check correctly detected that a build started before the final copy edits still served earlier wording. The final build was regenerated; both checks then passed against the current complete content. The initial trace remains in `/tmp/tarot-journal-20261028`.

## Access and test limits

Vercel private project access was previously denied with scope 403 and was not retried. GitHub CLI supplemental PR-rollup lookup returned GraphQL `Forbidden` in this run; that lookup was not retried after the denial. GitHub connector PR metadata and exact-commit status checks remain available. No approval review is submitted; any merge must use the ordinary server-enforced PR flow and expected head SHA.

Browser evidence uses actual Chromium viewport rendering, not a physical phone. Safari/Firefox, AI generation, account persistence and payments are outside these checks. Only same-origin GET browser requests are allowed. This is the pre-release evidence record. The PR head's exact Vercel check must pass before an ordinary merge; exact merge-commit status plus public production article, metadata and tool flows still require verification and will be recorded in the PR description after release.
