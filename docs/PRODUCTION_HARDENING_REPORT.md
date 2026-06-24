# BJ ELECTRONICS Production Hardening Report

## Completed in this pass

### GitHub / CI
- Hardened the production build workflow.
- CI now runs on push and pull request to main.
- CI installs dependencies, runs typecheck, builds the static app, verifies `out/index.html`, verifies `out/_next`, and uploads the Hostinger static export artifact.

### Supabase backend
- Confirmed project `bjelectronics` is active and healthy.
- Added missing foreign-key indexes for order items, inventory logs and payments.
- Added product and order query indexes for production filtering and dashboard usage.
- Added missing RLS policies for `profiles`.
- Replaced broad public-read table admin policies with write-only admin policies to reduce duplicate SELECT evaluation.
- Moved admin RLS checks from exposed `public.is_admin()` to non-exposed `private.is_admin()` and rewired active policies.
- Revoked public execution from internal SECURITY DEFINER helpers: `is_admin`, `rls_auto_enable`, `saas_emit_event`, `saas_order_event_trigger`, and `saas_product_event_trigger`.
- Added missing SaaS outbox foreign-key index: `idx_saas_outbox_event_id`.
- Split SaaS feature flag and product media policies into public read plus admin-only insert/update/delete policies.
- Scoped checkout and tracking public RPC execution to anonymous storefront usage only.

### Frontend/admin
- Added advanced product manager route at `/admin/product-manager`.
- Added live Supabase product management UI with product table, card view, sorting, search, filters, product form, media placeholders, gallery, video, specs JSON, flags, and realtime reload.
- Added professional CSS for admin product management.
- Consolidated UI polish imports through `app/ui-polish.css`.
- Consolidated Supabase browser client usage through a single shared runtime-safe client export.
- Updated storefront data loading so public products/categories/promotions/settings do not fall back to local seed just because protected admin/customer tables are blocked by RLS.

## Known limitations

1. Hostinger live redeploy still has to be triggered by Hostinger Git integration or Hostinger panel. The repository is deployment-ready, but this environment cannot press the Hostinger redeploy button.
2. `/admin/products` now reuses the advanced product manager route.
3. `components/enterprise-app.tsx` is still retained as a legacy fallback until every route reference is removed and a production build passes.
4. Two Supabase security advisor warnings remain intentionally for anonymous checkout/order tracking RPCs: `place_order_public` and `track_order_public`. Removing anonymous access would break guest checkout/tracking until these are replaced by Edge Functions.

## Hostinger deployment settings

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `out`
- Node version: 20+

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxshnhsmblnxxsszjeml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
NEXT_PUBLIC_SITE_URL=https://bjelectronics.shop
NEXT_PUBLIC_ADMIN_EMAIL=<approved-admin-email>
```

## Verification checklist

1. GitHub Actions should pass `typecheck` and `build`.
2. Hostinger should serve the static export from `out`.
3. Visit `/admin/signin` and sign in with an approved admin user.
4. Visit `/admin/products` or `/admin/product-manager` and create/update a product.
5. Confirm product changes appear on `/products` after Supabase realtime reload.
