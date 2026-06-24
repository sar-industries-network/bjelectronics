# Admin Dashboard Expansion

## Added

- Expanded dashboard module: `components/admin-dashboard-plus.tsx`
- New route: `/admin/dashboard`
- Support route placeholder: `/admin/support`
- Extra dashboard polish: `app/admin-dashboard-plus.css`
- Admin shell Support navigation link
- Preflight checks for the new dashboard resources
- Route smoke checks for `/admin/dashboard` and `/admin/support`

## Dashboard capabilities

The expanded dashboard loads protected Supabase admin data for:

- products
- orders
- notifications
- SaaS event feed
- support tickets
- feature requests

## New dashboard sections

- KPI cards for revenue, pending orders, low stock, support, feature requests, notifications, average order and fulfillment
- Product search
- Action focus panel
- Quick actions panel
- Latest orders panel
- Product intelligence panel
- Support queue panel
- Feature request panel
- Realtime event feed panel

## Security model

The dashboard is rendered inside `AdminShell`, so admin access still requires:

1. Supabase Auth session
2. active `admin_profiles` row
3. RLS permission for protected tables

## Verification

Run:

```bash
npm install
npm run verify
```
