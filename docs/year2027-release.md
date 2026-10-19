# 2027 free edition

## Scope

- Public route: `/2027` (English), `/2027?locale=zh` (Simplified Chinese).
- Gregorian January–December 2027; calendar containers use UTC. Solar-term instants are stored in UTC and displayed with an explicit time zone.
- No login, payment, generative AI, new API endpoint, external calculation recipient, or persistent birth-data storage. The calculator runs in the browser's memory. Existing analytics receive only fixed product/event identifiers.
- Built in an isolated copy of the existing MacBook repository from remote `main` at `18d72371baa11a8c08dc81efe40c6ea3d53de6f8`, preserving `89aba0ecbd7d1496e752f1935bf5f39218a5a67a`. Original checkout was left untouched.

## Calculation and interpretation

BaZi reuses the existing `lunar-javascript` engine and historical IANA/Temporal birth-time resolution. Year/month pillars compare global solar-term instants; day/hour pillars use the existing documented approximate apparent-solar-clock convention and midnight day boundary. The twelve Jie change BaZi month pillars; intervening Qi and Gregorian first days do not.

January 1 until immediately before LiChun belongs to 丙午, followed by 丁未 at LiChun. This is the edition's stated BaZi convention. HKO publishes LiChun as February 4, 2027, 09:46 Hong Kong time, while the existing library returns 09:46:18. Seconds are library output, not an assertion of HKO precision; the interface displays minutes. Lunar New Year on February 6 does not define this boundary.

Western astrology reuses Astronomy Engine 2.1.19 (MIT) for apparent geocentric tropical longitudes of date, derived from the actual birth UTC instant. Each monthly snapshot compares Jupiter and Saturn with the natal Sun at the 15th, 12:00 UTC, using 0/60/90/120/180-degree aspects and an inclusive 3-degree orb. These twelve isolated samples do not describe whole-month transit windows, ingress/egress times, or exact peak aspects. No Moon, ascendant, angles, or houses are included in this edition.

Unknown birth time samples the birthplace's complete civil-day UTC interval every 30 minutes plus its final boundary, honoring historical offsets and 23/25-hour DST dates. It never constructs a noon birth instant. Unstable year/month/day pillars or Sun sign are omitted; no hour pillar or precise natal longitude is returned. Unknown-time transit matches must satisfy the orb throughout the retained Sun range. Missing day master disables personal ten-god readings.

Traditional stem relationships and Western aspect readings have separate original symbolic explanations. The combined prompts are explicitly modern editorial reflections, without a fate score, scientific-prediction claim, guaranteed financial outcome, or disease/disaster forecast.

## Sources

- [HKO February 2027 calendar](https://www.hko.gov.hk/tc/gts/astron2027/files/2027cal02.pdf)
- [HKO solar terms](https://www.hko.gov.hk/tc/gts/time/24solarterms.htm)
- [lunar-javascript exact GanZhi API](https://6tail.cn/calendar/lunar.ganzhi.html)
- [Astronomy Engine documentation and license](https://github.com/cosinekitty/astronomy)
- [IANA Time Zone Database](https://www.iana.org/time-zones)

## Verification commands

```sh
node --import tsx --test lib/year2027/model.test.ts lib/engines/time.test.ts lib/engines/bazi.test.ts lib/engines/astrology.test.ts lib/analytics.test.ts lib/document-locale.test.ts
node --conditions=react-server --import tsx --test lib/seo.test.ts lib/topic-journeys.test.ts
npx tsc --noEmit
npx eslint --config eslint.english.config.mjs app/2027 components/year2027 lib/year2027 lib/analytics.ts lib/analytics.test.ts lib/document-locale.ts lib/document-locale.test.ts
npm run build
node scripts/check-year2027-http.mjs http://127.0.0.1:3007
```

The model tests cover continuous calendar bounds, LiChun immediately before/at the instant, Chinese New Year distinction, all twelve Jie, leap dates, historical UTC equivalence, skipped/repeated known local times, unknown civil days and DST, unstable Sun signs, and actual sampled major aspects. Analytics tests verify birth-field redaction and fixed event payloads. HTTP checks inspect actual initial HTML, metadata, free-app schema, sitemap/indexing, share image, and homepage/tool entry links without calling any calculation or AI API.

## Current verification status

- Passed: 48 calculation/analytics/document-language tests, 10 SEO/directory tests, TypeScript, targeted ESLint and `git diff --check`.
- Passed: production `next build --webpack`; `/2027` is server-rendered, its share image and sitemap remain static, and existing static routes remain static.
- Observed in real Chrome: Simplified Chinese initial page at 390 × 844, correct document language/title/canonical and no horizontal overflow. An initial SVG floating-point hydration discrepancy was subsequently fixed by rounding generated coordinates; full post-fix browser verification is still pending.
- Pending: complete known/unknown birth-time form interactions, English and additional mobile widths, navigation/locale state, production HTTP script, and release/post-release checks. Automatic approval review returned a model-capacity error for the HTTP script, a browser form-test action and production-preview startup; each was explicitly not executed. This was a review-service failure, not an unsafe-action finding. No production release has been claimed.
- Deployment observability limitation: scoped Vercel deployment-details retrieval returned 403. Its documented CLI fallback could not finish downloading because the network reset. Existing Git integration previously reports a successful Vercel deployment for the baseline commit; no access or security settings were changed.
- The temporary development server was stopped. Resetting Chrome's temporary 390 × 844 viewport was also not executed because the approval service returned the same capacity failure; reset it when browser control becomes available. No push or production deployment was attempted.
