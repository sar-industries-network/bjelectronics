'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, PackageCheck, RefreshCcw, Search, Truck } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type OrderRecord = {
  id: string;
  order_number?: string | null;
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  shipping_address?: string | null;
  order_status?: string | null;
  status?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  total?: number | null;
  items?: unknown;
  created_at?: string | null;
};

const money = (value?: number | null) => `৳${Number(value || 0).toLocaleString('en-BD')}`;
const orderStatus = (order: OrderRecord) => order.order_status || order.status || 'Processing';
const itemCount = (items: unknown) => Array.isArray(items) ? items.length : 0;

export function AdminOrdersManager() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) {
      setError('Supabase environment variables are missing.');
      return;
    }
    const { data, error: loadError } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(250);
    if (loadError) setError(loadError.message);
    else setOrders((data || []) as OrderRecord[]);
  };

  useEffect(() => {
    load();
    if (!supabaseClientConfigured) return;
    const channel = supabase.channel('admin-orders-live').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const processing = orders.filter((order) => ['processing', 'pending', 'new'].includes(orderStatus(order).toLowerCase())).length;
    const delivered = orders.filter((order) => orderStatus(order).toLowerCase() === 'delivered').length;
    return { totalRevenue, processing, delivered, total: orders.length };
  }, [orders]);

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    if (!text) return orders;
    return orders.filter((order) => `${order.order_number} ${order.customer_name} ${order.phone} ${order.email}`.toLowerCase().includes(text));
  }, [orders, query]);

  return (
    <AdminShell active="orders">
      <header className="ops-hero card">
        <div><span className="admin-eyebrow"><Truck size={16} /> Orders</span><h1>Order Operations</h1><p>Realtime order monitoring, payment visibility and customer delivery details.</p></div>
        <button className="btn" onClick={load}><RefreshCcw size={17}/> Refresh</button>
      </header>

      {error && <div className="admin-notice bad mt-4">{error}</div>}

      <section className="ops-kpis">
        <Kpi icon={<PackageCheck/>} label="Total Orders" value={stats.total} sub="All visible orders" />
        <Kpi icon={<Clock/>} label="Processing" value={stats.processing} sub="Needs action" tone="warn" />
        <Kpi icon={<CheckCircle2/>} label="Delivered" value={stats.delivered} sub="Completed" tone="ok" />
        <Kpi icon={<Truck/>} label="Revenue" value={money(stats.totalRevenue)} sub="Order total value" />
      </section>

      <section className="ops-command card">
        <div className="ops-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order number, customer, phone or email..." /></div>
        <div><button className="btn-soft" onClick={() => setQuery('')}>Clear Search</button></div>
      </section>

      <section className="ops-panel card mt-5">
        <div className="ops-panel-head"><div><span><Truck size={18}/></span><h2>Orders</h2></div><b>{filtered.length} shown</b></div>
        <div className="admin-table-wrap overflow-x-auto">
          <table className="table min-w-[940px]">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{filtered.map((order) => <tr key={order.id}><td><b>{order.order_number || order.id}</b><small className="block text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString() : 'No date'}</small></td><td><b>{order.customer_name || 'Customer'}</b><small className="block text-slate-500">{order.phone || order.email || 'No contact'} · {order.address || order.shipping_address || 'No address'}</small></td><td>{itemCount(order.items)} item(s)</td><td><b>{order.payment_method || 'COD'}</b><small className="block text-slate-500">{order.payment_status || 'Pending'}</small></td><td><b>{money(order.total)}</b></td><td><span className={orderStatus(order).toLowerCase() === 'delivered' ? 'status-on' : 'status-off'}>{orderStatus(order)}</span></td></tr>)}</tbody>
          </table>
        </div>
        {!filtered.length && <div className="empty-panel mt-4">No orders found.</div>}
      </section>
    </AdminShell>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; tone?: 'ok' | 'warn' }) {
  return <article className={`ops-kpi card ${tone || ''}`}><span>{icon}</span><small>{label}</small><b>{value}</b><p>{sub}</p></article>;
}
