# Relationship compatibility v2

- Public landing page `/compatibility` in EN, zh, zh-TW and RU; prominent homepage section and tool-directory listing.
- `POST /api/compatibility`, same-origin JSON, <=8 KiB. Requires two valid local birth records, known cities and permission confirmation. Future/invalid/ambiguous DST dates are rejected by shared birth-time validation.
- `mode: calculate` returns the deterministic Bazi + tropical chart comparison without AI or database dependency. Bazi year/month boundaries and local apparent solar day/hour reuse the calibrated engine. Gender/luck cycles are not used in compatibility.
- Positive editorial 60–100 scale: 30% Bazi (day-element relationship; four-pillar element distribution for rhythm), 70% astrological element/major aspect affinity (6° orb). Four dimensions have equal weight. Exact aspect and weighting rules are in model.ts and disclosed in the UI. This is not an empirically validated prediction. Input reversal preserves the score.
- `mode: interpret` recalculates server-side, then calls DeepSeek using ONLY derived chart data. AI never sets or overwrites scores. JSON output is bounded and checked. Failures leave the full baseline result available.
- Default provider model `deepseek-flash`, optional `COMPATIBILITY_DEEPSEEK_MODEL`; standard `DEEPSEEK_API_KEY` / `DEEPSEEK_API_URL`. Reference: https://api-docs.deepseek.com/guides/json_mode/
- Durable existing Supabase limiter: 6 AI requests/IP/hour and 300 provider calls/day across feature. Fail closed if limiter is unavailable. Local 20 requests/IP/minute CPU guard is per instance, not a global security boundary. Derived AI readings are cached in process for <=15 minutes, max128 entries; no raw birth records, report records or auth requirement. Existing provider/privacy policy applies.
- No payment, database schema, private report storage or external sharing is introduced. Page/results do not put birth details into URLs/localStorage. The first version requires supported city + known birth time; no guessed hour, houses, ascendants or marriage forecasts.

Validation:
`tsx --test lib/compatibility/model.test.ts lib/engines/astrology.test.ts lib/engines/time.test.ts`
`NODE_OPTIONS=--conditions=react-server tsx --test lib/compatibility/route.test.ts`
`npm run build`

Love edition: 60 animal names follow the new artwork (Chinese source manifest and English text read from cards); existing localized Day Pillar personality/love passages are projected into free results. A directional five-element panel and visible stem/branch distribution are deterministic. AI requires separate animalStory and elementStory before the four complementary sections. The score formula remains unchanged.
