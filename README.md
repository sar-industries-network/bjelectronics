# BJ ELECTRONICS Enterprise Frontend + Supabase Backend

Stack: React + Next.js + Tailwind CSS frontend, Hostinger static frontend deployment, Supabase backend/storage.

## Local Windows 11 test

1. Extract the ZIP.
2. Open the folder.
3. Double click `start-local.bat`.
4. Open `http://localhost:3000`.

Admin:
- Email: `admin@bjelectronics.com`
- Password: `Admin@1234`

The app works without Supabase using local browser fallback data. After Supabase env variables are added, it reads/writes to Supabase REST API.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy Project URL and anon public key.
5. Create `.env.local` from `.env.example` and paste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://bjelectronics.shop
```

Then run:

```bash
npm install --no-audit --no-fund
npm run build
```

## Hostinger frontend deployment

This is a static frontend deployment.

1. Run `npm run build` locally.
2. Open Hostinger File Manager.
3. Empty `public_html`.
4. Upload all CONTENTS from the generated `out` folder into `public_html`.
5. Upload `hostinger/.htaccess` into `public_html/.htaccess`.
6. Visit `https://bjelectronics.shop`.

Do not use Node.js App, Next.js server runtime, MySQL, MariaDB, or Hostinger Horizons AI builder for this package.

## Routes included

Store: `/`, `/products`, `/product/:slug`, `/categories/:slug`, `/cart`, `/checkout`, `/order-success/:orderNumber`, `/track-order`, `/wishlist`, `/account`.

Admin: `/admin/login`, `/admin`, `/admin/orders`, `/admin/products`, `/admin/categories`, `/admin/customers`, `/admin/promotions`, `/admin/theme-settings`, `/admin/reports`, `/admin/inventory`, `/admin/payments`, `/admin/users`, `/admin/settings`.

## Important security note

The included Supabase policies are permissive for demo/frontend testing. Before taking real payments or storing sensitive customer data, replace demo policies with Supabase Auth + role-based admin policies.
