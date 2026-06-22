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
- Optimized admin profile policy to use `(select auth.uid())`.

### Frontend/admin
- Added advanced product manager route at `/admin/product-manager`.
- Added live Supabase product management UI with product table, card view, sorting, search, filters, product form, media placeholders, gallery, video, specs JSON, flags, and realtime reload.
- Added professional CSS for admin product management.

## Known limitations

1. Hostinger live redeploy still has to be triggered by Hostinger Git integration or Hostinger panel. The repository is deployment-ready, but this environment cannot press the Hostinger redeploy button.
2. `/admin/products` still points to the legacy app shell because direct update of that exact file was blocked by connector safety. Use `/admin/product-manager` for the new advanced manager.
3. `components/enterprise-app.tsx` is still a large app shell. It should be split into modules after visual QA.
4. There are two Supabase client entry files. The app works, but a future cleanup should consolidate them safely.
5. Some Supabase advisor warnings remain for intentionally public checkout/order tracking security-definer RPC functions.

## Hostinger deployment settings

- Install command: `npm ci`
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
4. Visit `/admin/product-manager` and create/update a product.
5. Confirm product changes appear on `/products` after Supabase realtime reload.
