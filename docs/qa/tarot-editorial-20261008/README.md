# Tarot editorial revision QA · 2026-10-08

Base: `facd57a0c98b19dff9cb5b38b9d3751bcb65c737`, including the unrelated Prompt Radar refresh unchanged. Initial source baseline was `6865074359387409d81bbfa6019af471fa942b03` (merged PR21/PR22).

## Content and scope

- Four complete Chinese articles and twelve complete translations: Sun revision, four Fours comparison, three-card connecting method, and tarot history. English/Russian were translated in full; Traditional Chinese was reviewed after conversion. No native-human or specialist certification is claimed.
- The complete delivered source JSON and all four Chinese article SHA-256 values match exactly. `V&A` message entities were restored to literal characters, recovering the source hashes. All sixteen editions have matching section, paragraph-block, list-item and source-link structures.
- Current Sun keeps its URL, identity, existing art, related cards and original 2026-10-07 publication date. Modified date is 2026-10-08. Old section anchors remain. The exact four previous Sun records are archived, so the original source collection hashes can still be reconstructed without falsifying provenance.
- Other 308 tarot records, 256 hexagram records, image assets and existing journal manuscripts are unchanged. The two existing journal articles receive related-reading navigation through the renderer, with their existing text and dates preserved.
- No changes to drawing, casting, account/payment flows, APIs, environment variables, package versions, lockfile, unrelated pages or the latest Prompt Radar data.

## Checks

- Node 24.19.0, matching the Vercel project's Node 24 major; Next 16.3.4 webpack production build: 407 routes. TypeScript passes.
- Full server unit discovery plus the separate client-render test: **244 pass**. Server tests use the React server condition; build/HTTP/browser tests do not.
- All modified TypeScript/TSX/JavaScript passes ESLint using the repository's existing Next flat configuration (`eslint.english.config.mjs`). `npm run lint` itself remains blocked by the pre-existing absence of a root `eslint.config.*`; no unrelated lint configuration change is included.
- Source validators pass: all sixteen editorial editions; original 312 tarot editions reconstructed from 308 unchanged records and four archived Sun records; all 256 unchanged hexagram editions.
- Full HTTP regression: **312 tarot + 256 hexagram + 300 journal editions = 868 complete article editions**, plus directories. Metadata, canonical, reciprocal hreflang, JSON-LD, source links and sitemap checks pass. Journal sitemap has **884 unique URLs**: 868 articles and 16 index/directory editions.
- Dedicated editorial HTTP checks compare every rendered section against its complete Markdown, check opening paragraphs, dates, citations, 77 internal destinations, reciprocal links from old articles/cards, normal `V&A` display, and retained Sun anchors. All sixteen editions pass; `/journal/tarot-the-sun` remains 404.
- All eight Tarot/Astrology tool editions and existing homepage/guide entry links pass.
- Editorial browser checks: **60 responsive views** (five pages × four locales × 320/390/1440 px), images, section navigation, keyboard focus; four complete language-switch/Back/Forward/related-link workflows; no page errors.
- Existing tarot learning browser checks: **48 responsive views** and four tool → article/new-tab/Back/cast-preservation workflows.
- Existing hexagram browser checks: **96 responsive views**, all 64 directory diagrams and four Oracle/new-tab/Back workflows, including correct Tai/Pi/Jiji/Weiji links with retained casts.
- Tarot bottom-deck regressions: **32/32 mode/locale/viewport cases**. Deck-cycle checks: all eight reduced-motion/animated locale cases, including keyboard/touch, repeated/cancelled drops and retained mock readings.
- Existing tarot history regression also passes at 1280/390/320 px: select, draw, reveal, return, reset, Back/Forward and a fresh spread selection remain consistent.
- Final rebuild on `facd57a` passes, with TypeScript and all affected HTTP/editorial browser checks rerun against that final build.
- Sixteen full-article paragraph samples are absent from all 218 client JS chunks.
- Existing site artwork was visually checked for all seven reused cards. Desktop journal, Chinese mobile comparison gallery and Russian mobile Sun screenshots were visually reviewed. Final semantic cleanup keeps captions directly inside figures and keeps Open Graph date changes scoped to the Sun.

## Environment notes

The preinstalled dependencies were older than the lockfile and lacked `react-markdown`. A normal install stalled on mirror URLs and an unwritable default cache. A separate temporary installation used canonical npm URLs while retaining every locked version and integrity hash. Repository package/lock files were unchanged. These are local environment repairs, not application dependency changes.

GitHub CLI API requests fail at proxy tunnel setup; the official GitHub connector successfully identifies `guangtoulee` and reads PRs. Repository fetch/push uses the existing Git transport. Vercel project `prj_slMeI1x88MXzQ04gXZG8hg3pizxU` belongs to team `team_5OQidQba1dLcpLhkVoOWXZsK`. Existing Preview protection is preserved. The connector can read project details, but an explicitly scoped deployment-details call returned 403 (not authorised for the destinypixel scope); this is a service access limitation, not an automatic approval rejection.

External authenticated Preview browser QA is a separate required task step before the already-authorised production merge. Local checks do not claim that external review or production deployment has happened.

## Reproduction

```sh
python3 scripts/validate-tarot-editorial.py
python3 scripts/validate-tarot-learning.py
python3 scripts/validate-hexagram-learning.py
node --conditions=react-server --import tsx --test 'lib/**/*.test.ts' 'app/**/*.test.ts'
node --import tsx --test components/admin-sandbox-checkout.test.ts
npm run build
npx tsc --noEmit --incremental false
node --import tsx scripts/check-tarot-editorial.tsx http://127.0.0.1:3038
node --import tsx scripts/check-tarot-learning.tsx http://127.0.0.1:3038
node --import tsx scripts/check-hexagram-learning.tsx http://127.0.0.1:3038
node --import tsx scripts/check-journal-search.ts http://127.0.0.1:3038
node --import tsx scripts/check-learning-integration.ts http://127.0.0.1:3038
node --import tsx scripts/check-celestial-search.ts http://127.0.0.1:3038
node scripts/check-tarot-editorial-browser.mjs http://127.0.0.1:3038
node scripts/check-tarot-learning-browser.mjs http://127.0.0.1:3038
node scripts/check-hexagram-learning-browser.mjs http://127.0.0.1:3038
node scripts/check-tarot-bottom-deck.mjs http://127.0.0.1:3038
node scripts/check-tarot-deck-cycle.mjs http://127.0.0.1:3038
```
