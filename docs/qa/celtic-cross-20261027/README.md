# Celtic Cross crossing cards and reversals — 2026-10-27

One existing article is expanded in English and Simplified Chinese: `/journal/how-to-read-celtic-cross`. Base: `e7dbcd9a1fda111e90e15f27707a60edb7847f8f`, including the deployed PR #42. Content commit: `72e9ed24208963dfbc1b5f7b01f5a0f8e6011e67`. Draft PR: [#43](https://github.com/guangtoulee/destinypixel/pull/43).

## Editorial scope

The six original sections, all original paragraphs, ten-card table, diagram, title, topic, action and internal links are preserved. Two sections add a distinction between layout angle, orientation and position meaning; a two-hypothesis collaboration table; and an original exercise changing only the crossing card to reversed Three of Pentacles. Both languages identify the variation as hypothetical and the practical readings as contemporary RWS interpretations. The tool cannot be asked to return this example as a preset. Historical divination, modern reflective practice and a deck's own guidance remain distinct. No predictive/scientific, health or gender claim is added.

The original publication date remains 2026-10-23; only this article's shared EN/ZH modification date becomes 2026-10-27. Its only advertised editions remain EN/ZH. The journal-method article is identical to the base, including its dates. No historical test assertion is changed.

The declined local three-card commit `9925c12716d2953c6da88fabcf3bf1a0f10ebe33` was not retrieved, rebuilt, rewritten or cherry-picked. The new remote branch starts directly at the stated base. Existing three-card content files, card-name search, topics, and tarot product/CSS files match the base; hashes are recorded in [validation.json](validation.json).

## Sources checked

- [Waite, Part III §7](https://sacred-texts.com/tarot/pkt/pkt0307.htm): the crossing position is an obstacle, even when the card is favourable by itself. The article distinguishes that from this site's broader support-or-constraint position. The instruction to lay the card across is not presented as a universal rule for reversed orientation.
- [Waite, Part III §3](https://sacred-texts.com/tarot/pkt/pkt0303.htm): the reversed Sun retains the same general meaning in lesser degree. It demonstrates a historical counterexample to automatic opposites.
- [Waite, Seven of Cups](https://sacred-texts.com/tarot/pkt/pktcu07.htm): the upright entry emphasizes imagination without lasting substance; the reversed entry shifts toward intention and determination. The article does not generalize this into one formula for all reversals.
- [Red Wheel/Weiser's Pollack listing](https://redwheelweiser.com/book/seventy-eight-degrees-of-wisdom-9781578636655/): checked for its description of a modern psychological approach. Its 2019 English edition and 368 pages do not replace the supplied Chinese edition's bibliographic information or pagination.

The article's original targeted Pollack references are retained from the repository's [October 23 source-review receipt](../tarot-methods-20261023/README.md): Rachel Pollack, Sun Meijun translation, 商周, 2010 Chinese edition; the user identifies 422 pages. No source PDF was available or read in this cloud revision, no additional book pages are claimed, and no PDF, scan, extended quotation or extracted private source text is included. Prior page numbers refer only to that earlier documented scan. The new variation and review questions are independent editorial work. Model-assisted source/copy review found no release-blocking issue; no expert or human certification is claimed.

The selected environment contains no readable repository or ancestor `AGENTS.md` or relevant `.agents/skills` files. Recent commits and open PRs were reviewed before selecting this independent topic.

## Verification

Node 24.19.0, npm 11.9.0, Next.js 16.3.4; no dependency or lockfile changes.

- `npm run build`: passed, including TypeScript and all 426 static paths. Existing Edge Runtime warnings remain.
- Full Node/tsx suite before and after: **342 passed, 6 failed, 348 total**. Exact same six failures and counts are recorded in [validation.json](validation.json): historical day-pillar people inventories/date snapshots (3) and editorial date receipts (3). The full suite is not green; no assertion was weakened.
- Affected TS and the new browser script pass the existing `eslint.english.config.mjs`. Root `npm run lint` still cannot run because the baseline has no root `eslint.config.*`.
- `scripts/check-journal-search.ts http://127.0.0.1:3047 how-to-read-celtic-cross`: both complete article editions, H1, all paragraph text, canonical/alternates, original publication and real modification dates, Article schema, sitemap and product GET checks pass.
- Explicit date/locale checks confirm the two authored editions and the journal guide's unchanged date.
- `scripts/check-celtic-cross-revision.mjs`: actual Chromium 151 at 320×568, 390×844 and 1440×900 in both languages (6 states); all sections, new TOC anchors, loaded images, source links and no document overflow. EN/ZH switching, Back/Forward, keyboard topic navigation and 16 internal-link GETs pass.
- Article → tool → Celtic Cross → disable reversals → shuffle → select/draw/reveal the second card → open its meaning passes in desktop EN and mobile ZH. All ten tool labels match the teaching table. Desktop crossing transform is `matrix(0, 0.82, -0.82, 0, 0, 0)` while the modal says Upright; mobile uses its unrotated grid and says 正位. Actual card buttons are clicked, without force or synthetic state injection. No captured page exceptions.
- Article and tool screenshots were visually inspected. Browser requests allow same-origin GET only; no AI, account, paid or other write flow was exercised.
- `git diff --check`: passed.

Machine-readable local browser evidence: [browser-local.json](browser-local.json). Full command logs, initial failure trace and screenshots remain in `/tmp/celtic-cross-20261027` in the selected cloud environment. Re-run the browser script with `QA_EVIDENCE_DIR` to choose a different evidence directory or pass the public production origin as its first argument.

## Existing limitation and release boundary

The initial desktop pointer test found the second-position **text label** overlapped by the third slot. This CSS is unchanged from the base. The visible card button successfully selects, reveals and opens the crossing card, so the article's stated interaction is verified. The label overlap remains an existing usability issue outside this one-article revision; the failed initial trace is retained rather than described as a passing label test.

No physical phone, Safari/Firefox, AI generation, account persistence or payment test was performed. These viewport checks use a real browser. Vercel private project/details access was previously denied with a scope 403 and was not retried or bypassed. This is a pre-release evidence record: verify the final PR head's GitHub/Vercel status before marking ready and merging, then verify the exact merge commit's status plus public production content and tool flows. A successful build alone is not evidence that production is live. Production findings will be recorded on the PR.
