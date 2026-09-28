# Astrology and tarot — 2026-09-28

## Scope

Two standalone main-site tools, `/astrology` and `/tarot`, with EN, 简中, 繁中 and RU server-rendered pages. Homepage feature panels and desktop/mobile navigation connect to both; existing report, insights and bracelet entries remain. No account, checkout, billing, Prompt Radar or other independent app changes.

## Astrology

The existing Astronomy Engine 2.1.19 calculation supplies ten geocentric tropical planetary positions at the resolved UTC birth instant. Added eastern-horizon Ascendant, upper-meridian Midheaven, Whole Sign houses, signed daily motion, five major aspects with a 6-degree orb, and unweighted planet counts by element. The Midheaven remains independent of the tenth-house boundary. Exact local birth time and an IANA timezone are required; ambiguous/nonexistent DST times are rejected. Custom coordinates are supported. The initial chart is explicitly a fixed demonstration, not a visitor reading.

Calculation is deterministic and independent of AI. DeepSeek receives derived placements/angles/houses/aspects only after the visitor requests interpretation, without the raw birthday, name or birth location. Interpretation is symbolic, not an astronomical prediction or validated personality assessment.

References: [Astronomy Engine API](https://github.com/cosinekitty/astronomy/tree/master/source/js), particularly `SiderealTime`, `Rotation_EQD_ECT`, `GeoVector` and `Ecliptic`. Existing independent NASA/JPL fixture tests are retained.

## Tarot

78 unique cards; cryptographic Fisher–Yates shuffle with unbiased index selection. Upright/reversed orientation is assigned on shuffle. The full remaining deck is available face down; unrevealed images are not loaded. Cards cannot be drawn twice. A replaced or returned card rejoins the remaining deck with its orientation preserved until the next shuffle.

Five spreads: one card, three cards, relationship, two paths, Celtic cross. Desktop Celtic cross has a physical crossed center and side staff; mobile uses an ordered two-column layout. Free table supports mouse/touch pointer dragging, rotation, keyboard movement, reveal/conceal and returning cards. Card positions stay inside the board after viewport changes. Visitors can use the individual upright/reversed meanings without AI. In free mode, AI uses numbered card order, not inferred spatial meanings.

Artwork: Pamela Colman Smith, Rider–Waite–Smith Pam-A scans from [Wikimedia Commons / TaionWC](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). The Commons API marked all 78 selected files Public domain. Full individual source/artist/license records are at `public/tarot/attribution.json`, linked on the page. Cards are 560px WebP (13.10 MiB in total, loaded on reveal); two smaller JPEG derivatives support the static sharing image. The decorative card back and UI are original SVG/CSS. Concise meanings are original site interpretations, not quotations from a historical manual.

## AI and privacy

Both APIs validate inputs and same-origin mutations. Birth inputs and questions are POST bodies, never URL query parameters or analytics properties. Client edits abort/invalidate stale reading requests. Provider calls have a 35-second timeout, bounded JSON output and schema validation. Existing durable Supabase rate limiting permits 8 AI requests per IP/hour and 300 uncached provider calls/day across these tools; a bounded ten-minute in-memory cache deduplicates identical successful readings per process. Missing key, provider errors or unavailable durable rate storage leave the calculated chart/local card meanings usable. No paid upgrade or new external account is required. Model configuration follows `CELESTIAL_DEEPSEEK_MODEL`, then `COMPATIBILITY_DEEPSEEK_MODEL`, then `deepseek-flash`.

## Discovery and measurement

Localized title, description, H1, self-canonical, four reciprocal language alternates plus x-default, eight sitemap entries, WebApplication JSON-LD and individual share images. Fixed tool IDs `astrology`/`tarot`; starts correspond to calculate/first shuffle, successes to a chart result/complete revealed spread. Optional AI fallback is distinct. Analytics receives no cards, questions, names or birth information.

## Verification

- 13 automated tests passed: independent planet-position fixture, geometric horizon/meridian checks in both hemispheres, same-UTC/different-location invariants, Whole Sign houses, DST/input validation, aspect bounds, deck conservation/duplicate rejection, localized unique meanings, AI response validation and mocked provider behavior.
- Real DeepSeek calls succeeded for a synthetic birth chart and a three-card tarot spread; returned interpretations matched the supplied positions/cards and orientations.
- Browser checks covered free-table mouse drag, rotation, flip and return; 78 → 76 → 77 deck conservation; all five spread sizes; 320px free-table and spread layout without horizontal overflow.
- Rounded SVG coordinates to avoid Node/browser floating-point hydration differences.

- Production `next build --webpack` passed under Node 22; TypeScript and `git diff --check` passed.
- Local production HTTP checks: all eight localized pages have HTTP 200, correct self-canonical, five language alternatives and WebApplication schema. Both generated Open Graph images, the 78-card attribution manifest and sitemap return 200.
- Browser production checks: 320px astrology houses, tarot free table/ten-card spread and homepage navigation have no horizontal overflow. At 1280px the natal wheel and Russian homepage/navigation render normally. Ten cards flip with no missing images; replacing one preserves 68 remaining cards and conceals its replacement. Fresh production pages report no browser errors.
- API smoke checks: synthetic calculation 200 with ten positions; invalid location and duplicate-card payloads 400; foreign Origin 403; responses `private, no-store`.
- Build-only OG issue was fixed by using JPEG derivatives for Satori instead of WebP.
