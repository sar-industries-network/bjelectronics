'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, supabaseRuntimeConfigured } from '@/lib/supabaseClient';

const LIVE_TABLES = ['orders', 'products', 'customers', 'promotions', 'store_settings', 'notifications', 'inventory_logs'];

export function GlobalRealtimeClient() {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supabaseRuntimeConfigured || typeof window === 'undefined') return;

    const schedule = (table: string) => {
      setMessage(`${table.replace('_', ' ')} updated live`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        window.location.reload();
      }, 700);
    };

    const channel = LIVE_TABLES.reduce((ch, table) => {
      return ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => schedule(table));
    }, supabase.channel('bj-electronics-global-live'));

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setMessage('Realtime connected');
        setTimeout(() => setMessage(''), 1800);
      }
    });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, []);

  if (!message) return null;
  return <div className="live-sync-toast">⚡ {message}</div>;
}
