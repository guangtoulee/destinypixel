# 64-hexagram learning library — draft review

Branch: `codex/hexagram-learning-library-20261007`.
Base: `08a43050400818ea9e33622dd6cd7137fc4673c9`, latest main when work started. The only main change since the Pamela release was `data/prompt-radar.json`, with no overlap.

This PR is now explicitly stacked on Tarot draft PR21 at `425593a043139a3b1d079f5ad055b9017fdbac8d`. A history-preserving merge combines that branch with the original hexagram head `a28ec5fc5e1548ce9cd4e868ca1b11e87c2ada72`; latest main `08a4305` and its existing bot data remain present. All seven shared files are resolved with both route families, directories, sitemap entries and tests retained. PR21 remains unchanged and both PRs remain drafts. See `docs/qa/combined-learning-20261007.md` for the combined validation and exact dependency. The standalone validation below records the original hexagram implementation.

## Delivered

- `/journal/hexagrams`: accessible index of all 64 verified identities, in traditional King Wen order, in en/zh/zh-TW/ru.
- `/journal/hexagram-01` through `/journal/hexagram-64`: 256 complete language editions using the existing query-locale convention. Original full Markdown, classical quotations, editorial glosses, Ten Wings interpretation, every regular line, modern examples, practice and source layers are retained.
- Plain summary appears immediately below the title, before the mobile contents list. All six-line diagrams have descriptive localized accessibility labels; visual order is top-to-bottom while numbered identities remain bottom-to-top. Qian's Use of Nines and Kun's Use of Sixes stay separate from the six regular lines.
- The existing `/oracle` local cast links to the corresponding full article and library in new tabs. The original question, cast and page history remain available. Articles link back to the localized Oracle tool. This does not invoke AI.
- Explicit 8×8 King Wen lookup, with upper-trigram rows and lower-trigram columns, verified against all 64 supplied identities. No binary-index shortcut, casting change or seed change. Tai/Pi and Jiji/Weiji have distinct, explicitly tested orientations.
- Server-only article loading and Markdown rendering. Client links import only small identity/path/copy modules. No API endpoint, production credential, database, account, cron, domain or homepage change.

## Source integrity

The final four Library JSON files were read completely and reconstructed byte-for-byte. Each collection contains 64 complete articles and the same 132-source ledger. Checked-in per-article JSON records reconstruct the original collections exactly. Source hashes:

| Locale | SHA-256 |
| --- | --- |
| zh | `6277b1eb37389742313dee3f723406bd019a6b09c739c4e66f3d5a8768952a1a` |
| en | `6ced0765e9725031fc396e3945bf69da80b03a214d822318621a5e1cd1e294bc` |
| zh-TW | `1cb29b77e6223f88b48a1d4453f09a3499d3577ea85808cceff3791d60e6186f` |
| ru | `d34b60249e001c48b3185ba2820163fd5182dc028b306141355869c4ce5f9ad2` |

The supplied verified identity ledger and correction ledger also match their provided hashes. Chinese 11.4 retains the final correction `未付酬的劳动`, with sourceContentHash `6de6e0ce3eb996ba94147c9f359ffc602abe8e53e27e24d66b9b4ab7f8046bc5`. No older Chinese edition was used.

`scripts/validate-hexagram-learning.py` checks all 256 schemas, collection/article hashes, source quotations and references, full paragraph preservation, 1,536 regular line explanations, eight separate special statements, Unicode code points and diagram polarity/order. The original package validator was read; its imported-content invariants are covered. Archive-only reading bundles and every original package-manifest file were not reconstructed here, so this is not an archive-wide validation claim.

The supplied manuscripts have independent model review, not native-human or classical-text expert certification. Original reviewStatus/unpublished fields remain archival provenance. The sources distinguish received text, Legge's historical translation/commentary, Ten Wings material and modern editorial applications; English/Russian glosses are not presented as verbatim Legge quotations.

## Validation

- Node 22 production build: 325 generated pages (base 260 + 64 article paths + one directory). Four query-localized editions do not count as four route paths. TypeScript passed.
- Full repository test run: 235 server tests and one separately run client test passed. New tests cover all 64 identities, all 256 source hashes/loaders, 260 reciprocal sitemap entries, invalid IDs and unchanged deterministic casts.
- Full HTTP comparison covers every rendered word of all 256 approved manuscripts, all classical quotations and six line explanations, diagrams, source citations, title suffix, single H1, canonical/five hreflang entries, sitemap, section anchors, tool links and invalid-ID 404 behavior.
- Browser matrix: four locales × 320/390/430/1440 widths × directory and five representative articles (Qian, Tai, Pi, Jiji, Weiji) = 96 views. All 64 directory diagrams are checked in every locale/viewport.
- Four mobile navigation flows exercise keyboard directory navigation, Back, article → localized Oracle → deterministic Tai/Pi/Jiji/Weiji article in a new tab, retained question/cast, and language metadata. The browser blocks writes and verifies zero API requests for the learning flow.
- Existing journal regression: all 288 released article editions, metadata, sitemap and product links passed. All 240 day-pillar editions and the four Pamela editions remain present.
- `lib/oracle/cast.ts`, `/api/insights`, and the unrelated BaZi `/api/oracle` endpoint have no diff against the base.
- Complete article paragraph samples in all four locales are absent from all 217 built client JavaScript chunks. Only the identity lookup, path helpers and UI labels enter the Oracle client.

## Reproduction

Use Node 22, Python with jsonschema, and Playwright/Chromium. `NODE_OPTIONS=--conditions=react-server` belongs only on server unit tests, never on the build or HTTP/ReactDOM script.

```sh
python scripts/validate-hexagram-learning.py
NODE_OPTIONS=--conditions=react-server node --import tsx --test lib/hexagram-learning/learning.test.ts lib/seo.test.ts lib/journal.test.ts
npm run build
node --import tsx scripts/check-hexagram-learning.tsx http://127.0.0.1:3025
node scripts/check-hexagram-learning-browser.mjs http://127.0.0.1:3025
node --import tsx scripts/check-journal-search.ts http://127.0.0.1:3025
```

This branch is for a separate draft PR and the existing project's protected Preview. Publication requires separate approval. The environment's external CONNECT proxy has previously blocked Preview access; parent authenticated browser QA remains the external verification path. Protection is not disabled.

Final responsive run passed all 96 views and four mobile workflows after the summary placement and long-name wrapping refinements. Full 256-edition HTTP comparison and TypeScript also passed again on the final build. Visually reviewed screenshots: [Chinese quick summary](zh-hexagram-11-390.png), [Tai six-line diagram](zh-hexagram-11-diagram-390.png), [Russian directory](ru-hexagrams-390.png).
