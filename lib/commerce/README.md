# Main-site reports and checkout

This implementation is for DestinyPixel's metaphysics main site. Independent Prompt, script, image and English applications are outside this system. Crystal atelier links remain part of the main site.

## Rollout state

Paid reports are **off by default**. Missing database/payment/email configuration is an explicit unavailable state, never a successful local-only account or payment. This branch must not replace production report creation until the Supabase project is reachable and migrations have been applied. The separately released journal/calculation changes do not depend on commerce.

1. Restore the existing Supabase project and verify its real tables and data. Do not create a replacement project or delete existing data to bypass an outage.
2. Apply `lib/supabase/schema.sql`, `membership-auth.sql`, then `report-commerce.sql`. All are repeatable. Back up the database before operational changes. Only server `service_role` can access private tables/RPCs; browser roles cannot.
3. Configure a **sandbox** PayPal REST app and webhook. Set a test price and enable only in a preview environment. Sandbox purchases never count as live revenue. Public production users cannot buy sandbox reports; an explicitly authorized administrator can test there if required.
4. Verify create, approval, capture, pending, cancellation, webhook replay, refund, cross-account denial and a complete generated report using sandbox accounts. Verify email recovery with a controlled test account. Local mocks and PGlite do not substitute for this provider test.
5. Confirm the public price, administrator identity and operational support details. Only then configure live credentials and enable live checkout. The website takes no automatic recurring payments.

## Environment variables

Never put secrets in `NEXT_PUBLIC_*`, source files, screenshots or logs. The following are variable names, not values.

| Variable | Use |
| --- | --- |
| `SUPABASE_URL` | Existing Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only database access |
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS origin, or isolated preview origin for sandbox returns |
| `DESTINY_PAID_REPORTS_ENABLED` | `false` by default; `true` gates full reports behind purchases |
| `DESTINY_REPORT_PRICE_USD` | Approved decimal USD price; no production default |
| `PAYPAL_MODE` | `disabled`, `sandbox`, or `live` |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Matching REST app credentials |
| `PAYPAL_WEBHOOK_ID` | Matching app's webhook identifier |
| `PAYPAL_MERCHANT_ID` | Optional additional recipient check; set for the chosen merchant |
| `DEEPSEEK_API_KEY` | Real server-side report generation; paid delivery never falls back to a template |
| `DEEPSEEK_MODEL`, `DEEPSEEK_API_URL` | Optional provider settings, otherwise existing documented defaults |
| `DESTINY_ADMIN_MEMBER_IDS` | Explicitly bound existing member IDs, comma-separated |
| `DESTINY_ADMIN_EMAILS` | Alternative allowlist; an email is accepted only after verified recovery ownership |
| `RESEND_API_KEY`, `DESTINY_AUTH_EMAIL_FROM` | Recovery email delivery, unavailable until configured |
| `AUTH_RATE_LIMIT_SECRET` | Optional stable HMAC secret; otherwise uses server database key |

`DESTINY_MEMBER_LOCAL_STORE_ENABLED=true` is development/test only and is rejected as a production fallback. It does not provide a real report or payment database.

## Payment and report contract

- `/api/checkout/paypal` accepts only a report identifier. Price, USD currency, owner and application mode come from server state.
- PayPal return/cancel URLs contain our opaque order UUID, never birth details. Returning from PayPal is not proof of payment.
- `/api/checkout/paypal/capture` authenticates the owner, checks the actual PayPal order/capture and applies a database transaction. Capture uses a stable `PayPal-Request-Id`.
- `/api/webhooks/paypal` verifies PayPal's signature, checks order/capture identity and amount, and deduplicates event IDs. Subscribe to `PAYMENT.CAPTURE.COMPLETED`, `.PENDING`, `.DENIED`, `.REFUNDED`, and `.REVERSED`.
- Refund/reversal is terminal for that order. A delayed completed notification cannot restore access. Partial refunds currently revoke access too; review this product rule before making partial refunds.
- Guest credentials expire after seven days. Claiming requires the original browser credential plus a valid signed-in account. Knowing a report UUID is insufficient.
- Full generation endpoints reconstruct context from the owned server report. A database lease prevents duplicate generation; complete content is persisted before delivery. Partial chapters and failed generations do not count as complete paid content.
- Historical `saved_reports` browser snapshots are retained as historical records. They are not trustworthy proof of ownership of an original report. Old original report access requires an explicit recovery/migration decision; do not auto-assign it from a submitted report ID or snapshot.

## Verification

Run the engine, journal, analytics, authentication, commerce service, SQL and report-client tests plus `npm run build`. SQL tests execute the unmodified migrations in PostgreSQL/WASM with synthetic data. PGlite is single-connection: its concurrent Promise checks do not simulate hosted multi-connection lock scheduling. Server tests replace only external provider/database calls and Next cookie bindings; they never call live PayPal, send mail or change real member data.

## Follow-up channels

WeChat Pay is not integrated or advertised as available. It requires its own merchant configuration, currency/settlement decisions, signature verification and callback/refund tests. Traffic analytics and financial order records are separate: browser conversion events are not proof of revenue, and unrelated app traffic must not be counted as main-site growth.
