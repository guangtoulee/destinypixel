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

Follow-up: replaced the multi-row selection grid with one overlapping ribbon. Card spacing contracts with the available width; selected cards rise 28px. A first tap previews, a second tap or an upward pull draws, and horizontal scrubbing only previews. Previous/next controls and keyboard arrows provide precise access to all 78 cards on narrow screens. The raised card remains a full-size tap/drag target; pointer cancellation does not draw. Selecting, shuffling, returning or replacing resets the ribbon preview without exposing hidden faces.

Artwork: Pamela Colman Smith, Rider–Waite–Smith Pam-A scans from [Wikimedia Commons / TaionWC](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). The Commons API marked all 78 selected files Public domain. Full individual source/artist/license records are at `public/tarot/attribution.json`, linked on the page. Cards are 560px WebP (13.10 MiB in total, loaded on reveal); two smaller JPEG derivatives support the static sharing image. The decorative card back and UI are original SVG/CSS. Concise meanings are original site interpretations, not quotations from a historical manual.

## AI and privacy

Both APIs validate inputs and same-origin mutations. Birth inputs and questions are POST bodies, never URL query parameters or analytics properties. Client edits abort/invalidate stale reading requests. Tarot provider calls have a 35-second timeout. Detailed natal readings use a 125-second provider timeout, a 150-second client timeout and a 180-second route limit. Both use bounded JSON output and schema validation. Existing durable Supabase rate limiting permits 8 AI requests per IP/hour and 300 uncached provider calls/day across these tools; a bounded ten-minute in-memory cache deduplicates identical successful readings per process. Missing key, provider errors or unavailable durable rate storage leave the calculated chart/local card meanings usable. No paid upgrade or new external account is required. Model configuration follows `CELESTIAL_DEEPSEEK_MODEL`, then `COMPATIBILITY_DEEPSEEK_MODEL`, then `deepseek-flash`.

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
- Ribbon follow-up: production build and TypeScript passed. Browser checks verified desktop tap-preview/repeat-tap draw, upward pull, keyboard End/Enter, and 78 → 77 → 76 → 75 card conservation; 390px horizontal scrub selected without drawing, and 320px free-table pull/return preserved 78 → 77 → 78 with no horizontal overflow. EN, 简中, 繁中 and RU localized ribbon pages return 200.

## Natal interaction and detailed interpretation follow-up

Aspect lines now use non-scaling 1.8px strokes and 3.2px selection strokes. Mouse hover or keyboard focus previews, click/Enter/Space pins, and repeat selection, clear, blank chart or Escape cancels. Selecting an aspect highlights both endpoint planets and their radial guides. Touch ignores synthetic hover, with tap selection and 44px related-aspect controls below the wheel. The initial view shows all aspects instead of filtering to the Sun.

The previous four-section AI summary is replaced by five chapters: Sun/Moon/Ascendant, the other eight planets, every Whole Sign house, up to twelve closest major aspects, and four life-theme syntheses. Each item has a deterministic position/angle label followed by a definition, personalized interpretation and practical example. A five-part introductory glossary explains signs, houses, empty houses, major angles, orb and retrograde without requiring AI. Chapter navigation, individual disclosures and expand/collapse-all keep the complete report readable on phones. EN/简中/繁中/RU copy is maintained.

DeepSeek must return every requested item exactly once; incomplete, duplicated, too-short or truncated output is rejected. The request allows up to 18,000 output tokens and explicitly excludes invented placements, named chart patterns, missing-element deficits and predictions. Derived-data-only privacy and existing rate limits remain. The natal payload version invalidates the older short-reading cache. Token parameter reference: https://api-docs.deepseek.com/api/create-chat-completion (checked 2026-09-28).

Follow-up validation:
- 15 automated tests passed, including full target coverage, tightest-aspect ordering, all four locale glossaries, birth-identifier exclusion, rejected partial/duplicate/truncated AI output and provider request bounds.
- A real local API request for synthetic 1990-05-15 12:00 London input returned 39 distinct Chinese entries. The rendered report contains approximately 13,147 characters including deterministic labels. Manually checked Sun/Moon/Ascendant, seventh-house occupants and Venus-Neptune square against computed values.
- At 320px and 390px, complete expanded report and chart inspector have no horizontal overflow. Verified repeat-click cancellation, all-entry expansion, TOC navigation and related-aspect selection. At 1280px, verified mouse hover preview, click persistence after mouse leave, two-planet aspect highlighting, Escape and blank-area cancellation. No browser console errors observed. These are browser viewport checks, not a physical-device test.
- A separate real Russian provider request returned all 39 entries in 58 seconds (39,551 JSON characters), confirming the larger multilingual output fits the configured budget.
- Final production build, TypeScript and diff whitespace checks passed. All four localized astrology routes return 200 with self-canonical and five alternate links; Russian detailed-reading entry fits 320px without overflow.

## Member-saved astrology and tarot records — 2026-09-28

- Both tools now offer explicit Save to account. Guests use an in-page login/register dialog backed by the existing membership endpoints; their current result stays in memory and is saved after successful authentication. Generation itself remains available without an account.
- Saved astrology contains the calculated chart (including UTC and coordinates) and any existing full natal interpretation. Tarot contains the complete deck/table state, spread, positions, rotations, upright/reversed and reveal states, optional question and existing interpretation. Saving before AI is supported; explicitly save again after generation to update the same record.
- `/account` lists these records separately from paid birth reports. `/account/readings/[id]` reads a private snapshot with no AI or calculation call. Opening uses the original record language. The saved chart remains interactive; face-down tarot cards can be revealed in the viewing session.
- Members may permanently delete their own records with a confirmation. `/admin` offers a paginated metadata-only list and deletion for authorized administrators, using the existing member-ID allowlist. Admin lists do not retrieve private questions, charts, or AI text.
- Reuses `saved_reports` with the `celestial-v1:` report-ID namespace; no schema migration. An atomic upsert keyed by `(member_id, report_id)` makes repeated requests idempotent. Legacy bookmark lists explicitly exclude the new namespace, and paid-report access/ownership tables are never consulted or changed by these routes.
- Server-side session ownership, same-origin mutations, 256 KB streamed body cap, strict snapshot validation, private no-store responses, noindex pages and analytics exclusion for private record URLs. There is no public record lookup and no admin endpoint for reading another member's snapshot.
- Private birth context and tarot questions stay out of URLs and logs. The Save notice and privacy page describe opt-in persistence and deletion. No passwords or tokens are stored in record snapshots.

Validation: production webpack build and TypeScript pass. 63 tests pass across celestial calculations/readings, record validation and route authorization, analytics, member authentication and commerce regression. Real Supabase tests cover EN/zh/zh-TW/RU save/reopen equality, idempotent update and original creation date preservation, summary projection, private caching, unauthenticated rejection and own-record deletion. Browser checks cover guest login with automatic save, account/admin history, a 39-entry saved natal report, saved free-table and single-card tarot layouts, and no overflow at 390/320 px. A real tarot AI response was added to an existing saved record and reopened with byte-identical rendered text; the saved view has no AI-generation action. All test data is synthetic and scoped to a temporary test member.

## Phone tarot selection follow-up

- At 740px and below the 78-card deck is split into two balanced overlapping rows. Pointer selection measures the appropriate row; the raised card is a full-width tap target, with 44px previous/next controls and a direct Place on table button. Desktop retains one overlapping row. Keyboard Home/End/Enter and directional selection remain available.
- A unified mobile playing surface joins the board, current position toolbar and deck. The large shuffle illustration and repeated explanatory block are replaced on phones by a compact shuffle control, remaining-card count and upward-drag cue. The free table is 350px tall on phones.
- Pulling a card highlights its destination. Dropping onto a specific spread slot uses that slot; dropping within the free board preserves the chosen position. An upward pull without an explicit board hit still places into the current slot. All 78 cards and existing replace/return rules are preserved.
- EN/简中/繁中/RU instructions updated. Browser viewport checks at 390px confirmed second-row tap/repeat-tap, dragging to a non-selected spread slot, free-position drag and 78 → 77 → 78 return conservation. 320px Russian layout has no horizontal overflow and 44px action targets; 1280px English remains one row and supports keyboard End/Enter. No browser console errors observed. These are viewport/pointer checks, not physical iPhone touch tests.
