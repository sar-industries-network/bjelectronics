'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Bell, Boxes, CircleDollarSign, Clock, DatabaseZap, Package, RefreshCcw, Search, ShoppingBag, Truck } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type ProductRow = { id: string; name?: string; sku?: string; brand?: string | null; category_slug?: string | null; price?: number; stock?: number; low_stock_threshold?: number; active?: boolean; image?: string | null; updated_at?: string };
type OrderRow = { id: string; order_number?: string; customer_name?: string; total?: number; subtotal?: number; order_status?: string; status?: string; payment_status?: string; created_at?: string };
type NoticeRow = { id: string; title?: string | null; message?: string | null; is_read?: boolean; created_at?: string };
type EventRow = { id: string; event_type: string; entity_type: string; entity_id?: string | null; status: string; created_at: string };
type OutboxRow = { id: string; event_id?: string | null; target?: string; status: string; created_at: string };
type FlagRow = { id: string; flag_key: string; label: string; enabled: boolean; updated_at?: string };

type OpsState = { products: ProductRow[]; orders: OrderRow[]; notices: NoticeRow[]; events: EventRow[]; outbox: OutboxRow[]; flags: FlagRow[] };
const emptyState: OpsState = { products: [], orders: [], notices: [], events: [], outbox: [], flags: [] };

function money(value: number) { return `৳${Number(value || 0).toLocaleString('en-BD')}`; }
function orderStatus(order: OrderRow) { return String(order.order_status || order.status || 'Processing'); }
function niceDate(value?: string) { return value ? new Date(value).toLocaleString() : 'Just now'; }

export function OpsDashboard() {
  const [state, setState] = useState<OpsState>(emptyState);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState('');

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) { setError('Supabase environment variables are missing.'); setLoading(false); return; }
    const result = await Promise.allSettled([
      supabase.from('products').select('*').order('updated_at', { ascending: false }).limit(80),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(80),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('saas_events').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('saas_outbox').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('saas_feature_flags').select('*').order('flag_key').limit(40),
    ]);
    const next: OpsState = { ...emptyState };
    const messages: string[] = [];
    result.forEach((item, index) => {
      if (item.status === 'fulfilled') {
        if (item.value.error) messages.push(item.value.error.message);
        const rows = item.value.data || [];
        if (index === 0) next.products = rows as ProductRow[];
        if (index === 1) next.orders = rows as OrderRow[];
        if (index === 2) next.notices = rows as NoticeRow[];
        if (index === 3) next.events = rows as EventRow[];
        if (index === 4) next.outbox = rows as OutboxRow[];
        if (index === 5) next.flags = rows as FlagRow[];
      }
    });
    setState(next);
    setLastSync(new Date().toLocaleTimeString());
    if (messages.length) setError([...new Set(messages)].slice(0, 2).join(' · '));
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!supabaseClientConfigured) return;
    const channel = supabase
      .channel('ops-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saas_events' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saas_outbox' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const metrics = useMemo(() => {
    const revenue = state.orders.reduce((sum, order) => sum + Number(order.total || order.subtotal || 0), 0);
    const pendingOrders = state.orders.filter((order) => ['pending', 'processing', 'new'].includes(orderStatus(order).toLowerCase())).length;
    const activeProducts = state.products.filter((product) => product.active !== false).length;
    const lowStock = state.products.filter((product) => Number(product.stock || 0) <= Number(product.low_stock_threshold || 0)).length;
    const pendingOutbox = state.outbox.filter((item) => item.status === 'pending').length;
    const unread = state.notices.filter((item) => !item.is_read).length;
    return { revenue, pendingOrders, activeProducts, lowStock, pendingOutbox, unread };
  }, [state]);

  const products = useMemo(() => {
    const text = query.toLowerCase().trim();
    return state.products.filter((product) => !text || `${product.name} ${product.sku} ${product.brand} ${product.category_slug}`.toLowerCase().includes(text)).slice(0, 8);
  }, [state.products, query]);

  const toggleFlag = async (flag: FlagRow) => {
    const { error: flagError } = await supabase.from('saas_feature_flags').update({ enabled: !flag.enabled, updated_at: new Date().toISOString() }).eq('id', flag.id);
    if (flagError) setError(flagError.message);
    await load();
  };

  return (
    <AdminShell active="overview">
      <header className="ops-hero card">
        <div><span className="admin-eyebrow"><Activity size={16} /> Production Dashboard</span><h1>Realtime Operations Center</h1><p>Live products, orders, notifications, inventory signals, SaaS events and business controls.</p></div>
        <div className="ops-hero-actions"><div className="ops-live"><span /> Live Sync <b>{lastSync || 'Starting'}</b></div><button className="btn" onClick={load}><RefreshCcw size={17} /> Refresh</button></div>
      </header>

      {error && <div className="admin-notice bad">{error}</div>}
      {loading && <div className="card ops-loading">Loading realtime admin dashboard...</div>}

      <section className="ops-kpis">
        <Kpi icon={<CircleDollarSign />} label="Revenue" value={money(metrics.revenue)} sub={`${state.orders.length} total orders`} />
        <Kpi icon={<Clock />} label="Pending Orders" value={metrics.pendingOrders} sub="Needs attention" tone="warn" />
        <Kpi icon={<Package />} label="Active Products" value={metrics.activeProducts} sub={`${metrics.lowStock} low stock`} tone={metrics.lowStock ? 'warn' : 'ok'} />
        <Kpi icon={<Bell />} label="Notifications" value={metrics.unread} sub={`${metrics.pendingOutbox} pending outbox`} />
        <Kpi icon={<Activity />} label="Event Stream" value={state.events.length} sub="Realtime SaaS events" />
        <Kpi icon={<Truck />} label="Fulfillment" value="Live" sub="Order sync enabled" tone="ok" />
      </section>

      <section className="ops-command card"><div className="ops-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, SKU, brand or category..." /></div><div><a className="btn-soft" href="/admin/products">Manage Products</a><a className="btn-soft" href="/admin/platform">Platform Events</a><a className="btn" href="/admin/product-manager">Create Product <ArrowUpRight size={16} /></a></div></section>

      <section className="ops-grid">
        <Panel title="Latest Orders" icon={<Truck />} action="View all" href="/admin/orders"><div className="ops-list">{state.orders.slice(0, 7).map((order) => <OrderItem key={order.id} order={order} />)}{!state.orders.length && <Empty text="No orders found yet." />}</div></Panel>
        <Panel title="Product Intelligence" icon={<Package />} action="Manage" href="/admin/products"><div className="ops-list">{products.map((product) => <ProductItem key={product.id} product={product} />)}{!products.length && <Empty text="No products match the current search." />}</div></Panel>
        <Panel title="Realtime Event Feed" icon={<Activity />} action="Platform" href="/admin/platform"><div className="ops-list compact">{state.events.slice(0, 8).map((event) => <EventItem key={event.id} event={event} />)}{!state.events.length && <Empty text="No events yet. Product or order changes will appear here." />}</div></Panel>
        <Panel title="Feature Flags" icon={<DatabaseZap />}><div className="ops-flags">{state.flags.slice(0, 8).map((flag) => <button key={flag.id} onClick={() => toggleFlag(flag)} className="ops-flag"><div><b>{flag.label}</b><small>{flag.flag_key}</small></div><span className={flag.enabled ? 'status-on' : 'status-off'}>{flag.enabled ? 'On' : 'Off'}</span></button>)}{!state.flags.length && <Empty text="No feature flags configured." />}</div></Panel>
      </section>
    </AdminShell>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; tone?: 'ok' | 'warn' }) { return <article className={`ops-kpi card ${tone || ''}`}><span>{icon}</span><small>{label}</small><b>{value}</b><p>{sub}</p></article>; }
function Panel({ title, icon, children, action, href }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: string; href?: string }) { return <section className="ops-panel card"><div className="ops-panel-head"><div><span>{icon}</span><h2>{title}</h2></div>{action && href ? <a href={href}>{action} <ArrowUpRight size={14} /></a> : null}</div>{children}</section>; }
function OrderItem({ order }: { order: OrderRow }) { const status = orderStatus(order); return <div className="ops-row"><div><b>{order.order_number || order.id}</b><small>{order.customer_name || 'Customer'} · {niceDate(order.created_at)}</small></div><div className="ops-row-right"><b>{money(Number(order.total || order.subtotal || 0))}</b><span className={status.toLowerCase().includes('delivered') ? 'status-on' : 'status-off'}>{status}</span></div></div>; }
function ProductItem({ product }: { product: ProductRow }) { const low = Number(product.stock || 0) <= Number(product.low_stock_threshold || 0); return <div className="ops-row"><div className="ops-product"><span>{product.image || '📦'}</span><div><b>{product.name || 'Untitled product'}</b><small>{product.sku || product.brand || 'No SKU'} · {product.category_slug || 'Uncategorized'}</small></div></div><div className="ops-row-right"><b>{money(Number(product.price || 0))}</b><span className={low ? 'status-off' : 'status-on'}>{product.stock || 0} stock</span></div></div>; }
function EventItem({ event }: { event: EventRow }) { return <div className="ops-row compact"><div><b>{event.event_type}</b><small>{event.entity_type} · {event.entity_id || 'system'} · {niceDate(event.created_at)}</small></div><span className={event.status === 'processed' ? 'status-on' : 'status-off'}>{event.status}</span></div>; }
function Empty({ text }: { text: string }) { return <div className="empty-panel">{text}</div>; }
