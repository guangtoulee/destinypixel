# Static fan clipping: candidate trigger removed

Baseline: `3a243dcf32ee8ab35c1f3743d64ae05fa26607f9`. Preview-only correction; no production publication.

## Finding and limits

The reported defect is a hard vertical crop of the outer cards when animation ends. The parent thread inspected the user's two screenshots. Their Library downloads failed in this executor, including one supported retry into a different local directory; no readable reference images were obtained here. No alternative transfer route was used.

Computed styles on the baseline show `overflow: visible` and `contain: none` through the deck's ancestors. The scenic `contain: paint` layer is a sibling, not an ancestor of the cards. The relevant narrow ancestor is `.tarot-deck-stack`: only 190px wide on a full desktop (108px after placement), or 166px / 76px on a short desktop, while transformed descendants form the much wider fan. This ancestor applies a whole-group `filter: drop-shadow(...)`.

That offscreen filter group is the leading compositor-clipping trigger, **not a proven reproduction of the user's browser failure**. Local Chromium, including 2048×1136 at device scale 2 and ten-second settled idle, did not reproduce the original hard crop. The existing [WebKit animation/filter issue](https://bugs.webkit.org/show_bug.cgi?id=219729) documents different parent-filter application during transformed-child animation and at rest; it supports testing this structure but does not establish the user's exact browser bug. Installing the official WebKit test runtime was blocked by `403 Domain forbidden`; no alternative download route was attempted.

## Minimal correction

Remove only the group-level drop-shadow filter from the narrow fan parent. Existing individual card box shadows remain. Card sizes, fan angles, transforms, overflow, isolation, scenery and drawing logic are unchanged. No perpetual animation or forced GPU promotion is used to conceal a static paint problem.

## Verification

The dedicated browser suite waits ten seconds after initial entry, then 2.5 seconds after each settled action with the pointer outside the fan and focus removed. It checks six states: initial 78, shuffled 78, hover-ended 78, placed 75, reshuffled 75, hover-ended 75. It covers 1165×757, 1280×720, 2048×1136 (DPR 2) and 390×844 with both normal and reduced motion.

In addition to geometry and click hit regions, screenshots are read back as pixels: gold card-border strokes and adjacent purple card fill must actually be painted on BOTH exposed wings outside the narrow parent box. This avoids treating a valid bounding box or hit region as proof of visible pixels. Primary actions must remain above the fold. The parent filter must compute to `none` at every settled state.

The before images are genuine local baseline captures, **not reproductions of the user's clipped screenshots**. After images show the candidate correction at the same settled states. Original-browser confirmation remains required before calling the reported defect conclusively resolved.

Result: production build and types pass; all 8 viewport/motion combinations and 48 settled states pass. Both wide-screen baseline motion variants retain exactly equal per-card bounding boxes after the correction (no size, position or angle change). Each captured wing has at least 13 independently verified painted border samples.
