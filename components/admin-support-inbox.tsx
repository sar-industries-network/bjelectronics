'use client';

import React, { useEffect, useState } from 'react';
import { LifeBuoy, RefreshCcw, Sparkles } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type Ticket = { id: string; name?: string; subject?: string; message?: string; status?: string; created_at?: string };
type Request = { id: string; title?: string; description?: string; priority?: string; status?: string; created_at?: string };

const when = (value?: string) => value ? new Date(value).toLocaleString() : 'Just now';

export function AdminSupportInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) { setError('Supabase environment variables are missing.'); setLoading(false); return; }
    const [ticketRes, requestRes] = await Promise.all([
      supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('feature_requests').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (ticketRes.error || requestRes.error) setError(ticketRes.error?.message || requestRes.error?.message || 'Unable to load support data.');
    setTickets((ticketRes.data || []) as Ticket[]);
    setRequests((requestRes.data || []) as Request[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return <AdminShell active="support"><header className="ops-hero card"><div><span className="admin-eyebrow"><LifeBuoy size={16}/> Support Center</span><h1>Support & Feature Inbox</h1><p>Review support tickets and feature requests submitted from the frontend Help Center.</p></div><button className="btn" onClick={load}><RefreshCcw size={17}/> Refresh</button></header>{error && <div className="admin-notice bad">{error}</div>}{loading && <div className="card ops-loading">Loading support inbox...</div>}<section className="ops-grid"><InboxPanel title="Support Tickets" icon={<LifeBuoy/>} rows={tickets.map((item) => ({ id: item.id, title: item.subject || 'Support ticket', sub: `${item.name || 'Customer'} · ${when(item.created_at)}`, status: item.status || 'open' }))}/><InboxPanel title="Feature Requests" icon={<Sparkles/>} rows={requests.map((item) => ({ id: item.id, title: item.title || 'Feature request', sub: `${item.priority || 'medium'} priority · ${when(item.created_at)}`, status: item.status || 'planned' }))}/></section></AdminShell>;
}

function InboxPanel({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: Array<{ id: string; title: string; sub: string; status: string }> }) {
  return <section className="ops-panel card"><div className="ops-panel-head"><div><span>{icon}</span><h2>{title}</h2></div><b>{rows.length}</b></div><div className="ops-list">{rows.map((row) => <article className="ops-row" key={row.id}><div><b>{row.title}</b><small>{row.sub}</small></div><span className={row.status.toLowerCase().includes('open') || row.status.toLowerCase().includes('planned') ? 'status-off' : 'status-on'}>{row.status}</span></article>)}{!rows.length && <div className="empty-panel">No records yet.</div>}</div></section>;
}
