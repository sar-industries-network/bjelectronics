# BJ ELECTRONICS Routing and Code Quality Audit

## Routing audit

### Healthy routes
- `/` is handled by the main app shell.
- `/products` is handled by the product listing page inside the shell.
- `/categories/[slug]` has static route support.
- `/product/[slug]` has a professional product detail route.
- `/cart`, `/checkout`, `/wishlist`, `/account`, `/track-order` have route wrappers.
- `/admin/login` redirects to `/admin/signin`.
- `/admin/signin` has Supabase magic-link admin sign-in.
- Support pages exist for help, shipping, returns, warranty, privacy and terms.

### Routing risks found
1. The client app shell also contains an older inline product detail component. This can shadow the professional product detail route when navigating internally through the shell.
2. Footer service items are currently text-style items, not active links inside the shell footer.
3. The central app shell is large and contains many screens in one file, making route-specific changes harder to verify.
4. Some route wrappers intentionally point to the same `EnterpriseApp` shell. This is acceptable for static export, but long-term route-specific components should be split.

## Duplicate / old / problematic code audit

### Found
1. Two backend client entry points exist: `lib/supabaseClient.ts` and `lib/supabase/client.ts`.
2. Product detail styling is split across `product-detail.css` and `product-detail-plus.css`.
3. Global UI polish is layered across multiple files. This is currently safe because later files override earlier ones, but it should eventually be merged into a formal design system.
4. `components/enterprise-app.tsx` is a very large multi-screen component and should be refactored into smaller modules.

### Kept intentionally
- Older product detail CSS files were not deleted because active product pages still rely on them.
- Existing route wrappers were not deleted because they support Hostinger/static-export routing.
- The large app shell was not deleted because it is currently the active storefront and admin shell.

## Fixes applied in this audit pass

1. Added `app/audit-quality-polish.css` for quality hardening.
2. Loaded the new audit polish layer globally in `app/layout.tsx`.
3. Strengthened mobile nav duplicate prevention.
4. Improved admin/table/mobile/footer quality safeguards.
5. Improved disabled states, placeholder contrast, empty component handling, and print cleanup.

## Recommended next refactor

1. Split `components/enterprise-app.tsx` into feature modules.
2. Convert footer service items into real route links.
3. Consolidate backend client entry points into one file.
4. Route internal product navigation to the professional product detail page.
5. Run GitHub Actions build after redeploy.
