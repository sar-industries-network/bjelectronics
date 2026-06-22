'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BellRing, Boxes, CheckCircle2, Clock, DatabaseZap, Flag, Package, RefreshCcw, RadioTower, ServerCog, Workflow } from 'lucide-react';
import { loadSaasEvents, SaasEvent, SaasOutboxItem, subscribeSaasEvents } from '@/lib/saas/event-bus';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type FeatureFlag = { id: string; flag_key: string; label: string; enabled: boolean; updated_at: string };
type Timeline = { id: string; order_id: string; order_number?: string | null; status: string; note?: string | null; created_at: string };

export function AdminSaasControlCenter() {
  const [events, setEvents] = useState<SaasEvent[]>([]);
  const [outbox, setOutbox] = useState<SaasOutboxItem[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) {
      setError('Supabase environment variables are missing.');
      setLoading(false);
      return;
    }
    try {
      const eventData = await loadSaasEvents(40);
      setEvents(eventData.events);
      setOutbox(eventData.outbox);
      const [flagsResult, timelineResult] = await Promise.all([
        supabase.from('saas_feature_flags').select('*').order('flag_key'),
        supabase.from('saas_order_timeline').select('*').order('created_at', { ascending: false }).limit(30),
      ]);
      if (flagsResult.error) throw flagsResult.error;
      if (timelineResult.error) throw timelineResult.error;
      setFlags((flagsResult.data || []) as FeatureFlag[]);
      setTimeline((timelineResult.data || []) as Timeline[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load SaaS control center.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return subscribeSaasEvents(load);
  }, []);

  const stats = useMemo(() => {
    const pending = outbox.filter((item) => item.status === 'pending').length;
    const processed = outbox.filter((item) => item.status === 'processed').length;
    const orderEvents = events.filter((item) => item.entity_type === 'orders').length;
    const inventoryEvents = events.filter((item) => item.event_type.includes('inventory')).length;
    return { pending, processed, orderEvents, inventoryEvents };
  }, [events, outbox]);

  const toggleFlag = async (flag: FeatureFlag) => {
    const next = !flag.enabled;
    const { error: updateError } = await supabase.from('saas_feature_flags').update({ enabled: next, updated_at: new Date().toISOString() }).eq('id', flag.id);
    if (updateError) setError(updateError.message);
    await load();
  };

  return (
    <main className="admin-saas-page min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-[#07111f] dark:text-white">
      <header className="saas-hero card">
        <div>
          <span className="admin-eyebrow"><RadioTower size={16} /> SaaS Architecture Level 2</span>
          <h1>Enterprise Event Control Center</h1>
          <p>Monitor realtime events, outbox pipeline, order lifecycle timeline, feature flags and backend sync health.</p>
        </div>
        <button className="btn" onClick={load}><RefreshCcw size={17} /> Refresh</button>
      </header>

      {error && <div className="admin-notice bad mt-4">{error}</div>}
      {loading && <div className="card mt-4">Loading SaaS control center...</div>}

      <section className="saas-stat-grid">
        <SaasStat icon={<Workflow />} label="Total Events" value={events.length} />
        <SaasStat icon={<Clock />} label="Pending Outbox" value={stats.pending} tone="warn" />
        <SaasStat icon={<CheckCircle2 />} label="Processed Outbox" value={stats.processed} />
        <SaasStat icon={<Boxes />} label="Order Events" value={stats.orderEvents} />
        <SaasStat icon={<Package />} label="Inventory Events" value={stats.inventoryEvents} />
        <SaasStat icon={<Flag />} label="Feature Flags" value={flags.length} />
      </section>

      <section className="saas-grid">
        <Panel title="Realtime Event Stream" icon={<Activity />}>
          <div className="saas-list">
            {events.map((event) => <EventRow key={event.id} event={event} />)}
            {!events.length && <Empty text="No events yet. Create/update a product or order to generate events." />}
          </div>
        </Panel>

        <Panel title="Outbox Queue" icon={<ServerCog />}>
          <div className="saas-list">
            {outbox.map((item) => <div className="saas-row" key={item.id}><div><b>{item.target}</b><small>{item.event_id}</small></div><span className={item.status === 'pending' ? 'status-off' : 'status-on'}>{item.status}</span></div>)}
            {!outbox.length && <Empty text="No outbox items found." />}
          </div>
        </Panel>

        <Panel title="Order Timeline" icon={<BellRing />}>
          <div className="saas-list">
            {timeline.map((item) => <div className="saas-row" key={item.id}><div><b>{item.status}</b><small>{item.order_number || item.order_id} · {new Date(item.created_at).toLocaleString()}</small></div><span className="status-on">timeline</span></div>)}
            {!timeline.length && <Empty text="No order timeline records yet." />}
          </div>
        </Panel>

        <Panel title="Feature Flags" icon={<DatabaseZap />}>
          <div className="saas-list">
            {flags.map((flag) => <button className="saas-row flag-row-button" key={flag.id} onClick={() => toggleFlag(flag)}><div><b>{flag.label}</b><small>{flag.flag_key}</small></div><span className={flag.enabled ? 'status-on' : 'status-off'}>{flag.enabled ? 'Enabled' : 'Disabled'}</span></button>)}
            {!flags.length && <Empty text="No feature flags configured." />}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function SaasStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: 'warn' }) {
  return <div className={`saas-stat card ${tone === 'warn' ? 'warn' : ''}`}><span>{icon}</span><small>{label}</small><b>{value}</b></div>;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="saas-panel card"><div className="saas-panel-head"><span>{icon}</span><h2>{title}</h2></div>{children}</section>;
}

function EventRow({ event }: { event: SaasEvent }) {
  return <div className="saas-row"><div><b>{event.event_type}</b><small>{event.entity_type} · {event.entity_id || 'system'} · {new Date(event.created_at).toLocaleString()}</small></div><span className={event.status === 'processed' ? 'status-on' : 'status-off'}>{event.status}</span></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="empty-panel">{text}</div>;
}
