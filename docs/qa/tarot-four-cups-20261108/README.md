# Four of Cups revision: verification and release status

Base: `8f7c5727a8f0eef612595dba42d757ff7ba1e22a`. Branch: `codex/tarot-reversals-20261108`. Node 24.19.0; Next 16.3.4. No repository AGENTS.md or project `.agents/skills` was present; `/workspace/.agents` was empty. The Vercel deployments skill was read for the intended release workflow. No environment/account/security configuration was changed.

## Passed on the final content

- Production build, standalone TypeScript, scoped ESLint and `git diff --check`. Existing Edge Runtime deprecation/build notices remain. The final later edits affect tests, check scripts and receipts only; the accepted production build contains the final article content and date registry.
- Fresh full test baseline: 376 passed / 6 failed / 382 total. Final: 378 passed / 6 failed / 384 total, zero skipped. The exact six failure names match (`baseline-comparison.json`). Historical failing assertions and expected hashes were not changed or omitted.
- `validate-four-cups.log`: both current records pass JSON Schema; historical file and Markdown hashes agree with the prior depth manifest; every old section and nonrevision field is intact; exactly two new sections and two fresh source records are present; readable manuscripts match the complete JSON Markdown. The Python helper integrates those historical/current receipts into the existing validation path.
- `validate-tarot-learning.py`: original 312 approved records reconstruct exactly; JSON Schema checks run with the existing available package. `validate-tarot-editorial.py`: all 16 historical editorial editions pass. Their base versions also pass.
- `preserved-scope.json`: exact main-base bytes retained for PR63's simplified-Chinese Hanged Man, PR62's three-card implementation/receipt, both unedited Four of Cups editions and both method files adjacent to open PR44.
- Independent read-only AI source and bilingual review found no content blocker. New facts are supported by the two public Waite passages; modern applications and the invented case are explicit. This is not a human/expert certificate.
- Actual Chromium, local production server: EN/ZH/Traditional Chinese/Russian at 320×568, 390×844 and 1440×900, 12 states total. Complete paragraphs, images, all earlier sections, new section navigation, correct language/canonical/hreflang and no horizontal document overflow pass. Desktop English and mobile Chinese source/practice screenshots were visually inspected and are legible.
- Four initial server HTML editions have all section IDs, Article publication/modification dates and citations. All four sitemap dates match their actual language scope. Forty-seven internal destinations/fragments return 200, including new source-context navigation and matching-language tool paths. EN→ZH→Back→Forward language/content works.
- Actual desktop EN and mobile ZH article→tarot table→open settings→Free table→shuffle→draw→reveal→meaning dialog pass. The random cards are not the written teaching card. Mobile meaning screenshot was inspected. Browser routing blocks non-GET and external requests; no AI generation, account persistence, purchase or payment was tested.

## Existing failures and recovered checks

The complete suite is not green. Six failures remain in prior people-edition/sitemap/date snapshot receipts. Initial current tests also found that the date test's explicit editorial inventory needed this new EN/ZH-only revision. Only its scope/date predicate was extended; final actual dates are independently checked and all six historical failures retain their old expected hashes.

`npm run lint` exits 2 because the repository has no default ESLint config. The existing scoped `eslint.english.config.mjs` passes for every edited TS and browser script. No unrelated lint migration was attempted.

Two broad depth validators fail identically on a clean detached baseline worktree and the current tree: `validate-tarot-depth-content.py:174` first reaches historical `zh/death`; `validate-tarot-depth-final.py:53` first reaches `zh-TW/death`. Their old full-Markdown equality check fails. These failures predate this revision; no death files or historical receipts were changed. Baseline/current traces are saved. The new Four of Cups records have their own complete passing checks above. Neither broad failing validator is represented as a pass.

The first browser run asserted a changed hash before navigation finished; the replay now waits for the URL. The next run attempted the Free table tab while its existing settings disclosure was closed; the final replay opens the disclosure through its accessible summary before selecting the tab. Initial traces are retained. Neither required a product change.

## Release blocker: draft, not production

Before editing, the formal GET target `https://www.destinypixel.com/journal/how-to-read-celtic-cross` could not be extracted by the web tool. A direct Node request failed DNS (`EAI_AGAIN`); the normal configured proxy request returned `CONNECT 403` from Envoy. After that denial, current user history was read; it contained no materially new evidence changing the access restriction. No alternate routing, IP override, protected-deployment share link or repeated formal-site request was attempted.

The user has already authorized merging and production deployment after checks. The missing requirement is a usable formal-site acceptance channel, not another content approval. With the explicit instruction not to publish blindly, the branch is saved as a draft PR. Merge/promotion is **not attempted** while formal body/tool verification is blocked. There is no merge SHA or production release for this revision. Preview build status alone will not be described as production acceptance.

After permitted formal-site access is restored, confirm current main/open PRs, rerun relevant changed checks if the branch changes, inspect the exact final head's deployment status, mark ready and merge through the ordinary server-enforced PR flow. Then correlate the remote merge SHA to its actual production deployment and verify complete EN/ZH formal bodies, dates, anchors and article-to-tool paths. This run did not force merge, bypass review, deploy directly to production or use an alternate route around denied access.

Existing formal URL targets (new sections are **not live** yet):

- `https://www.destinypixel.com/journal/tarot-four-of-cups?locale=zh#reversal-source-choice`
- `https://www.destinypixel.com/journal/tarot-four-of-cups#reversal-source-choice`

Physical mobile devices, Safari/Firefox, formal-site browser layout, private PDF access, production logs and AI/account/payment flows were not tested. Local viewport acceptance is described only as local acceptance.

## Replay

```sh
npm run build
npx --no-install tsc --noEmit --pretty false --incremental false
npx --no-install eslint --config eslint.english.config.mjs lib/editorial-updates.ts lib/editorial-updates.test.ts lib/tarot-learning/learning.test.ts lib/tarot-four-cups-revision.test.ts scripts/check-tarot-four-cups.mjs
node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts
python3 scripts/validate-tarot-learning.py
python3 scripts/validate-tarot-editorial.py
npm run start -- -p 3060
node scripts/check-tarot-four-cups.mjs http://127.0.0.1:3060
```

The last command uses the environment's preinstalled Chromium/Playwright. Set `PLAYWRIGHT_MODULE` to another installed Playwright test module if needed. It intentionally accepts only a loopback origin; formal acceptance must use a permitted channel after the recorded access denial is resolved.
