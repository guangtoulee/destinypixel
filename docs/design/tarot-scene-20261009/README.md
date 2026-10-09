# Tarot scene, 9 October 2026

Preview-only revision of PR #25, based on main `140ac9eb3b46f39162eb1821e29e29d1b5537466`. The prior beige panel design was rejected. This revision gives `/tarot` an illustrated scene and a large interactive fan. Existing `/journal` article URLs, canonical URLs, language links and anchors remain intact. The homepage and backend are unchanged.

## Original artwork

Both source PNGs were generated with the built-in image generator in this execution environment and inspected directly. No outside website artwork was copied. The parent thread's separate Library background could not be downloaded (`download failed`); these are newly generated assets, not that Library file. Originals are retained in `originals/`.

- `twilight-terrace.png`: original 1536×1024 illustrated violet mountain lake, sunset, right-hand arch, empty foreground stone terrace. No cards, text or UI. Corners inspected for pseudo-signatures.
- `foreground-bough.png`: original 1024×1536 transparent botanical overlay, generated separately so the foreground can move independently of the landscape.
- Runtime WebP assets are under `/public/tarot/scene/`: desktop landscape ~284 KiB, dedicated portrait landscape ~124 KiB, alpha bough ~68 KiB. Only the viewport's chosen landscape is requested.

The far and near atmospheric layers move at different speeds; two separate botanical overlays sway at the edges. The main landscape stays still. Ambient particles are sparse. The scene ends before the reading section. Reduced-motion freezes ambience and card transitions, retaining all controls.

## Interaction

The existing deck logic still owns order, shuffling, drawing, reversals, reset and history. Six exposed fan cards call the existing indexed `onDraw` action; the center retains drag-to-position and ArrowDown cycling. Shuffle and Place remain explicit buttons. Spread settings are a secondary native disclosure. Free mode keeps its controls visible within its bounded workspace. No card meaning is fabricated or fetched for the decorative background.

## Routes

- `/tarot`: independent themed tool shell, four locales via existing locale query.
- `/journal/tarot-cards`: existing 78-card directory.
- `/journal/how-to-connect-three-tarot-cards`: existing introductory guide.
- Other `/journal/tarot-*` articles retain their previous locations and navigation.

Production publication is not authorized for this visual revision; review the updated Preview first.
