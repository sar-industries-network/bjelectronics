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

The realtime operations dashboard, SaaS platform dashboard, orders route and settings route now use dedicated admin modules instead of the legacy all-in-one shell.

### Storefront app split

A dedicated storefront shell was added:

- `components/storefront-app.tsx`
- `components/storefront-core.tsx`
- `components/storefront-products.tsx`

This extracts the active customer storefront away from the old enterprise shell for home, products, cart, checkout, account, wishlist, categories and tracking routes.

### Storefront route migration

The following storefront routes now resolve through the split storefront app:

- `/`
- `/products`
- `/categories/[slug]`
- `/cart`
- `/checkout`
- `/track-order`
- `/wishlist`
- `/account`

### Admin route migration

The following admin routes now resolve through focused modules:

- `/admin` -> realtime operations dashboard
- `/admin/products` -> advanced product manager
- `/admin/product-manager` -> advanced product manager
- `/admin/orders` -> dedicated orders manager
- `/admin/settings` -> dedicated settings overview
- `/admin/platform` -> SaaS platform dashboard

### Legacy shell removal

The old all-in-one file was removed after storefront/admin route migration:

- removed: `components/enterprise-app.tsx`

### Route smoke tests

Build-time static route smoke checks were added and expanded:

- `scripts/route-smoke-test.mjs`
- `npm run smoke:routes`

The smoke test now covers storefront, product detail, admin products, admin orders, admin settings, admin platform and command center routes.

### Preflight duplicate/dead-file guard

Production preflight now fails if known legacy duplicate/dead files return:

- `components/enterprise-app.tsx`
- `app/product-detail.css`
- `app/product-detail-plus.css`
- `app/product-detail-fixes.css`
- `components/admin-dashboard-pro.tsx`
- `components/command-center-client.tsx`

## Kept intentionally

### Route wrapper files

Static export on Hostinger benefits from route wrapper files. These are kept when they map cleanly to focused modules.

### `lib/storage.ts`

This file is intentionally kept as a compatibility re-export to `lib/data-layer.js`, because active storefront code imports `@/lib/storage`.

## Remaining optional refactor

1. Move cart and checkout internals into a dedicated storefront commerce module.
2. Add editable settings form after admin save flow is visually QA-tested.
3. Add deeper route smoke checks for dynamic product/category routes when stable seed data is finalized.
4. Keep deleting files only after preflight and route smoke checks prove they are not active.
