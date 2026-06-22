# BJ ELECTRONICS Production Deployment Checklist

## GitHub

Repository: `sar-industries-network/bjelectronics`

Required commands for a clean local verification:

```bash
npm ci
npm run typecheck
npm run build
```

Expected static output:

```text
out/index.html
out/_next/
```

## Hostinger Git Integration

Use these settings in Hostinger Git deployment:

```text
Install command: npm ci
Build command: npm run build
Output directory: out
Node version: 20.x
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxshnhsmblnxxsszjeml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wBgojnwPpXTHRaeoD28Y-g_JpFXCwP9
NEXT_PUBLIC_SITE_URL=https://bjelectronics.shop
NEXT_PUBLIC_ADMIN_EMAIL=admin@bjelectronics.com
NEXT_PUBLIC_ADMIN_ACCESS_CODE=replace-with-your-admin-access-code
```

After each push to `main`, redeploy the latest commit from Hostinger if automatic deployment is not enabled.

## Supabase

Project reference: `xxshnhsmblnxxsszjeml`
Region: `ap-southeast-1`

Live tables expected:

```text
products
categories
orders
customers
promotions
store_settings
notifications
inventory_logs
```

Realtime publication must include:

```text
products
orders
customers
promotions
store_settings
notifications
inventory_logs
```

Checkout RPC expected:

```text
place_order_public(payload jsonb)
```

## Live verification

1. Visit `/` and confirm product data loads.
2. Visit `/product/samsung-galaxy-a55-5g/` and confirm the refined product details UI loads.
3. Add a product to cart.
4. Use Buy Now and complete checkout.
5. Check Supabase `orders` table for the new order.
6. Update a product stock value in Supabase and confirm the site realtime toast/refresh behavior.
7. Check `/admin` only after admin environment variables are configured.
