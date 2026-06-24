# Latest Audit Fix Report

## Completed in this audit pass

- Fixed Help page React type usage.
- Removed unused icon import from the feature center component.
- Fixed admin shell active key support for roadmap and feature-center states.
- Added support and feature request table grants in Supabase.
- Restricted support and feature request grants so anon can only insert.
- Deduplicated support and feature request RLS insert policies to remove performance WARN findings.
- Confirmed support and feature request tables exist in live Supabase.
- Confirmed RLS policies exist for public insert and authenticated admin management.
- Fixed client-side submission validation so external referrals do not block valid form submissions.
- Improved secret scanner to avoid false positives from documentation variable names while still detecting real Supabase URLs, publishable keys, secret keys and JWT-like secrets.
- Extended functional smoke tests to check support ticket and feature request insert wiring.

## Live Supabase access model

### Public visitors

- Can insert support tickets only.
- Can insert feature requests only.
- Cannot select, update or delete support tickets or feature requests through anon grants.

### Authenticated admin users

- Can manage support tickets and feature requests only when RLS confirms `private.is_admin()`.

## Advisor status

- Supabase performance advisor: no WARN items after policy deduplication; remaining entries are INFO-only unused-index observations until production traffic uses those indexes.
- Supabase security advisor: one dashboard-level WARN remains for Auth leaked password protection. This cannot be changed through repository code or SQL migrations; enable it manually in Supabase Dashboard → Authentication → Security.

## Verification command

```bash
npm install
npm run verify
```

## Still manual before final deployment

- Confirm Hostinger environment variables include all four required frontend variables.
- Confirm GitHub Actions secrets include all four required frontend variables.
- Confirm the Supabase `secure-checkout` Edge Function has server-side runtime secrets.
- Enable Supabase Auth leaked password protection in the Supabase Dashboard.
- Refresh and commit `package-lock.json` if local lock check reports stale lock metadata.
