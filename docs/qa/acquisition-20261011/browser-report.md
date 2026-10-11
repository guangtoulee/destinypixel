# Guanyin acquisition browser acceptance

Source: 618c36571bf56a7975369b2c0d7a7638a5f62a16 (before scoped underline CSS follow-up).

Origin: http://localhost:3037. Chromium: /usr/bin/chromium. Run: 2026-10-11T14:21:19.615Z to 2026-10-11T14:21:35.253Z.

19/19 checks passed. 0 page errors, 0 HTTP errors, 0 permitted write requests.

Only same-origin GET/HEAD were permitted. Telemetry scripts and all writes/external origins were blocked, without logging request bodies. No AI or account action was used.

- PASS: overview layout and navigation 320px
- PASS: overview layout and navigation 390px
- PASS: overview layout and navigation 430px
- PASS: overview layout and navigation 1440px
- PASS: reading link step-1: keyboard Enter, Tab, Shift+Tab and browser Back
- PASS: reading link step-4: click and browser Back
- PASS: reading link step-5: click and browser Back
- PASS: lookup entered from new overview link: Guanyin preselected and number 33 has readable Source note
- PASS: existing detailed guide locale en: 200, language, canonical, five hreflangs, anchors, 390px
- PASS: existing detailed guide locale zh: 200, language, canonical, five hreflangs, anchors, 390px
- PASS: existing detailed guide locale zh-TW: 200, language, canonical, five hreflangs, anchors, 390px
- PASS: existing detailed guide locale ru: 200, language, canonical, five hreflangs, anchors, 390px
- PASS: existing Guanyin lookup locale en: number 33 and Source note at 390px
- PASS: existing Guanyin lookup locale zh: number 33 and Source note at 390px
- PASS: existing Guanyin lookup locale zh-TW: number 33 and Source note at 390px
- PASS: existing Guanyin lookup locale ru: number 33 and Source note at 390px
- PASS: SSR JavaScript disabled: overview links, exact title/canonical, six visible FAQs and FAQ schema
- PASS: SSR JavaScript disabled: ordinary other guide remains without new navigation
- PASS: browser safety and errors

Screenshots:

- reading-navigation-320.png
- after-390-fullpage.png
- reading-navigation-1440.png

Detailed measurements, metadata, headings and source notes: browser-report.json.

Screenshots will be refreshed in the scoped release follow-up; see release-browser-report.json for final screenshot source.

Final source: 7e9a9b12b6e3e4e65c9190aa174c213eaaaaec06. Final scoped CSS validation and refreshed screenshots: release-browser-report.json / release-browser-report.md.

The full 19-check acceptance used core source 618c365; the final source only adds scoped navigation-link underline CSS. The final 11-check related recheck also passes.

Existing note: translated detailed journal articles have correct main lang while html root remains en; lookup sets both languages correctly. No language behavior was changed in this scope.
