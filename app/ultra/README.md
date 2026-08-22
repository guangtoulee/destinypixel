# DestinyPixel Ultra

`/ultra` is the data-driven successor to `/xingpan`. The original route remains intact; Ultra reuses its WebGL renderer while replacing the demo profile with a server-calculated chart and node-specific oracle copy.

## Runtime flow

```text
UltraBirthConsole
  -> POST /api/oracle
    -> lib/destinyCalculator.ts
      -> lunar-javascript EightChar + minute-level Yun
      -> IANA timezone / DST-aware true-solar-time calibration
      -> birth-instant / Beijing-jieqi year-month track
      -> local-apparent-solar-time day-hour track
      -> seasonal-qi five-element visualization field
      -> ten-year / annual XYZ coordinate mapping
    -> DeepSeek through the OpenAI SDK
      -> strict JSON node copy
      -> deterministic copy fallback on model failure
  -> atomic profile + chart update
  -> GSAP Time Warp
  -> DestinyCanvas / DestinyCore / UltraDestinyHud
```

The raw birth date, time and birthplace are used only by the server-side calculator. DeepSeek receives the derived chart structure and cycle IDs, not the original birth fields or city.

The response declares its calculation convention as `lunar-javascript+destinypixel-v3`: year/month and `Yun` compare the absolute birth instant with lunar-js's Beijing-time solar terms; day/hour use local apparent solar time with sect 2's late-Zi-day convention. `getYun(gender, 2)` is deliberately locked to lunar-js's minute-resolution sect-2 method, so the convention is testable rather than implicit.

## Local environment

Copy `.env.example` to `.env.local` and set:

```bash
DEEPSEEK_API_KEY=your_server_only_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_ORACLE_MODEL=deepseek-v4-pro
```

Never prefix the key with `NEXT_PUBLIC_`. Vercel needs the same server-side environment variable configured in the project settings.

## Data contract

`POST /api/oracle` accepts:

```json
{
  "birthDate": "1993-09-17",
  "birthTime": "21:36",
  "birthplace": "shanghai-cn",
  "gender": "male"
}
```

It returns:

- `profile`: the existing R3F-compatible `DestinyProfile`, now populated with real decade cycles, XYZ positions, angles and AI copy.
- `chart`: four pillars, true solar time, weighted element field, current luck node and 100 annual coordinates.
- `activeCycleId`: the cycle selected when the core opens.
- `meta`: model provenance and degraded-mode state.

`seasonal-qi-plus-visible-and-hidden-stems-v2` is an explicit visualization strength model. It combines visible stems, weighted hidden stems and month-branch seasonal qi, then normalizes the result for particles and rings. The API exposes the method and seasonal factors instead of presenting the number as a canonical traditional verdict.

The route includes same-origin checks, payload validation, abort propagation and a bounded per-instance rate limiter. Before opening paid AI traffic at scale, configure an atomic rate limit in Vercel Firewall or a shared KV/Redis store; an in-memory serverless bucket is intentionally treated as defense in depth, not a billing boundary.
