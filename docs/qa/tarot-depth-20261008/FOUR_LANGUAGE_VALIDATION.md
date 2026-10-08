# Final four-language local integration · 2026-10-08

The 77 revised cards now have **308 complete local editions**: 77 each in Simplified
Chinese, Traditional Chinese, English and Russian. This adds the parent's final 231
reviewed translations to Chinese checkpoint `90b648c65705fb90497ea605167161900de4819f`.
No article or translation was generated during this integration. Earlier 39 candidates
and two unreviewed English drafts remain archived and were not used as final inputs.

## Source and display fidelity

All 15 final private Library JSON files were read through the official full-text interface
to `has_more=false`. The previously verified Traditional Chinese Wands file was reused.
All file sizes, complete-file SHA-256 values and 231 source/translated-body hashes match
the parent's manifest. The supplied English aggregate `ff465b9f…80fe16` and Russian
aggregate `40f11d96…90cdb` also match reconstruction in the supplied group order.

`content/tarot-depth-20261008/final-reviewed/packages/` preserves the exact received
bytes. The manifest records every extracted edition's package, source/body/record hashes
and Library identity. Installed non-Chinese editions must match these complete final
records exactly. Runtime provenance retains the original Chinese hash separately from
the supplied translation source hash. The approved Page of Cups brief-feedback correction
is retained in all four languages; the uncorrected incoming original remains intact.

Each edition has two distinct complete visible case sections: **616 case sections** in
the revised collection. All structured sections and remaining opening prose reconstruct
the supplied body exactly. Where the manuscript begins with two labeled quick takes,
both must match the visible quick-take fields before the repeated opening labels are
omitted from display. Pentacles' actual opening prose is retained without dropping it.

Localized source metadata comes from the final editions. Source URL order is unchanged;
source titles without URLs remain visible and produce valid textual citations. The 21
major cards use localized source appendices in all four editions. All previous section
IDs remain available through their original roles or explicit semantic aliases.

The Sun, three education articles, every hexagram, original routes, artwork and tool logic
are unchanged. The original 312 tarot records remain reconstructible from exact archives
and unchanged Sun records. Metadata summaries and date declarations now match all 308
revised editions; canonical URLs and reciprocal hreflang retain the original routes.

## Fresh checks on the four-language build

- Final package integrity and independent content validation passed all 308 editions.
  Candidate archives retain separate hash checks. In-memory negative checks rejected
  altered titles, sources and final-input provenance.
- Production build passed with 407 generated routes. Standalone TypeScript passed.
- All 244 tests passed: 243 server tests and one client component test.
- Changed TypeScript/JavaScript passed the repository's existing scoped ESLint config.
  The general root lint command remains unavailable because the baseline repository lacks
  a root `eslint.config.*`; no unrelated lint configuration was introduced.
- HTTP validation passed every new edition, including complete section rendering, both
  cases, quick takes, source appendices, legacy anchors, JSON-LD, dates and language links.
- Fresh full regression passed 312 tarot + 256 hexagram + 300 journal editions, 884 unique
  sitemap URLs, the 16 protected Sun/education editions and 77 education link destinations.
- Fresh four-language drawing and casting browser flows retained the card/cast state,
  opened the correct learning article and passed history navigation. Protected education
  browser checks passed 60 responsive views and four language/history workflows.
- Every revised edition passed at 390px and 1440px: **616 responsive views**, **1,232
  case navigation checks**, **5,320 legacy-anchor checks**, **168 source-appendix checks**
  and **16 cross-card/language Back/Forward flows**. There were no duplicate quick takes,
  horizontal overflows, page errors or external requests. Eleven screenshots are retained;
  English, Traditional Chinese and Russian long titles/cases/source appendices were
  visually reviewed. New browser script syntax and scoped lint passed.

The dedicated all-edition browser report is in `browser-four-language/`. Command outputs
are in `four-language-checks/`. The browser check uses the new local production server
at `http://127.0.0.1:3041`, restricts traffic to loopback GET and checks every rendered
Markdown paragraph, list and link against the complete record.

## Publication state

All work is private and local. No push, new public PR, Preview or production deployment
was performed. The previous public checkpoint remains
`163542ea0c01aad54711c8825cdd3482c223b52d`. Public disclosure/release remains paused after
the earlier automatic approval rejection, pending explicit user confirmation. Parent
external browser QA remains outstanding and is not replaced by these local checks.
