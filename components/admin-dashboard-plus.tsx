'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, Bell, Boxes, CircleDollarSign, Clock, LifeBuoy, Package, RefreshCcw, Search, Sparkles, Truck } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type Product = { id: string; name?: string; sku?: string; brand?: string | null; category_slug?: string | null; price?: number; stock?: number; low_stock_threshold?: number; active?: boolean; image?: string | null };
type Order = { id: string; order_number?: string; customer_name?: string; total?: number; subtotal?: number; order_status?: string; status?: string; created_at?: string };
type Notice = { id: string; is_read?: boolean; message?: string | null; created_at?: string };
type Feed = { id: string; event_type?: string; entity_type?: string; status?: string; created_at?: string };
type Support = { id: string; name?: string; subject?: string; status?: string; created_at?: string };
type Feature = { id: string; title?: string; priority?: string; status?: string; created_at?: string };

type State = { products: Product[]; orders: Order[]; notices: Notice[]; feed: Feed[]; support: Support[]; features: Feature[] };
const empty: State = { products: [], orders: [], notices: [], feed: [], support: [], features: [] };

const money = (value: number) => `৳${Number(value || 0).toLocaleString('en-BD')}`;
const when = (value?: string) => value ? new Date(value).toLocaleString() : 'Just now';
const statusOf = (order: Order) => String(order.order_status || order.status || 'Processing');

export function AdminDashboardPlus() {
  const [state, setState] = useState<State>(empty);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState('');

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) { setError('Supabase environment variables are missing.'); setLoading(false); return; }
    const [products, orders, notices, feed, support, features] = await Promise.all([
      supabase.from('products').select('*').order('updated_at', { ascending: false }).limit(100),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(120),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(40),
      supabase.from('saas_events').select('*').order('created_at', { ascending: false }).limit(40),
      supabase.from('support_tickets').select('id,name,subject,status,created_at').order('created_at', { ascending: false }).limit(60),
      supabase.from('feature_requests').select('id,title,priority,status,created_at').order('created_at', { ascending: false }).limit(60),
    ]);
    const firstError = [products.error, orders.error, notices.error, feed.error, support.error, features.error].find(Boolean);
    if (firstError) setError(firstError.message);
    setState({ products: (products.data || []) as Product[], orders: (orders.data || []) as Order[], notices: (notices.data || []) as Notice[], feed: (feed.data || []) as Feed[], support: (support.data || []) as Support[], features: (features.data || []) as Feature[] });
    setLastSync(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!supabaseClientConfigured) return;
    const channel = supabase.channel('admin-dashboard-plus')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_requests' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const metrics = useMemo(() => {
    const revenue = state.orders.reduce((sum, item) => sum + Number(item.total || item.subtotal || 0), 0);
    const pending = state.orders.filter((item) => ['pending', 'processing', 'new'].includes(statusOf(item).toLowerCase())).length;
    const lowStock = state.products.filter((item) => Number(item.stock || 0) <= Number(item.low_stock_threshold || 0)).length;
    const unread = state.notices.filter((item) => !item.is_read).length;
    const openSupport = state.support.filter((item) => String(item.status || 'open') === 'open').length;
    const highPriority = state.features.filter((item) => String(item.priority || '').toLowerCase() === 'high').length;
    return { revenue, pending, lowStock, unread, openSupport, highPriority, avgOrder: state.orders.length ? revenue / state.orders.length : 0 };
  }, [state]);

  const shownProducts = state.products.filter((item) => !query || `${item.name} ${item.sku} ${item.brand}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7);

  return <AdminShell active="overview"><header className="ops-hero card"><div><span className="admin-eyebrow"><Activity size={16}/> Admin Dashboard</span><h1>Business Control Center</h1><p>Realtime store operations with orders, products, support, feature requests, notifications and growth signals.</p></div><div className="ops-hero-actions"><div className="ops-live"><span/>Synced <b>{lastSync || 'Starting'}</b></div><button className="btn" onClick={load}><RefreshCcw size={17}/>Refresh</button></div></header>{error && <div className="admin-notice bad">{error}</div>}{loading && <div className="card ops-loading">Loading admin dashboard...</div>}<section className="ops-kpis expanded"><Kpi icon={<CircleDollarSign/>} label="Revenue" value={money(metrics.revenue)} sub={`${state.orders.length} orders`} /><Kpi icon={<Clock/>} label="Pending Orders" value={metrics.pending} sub="Needs processing" tone="warn"/><Kpi icon={<Package/>} label="Low Stock" value={metrics.lowStock} sub={`${state.products.length} products`} tone={metrics.lowStock ? 'warn' : 'ok'}/><Kpi icon={<LifeBuoy/>} label="Support" value={metrics.openSupport} sub="Open tickets" tone={metrics.openSupport ? 'warn' : 'ok'}/><Kpi icon={<Sparkles/>} label="Feature Requests" value={state.features.length} sub={`${metrics.highPriority} high priority`}/><Kpi icon={<Bell/>} label="Notifications" value={metrics.unread} sub="Unread alerts"/><Kpi icon={<BarChart3/>} label="Avg Order" value={money(metrics.avgOrder)} sub="Basket value" tone="ok"/><Kpi icon={<Truck/>} label="Fulfillment" value="Live" sub="Admin sync" tone="ok"/></section><section className="ops-command card"><div className="ops-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, SKU or brand..."/></div><div><a className="btn-soft" href="/admin/support">Support Inbox</a><a className="btn-soft" href="/admin/orders">Orders</a><a className="btn-soft" href="/roadmap">Roadmap</a><a className="btn" href="/admin/product-manager">Create Product <ArrowUpRight size={16}/></a></div></section><section className="ops-insights"><Panel title="Action Focus" icon={<Boxes/>}><div className="ops-focus-list"><Focus href="/admin/orders" label="Pending orders" value={metrics.pending}/><Focus href="/admin/support" label="Open support" value={metrics.openSupport}/><Focus href="/admin/products" label="Low stock" value={metrics.lowStock}/><Focus href="/roadmap" label="Feature queue" value={state.features.length}/></div></Panel><Panel title="Quick Actions" icon={<Sparkles/>}><div className="ops-actions-grid"><a href="/admin/product-manager">New product</a><a href="/admin/orders">Review orders</a><a href="/admin/support">Resolve support</a><a href="/admin/settings">Store settings</a><a href="/help">Help page</a><a href="/roadmap">Roadmap</a></div></Panel></section><section className="ops-grid"><Panel title="Latest Orders" icon={<Truck/>} action="View all" href="/admin/orders"><div className="ops-list">{state.orders.slice(0, 7).map((item) => <OrderItem key={item.id} order={item}/>)}{!state.orders.length && <Empty text="No orders found yet."/>}</div></Panel><Panel title="Product Intelligence" icon={<Package/>} action="Manage" href="/admin/products"><div className="ops-list">{shownProducts.map((item) => <ProductItem key={item.id} product={item}/>)}{!shownProducts.length && <Empty text="No products match the current search."/>}</div></Panel><Panel title="Support Queue" icon={<LifeBuoy/>} action="Inbox" href="/admin/support"><div className="ops-list compact">{state.support.slice(0, 6).map((item) => <SimpleRow key={item.id} title={item.subject || 'Support ticket'} sub={`${item.name || 'Customer'} · ${when(item.created_at)}`} status={item.status || 'open'}/>)}{!state.support.length && <Empty text="No support tickets yet."/>}</div></Panel><Panel title="Feature Requests" icon={<Sparkles/>} action="Roadmap" href="/roadmap"><div className="ops-list compact">{state.features.slice(0, 6).map((item) => <SimpleRow key={item.id} title={item.title || 'Feature request'} sub={`${item.priority || 'medium'} priority · ${when(item.created_at)}`} status={item.status || 'planned'}/>)}{!state.features.length && <Empty text="No feature requests yet."/>}</div></Panel><Panel title="Realtime Event Feed" icon={<Activity/>} action="Platform" href="/admin/platform"><div className="ops-list compact">{state.feed.slice(0, 8).map((item) => <SimpleRow key={item.id} title={item.event_type || 'event'} sub={`${item.entity_type || 'system'} · ${when(item.created_at)}`} status={item.status || 'new'}/>)}{!state.feed.length && <Empty text="No events yet."/>}</div></Panel></section></AdminShell>;
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; tone?: 'ok' | 'warn' }) { return <article className={`ops-kpi card ${tone || ''}`}><span>{icon}</span><small>{label}</small><b>{value}</b><p>{sub}</p></article>; }
function Panel({ title, icon, children, action, href }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: string; href?: string }) { return <section className="ops-panel card"><div className="ops-panel-head"><div><span>{icon}</span><h2>{title}</h2></div>{action && href ? <a href={href}>{action} <ArrowUpRight size={14}/></a> : null}</div>{children}</section>; }
function Focus({ href, label, value }: { href: string; label: string; value: React.ReactNode }) { return <a className="ops-focus" href={href}><span>{value}</span><b>{label}</b><ArrowUpRight size={15}/></a>; }
function OrderItem({ order }: { order: Order }) { const status = statusOf(order); return <div className="ops-row"><div><b>{order.order_number || order.id}</b><small>{order.customer_name || 'Customer'} · {when(order.created_at)}</small></div><div className="ops-row-right"><b>{money(Number(order.total || order.subtotal || 0))}</b><span className={status.toLowerCase().includes('delivered') ? 'status-on' : 'status-off'}>{status}</span></div></div>; }
function ProductItem({ product }: { product: Product }) { const low = Number(product.stock || 0) <= Number(product.low_stock_threshold || 0); return <div className="ops-row"><div className="ops-product"><span>{product.image || '📦'}</span><div><b>{product.name || 'Untitled product'}</b><small>{product.sku || product.brand || 'No SKU'} · {product.category_slug || 'Uncategorized'}</small></div></div><div className="ops-row-right"><b>{money(Number(product.price || 0))}</b><span className={low ? 'status-off' : 'status-on'}>{product.stock || 0} stock</span></div></div>; }
function SimpleRow({ title, sub, status }: { title: string; sub: string; status: string }) { return <div className="ops-row compact"><div><b>{title}</b><small>{sub}</small></div><span className={status.toLowerCase().includes('open') || status.toLowerCase().includes('pending') ? 'status-off' : 'status-on'}>{status}</span></div>; }
function Empty({ text }: { text: string }) { return <div className="empty-panel">{text}</div>; }
