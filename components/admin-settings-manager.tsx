'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCcw, Settings } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type StoreSettingsRecord = {
  id: string;
  store_name?: string | null;
  logo_text?: string | null;
  hotline?: string | null;
  delivery_location?: string | null;
  hero_eyebrow?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  footer_credit?: string | null;
  bank_offer_text?: string | null;
  emi_offer_text?: string | null;
  currency?: string | null;
  active_theme?: string | null;
  updated_at?: string | null;
};

const fields: Array<[keyof StoreSettingsRecord, string]> = [
  ['store_name', 'Store Name'],
  ['logo_text', 'Logo Text'],
  ['hotline', 'Hotline'],
  ['delivery_location', 'Delivery Location'],
  ['hero_eyebrow', 'Hero Eyebrow'],
  ['hero_title', 'Hero Title'],
  ['hero_subtitle', 'Hero Subtitle'],
  ['bank_offer_text', 'Bank Offer'],
  ['emi_offer_text', 'EMI Offer'],
  ['footer_credit', 'Footer Credit'],
  ['currency', 'Currency'],
  ['active_theme', 'Theme']
];

export function AdminSettingsManager() {
  const [settings, setSettings] = useState<StoreSettingsRecord | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) {
      setError('Supabase environment variables are missing.');
      return;
    }
    const { data, error: loadError } = await supabase.from('store_settings').select('*').eq('id', 'default').single();
    if (loadError) setError(loadError.message);
    else setSettings(data as StoreSettingsRecord);
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminShell active="settings">
      <header className="ops-hero card">
        <div><span className="admin-eyebrow"><Settings size={16} /> Settings</span><h1>Store Settings</h1><p>Clean settings overview for brand, homepage copy, offers, footer and storefront labels.</p></div>
        <button className="btn" onClick={load}><RefreshCcw size={17}/> Refresh</button>
      </header>
      {error && <div className="admin-notice bad mt-4">{error}</div>}
      <section className="ops-panel card mt-5">
        <div className="ops-panel-head"><div><span><Settings size={18}/></span><h2>Current Settings</h2></div><b>{settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Live'}</b></div>
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map(([key, label]) => <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]" key={String(key)}><small className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</small><p className="mt-2 font-bold text-slate-900 dark:text-white">{String(settings?.[key] || '—')}</p></div>)}
        </div>
      </section>
    </AdminShell>
  );
}
