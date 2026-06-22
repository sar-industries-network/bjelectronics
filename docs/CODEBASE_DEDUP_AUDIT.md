# Codebase Deduplication Audit

## Completed

### Supabase client consolidation

Before this pass, the project had two active client implementations:

- `lib/supabaseClient.ts`
- `lib/supabase/client.ts`

This was cleaned by making `lib/supabaseClient.ts` the canonical runtime-safe browser client and turning `lib/supabase/client.ts` into a re-export wrapper. This prevents duplicate Supabase browser instances while preserving existing import paths.

### UI polish import consolidation

Before this pass, `app/layout.tsx` imported many polish CSS files directly. This made the root layout noisy and easier to break during edits.

A new consolidated entrypoint was added:

- `app/ui-polish.css`

The root layout now imports:

- `app/globals.css`
- `app/ui-polish.css`
- `app/live-sync.css`

The source CSS files are still kept because they are active design layers, but they are now merged through one stable import entrypoint.

### Admin products route cleanup

`/admin/products` now reuses the advanced product manager route instead of rendering the legacy shell separately.

## Kept intentionally

### `components/enterprise-app.tsx`

This file is still large, but it is currently the active storefront shell. It was not deleted or split blindly because that could break working routes. The safe next refactor is to split it feature-by-feature after visual QA.

### Existing CSS source files

The CSS files are no longer imported individually by `app/layout.tsx`; however, they are not dead files. They are active source layers imported through `app/ui-polish.css`.

### Route wrapper files

Static export on Hostinger benefits from route wrapper files. These were not deleted unless they were clearly obsolete.

## Remaining safe next refactor

1. Split `components/enterprise-app.tsx` into storefront feature modules.
2. Convert repeated dashboard sidebar markup into one reusable admin shell component.
3. Add build-time route smoke checks after GitHub Actions starts producing visible workflow runs.
4. Merge product detail CSS layers only after visual verification of product pages.
