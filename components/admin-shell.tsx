import React from 'react';
import { Boxes, DatabaseZap, LayoutDashboard, Package, Settings, ShoppingBag, Sparkles, Zap } from 'lucide-react';

type AdminShellProps = {
  active?: 'overview' | 'products' | 'orders' | 'product-manager' | 'platform' | 'settings';
  children: React.ReactNode;
};

const links = [
  { key: 'overview', href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { key: 'products', href: '/admin/products', label: 'Products', icon: Package },
  { key: 'orders', href: '/admin/orders', label: 'Orders', icon: Boxes },
  { key: 'product-manager', href: '/admin/product-manager', label: 'Product Manager', icon: ShoppingBag },
  { key: 'platform', href: '/admin/platform', label: 'SaaS Platform', icon: DatabaseZap },
  { key: 'settings', href: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

export function AdminShell({ active = 'overview', children }: AdminShellProps) {
  return (
    <main className="admin-shell-layout">
      <aside className="admin-shell-sidebar">
        <a className="admin-shell-brand" href="/admin">
          <span>🛒</span>
          <div>
            <b>BJ ELECTRONICS</b>
            <small>Enterprise Console</small>
          </div>
        </a>
        <nav>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.key} className={active === item.key ? 'active' : ''} href={item.href}>
                <Icon size={18} /> {item.label}
              </a>
            );
          })}
        </nav>
        <div className="admin-shell-side-card">
          <Sparkles size={18} />
          <b>SAR INDUSTRIES NETWORK</b>
          <p>Realtime commerce operations, event stream, inventory intelligence and admin automation.</p>
          <span><Zap size={14} /> Production ready</span>
        </div>
      </aside>
      <section className="admin-shell-main">{children}</section>
    </main>
  );
}
