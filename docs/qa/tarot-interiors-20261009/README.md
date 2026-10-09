# Tarot interiors and release checks — 9 October 2026

The user authorized production release at 08:56 UTC, including matching tarot interior backgrounds. This supersedes the earlier Preview-only instruction for PR #25.

Main `08c010634abc7b1e75afb2235ae3d7391ad4021d` was merged without conflicts in `9cba5a6`. The newer prompt-radar data and previously integrated fortune-stick edition guide are preserved. No account, credentials, payments, environment variables, network settings or backend code changed.

## Final change

- The 78-card directory, all card articles, three educational articles, existing three-card introduction and Pamela Colman Smith biography share the original twilight landscape assets.
- A static viewport-sized background never stretches to article length or tiles. Mobile uses the existing portrait crop. Light, nearly opaque reading surfaces preserve contrast. No additional animation or asset download was introduced.
- Theme scope is the tarot learning CSS module; general Journal, hexagram and eastern article surfaces stay unchanged.
- The fan ancestor remains unfiltered, per-card shadows remain, and short-desktop first-screen actions keep their established geometry.

## Verification on the local production build

- Build, TypeScript and scoped ESLint pass; 244 unit tests pass (243 application/library + admin checkout fixture).
- Complete content checks pass for 312 tarot and 256 hexagram language editions, all 300 existing Journal editions, canonical/hreflang/sitemap, plus all 16 editorial editions and 77 internal-link destinations.
- `interiors-report.json`: 128 views = eight interior routes × four languages × 360/390/430/1440 widths; full lazy-loaded artwork, final section anchors, no horizontal overflow, static background size at top and bottom, metadata and four-language alternates. Eight language-switch/Back/Forward workflows pass; four unrelated routes retain their original surface.
- `interaction-report.json`: 16 keyboard/touch workflows exercise Shuffle/Place, unique cards, reshuffle preservation, meanings, full article in a separate tab, return to the unchanged draw, reset cancellation/confirmation, atlas and guide navigation, Back/Forward.
- `scene-report.json`: 28 cases include 1165×757 and 1280×720, visible first-screen actions, actual exposed fan selection, three-card reveal and reduced motion.
- `fan-report.json`: eight viewport/motion combinations, 48 fully settled states after entrance, shuffle, placement and hover exit. Both exposed wings pass actual pixel readback and hit testing. Original user-browser clipping was not reproduced in local Chromium; the filter removal is a targeted mitigation, not a proven root-cause diagnosis.

Screenshots here are **local production-build captures**, not screenshots of the public deployment. They include article top/middle, directory top/middle, desktop, 360/390/430 mobile, Russian wrapping, short desktop and the settled fan. The executor's outbound proxy returns CONNECT 403 for the public domain. Vercel connector also lacks project/team scope; neither network nor connection settings were changed. Production readiness will be checked separately through GitHub's Vercel commit status and public-page reads; public interactive screenshot QA requires the parent thread's external browser.

Prior full regressions remain in `../tarot-scene-20261009`, including 616 complete article browser views, 5,320 legacy anchors and all free-table/spread checks. The final interior change alters presentation and the legacy tarot articles' chrome only; all manuscripts, SEO generators and URLs are unchanged.
