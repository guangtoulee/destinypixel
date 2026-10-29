# Four Fours: reversed entries and practice — 2026-10-29

The existing `/journal/why-the-four-fours-differ` is expanded in English and Simplified Chinese. Base: `4b91860f65da93b735ae979c1cb8147158e53d29`. Branch: `codex/four-fours-reversals-20261029`.

## Editorial result

Two sections compare Waite’s four distinct reversed entries, then turn the reversed Four of Pentacles into a concrete question in two positions. The reading-group variation is explicitly hypothetical: twelve interested members, eight seats, unconfirmed room/fee and two available organisers. It calls for checking the venue’s actual arrangements and abandoning an unsupported interpretation. A change of position is not presented as independent confirmation.

The table separates historical paraphrase from modern reflective questions. The Four of Wands retains its favourable direction; Cups includes new things, presage, teaching and connections; Swords keeps the difficult combination of management, thrift, miserliness, safeguards and a will; Pentacles concerns an unresolved state, delay and opposition. “Letting go” is explicitly identified as a possible modern image exercise, not Waite’s reversed entry. No prediction of a hidden opponent, duration, price rise, health outcome or scientific validation is added.

All five original sections, openings, title, URLs, source links, card images, action and other internal links remain intact. The new sections are appended through a narrowly scoped overlay; the original four-language manuscript files, source bundle and historical provenance hashes are untouched. Traditional Chinese and Russian keep their complete five-section editions. The publication date stays 2026-10-08. Only EN/ZH effective modification dates become 2026-10-29, through the existing language-specific revision registry.

## Sources and review

Read on 2026-10-29:

- [Waite, Four of Wands](https://sacred-texts.com/tarot/pkt/pktwa04.htm)
- [Waite, Four of Cups](https://sacred-texts.com/tarot/pkt/pktcu04.htm)
- [Waite, Four of Swords](https://sacred-texts.com/tarot/pkt/pktsw04.htm)
- [Waite, Four of Pentacles](https://sacred-texts.com/tarot/pkt/pktpe04.htm)

The four legacy links remain accessible and redirect to the matching `/book/the-pictorial-key-to-the-tarot/four-of-…` pages. The actual card entries, including reversed lists, were checked, not just search snippets. The historical text is paraphrased; no printed pagination is asserted. Independent model source/copy review found no required correction and verified the EN/ZH equivalence. This is not native-human or expert certification and is not a GitHub approval review.

The unchanged [Mathers transcription and editor’s introduction](https://hermeticgoldendawn.org/the-tarot/) and [Met museum explanation](https://www.metmuseum.org/perspectives/tarot-2) were also checked against their existing claims: Mathers’s different Pentacles interpretation and caution about equating the early booklet with Golden Dawn teachings, and the repeated suit symbols on early pip cards.

No Pollack book or private PDF was available or read in this revision. No book file, scan, extended excerpt or invented reading/page record is included.

## Isolation and exact scope

No readable repository or ancestor `AGENTS.md` or relevant `.agents/skills` was found in the selected environment. Main, the branch list, open PRs and recent articles were checked before selection and main was checked again before publication preparation. PR #44 is untouched; the declined three-card work was not retrieved or recreated. The Star, Celtic Cross, journal, three-card, Sun, Moon and Judgement content remains unchanged. Ruilan, DNS, project configuration, account settings and unrelated code are outside this change.

An independent detached worktree at the exact base exports all 79 journal articles, metadata/schema and all 996 sitemap URLs. [scope-and-baseline.json](scope-and-baseline.json) proves:

- Every original article field and section is retained after removing exactly the two appended EN/ZH sections.
- Every other article and language edition is byte-for-byte equivalent in the exported data.
- All URL sets remain identical. Exactly the two selected EN/ZH sitemap dates and their metadata/schema modification dates change.
- Four source citations are added to each edited edition. Original publication, canonical/hreflang, tool actions and all other metadata remain intact.
- The six full-suite failure names and test counts match the detached baseline.

Two existing tests required precise expectation maintenance: the date registry recognises this explicitly named EN/ZH revision and restores only its prior dates when checking old receipts; the language-shape check compares retained ZH-TW/RU against the original five-section manuscript. No historical hash, original count, assertion or test was removed or skipped. An initial run caught the old four-language equal-section assumption (341 passed / 7 failed); after correcting that expectation, the final result matches baseline below.

## Verification

Node 24.19.0; npm 11.9.0; Next.js 16.3.4. Dependencies and lockfile unchanged.

- `npm run build`: passed; 426 generated paths. Existing Edge Runtime deprecation warnings remain.
- `npx tsc --noEmit`: passed after all TS edits.
- Full suite in both the detached base and final branch: **342 passed / 6 failed / 348 total**, with no skipped or cancelled tests. The full suite is not green. The six names are preserved in [scope-and-baseline.json](scope-and-baseline.json).
- `npx eslint --config eslint.english.config.mjs lib/journal-tarot-editorial.ts lib/editorial-updates.ts lib/editorial-updates.test.ts lib/journal.test.ts scripts/check-four-fours-revision.mjs`: passed.
- Root `npm run lint`: baseline cannot find a root `eslint.config.*`; unchanged.
- `python3 scripts/validate-tarot-editorial.py`: passed all 16 historical complete editions and provenance checks.
- `python3 scripts/validate-tarot-learning.py`: passed original 312 records reconstructed from exact archives.
- `validate-tarot-depth-final.py` and `validate-tarot-depth-content.py`: both fail the same old articleMarkdown equality checks at lines 53 and 174 respectively on the detached baseline and this branch. Neither script nor its input content was changed.
- `git diff --check`: passed.

Full-suite replay:

```sh
NODE_OPTIONS=--conditions=react-server node --import tsx --test $(rg --files lib | rg '\.test\.ts$')
```

The React server condition is confined to the test/snapshot process and is not applied to the build or browser script.

## Browser and HTTP

[Browser report](browser-local.json), replay: `node scripts/check-four-fours-revision.mjs http://127.0.0.1:3049`. Default evidence output is `/tmp/four-fours-20261029/browser`; set `QA_EVIDENCE_DIR` to change it. The script can accept another permitted origin without changing its content assertions.

Actual Chromium 151.0.7922.173:

- EN, ZH, ZH-TW and RU at 320×568, 390×844 and 1440×900 (12 states).
- All original and new Markdown bodies match the full server response and rendered DOM. The four-row table matches both complete translated datasets.
- Four images load in each state; all TOC anchors, source links, focusable table region and document fit pass, with no horizontal document overflow.
- Canonical, five reciprocal hreflang links, Article schema, original publication and exact language-specific modification/sitemap dates pass.
- Seven language-navigation/Back/Forward steps and 54 internal-link GETs pass.
- EN desktop and ZH mobile: article CTA → Free table → disable reversals → shuffle → draw → reveal → meaning → actual drawn card’s full article pass through real controls.
- No captured page exception, non-GET request or third-party request. No AI, account, persistence or payment flow is exercised.

Selected screenshots are [desktop comparison](en-1440-reversed-entries.png), [mobile Chinese comparison](zh-390-reversed-entries.png), [mobile Chinese practice](zh-390-practice.png) and [mobile tool meaning](zh-390-tool-meaning.png). They were visually reviewed. No physical phone, Safari or Firefox test was performed.

Full logs, initial regression trace, snapshots, all ten screenshots and the scope audit program remain in `/tmp/four-fours-20261029` in the saved cloud environment.

## Release boundary

This record covers the local production build. Release must use the ordinary PR flow and exact-head GitHub/Vercel statuses. No approval review is submitted on the user’s behalf, and no protection or account policy is changed.

The earlier denied Vercel private-project scope and public-site proxy CONNECT 403 are not retried or bypassed. PR #44’s denied merge is not retried. An independent current release outcome and any exact blocked action must be recorded on this PR; no production success is claimed from local build/test evidence.
