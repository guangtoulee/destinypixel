# Day-pillar free readings and report previews

The free report now presents an archetype-specific headline, personality, work and relationship readings before the unlock section. The same public editorial content appears in `/day-pillar` and `/discover`. The paid preview explains the added scope through three questions, links directly from the free reading, and retains the server-configured price and existing checkout/account actions. Bracelet guidance follows the unlock section and stays free.

## Source and editorial choices

- Source: user-supplied `/Users/lee/Desktop/玄学/日柱.xlsx`, first worksheet, rows 2–61, columns B–F. The source workbook is unchanged.
- All 60 entries are keyed by the Chinese stem–branch pair, not row position or a translated card name.
- Personality, work and relationship themes are adapted into original public copy. The worksheet's health column, diagnostic labels, guaranteed wealth and assertions of violent behavior are not used.
- English and Russian are editorial translations; Traditional Chinese is converted before client serialization. Existing English archetype names, including The Oceanic Sequoia, remain unchanged.
- These are shared archetype readings. The interface distinguishes them from a report interpreted using the complete birth data. No celebrities are added: the workbook does not supply verified celebrity examples.

## Access and layout

- Only the explicit public card projection is sent to the free calculators. It contains no purchased/generated chapters, medical or financial profile fields.
- Report ownership and `access.isFull` remain server-side. Generation, payment verification and administrator entitlements are unchanged.
- The light report layout uses smaller sans-serif headings. Mobile visitors read the interpretation and unlock section before the Four Pillars details.
- The three reading cards respond to their container width, avoiding narrow desktop columns inside the report sidebar layout.
- `/discover` keeps four reciprocal language canonicals and localized descriptions. `/day-pillar` keeps its two existing canonicals. Private reports remain noindex.

## Validation

- Production build, full-cycle date/card tests, all 60 readings across four locales, public payload allowlist and Traditional Chinese checks.
- Existing report-content, SEO, journal, analytics, PayPal validation and commerce server tests. PostgreSQL/WASM checks for private state, ownership, payment and generation integrity.
- Browser checks: real date submission, Chinese card detail, Russian discovery result, English report, Traditional Chinese report, mobile reading order, unlock anchor and no horizontal overflow at 390px.
- Local report preview verified with a process-scoped `DESTINY_PAID_REPORTS_ENABLED=true`; no environment file or live pricing configuration changed. No real checkout or charge performed.
