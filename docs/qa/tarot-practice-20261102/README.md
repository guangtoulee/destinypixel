# Eight of Swords revision: actual verification scope

Source/copy review and exact preservation receipts: `content/eight-swords-update-20261102/`. Base `7c162a22012d8909b8b8146df573c9d36e16d4b5`; scope is one existing EN/ZH article. Full manuscript exports match the published JSON's complete Markdown. All eleven original sections are retained, and RU/Traditional Chinese records are unchanged.

## Automated checks

- `npm run build` passes with 427 static paths; `build.log`.
- Standalone `npx --no-install tsc --noEmit --pretty false --incremental false` passes; `typecheck.log`.
- Scoped ESLint using existing `eslint.english.config.mjs` passes for the registry, all changed/new TS tests and the HTTP script; `lint-scoped.log`.
- Root `npm run lint` still fails because the repository has no default ESLint config; `lint-root.log`. No root config was invented or tests disabled.
- Full command: `node --conditions=react-server --import tsx --test lib/**/*.test.ts lib/*.test.ts`. Main baseline: **362 total / 356 pass / 6 fail**. Revised: **365 / 359 pass / the same 6 fail**; exact names compared in `test-comparison.json`. All three new regressions pass. The complete suite is not green.
- The first full revised run had an additional suit-guide preservation failure, retained in `tests-current-initial.log`: its three example cards included Eight of Swords. The original immutable receipt and all 18 protected paths remain. Today's two card files strictly recover the old complete object and exact bytes after reversing only this recorded section/source/date addition; the Celtic chain is unchanged and the other 13 files retain direct byte checks. Historical hashes and test counts were not reset.
- New Python validator requires real JSON Schema validation and checks current EN/ZH records, old eleven sections/order/fields, full-Markdown inverse projection, source-prefix preservation, null local-book URL, actual page pairs, manuscripts and unchanged other languages. `validator-eight-swords.log` passes. The isolated existing `jsonschema` directory is loaded through `PYTHONPATH=/tmp/dpx-editorial-validation-20261031`; no project or system dependency was installed.
- Original 312 tarot records and 16 original editorial editions validate; see `validator-learning.log` and `validator-editorial.log`.
- Two separate existing depth validators **do not pass**: `validate-tarot-depth-content.py` fails at historical `zh/death` line174; `validate-tarot-depth-final.py` fails at `zh-TW/death` line53. Both are reproduced on an unmodified product baseline, with the relevant baseline files equal to main. See the `validator-depth-*` logs and `validator-depth-baseline-files-diff.log`. These link-maintenance/historical-Markdown mismatches were not modified or hidden.
- Run the actual HTTP check with **ordinary Node**, `node scripts/check-eight-swords-revision.mjs [base] [output]`. It renders Markdown for exact text comparison and must not use React's server-only condition. Initial React/CSS harness attempts failed before meaningful site checks and were corrected in the harness; no CSS hook or duplicate schema factory remains in tests.
- `http-local.json`: all four full server-rendered bodies, original opening/quick takes, every section, source citation schema, old anchors, TOC, canonical/four-language alternates, Article/sitemap dates and authored update notices pass. EN/ZH have12 sections/date2026-11-02; RU/Traditional Chinese retain11/date2026-10-08. Publication remains2026-10-07 throughout. All **17 internal destinations/fragments** and both card-atlas discovery links pass.

## Actual browser work

Local Next production server at 127.0.0.1:3054. Actual EN/ZH at **320×568, 390×844 and 1440×900**:12 sections, both new comparison bullets and no horizontal article overflow. `layout-local.json` retains an image still loading during the first desktop resize; the same desktop image completed normally in `image-recheck-local.json`, with no console errors. Other image variants completed. New-section screenshots are saved for English desktop and Chinese mobile.

TOC links reached `#number-and-image`; the English contrast-guide link reached the actual Eight of Wands article. Both new inline tool links reached the matching-language tarot page. Chinese mobile: expanded the actual settings, selected one-card mode, disabled reversals, shuffled, placed one card, revealed it and opened its upright short meaning/detailed article link. The actual random card was Page of Wands, not a forced teaching result. Question/context remained blank; no AI, account save, login or payment was requested.

Browser Back/language chaining hit a debugger synchronization timeout. The actual tab URL was inspected before further action; a fresh tab in the same selected browser restored access. Some DOM clicks did not navigate, while the documented current accessibility link action did; stable AX/DOM state was checked before recording success. This is recorded as browser tooling trouble, not a website regression or a passed Back/Forward test. Back/Forward remains unverified this round. No alternative browser control technology or security change was used.

These are real viewport checks, not physical iOS/Android devices, Safari/Firefox, VoiceOver or a full accessibility audit. No paid AI generation, account persistence or payment tests were run. The tool implementation is unchanged. Git whitespace checks pass; committed logs remove only terminal/trailing whitespace, with raw copies retained in the local task folder.

## Release

A local build or pushed branch is not evidence of a live page. Draft PR, exact-head checks, ordinary merge and final production commit/deployment-ID mapping plus public full-body/tool-entry verification are recorded separately after release. No PR approval operation or older denied publication is part of this revision.
