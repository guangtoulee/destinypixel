# Zhongyi1 local browser verification

Verified on 15 October 2026 using the installed Chrome 154.0.8037.98 and existing Playwright runtime. This directory documents local browser verification, not a public deployment or physical phone test. Native CDP touch input was used for drag/swipe verification; the complete mobile flow used Playwright touch taps in a 390×844 mobile context.

## Final results

- `production-local/experience-report.json`: **34/34 passed** against the optimized Next.js production build on `http://127.0.0.1:3049`. Desktop 1440×1000 and mobile 390×844 complete the journey through collecting, sequencing, printing and three artifact observations, download an actual SVG keepsake, replay with all state cleared, skip all chapters with honest 0/4 labeling, and return to the entrance. Source modal focus/close/Escape/return controls, three HTTPS source links, sound toggle, noindex, Chinese document language, loaded artwork and horizontal overflow checks pass. Zero page errors, unexpected console errors or failed HTTP resources were observed. Telemetry and external requests were deliberately blocked.
- `production-local/input-loading-before-fallback-fix.json`: **nine supplemental checks pass**, with a separately recorded artwork-fallback defect. Actual CDP touch dragging places the three pages at 390×844; actual horizontal touch swiping completes printing. Desktop mouse dragging and swiping also work. At 320×740, 430×932 and landscape 844×390, all scenes and keepsake avoid horizontal overflow; key start/back/skip/replay controls are at least 44px tall. Reduced motion is enabled in these checks. A delayed artwork response leaves the journey available. First three scenes load seven JavaScript responses without the Three.js implementation; the two implementation chunks are requested when the artifact opens.
- `production-local/fallback-fix-report.json`: **3/3 passed** against the final optimized build on `http://127.0.0.1:3050`. Artwork failures both before hydration and after hydration now hide the broken image, activate the decorative CSS fallback, retain the start control and avoid horizontal overflow. A normal-artwork mobile smoke also passes: start → skip first three scenes → three artifact hotspots → keepsake showing 1/4 → replay resets collection. Zero page errors.

The earlier supplemental report intentionally retains `passed:false` as the original failure evidence. Its sole product defect is resolved and superseded by `fallback-fix-report.json`; it is not an outstanding release blocker. `mobile-image-fallback-before-fix.png` and `mobile-image-fallback-fixed-before-hydration.png` show the before/after result. A root-level `input-loading-initial-interrupted.json` records an earlier supplemental attempt interrupted when the dev server stopped during a concurrent build; it does not establish a product failure.

## Screenshots

The `production-local/` folder contains clean production-build entrance, sources, collection, sequencing, printing, artifact and keepsake screenshots for desktop and mobile, plus 320px/430px/landscape and repaired image-fallback evidence. Its `mobile-entrance.png` was refreshed against the final 3050 build. Root-level screenshots and `experience-report.json` are the earlier development-server 34/34 run and may show the Next.js development indicator. Production screenshots do not.

Visual inspection covered desktop entrance, mobile entrance, collection, keepsake, landscape keepsake, and the before/after failed-artwork screens. The artwork and keepsake are legible, controls remain available, and no layout clipping was observed in these views.

## Reproduction

Run from the repository root with the existing Chrome/Playwright paths, after starting a local optimized Next.js build:

```sh
QA_BASE=http://127.0.0.1:3050 QA_OUT=docs/qa/zhongyi1-20261015/production-local node docs/qa/zhongyi1-20261015/check-experience.cjs
QA_BASE=http://127.0.0.1:3050 QA_OUT=docs/qa/zhongyi1-20261015/production-local node docs/qa/zhongyi1-20261015/check-input-loading.cjs
QA_BASE=http://127.0.0.1:3050 QA_OUT=docs/qa/zhongyi1-20261015/production-local node docs/qa/zhongyi1-20261015/check-art-fallback.cjs
```

Chrome launch requires the executor's approved expanded execution permission. The scripts reject non-loopback targets. Only QA files were edited by this reviewer. Specialized WebGL/context-loss tests and remote deployment verification belong to the other reviewers; they are not claimed by this report. Safari/iOS hardware was not tested.
