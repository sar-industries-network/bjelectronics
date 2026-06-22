# BJ ELECTRONICS SaaS Architecture Level 2

## Backend layer added

The production database now includes an event-driven SaaS layer:

- `saas_events` — canonical event stream.
- `saas_outbox` — internal outbox queue for async processing.
- `saas_webhook_endpoints` — webhook registry for future provider integrations.
- `saas_order_timeline` — order lifecycle history.
- `saas_inventory_ledger` — inventory movement ledger.
- `saas_product_media` — product gallery/video/document media layer.
- `saas_feature_flags` — platform feature toggles.
- `saas_payment_events` — payment webhook/event intake table.

## Functions and triggers

- `saas_emit_event()` creates event stream records and outbox rows.
- `saas_order_event_trigger()` emits events for order creation and order status changes.
- `saas_product_event_trigger()` emits product and inventory events when products change.

## Realtime

Realtime publication was enabled for the SaaS tables that power admin dashboards:

- `saas_events`
- `saas_outbox`
- `saas_order_timeline`
- `saas_inventory_ledger`
- `saas_product_media`
- `saas_feature_flags`
- `saas_payment_events`

## Edge function

Deployed Supabase Edge Function:

- `saas-event-dispatcher`

This function requires JWT authentication and allows approved admin sessions to process pending outbox events.

## Frontend integration

New GitHub code added:

- `lib/saas/event-bus.ts`
- `components/admin-saas-control-center.tsx`
- `app/admin/platform/page.tsx`
- `app/admin-saas-control.css`

Admin route:

```text
/admin/platform
```

This page displays realtime SaaS event stream, outbox status, order lifecycle timeline and feature flags.

## Current production notes

1. Hostinger still needs to redeploy the latest GitHub commit to make these frontend routes live.
2. Payment webhook intake table exists, but provider-specific payment verification should be configured before accepting live online payments.
3. The event-dispatcher function is deployed with JWT verification enabled.
4. Some public checkout/order-tracking functions remain intentional because storefront checkout and tracking need public access.

## Recommended next phase

- Add payment provider-specific webhook function after choosing provider: bKash, SSLCommerz, Stripe, or manual bank transfer workflow.
- Add admin role-aware UI panels for owner/admin/staff.
- Add webhook retry worker and delivery history viewer.
- Move large legacy shell sections into smaller feature modules after visual QA.
