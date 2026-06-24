# Current Dependency and Configuration Audit

## Scope

Audited current repository configuration for:

- dependencies
- package lock consistency
- environment variables
- GitHub Actions build pipeline
- static export configuration
- Supabase runtime configuration
- secret scanning
- security headers
- TypeScript/Tailwind configuration

## Good status

### Environment variables

`.env.example` now contains only empty placeholders and does not commit real Supabase project values.

Required frontend variables remain:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ADMIN_EMAIL`

`NEXT_PUBLIC_ADMIN_ACCESS_CODE` is forbidden by the validation script and should not be configured anywhere.

### GitHub Actions

The workflow uses repository secrets for frontend runtime values and runs:

- preflight
- strict environment validation
- secret scan
- package lock check
- CSS audit
- dead import scan
- lint
- typecheck
- static build
- route smoke
- functional smoke
- build audit
- health report
- Hostinger zip artifact generation

The workflow also has read-only repository permissions.

### Static export

`next.config.mjs` is intentionally configured for static export and documents that middleware is not used in production. Admin protection is handled in the client admin shell with Supabase Auth and RLS.

### Runtime Supabase config

`lib/supabaseClient.ts` reads only public frontend env variables and uses safe placeholders when local env values are missing, so local/static preview builds do not crash.

### Security checks

The repo includes:

- environment validation
- committed secret scanner
- dead import scanner
- functional smoke test that requires checkout to use the `secure-checkout` Edge Function
- Hostinger static header generation into `out/.htaccess`

### Live Supabase RLS spot check

The live project no longer has the old demo public-write policy names. The `orders` table currently shows the authenticated admin management policy only.

## Remaining issues

### 1. `package-lock.json` is stale in the repository

`package.json` is version `2.1.2`, but `package-lock.json` still says version `2.0.0` at the file root and lock root package. The lock root also does not include every current direct dependency from `package.json`.

Impact:

- `npm run lock:check` can fail before a fresh `npm install` regenerates the lock file.
- GitHub Actions runs `npm install` before `lock:check`, so CI may self-heal during the runner job, but the committed lock file should still be refreshed and committed.

Required fix:

```bash
npm install
npm run lock:check
git add package-lock.json
git commit -m "chore: refresh package lock"
git push
```

### 2. Supabase Edge Function server secrets must be confirmed in Supabase dashboard

`secure-checkout` requires server-side Supabase runtime secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These must remain inside Supabase Edge Function secrets/runtime and must never be exposed in Hostinger public variables or GitHub frontend env variables.

### 3. GitHub and Hostinger secrets must be manually configured in dashboards

The repo is prepared, but secret values must be pasted into:

- GitHub repository secrets
- Hostinger environment variables
- Supabase Edge Function secrets if not automatically available

## Recommendation

Before the next production deployment:

1. Refresh and commit `package-lock.json`.
2. Confirm GitHub Actions secrets exist.
3. Confirm Hostinger environment variables exist.
4. Confirm `secure-checkout` Edge Function has service runtime variables.
5. Run `npm run verify` locally or through GitHub Actions.
