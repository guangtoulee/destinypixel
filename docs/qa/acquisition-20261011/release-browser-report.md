# Guanyin acquisition browser acceptance

Source: 7e9a9b12b6e3e4e65c9190aa174c213eaaaaec06.

Scoped release recheck after navigation link underline CSS: overview layout/visible link affordance, existing destinations/keyboard/back, lookup entry and SSR; four-language detailed guide/lookup full acceptance is in browser-report.json for prior source.

Origin: http://localhost:3037. Chromium: /usr/bin/chromium. Run: 2026-10-11T14:23:09.516Z to 2026-10-11T14:23:19.563Z.

11/11 checks passed. 0 page errors, 0 HTTP errors, 0 permitted write requests.

Only same-origin GET/HEAD were permitted. Telemetry scripts and all writes/external origins were blocked, without logging request bodies. No AI or account action was used.

- PASS: overview layout and navigation 320px
- PASS: overview layout and navigation 390px
- PASS: overview layout and navigation 430px
- PASS: overview layout and navigation 1440px
- PASS: reading link step-1: keyboard Enter, Tab, Shift+Tab and browser Back
- PASS: reading link step-4: click and browser Back
- PASS: reading link step-5: click and browser Back
- PASS: lookup entered from new overview link: Guanyin preselected and number 33 has readable Source note
- PASS: SSR JavaScript disabled: overview links, exact title/canonical, six visible FAQs and FAQ schema
- PASS: SSR JavaScript disabled: ordinary other guide remains without new navigation
- PASS: browser safety and errors

Screenshots:

- reading-navigation-320.png
- after-390-fullpage.png
- reading-navigation-1440.png

Detailed measurements, metadata, headings and source notes: release-browser-report.json.

Final source: 7e9a9b12b6e3e4e65c9190aa174c213eaaaaec06. All four new navigation links visibly underlined at each tested width; final 320px/1440px navigation and 390px full-page screenshots visually inspected.

Known request failures are deliberate telemetry blocking, asset cancellation during navigation, and JavaScript-disabled script blocking. No page exceptions, HTTP >=400 responses, AI/account request attempts or permitted write requests occurred.
