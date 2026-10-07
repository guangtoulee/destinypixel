# Tarot learning library — draft review

Base: `9a022aa53089ea0ed57b8b6d8719b6d34347b034` (PR20 Pamela release).
Branch: `codex/tarot-learning-library-20261007`. Latest main was fetched before commit and equals the base: no integration overlap.

## Delivered

- 78 complete card articles in en, zh, zh-TW and ru (312 editions), at `/journal/tarot-{actual-card-id}`; directory `/journal/tarot-cards`. Non-English editions use the existing `?locale=` convention.
- Every supplied section and paragraph is rendered. Upright quick take, reversed quick take, then the full hook precede the full article. Original records retain articleMarkdown, sources and editorial provenance unchanged.
- Existing RWS images and site attribution are reused. Directory, card relationships, previous/next cards, artist biography and the Tarot tool are linked in the selected locale.
- A card dialog opens its complete article in a new tab, preserving the original draw, reading and native dialog history. The Tarot topic and journal link to the directory. Main homepage is unchanged.
- Existing article URLs, canonical/hreflang, tools, card mechanics, APIs and source assets are preserved. No hexagram placeholders, algorithm changes, account writes, paid AI calls or production deployment.
- Article loading and Markdown rendering stay on the server; only small labels and path helpers enter the card dialog client bundle.

## Source integrity

Four source collections were recovered completely through paginated Library text reads after archive materialization failed. The checked-in per-card records reconstruct each original collection byte-for-byte; hashes are in `content/tarot/provenance.json`. All 312 articleMarkdown hashes and JSON Schema validations pass. Section/paragraph mapping, original source URLs/metadata, related-card IDs and image evidence also match across locales.

The original `validate_package.py` was read and verified as SHA-256 `68ad374c03131ac192bf8f559544f9c0fd91d8816c9f0b7aa4e60afd1b23fc46`. Its content invariants are checked by `scripts/validate-tarot-learning.py`. The original archive-wide validator was **not** run: archive reading bundles and every package-manifest file were not reconstructed. This is a complete imported-content validation, not a full archive checksum pass.

The supplied translations have model editorial review, not native-human certification. Source image evidence does not claim every supplied external image is pixel-identical to the site's reused assets. Source `articleSlug: null` and unpublished manuscript status remain archival provenance; actual application routes are explicitly registered in `lib/tarot-learning/paths.ts`.

## Validation

- Node 22 production build passed: 339 generated pages, including 78 new article routes and one directory. Query-localized editions are not counted as separate route paths.
- TypeScript `tsc --noEmit` passed.
- Repository unit suite: final full run passed all 235 server tests, plus one separately run client test (236 total). The metadata assertion recognizes the new Tarot route family.
- Full HTTP rendered-text comparisons: **312/312** article editions; all four directory editions; complete sections and opening text, schema, citations, canonical/hreflang, sitemap, image credits and invalid-ID 404 checks.
- Existing journal preservation: **288/288** article editions, including all 240 day-pillar editions and the four Pamela editions.
- Existing tool discovery/SEO: **8/8** Tarot/Astrology editions and homepage/guide links.
- Learning browser matrix: four locales × 320/390/430/1440 widths × directory/Fool/King of Pentacles = **48 views**, plus four locale navigation workflows. No horizontal overflow or page errors; images, quick-take order, full sections, keyboard/Back navigation, language metadata and tool-to-article new-tab state preservation passed.
- Existing Tarot workflow matrix: **32/32** cases covering free and five structured spreads, details/Back, cancellation, reset, rotation and orientation.
- Animated/reduced-motion deck cycle checks: **8/8** passed sequentially. Concurrent browser tabs cause intentional window-blur cancellation; see the committed test comment. No deck runtime code changed.
- Distinct article paragraphs in all four locales are absent from all **217** built client JS chunks.
- Representative mobile screenshots: [Chinese directory](zh-tarot-cards-390.png), [Russian Fool article](ru-tarot-fool-390.png), visually reviewed.

## Reproduction

Use Node 22. Build with `npm run build`; never set the react-server condition globally. Start the built app on a localhost port and pass that same origin to HTTP/browser checks.

```sh
python scripts/validate-tarot-learning.py
NODE_OPTIONS=--conditions=react-server node --import tsx --test lib/seo.test.ts lib/journal.test.ts lib/tarot-learning/learning.test.ts
node --import tsx scripts/check-tarot-learning.tsx http://127.0.0.1:3022
node scripts/check-tarot-learning-browser.mjs http://127.0.0.1:3022
node scripts/check-tarot-bottom-deck.mjs http://127.0.0.1:3022
node scripts/check-tarot-deck-cycle.mjs http://127.0.0.1:3022
node --import tsx scripts/check-journal-search.ts http://127.0.0.1:3022
node --import tsx scripts/check-celestial-search.ts http://127.0.0.1:3022
```

Python JSON Schema and Playwright/Chromium are QA environment dependencies. Browser scripts block external writes and use local mock AI fixtures. Production publication requires separate owner approval; this branch is for a draft PR and the existing project's protected Vercel Preview only.

## Narrow quality follow-up

Parent authenticated Preview QA confirmed all 78 localized directory links, Magician full articles and canonical/five hreflang links in all four locales, plus a Russian tool → full Five of Pentacles article → preserved 77-card spread workflow, without desktop overflow.

Browser titles now follow the existing journal convention: `<localized title> | DestinyPixel`, exactly once. H1, Open Graph/Twitter titles and manuscript text remain unchanged. Rendered HTTP and browser checks assert the final title against H1.

The article hero already declares `sizes="(max-width:650px) 220px, 280px"`, matching CSS. At a 1440px desktop viewport, actual Chromium network requests/currentSrc are `w=384` for DPR1 and `w=640` for DPR2, with a 280px rendered width. Next Image's fallback `src` is `w=3840`, but that is not the selected request in these browsers. No asset or image configuration change is needed. The responsive browser check now verifies the rendered width and selected currentSrc to catch oversized-image regressions.

Follow-up validation passed: fresh Node 22 production build (339 pages and TypeScript), 13 SEO/learning unit tests, all 312 full-text/title HTTP checks plus four directories, and all 48 responsive views plus four tool/navigation workflows with the new title/image-size assertions.
