# Security Fixes

Completed in this pass:

- Removed `middleware.ts` because static export does not execute Next.js middleware on Hostinger.
- Added Supabase session and active admin profile validation inside the shared admin shell.
- Removed real project values from `.env.example`.
- Removed the public admin access code variable from `.env.example`.
- Deployed the `secure-checkout` Supabase Edge Function.
- Updated checkout data flow to call `secure-checkout` instead of inserting directly into `orders`.
- Removed the unused Stripe browser dependency from `package.json`.
- Added client-side request throttling helpers.
- Added client-side form token helpers.
- Added admin sign-in throttling.
- Added static response header generation in `scripts/copy-hostinger-assets.mjs`.
- Added a repository scan script for committed credential patterns.
- Added repository scan to `npm run verify` and GitHub Actions.

Live Supabase verification:

- Demo policy count for the old public-write policy names is `0`.
- The `orders` table now shows only the authenticated admin management policy.

Important static export note:

- Static HTML files can still be downloaded by a browser. The protection is that admin modules do not render or load admin data until Supabase validates the signed-in user and active admin profile, while RLS blocks unauthorized data access.
