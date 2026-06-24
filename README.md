# BJ ELECTRONICS Enterprise Commerce Platform

Production storefront and admin platform for the BJ ELECTRONICS domain.

Stack: Next.js static export, React, Tailwind CSS, Hostinger static hosting, Supabase Auth, RLS, database and Edge Functions.

## Production domain

Configure the live domain in Hostinger and environment variables as your BJ ELECTRONICS domain.

Hostinger should serve the generated `out` folder from `public_html` and include the generated `.htaccess` security headers.

## Required environment variables

Configure these in Hostinger and GitHub Actions secrets:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ADMIN_EMAIL=
```

Do not configure or commit `NEXT_PUBLIC_ADMIN_ACCESS_CODE`.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend variables. It belongs only inside Supabase Edge Function runtime secrets.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production verification

```bash
npm install
npm run verify
```

The verify command runs preflight, environment validation, secret scan, lock check, CSS audit, dead import scan, lint, typecheck, static build, route smoke, functional smoke, build audit, health report and Hostinger artifact generation.

## Hostinger deployment

Recommended settings:

```text
Install command: npm install
Build command: npm run build
Output directory: out
Node version: 20+
```

If uploading manually:

1. Run `npm run build`.
2. Upload the contents of `out` into `public_html`.
3. Ensure `public_html/.htaccess` exists.
4. Visit the configured production domain.

## Supabase backend

Current backend uses:

- Supabase Auth for admin sign-in
- `admin_profiles` for admin authorization
- RLS for protected data
- `secure-checkout` Edge Function for checkout
- `support_tickets` and `feature_requests` tables for Help Center submissions

Admin access requires:

1. Supabase Auth user session
2. active row in `public.admin_profiles`
3. RLS permission through `private.is_admin()`

## Important routes

Storefront:

- `/`
- `/products`
- `/product/:slug`
- `/categories/:slug`
- `/cart`
- `/checkout`
- `/order-success/:orderNumber`
- `/track-order`
- `/wishlist`
- `/account`
- `/help`
- `/roadmap`

Admin:

- `/admin/signin`
- `/admin`
- `/admin/dashboard`
- `/admin/products`
- `/admin/product-manager`
- `/admin/orders`
- `/admin/platform`
- `/admin/ui-kit`
- `/admin/support`
- `/admin/settings`

## Security baseline

- Static export does not rely on Next.js middleware.
- Admin UI is gated by Supabase Auth and admin profile validation.
- Protected data is enforced by Supabase RLS.
- Checkout does not insert orders directly from anonymous frontend code.
- Secret scan prevents committed Supabase project URLs, publishable keys, secret keys and JWT-like secrets.
- Hostinger `.htaccess` adds CSP and hardening headers.
