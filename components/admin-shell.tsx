'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, DatabaseZap, LayoutDashboard, LogOut, Map, Package, Palette, Settings, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type AdminShellProps = {
  active?: 'overview' | 'products' | 'orders' | 'product-manager' | 'platform' | 'settings' | 'ui-kit';
  children: React.ReactNode;
};

const links = [
  { key: 'overview', href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { key: 'products', href: '/admin/products', label: 'Products', icon: Package },
  { key: 'orders', href: '/admin/orders', label: 'Orders', icon: Boxes },
  { key: 'product-manager', href: '/admin/product-manager', label: 'Product Manager', icon: ShoppingBag },
  { key: 'platform', href: '/admin/platform', label: 'SaaS Platform', icon: DatabaseZap },
  { key: 'ui-kit', href: '/admin/ui-kit', label: 'UI Kit', icon: Palette },
  { key: 'roadmap', href: '/roadmap', label: 'Roadmap', icon: Map },
  { key: 'settings', href: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

export function AdminShell({ active = 'overview', children }: AdminShellProps) {
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState('Checking admin session...');

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!supabaseClientConfigured) {
        setNote('Supabase environment variables are missing.');
        return;
      }
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!mounted) return;
      if (!userId) {
        window.location.replace(`/admin/signin?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const profile = await supabase.from('admin_profiles').select('user_id, active').eq('user_id', userId).eq('active', true).maybeSingle();
      if (!mounted) return;
      if (!profile.data) {
        setNote('This account is not approved for admin access.');
        return;
      }
      sessionStorage.setItem('bj_admin_session', 'true');
      setReady(true);
    }
    run();
    return () => { mounted = false; };
  }, []);

  const signOut = async () => {
    sessionStorage.removeItem('bj_admin_session');
    await supabase.auth.signOut();
    window.location.replace('/admin/signin');
  };

  if (!ready) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-[#07111f]"><section className="card max-w-md text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-blue text-2xl text-white">🛒</div><h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">BJ ELECTRONICS Admin</h1><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{note}</p><a className="btn mt-5" href="/admin/signin">Admin Sign In</a></section></main>;
  }

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
          <button type="button" onClick={signOut}><LogOut size={18}/> Sign Out</button>
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
