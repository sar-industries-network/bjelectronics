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

### Storefront core split

A storefront core module was added:

- `components/storefront-core.tsx`

It extracts shared storefront header, footer, logo, theme button, sticky cart bar, mobile nav and store link helpers. This prepares `components/enterprise-app.tsx` for safe feature-by-feature extraction without breaking active storefront routes in a single risky edit.

### Admin products route cleanup

`/admin/products` now reuses the advanced product manager route instead of rendering the legacy shell separately.

### Route smoke tests

Build-time static route smoke checks were added:

- `scripts/route-smoke-test.mjs`
- `npm run smoke:routes`

The GitHub Actions workflow now runs the smoke checks after the static build.

## Kept intentionally

### `components/enterprise-app.tsx`

This file is still large, but it is currently the active storefront shell. It was not deleted blindly because it still powers working storefront routes. The safe next refactor is to replace its inline storefront pieces with the extracted storefront core and feature modules step by step.

### Route wrapper files

Static export on Hostinger benefits from route wrapper files. These were not deleted unless they were clearly obsolete.

## Remaining safe next refactor

1. Move product grid/product card into a storefront product module.
2. Move cart and checkout into storefront commerce modules.
3. Move product-manager to the reusable admin shell as the next safe UI refactor.
4. Add deeper route smoke checks for dynamic product/category routes when stable seed data is finalized.
5. Continue deleting files only after they are no longer imported by any active route.
