# Calculated day-card browser history — 2026-10-11

Base: `f54c97098cfed468d7e3145bd730c41c0b27fdb7` (PR31). Independent draft: [PR32](https://github.com/guangtoulee/destinypixel/pull/32). Runtime source tested: `de51c43480a81eb1767ee7d667d353e49aa84a2a`; subsequent evidence changes are documentation only.

## Change

Opening `/day-pillar?pillar=ding_you` and calculating `2000-01-01` previously displayed 戊午 while the current history URL stayed `ding_you`. Switching language then using Back could restore 丁酉. The success path now finds the existing controlled card and calls `window.history.replaceState(null, "", dayPillarSharePath(locale, nextCard.slug))`. It changes the current public card URL without adding a history entry. Invalid calculations leave the existing URL and card intact.

This is a client-only calculation. It sends no birthday to an API, puts no birthday in URL/history state/storage, and invokes no AI. The existing canonical remains the generic tool URL for the current language. Article and card routes, copy, locales, dependency files, and safety settings are unchanged.

## Verification

`checks.log` records 13 passing day-pillar unit tests, scoped ESLint with the repository's existing Next/TypeScript config, standalone TypeScript, and a successful production Next build. The repository has no default ESLint config; the initial unconfigured lint command could not run, so the scoped command explicitly uses `eslint.english.config.mjs`.

`check-history.cjs` is a rerunnable browser companion. `production/report.json` records six passing flows (English and Simplified Chinese, each at 320×740, 390×844 and 1440×900), 36 card/locale/history snapshots, 18 invalid-date checks and zero runtime errors. Six full-page screenshots verify readable existing layouts, complete card artwork and the matching encyclopedia link without horizontal overflow.

Each flow opens the shared 丁酉 card, rejects blank/out-of-range/future dates without changing its URL or history, calculates `2000-01-01` to 戊午, repeats the calculation without history growth, changes language, uses Back and Forward, then reloads. URL, body language, animal name/image, encyclopedia link, locale links and locale canonical match at every stage. History length is 2 before and after calculation, and 3 after language navigation/Back/Forward/reload. Full-document language/back navigation clears the unsaved input in this browser while reconstructing the correct 戊午 card from its public URL; the date is retained while calculating on the current document. Local/session storage remains empty and no request contains the test birthday or invokes an API/AI endpoint.

Re-run against a production server:

```sh
BASE_URL=http://127.0.0.1:3051 node docs/qa/day-pillar-history-20261011/check-history.cjs
```

The new worktree and `/workspace/.agents` had no `.agents/skills` or AGENTS.md initially. Next dev generated AGENTS.md/CLAUDE.md; its instruction and the packaged Next 16.3.4 Native History API guide were read. Generated instruction files are excluded from the PR.

The code commit's exact Vercel preview `dpl_AmVx3PiM5DrdQmCG2txWENoipPTV` reported READY with matching Git metadata. This report verifies a local production build; it does not claim a public-domain browser visit. Parent independently checks deployed runtime behavior and the final merged production commit.
