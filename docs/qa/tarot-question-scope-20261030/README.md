# Three-card question and layout scope: QA, 2026-10-30

Target: **how-to-read-three-card-tarot**, the existing introductory worked example. This is not the declined October26 `how-to-connect-three-tarot-cards` revision. Base main `d969aedab73a5764525a7234a1fe2e9bd20aa6c8`; independent branch `codex/tarot-method-20261030`. Main and open PRs rechecked before publication; no overlap. PR44 and all excluded pending work are untouched. No account/security, unrelated project, package, lockfile, layout or product implementation edit.

## Passed

- Production `npm run build`: pass (build.log).
- Standalone `npx --no-install tsc --noEmit --pretty false --incremental false`: pass (empty typecheck.log), run after the production build to avoid generated-type races.
- Existing `eslint.english.config.mjs` scoped to five edited/new TypeScript files and the HTTP checker: pass (empty lint-scoped.log). No rule disabled.
- Full existing Python editorial validation with the actual jsonschema dependency: all16 retained complete editions and original source hashes pass (editorial-validation.log). This validates the separate unchanged editorial collections; the current introductory article is covered by TypeScript and the dedicated new tests below.
- Four new tests pass: all prior metadata and eight IDs/order; every original paragraph at the front and all original position-table/links retained; exactly two sections may gain the planned additions; the other six sections and complete RU/TW copies remain equal; explicit prior Traditional Chinese pin; baseline/current source receipt hashes; real three/five position labels and link route; publication, language-specific modification/schema/OpenGraph/sitemap dates.
- Full HTTP checks against the actual local production server: all four complete article editions, every paragraph/table cell/step/source/link, unique H1, all eight section IDs and TOC targets, canonical, all reciprocal languages, Article publication October2 and modified October30 only in EN/ZH, corresponding sitemap dates; **34 internal destinations/fragments** all200 and anchors present (http-local.json/log).
- Actual IAB: English and Simplified Chinese at320×568,390×844,1440×900. Eight sections and two complete3-column/3-data-row tables, no document overflow or broken images. See responsive-local.json. Desktop English and mobile Chinese table screenshots were visually inspected and show readable wrapping without clipping. The original position table remains complete.
- Actual language/history navigation EN→Back ZH→Forward EN returns correct H1/main language. Existing TOC/section IDs retained and HTTP checks all target anchors.
- Actual desktop EN article new choice link→/tarot: selected real choice option and checked all five labels/order, then selected three, shuffled, placed3, revealed3 and opened the free High Priestess card-meaning dialog. The random cards are not the teaching example and are not interpreted as observations about a person. No AI request/question/account save/payment.
- Actual mobile ZH article new choice link→/tarot?locale=zh: selected choice, checked five actual positions/order and no horizontal overflow, shuffled, placed/revealed first card, opened the free Ace of Wands card-meaning dialog. Remaining four choice positions were not filled; this is not described as a complete five-card reading. No AI/background/account data entered.
- Independent read-only source/copy review found no required correction. Product labels were also checked against lib/celestial/copy.ts.
- Root visually checked the two cited book pages331/358 and printed333/360. Source subagent additionally read388–390/printed390–392, not adopted as background-form rules or predictive evidence. Targeted5-page rereading only, not whole-book completion. Source PDF bytes94647782, mtime_ns1565523810000000000 and SHA256edd0ffdc1d4e96950ce9cad1ede1eed07d6a1b57d00fd563dee1e88d41375a37 match prior records. No PDF/scan tracked.
- Baseline source file SHA verified independently with `git show d969aedab73a5764525a7234a1fe2e9bd20aa6c8:lib/journal-three-card-tarot.ts`. `git diff --check` passes. Excluded article/product files have no diff from base.

## Failures, repairs and limits

- **Full tests are not green.** Baseline:342 passed /6 failed /348 total /0 skipped. Current:346 passed /6 failed /352 total /0 skipped. The exact six historical-snapshot failure names match (baseline-comparison.json); all logs retained. No old failing assertion or baseline hash was removed, changed or skipped.
- The initial current run added a seventh failure because the registry scope test did not yet list this newly revised EN/ZH pair. Its explicit slug/date/locale expectations and historical-date projection were extended only for this pair; no historical assertion or expected hash changed. The dedicated current-date test independently checks the two new dates and both unedited dates. Initial run retained (tests-initial-date-scope.log).
- Root `npm run lint` still exits2 because main has no default eslint.config.* (root-lint.log). Scoped checks above pass. This pre-existing issue was not expanded into an unrelated configuration change.
- Initial HTTP checker inserted whitespace when stripping an inline Chinese link; the product text was correct. The checker now ignores insignificant whitespace while comparing every full paragraph/cell and still checks exact URLs and metadata separately. Initial failure retained (http-initial-whitespace.log); final all4 editions/34targets pass.
- New local clone initially lacked one public prompt-radar blob; full fetch suffered an incomplete network transfer. Only the exact public blob was restored and verified to Git SHA109c83e7d217e170d76a806fb196eb7034f515dc; data/prompt-radar.json matches base and is not changed/staged. Original workspaces and pending drafts were not reset or checked out.
- Public article was read successfully in actual Mac IAB; web extraction returned an internal fetch error. Waite §7 primary transcription was successfully read via web. Temporary GitHub connector transport failures later recovered; no connection or security setting was changed.
- No physical mobile device, native Safari/Firefox, drag gesture, AI generation, account persistence, purchase or paid flow test. No native-human language certification claimed. Private Vercel access previously denied in earlier tasks is not retried. Branch CI/deployment and production acceptance are separate subsequent steps; local build success is not described as live.

## Replay

```sh
npm run build
npx --no-install tsc --noEmit --pretty false --incremental false
npx --no-install eslint --config eslint.english.config.mjs lib/journal-three-card-tarot.ts lib/journal.test.ts lib/editorial-updates.ts lib/editorial-updates.test.ts lib/tarot-question-scope.test.ts scripts/check-tarot-question-scope.mjs
node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts
PYTHONPATH=/tmp/dpx-editorial-validation-20261026 python3 scripts/validate-tarot-editorial.py
node --import tsx scripts/check-tarot-question-scope.mjs http://127.0.0.1:3051
```

For production use the same HTTP checker with the public origin and write its report outside the repository, then correlate its deployment IDs with the exact merge commit's successful status. Save production browser/body/tool evidence separately; do not cause another deployment merely to record the previous deployment.
