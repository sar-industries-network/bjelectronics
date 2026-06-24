# Routing, Middleware and Connection Improvements

## Static middleware boundary

This project uses `next.config.mjs` with `output: 'export'`. Because of that, Next.js middleware is not used for production authorization or redirects.

Production middleware-equivalent behavior is handled by:

- Supabase Auth and RLS for protected admin data
- client admin shell checks for admin pages
- Hostinger `.htaccess` security headers and route aliases generated during postbuild
- build-time preflight checks that block legacy or ambiguous routes

## Routing improvements

- Only `app/order-success/[orderNo]` is allowed for order success pages.
- `app/order-success/[orderNumber]` is blocked by preflight to prevent ambiguous dynamic route errors.
- legacy `EnterpriseApp` imports are blocked by preflight.
- Hostinger route aliases redirect old admin paths to the modern dashboard or products page.
- `/admin/login` redirects to `/admin/signin` through Hostinger routing rules.

## Connection improvements

- Hostinger `.htaccess` CSP includes Supabase REST and realtime websocket connections.
- `connect-src` allows `https://*.supabase.co` and `wss://*.supabase.co`.
- `font-src` allows local and data fonts.
- security headers are generated during `npm run build` by `scripts/copy-hostinger-assets.mjs`.

## Verification

Run:

```bash
npm run preflight
npm run build
npm run audit:build
npm run smoke:routes
```

Full verification:

```bash
npm run verify
```
