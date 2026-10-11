# Guanyin overview acquisition paths

Application source: `7e9a9b12b6e3e4e65c9190aa174c213eaaaaec06`.
Base main: `bf21877944f181119b1fd6c64e75c0af69a975bc`, including PR27 and the subsequent prompt-radar update.
PR: https://github.com/guangtoulee/destinypixel/pull/28

## Evidence and decision

The supplied GSC snapshot covers October 2–8, not current traffic. It reports 53 impressions, zero clicks and an average position of 12 for the Guanyin overview, with queries about versions and interpreting allusions. This suggests a reading intent worth serving; it does not prove a title problem or predict more clicks.

The detailed article `/journal/fortune-stick-number-and-edition` already received a substantive revision on October 9, after that snapshot. Its existing sections explain identification, official collection comparisons, mismatched poems, reading imagery and same-edition commentary, and the existing number lookup. Duplicating that article would not address a demonstrated gap.

The overview's only detailed-guide link was inside its offline-lookup FAQ. In the captured pre-change HTML at a 390 × 844 viewport, it began at y=1919px (see `before-summary.json`). The page was already linked from Learn, Tools, the sticks tool's explanatory content and the detailed article; it was not an orphan or broken route.

This change provides three task-specific paths immediately after the existing introduction:

- An existing temple slip → `#step-1`: retain source, collection, number and actual text.
- A mismatched online poem → `#step-4`: compare wording and collection before substituting a reading.
- An unfamiliar allusion → `#step-5`: read the verse, imagery and commentary from the identified edition.

The fourth link opens the existing Guanyin tool and explains how to expand its offline-number lookup. It explicitly warns that the returned entry may be a modern reflection. Underlines identify the links on touch screens. The English overview retains its title, six FAQs and draw action. Its modification date is October 11; the detailed article remains dated October 9.

## Verification

- 14 existing SEO/guide tests pass: `node --conditions=react-server --import tsx --test lib/seo-guides.test.ts lib/seo.test.ts`.
- Scoped unchanged Next.js rules pass: `node_modules/.bin/eslint --config eslint.english.config.mjs components/seo-guide-article.tsx lib/seo-guides.ts`.
- The final `npm run build` passes compilation, TypeScript and generation of 417 pages; see `build-final.log`.
- `scripts/check-celestial-search.ts http://127.0.0.1:3037` passes eight astrology/tarot locale editions and their metadata, SSR content, internal links and sitemap integration; see `celestial-ssr.log`.
- Actual Chromium acceptance uses a local production server. See `browser-report.md` and `browser-report.json` for 320/390/430/1440px fit, keyboard/Back behavior, hash destinations, four-language detailed-guide metadata and lookup results, and JavaScript-disabled content. Final CSS verification is recorded separately. All analytics scripts, external requests and writes are blocked during browser QA; no AI, account or payment action is used.
- The production server's sitemap contains 982 unique URLs, zero duplicates. The overview appears once with `lastmod=2026-10-11`; the detailed article's four reciprocal language editions retain `lastmod=2026-10-09`.

The before screenshot renders pre-change initial HTML captured from this checkout with JavaScript disabled; it is a local baseline, not a live-site screenshot. The after screenshots show the checked final local production build.

## Audit findings outside this patch

No evidence justified changing astrology's title: the existing implementation provides ten bodies, Sun/Moon/Rising, ASC/MC, twelve Whole Sign houses, major aspects and retrograde indicators. Its calculation is free without an account; AI interpretation and saving have separate boundaries. Existing astrology/celestial tests passed 16/16, and the production SSR regression above passed.

No duplicate sitemap entries, missing Guanyin canonical or orphaned Guanyin page was found. This patch improves discovery of existing content; it does not repair a demonstrated indexing failure. The multilingual journal uses localized `main lang` and reciprocal metadata, while its root `html lang` remains English in the browser check. That existing accessibility issue is recorded without expanding this patch.

Existing analytics sends fixed tool/area event properties and sanitizes query parameters and fragments; it does not send user questions in event properties. Astrology and Tarot have start/result events. Sticks draw and lookup share the same event names, so they cannot be separated by collection or action. Oracle and I Ching lack complete start/result events. Generic article-click properties group article routes, while pageviews retain the public article pathname. Preserved UTM parameters alone do not establish that current account reports expose UTM attribution. Vercel analytics reads returned a scope-permission error; event delivery, current plan and UTM reports were not verified. No tracking code was changed.

## Public verification limits

The existing GitHub/Vercel integration reports preview deployment status for each exact commit. Direct HTTP/browser access to both the public domain and preview alias fails at the environment's proxy with `CONNECT tunnel failed, response 403`, before reaching the application. The web reader also cannot retrieve these pages. Authenticated Vercel deployment/detail and preview-fetch tools return 403 because the connection lacks the `destinypixel` project/team scope; no Vercel CLI credentials are available.

These results establish local production behavior and remote build status, not direct production-page or production-interaction verification. The formal page for independent checking is https://www.destinypixel.com/learn/guanyin-fortune-sticks. The existing reading destination is https://www.destinypixel.com/journal/fortune-stick-number-and-edition; the tool entry is https://www.destinypixel.com/sticks?locale=en&type=guanyin.

The patch contains no new pages, verse collection, PR14 draft, external service, indexing request, advertisement or analytics change. Source changes are limited to the existing guide data, its optional SSR navigation renderer and its scoped CSS. Package versions and the committed lockfile remain unchanged. The original working checkout is preserved; Next.js-generated local agent files are excluded from this PR.
