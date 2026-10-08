# Local Chinese integration checkpoint · 2026-10-08

All 77 supplied Chinese manuscripts are integrated and locally validated. Each retains
two complete cases, original manuscript provenance, exact previous-record archives and
semantic legacy anchors. The separately approved Page of Cups wording correction is
recorded without modifying the received original. Twenty-one major-card articles have
a visible source appendix because their supplied body has no standalone source section.
Quick takes are shown once; complete remaining opening prose and sections are preserved.

Only Chinese editions receive the new modification date. Other three-language records,
the Sun, the three existing education articles, hexagrams, artwork and divination tools
remain unchanged. Existing metadata summaries already match the supplied titles, hooks
and quick takes, so no catalog change is necessary. Source URLs may be null; those books
appear by title in the source appendix and structured citations.

The 39 complete translations are retained candidates; two English drafts remain
unreviewed. No translated edition from this round is installed. Four-language completion
is therefore **0/77**, while Chinese local completion is **77/77**.

## Completed checks

- Independent source/edition integrity, complete section parity, 154 distinct cases,
  original collection archives, approved correction hashes and all legacy anchors.
- `npm run build`: 407 generated routes; standalone `tsc --noEmit --incremental false`.
- 243 server tests and one client component test: 244 passed, zero failures.
- Changed-file ESLint using the repository's existing `eslint.english.config.mjs`.
  The general `npm run lint` remains unavailable because the repository has no root
  `eslint.config.*`; no unrelated lint configuration was introduced.
- Local production HTTP checks: 312 tarot, 256 hexagram and 300 journal editions;
  884 unique sitemap URLs; the 16 protected Sun/education editions and their 77 internal
  destinations; full text, metadata, sources, canonical and reciprocal hreflang.
- The dedicated new-edition HTTP validator passed all 77 Chinese articles.
- Browser: all 77 new Chinese articles at 390px and 1440px, 308 case navigation checks,
  1,330 old-anchor checks, and four cross-card/language Back/Forward workflows.
- Existing four-language tarot drawing and hexagram casting flows retained their state
  while opening learning articles. Existing education browser coverage passed 60
  responsive views plus four language/history workflows. No browser page errors.
- Protected-scope check and `git diff --check` passed. Browser traffic stayed local.

The build preceded a non-rendered review-status clarification and workflow-checkpoint
updates; manuscript, renderer and metadata content tested by the build did not change.
Evidence is retained in `local-checks/` and `browser-local/` (including seven screenshots).

## Release state

No push, public PR, Preview or production deployment was performed for this checkpoint.
The last public checkpoint remains `163542ea0c01aad54711c8825cdd3482c223b52d`.
The parent is awaiting explicit authorization to publish to the public repository after
automatic approval review rejected publication. Final parent-reviewed three-language
packages and later external browser QA remain outstanding. Local tests do not replace
that external review or establish deployment success.
