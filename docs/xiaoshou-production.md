# PACKOM Sales OS production setup

The `/xiaoshou` application is a server-backed sales-force system. It never
falls back to browser storage or temporary files for business records.

## Included workflows

- Email/password registration, login, logout and password change
- One-time company-owner activation and administrator approval of new members
- Roles: owner, administrator, sales manager and sales representative
- Customer and store records, ownership, contacts, location and follow-up data
- Visit scheduling, location-aware check-in, completion notes and display score
- Product-backed sales orders with server-calculated prices and approval status
- Company dashboard, individual performance, territory, targets and account state
- Server-side authorization, hashed sessions and passwords, and audit records
- Chinese and English responsive interfaces

## Database

Run [`lib/supabase/xiaoshou-schema.sql`](../lib/supabase/xiaoshou-schema.sql)
once in the Supabase SQL editor. The schema enables row-level security, revokes
browser roles, grants access only to `service_role`, and seeds the initial
PACKOM/Jake/Whole product list.

## Environment

Configure these values for every production domain:

```text
XIAOSHOU_SUPABASE_URL=https://<project-ref>.supabase.co
XIAOSHOU_SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
XIAOSHOU_BOOTSTRAP_CODE_HASH=<sha256-hex-of-owner-activation-code>
```

The application can also use the repository-wide `SUPABASE_URL` or
`NEXT_PUBLIC_SUPABASE_URL` together with `SUPABASE_SERVICE_ROLE_KEY`. Never put
the service-role key in a `NEXT_PUBLIC_*` variable.

## First activation

1. Open `/xiaoshou`, choose **Company console**, then **Activate company**.
2. Register the first owner with the one-time activation code.
3. Register salespeople normally. Their accounts remain pending until an owner
   or administrator approves them and assigns their role, region and target.
4. After the owner exists, the activation code cannot create another owner.
5. Company settings can disable further public registration.

## Deployment checks

`GET /api/xiaoshou/health` must return HTTP 200 and `storage: "ready"`. A 503
response deliberately blocks the application so sales data cannot be written to
an unreliable fallback. Run `npm run build`, then verify login, registration,
role restrictions, customer creation, visit check-in, order approval and mobile
navigation against the production database.
