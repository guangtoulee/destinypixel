# Hanged Man revision — pre-release verification, 2026-10-24

Base: `091966f10d431ec4b0720971475d1fb99954d2a9` on `main`. Independent branch: `codex/hanged-man-context-20261024`. Draft PR: [#40](https://github.com/guangtoulee/destinypixel/pull/40), opened before final review and validation.

## Content and review

Exactly one existing article is expanded in English and Simplified Chinese. All nine original sections, both labelled fictional cases, title, URL, artwork, publication date and historical provenance fields remain intact. The two previous files match the base commit byte for byte. Current record and Markdown hashes have independent receipts. Traditional Chinese and Russian remain unchanged with their October 8 dates; only the edited editions receive October 24 in visible dates, update notes, Open Graph, Article schema and sitemap.

The short answer distinguishes the figure's posture from card orientation. Three new sections separate posture/orientation/position, compare an official early-deck record with Waite's RWS text and explain practice in the existing Free table. Museum facts, Waite's mystical account, historical divinatory words and the site's modern applications are attributed separately. The Morgan object image was not inspected, so no unsupported visual detail or figure identity is claimed. Research and competitor comparison: `content/hanged-man-update-20261024/README.md`.

Independent model-assisted full content/source/code review found no remaining release blocker after the practice was corrected to name Free table, reversal settings, shuffling and revealing/selecting a card. No human, native-speaker or expert certification is claimed.

## Passed checks

- `npm run build`: passed with Next.js 16.3.4; existing Edge Runtime deprecation warning remains (`build.log`).
- `npx --no-install tsc --noEmit --pretty false --incremental false`: passed (`typecheck.log`).
- Scoped ESLint through the existing `eslint.english.config.mjs`: passed for all three changed TS files (`scoped-lint.log`). No new lint configuration or dependencies.
- 36 relevant tests: passed, zero failures (`tests.log`). Covers all 312 learning editions, preserved approval hashes and language dates, journal, editorial, methods, SEO, layout and deck cycles.
- `validate_hanged_man_record` for both current records: passed file/Markdown hashes, previous archive hashes against the original depth approval, exact old sections/order and metadata, original sources, schema, unique anchors and complete Markdown parity (`content-validation.log`).
- `node scripts/check-hanged-man.mjs http://127.0.0.1:3048`: passed (`browser.log`, `responsive.json`). Four initial HTML editions contain complete per-section text and sources; 17 internal links return 200. English/Chinese have 12 sections and the update, Russian/Traditional Chinese retain nine sections and their prior date.
- Actual Chromium at 320×740, 390×844 and 1440×900, English and Simplified Chinese: six responsive combinations, no horizontal document overflow, successfully loaded article images, all thirteen unique table-of-contents targets navigable. English desktop introduction and Chinese mobile new source-comparison paragraphs were visually inspected in the two screenshots.
- Browser interactions: English → Chinese → Back → Forward metadata stays aligned; linked three-card and journal articles open; Chinese article → tarot tool → Free table → disable reversals → shuffle → draw → reveal → rotate 15° retains Upright → orientation switch changes label and face transform to Reversed.
- No page exceptions. The only browser console/network errors were 32 local 404 responses for the two exact Vercel telemetry paths, `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`; these are identified separately in the report. Non-GET and third-party requests were blocked. No AI generation, account write or payment was performed.
- `git diff --check`: passed. `package.json` and `package-lock.json` match the base.

Relevant test command:

```sh
NODE_OPTIONS=--conditions=react-server node --import tsx --test lib/tarot-learning/learning.test.ts lib/editorial-updates.test.ts lib/journal.test.ts lib/tarot-editorial.test.ts lib/tarot-methods.test.ts lib/seo.test.ts lib/celestial/tarot-layout.test.ts lib/celestial/tarot-cycle.test.ts
```

## Environment and known baseline failures

The saved `node_modules` lacked existing `react-markdown` and `@vercel/blob`, causing the first build to fail (`build-initial.log`). Dependency restoration initially encountered an unwritable default npm cache and a 403 from an existing lockfile download mirror. Using a writable `/tmp` cache and the npm primary registry restored the exact locked versions with integrity checks; the original lockfile was restored byte for byte, without any dependency change (`dependency-restore-primary-registry.log`). The successful build above uses the restored dependencies.

Full `npm run lint` still fails because the repository has no root ESLint configuration (`root-lint.log`), reproduced before content changes. Historical depth validators also fail on unchanged main: depth-content line 174 and depth-final line 52. The final diagnostic identifies the existing Death source-link maintenance (`death/zh`, `death/zh-TW`) as the first unmatched historical bodies (`baseline-depth.log`, `historical-validation.log`). This revision does not replace those old manifests or expand into unrelated repairs. Its new Hanged Man historical projection and current records are explicitly validated.

## Release boundary and limits

This report records successful local pre-release checks. It does not itself establish publication. Exact PR-head/merge commits and Vercel status must be tracked separately in the PR release record.

Public-domain HTTPS verification is currently blocked by this cloud environment: direct GET to `www.destinypixel.com` returned CONNECT-tunnel 403, including one authorized escalation; the web reader also reported the apex and www article/tool URLs inaccessible. Vercel's connected fetch separately returned a project/team authorization 403 at `read_protection_bypass`. No account/security configuration was changed and that denied connector operation was not retried. These failures occurred while checking the already-existing production page, before release; they do not establish an origin outage. They leave public production body/tool-entry checks unverified unless an independently available access path succeeds later.

Physical phones, Safari/Firefox, authenticated persistence and AI responses were not tested. Mobile evidence is actual Chromium layout at the stated viewport sizes.
