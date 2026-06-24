# Codebase Deduplication Audit

## Completed

### Supabase client consolidation

Before this pass, the project had two active client implementations:

- `lib/supabaseClient.ts`
- `lib/supabase/client.ts`

This was cleaned by making `lib/supabaseClient.ts` the canonical runtime-safe browser client and turning `lib/supabase/client.ts` into a re-export wrapper. This prevents duplicate Supabase browser instances while preserving existing import paths.

### UI polish import consolidation

Before this pass, `app/layout.tsx` imported many polish CSS files directly. This made the root layout noisy and easier to break during edits.

A consolidated entrypoint exists:

- `app/ui-polish.css`

The root layout now imports only:

- `app/globals.css`
- `app/ui-polish.css`
- `app/live-sync.css`

### Product detail CSS merge

The previous split files were merged into one active layer:

- old: `app/product-detail.css`
- old: `app/product-detail-plus.css`
- new: `app/product-detail-merged.css`

The old split files were deleted after the merged file was connected through `app/ui-polish.css`.

### Reusable admin shell extraction

A reusable admin shell was added:

- `components/admin-shell.tsx`
- `app/admin-shell.css`

The realtime operations dashboard and SaaS platform dashboard now use this shared shell, which removes duplicated sidebar/layout code from those features.

### Storefront app split

A dedicated storefront shell was added:

- `components/storefront-app.tsx`
- `components/storefront-core.tsx`
- `components/storefront-products.tsx`

This extracts the active customer storefront away from `components/enterprise-app.tsx` for home, products, cart, checkout, account, wishlist, categories and tracking routes.

### Storefront route migration

The following storefront routes now resolve through the split storefront app instead of the legacy enterprise shell:

- `/`
- `/products`
- `/categories/[slug]`
- `/cart`
- `/checkout`
- `/track-order`
- `/wishlist`
- `/account`

### Admin products route cleanup

`/admin/products` now reuses the advanced product manager route instead of rendering the legacy shell separately.

### Route smoke tests

Build-time static route smoke checks were added:

- `scripts/route-smoke-test.mjs`
- `npm run smoke:routes`

The GitHub Actions workflow now runs the smoke checks after the static build.

## Kept intentionally

### `components/enterprise-app.tsx`

This file is still retained as a legacy fallback/admin shell for routes that have not yet been fully migrated. It should only be deleted after every route import is confirmed to no longer reference it and a production build passes.

### Route wrapper files

Static export on Hostinger benefits from route wrapper files. These were not deleted unless they were clearly obsolete.

## Remaining safe next refactor

1. Move cart and checkout internals into a dedicated storefront commerce module.
2. Move product-manager to the reusable admin shell as the next safe UI refactor.
3. Remove legacy `components/enterprise-app.tsx` only after code search confirms zero route references and build passes.
4. Add deeper route smoke checks for dynamic product/category routes when stable seed data is finalized.
