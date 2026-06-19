# Local Build Verification

Date: 2026-06-19

Commands run successfully:

```bash
npm install --no-audit --no-fund --silent
npm run build
```

Static output generated in:

```text
out/
```

Local static smoke test using Python HTTP server returned HTTP 200 for:

```text
/                                200
/products/                       200
/cart/                           200
/checkout/                       200
/admin/login/                    200
/admin/                          200
/product/samsung-galaxy-a55-5g/  200
/categories/smartphones/         200
```

Backend mode:
- Supabase if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.
- Local browser fallback when Supabase env is missing, so Windows localhost testing works immediately.
