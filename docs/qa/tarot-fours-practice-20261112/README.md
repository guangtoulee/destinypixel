# Four Fours practice: November 12 verification

Base: `d0e724c88cb8ce096c16bbd53cba72e4d81b536c`. Branch: `codex/tarot-spread-practice-20261112`. Node 24.19.0 / Next 16.3.4. No repository AGENTS.md or project `.agents/skills` was found; `/workspace/.agents` was empty. No install, package/lockfile, environment, account or security setting was changed.

## Final local checks

- Production build, standalone TypeScript, scoped ESLint and `git diff --check` pass. Existing Edge Runtime notices remain. Later changes after the build are checks, documentation and source receipts, not live article content.
- Fresh full baseline: 379 passed / 6 failed / 385 total. Final: 381 passed / 6 failed / 387 total, zero skipped. Exact six failure names match; printed actual/expected hash values also match. The suite is not green. Historical failing assertions and expected hashes were not removed or rewritten (`test-comparison.json`, baseline/final logs).
- The new preservation test verifies unchanged historical container hashes, the exact one-section EN/ZH addition, untouched other language editions, complete current manuscript exports and all current edition dates/citations/canonical routes. The second test independently checks four sitemap entries and schema dates. All earlier source collections remain intact.
- `validate-tarot-editorial.py`: all 16 historical editorial editions pass exact source/text/paragraph/list/source checks. `validate-tarot-learning.py`: all 312 original approved records reconstruct with exact hashes, image paths and JSON Schema checks. Neither validator's historical receipt was changed to claim approval for new prose.
- `preserved-scope.json`: exact current-main bytes retained for both PR66 Two of Pentacles editions, PR67 Hermit, PR68 Strength, both neighboring method containers and both existing Four of Cups editions. The November 8 separate branch's remote SHA is still `392eb7c2d0bc0169fa75769d51f07695d6999bec`; it was not edited or resubmitted.
- Independent read-only AI review of the actual public primary texts and final EN/ZH content found no content blocker. Selected versus dealt cards, upright versus reversed lists, modern application and hypothetical facts are explicit. No private PDF/new page or native-human/expert certification claim.
- Actual Chromium against the local production server: EN/ZH/Traditional Chinese/Russian at 320×568, 390×844 and 1440×900, 12 states. Complete paragraphs, all four reused card images, correct section counts, all earlier anchors and authored new-section keyboard navigation pass. No horizontal document overflow or page exceptions.
- Four initial server HTML editions contain the expected section IDs, complete Article citations and actual language-specific dates. Canonical and five reciprocal hreflang entries, all four sitemap dates, 49 internal destinations/fragments, EN→ZH→Back→Forward content/language, and actual desktop EN/mobile ZH article→settings→Free table→shuffle→draw→reveal→meaning pass (`acceptance-local.json`). Random tool cards are not the selected teaching pair.
- Desktop English new-section, mobile Chinese practice and mobile meaning-dialog screenshots were visually inspected: readable content, no clipping or horizontal overflow. Browser requests are restricted to same-origin GETs; no AI, account save, payment or purchase operation was performed.

## Existing failures and check adjustments

Default `npm run lint` still exits 2 because the repository lacks a default ESLint config. The existing scoped `eslint.english.config.mjs` passes for all edited TS and the browser script. No unrelated lint migration was made.

The initial full run had one extra structural-language failure: the old guard expected every Four Fours section to exist in all four editions. It now removes exactly the separately receipted addition before comparing the complete four-language predecessor, explicitly checks the authored addition count, and retains all other original checks. The independent new test compares every historical section's complete data and verifies the current added text/manuscript. No assertion was skipped.

The initial browser run checked lazy images before scrolling them into view. The replay now visits every card image before checking successful loading. It passes without any product change; the initial trace remains in `browser-initial-lazy-images.log`.

The broad cross-card depth Python validators, the historical all-article HTTP script with hardcoded old dates, physical phones, Safari/Firefox, production browser layout, AI/account/payment flows and production logs were not run. No historical November 8 result is represented as a November 12 pass.

## Release/access boundary

Public web extraction successfully read the existing English Four Fours article on November 12; it still had its five original sections, as expected before this revision. The Chinese URL could not be extracted. A normal configured-proxy request to `https://www.destinypixel.com/journal/why-the-four-fours-differ?locale=zh` then returned Envoy `CONNECT 403`. This is an environment access denial, not evidence that the website itself is broken. After that denial, current user history was read; it supplied no new relevant access evidence. The denied request was not repeated or routed around.

Local checks and prepared content are complete. A draft PR is the intended review step; its actual creation result and exact remote checks belong in the final handoff, not an assumed success here. No merge, promotion or production release is claimed by this receipt. Required formal EN/ZH body/tool acceptance and remote-merge-to-production correlation remain unavailable while the public access restriction is unresolved.

Resume only through a permitted channel once access conditions change. Confirm latest main/open PRs and the exact branch head; inspect the draft result and honor any automatic-review rejection rather than switching tools to bypass it. After release checks can be completed, follow the ordinary ready/merge workflow under the user's existing authorization, correlate the remote merge SHA to the actual production deployment, then verify both complete formal bodies, new anchor, dates and tool entries. A successful branch Vercel check alone is not production acceptance.

Formal targets, with the new section **not claimed live**:

- `https://www.destinypixel.com/journal/why-the-four-fours-differ?locale=zh#fours-compare-and-combine`
- `https://www.destinypixel.com/journal/why-the-four-fours-differ#fours-compare-and-combine`

## Replay

```sh
npm run build
npx --no-install tsc --noEmit --pretty false --incremental false
npx --no-install eslint --config eslint.english.config.mjs lib/journal-tarot-editorial.ts lib/editorial-updates.ts lib/editorial-updates.test.ts lib/journal.test.ts lib/tarot-fours-practice.test.ts scripts/check-tarot-fours-practice.mjs
node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts
python3 scripts/validate-tarot-editorial.py
python3 scripts/validate-tarot-learning.py
npm run start -- -p 3062
node --conditions=react-server --import tsx scripts/check-tarot-fours-practice.mjs http://127.0.0.1:3062
```

The browser replay uses preinstalled Chromium and Playwright; `PLAYWRIGHT_MODULE` can select another installed Playwright test module. It deliberately accepts only loopback origins after the recorded formal access denial.
