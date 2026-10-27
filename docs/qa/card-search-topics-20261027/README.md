# Card-name search and article topics — release checks

Base: `1cc63d13f6b80117d296ce0ee3aeb782afbd85ee`. Separate checkout and branch: `codex/card-search-topics-20261027`. The unpublished three-card commit `9925c12716d2953c6da88fabcf3bf1a0f10ebe33` is not an ancestor; its working directory was not changed.

## Behavior

- The existing four-language 78-card directory searches names and explicit aliases locally. English/Cyrillic words and numeric ranks use whole-word boundaries; Chinese names allow partial names. All 312 published card names resolve uniquely, including traditional Chinese. Common coins/pentacles and Ace/one/一/王牌 variants are tested. A test found an ambiguous 女教皇 alias and it was removed so 教皇 resolves correctly.
- Each result uses both existing reviewed `quickTake` strings, with the same image and complete article URL. The initial HTML contains all 78 cards, both meanings and five group anchors without JavaScript.
- Eleven controlled topics classify real content, with one to three tags per article. There are 234 English, 229 simplified Chinese, 226 traditional Chinese and 226 Russian article editions. The five independent English-only `/learn` and `/insights` guides join English discovery only. Palmistry has no translated empty listing.
- Filtering uses the existing `/journal?topic=…` route, with clear and topic-preserving language links, a canonical to the main language-specific journal, and `noindex, follow`. Articles link to their topics; existing editorial recommendations are retained and common-topic discovery is added.
- Existing article text, publication/modification dates, sources, deep-reading URLs, landscape background and interactive tarot table are unchanged. No AI or paid generation requests were made. No new meta keywords or topic sitemap routes were added.

## Local validation

Node 22.22.0; existing dependencies match the unchanged package lock.

- `npm run build`: passed (Next.js webpack production build, including TypeScript).
- `tsc --noEmit --pretty false --incremental false`: passed.
- All changed TS/TSX and both QA scripts: passed ESLint using the repository's existing `eslint.english.config.mjs` Next.js configuration.
- `npm run lint`: cannot run repo-wide because main has no root `eslint.config.*`; unchanged.
- `NODE_OPTIONS=--conditions=react-server node --import tsx --test $(rg --files lib | rg '\.test\.tsx?$')`: **342 passed, 6 failed, 348 total**. All ten new search/topic tests passed. The six failures reproduced unchanged against an archive of base `main`:
  - `day-pillar-people-second-batch.test.ts`: historical 75-edition inventory and 982-URL/date snapshots (2).
  - `day-pillar-people.test.ts`: historical 75-translation inventory (1).
  - `editorial-updates.test.ts`: first-rollout date hashes, birthday-rollout date hashes, original 75-entry date receipt (3).
  Current main contains 79 journal articles and later editorial revisions; this feature does not rewrite those historical assertions or article dates.
- `git diff --check`: passed.

`scripts/check-card-search-topics.mjs` passed against the local production server with Chrome 156: all four languages, 19 search fixtures each, clear/focus/keyboard and no-results states, full-guide links and Back, language switching and Back, no-JS content, actual 320/390/1440 viewports, topic filtering and article tags, and English/simplified Chinese interactive deck draws. No page exceptions. Screenshots were visually reviewed. Requests are limited to same-origin GET; external/write requests are blocked.

`scripts/check-card-search-topics-http.ts` passed all **915 actual article-edition URLs**, **41 populated topic filters**, **3 unavailable-language palmistry fallbacks**, and **4 complete 78-card directories**. Checks include HTTP 200, canonical/H1/language, exact SSR tag assignment and working filter URL, complete result subset, query robots directive and matching ItemList schema.

Machine-readable evidence: [browser report](local/report.json), [HTTP report](local-http/report.json). Full viewport screenshots and command logs are retained in the local checkout, outside the committed evidence set.

## Release verification

PR starts as draft and is marked ready only after the above checks. Verify final head SHA and remote Vercel status before merging, then verify the merge SHA's deployment status and run both scripts against `https://www.destinypixel.com`.

The Vercel connector refused `get_deployment` for `destinypixel.com` in team `team_5OQidQba1dLcpLhkVoOWXZsK` with HTTP 403 (team scope authorization missing). It was not retried or bypassed. GitHub's commit-associated Vercel status and the actual production site are the release evidence; direct Vercel API deployment details/runtime logs remain unverified through that connection.
