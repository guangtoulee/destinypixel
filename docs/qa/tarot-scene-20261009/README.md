# Illustrated tarot Preview verification

Local production-build verification, 9 October 2026. Preview-only PR #25; production remains unchanged. Main `140ac9e` was merged without conflicts before this revision.

- Build and TypeScript pass. Scoped ESLint: zero errors, one pre-existing `<img>` warning.
- 244 unit tests pass (243 library/app tests plus admin checkout fixture).
- All 868 article editions and 884 journal sitemap entries pass metadata, canonical, hreflang, schema, sources and reciprocal learning-entry checks, including all original 312 tarot and 256 hexagram editions.
- 616 full article browser views, 1,232 case-anchor navigations, 5,320 legacy-anchor checks, 168 source-appendix views and 16 cross-card/language history workflows pass. See `article-regression.json`.
- 16 four-language tool interaction workflows pass: keyboard/touch drawing, unique cards, reshuffle preservation, reset cancellation/confirmation, meaning/article navigation and history. See `interaction-report.json`.
- 32 mode/locale/viewport cases cover free mode and all five spreads. Four locales × five free-table viewports verify 480 rotation steps, pointer and keyboard bounds, reversal and source viewer preservation.
- Eight cycle scenarios cover normal and reduced motion in all four languages; no external AI/account/payment writes occur (the reading response is a local fixture).
- The final scene suite additionally checks first-screen buttons, fan dimensions, actual exposed-side-card pointer selection, three unique revealed cards, no overflow and reduced-motion behavior at 360, 390, 430 and 1440 pixels in all four languages. See `scene-report.json`.

The full-content and history regressions ran after integrating main. Final changes after those checks are scoped tarot scene styling, fan animation timing, and moving free-mode help below its viewport-bound workspace; the production build and scene/free-table checks were rerun. Original images and asset provenance are in `../../design/tarot-scene-20261009/`.

Remote browser visual approval belongs to the parent thread. The executor cannot access protected Preview pages through its outbound proxy; deployment readiness is verified separately through the Vercel status reported to GitHub. This is not a production approval or production verification report.

Measured initial fan widths: 308.47px on mobile (142px center card), 599.48px on desktop (190px center card). Screenshots show the final settled state; `desktop-motion.webm` records the default shuffle, placement and reveal sequence.
