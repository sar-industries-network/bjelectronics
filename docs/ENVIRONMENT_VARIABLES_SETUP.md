# BJ ELECTRONICS Environment Variables Setup

Do not commit real environment values to Git. Configure real values only inside Hostinger, GitHub Actions secrets and Supabase Edge Function secrets.

## Required frontend variables

Set these in both Hostinger and GitHub Actions secrets:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-publishable-key>
NEXT_PUBLIC_SITE_URL=https://bjelectronics.shop
NEXT_PUBLIC_ADMIN_EMAIL=<approved-admin-email>
```

## Hostinger setup

In Hostinger project settings, add the required frontend variables above.

Recommended build settings:

```bash
Install command: npm install
Build command: npm run build
Output directory: out
Node version: 20+
```

## GitHub Actions secrets

Create these repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ADMIN_EMAIL`

The GitHub workflow reads these secrets and runs `npm run env:check:strict` before build.

## Supabase Edge Function environment

The `secure-checkout` Edge Function requires Supabase runtime secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Supabase normally provides these to Edge Functions automatically. If the function returns a service environment error, add them in Supabase Dashboard → Edge Functions → Secrets, or through the Supabase CLI.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code, Hostinger public variables or GitHub client-side environment variables.

## Admin setup

Admin access is not controlled by a public access code. A user must:

1. Sign in through `/admin/signin` using Supabase Auth.
2. Have an active row in `public.admin_profiles`.
3. Pass RLS checks before admin data is readable or writable.

## Verification

After setting variables, run:

```bash
npm install
npm run verify
```

Expected checks:

- environment validation passes
- secret scan passes
- lock consistency passes
- CSS audit passes
- dead import scan passes
- lint passes
- typecheck passes
- build passes
- route smoke passes
- functional smoke passes
- Hostinger zip artifact is generated
