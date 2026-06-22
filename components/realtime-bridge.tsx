'use client';

import { useEffect, useRef } from 'react';
import { supabase, supabaseRuntimeConfigured } from '@/lib/supabaseClient';

type Props = {
  enabled?: boolean;
  onRefresh: () => Promise<void>;
  onNotify?: (message: string) => void;
};

const TABLE_LABELS: Record<string, string> = {
  orders: 'Order updated',
  products: 'Inventory updated',
  customers: 'Customer updated',
  promotions: 'Promotion updated',
  store_settings: 'Store settings updated',
  notifications: 'New notification',
  inventory_logs: 'Inventory log updated',
};

export function RealtimeBridge({ enabled = true, onRefresh, onNotify }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !supabaseRuntimeConfigured) return;

    const scheduleRefresh = (message: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        await onRefresh();
        onNotify?.(message);
      }, 250);
    };

    const channel = supabase.channel('bj-electronics-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => scheduleRefresh(TABLE_LABELS.orders))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => scheduleRefresh(TABLE_LABELS.products))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => scheduleRefresh(TABLE_LABELS.customers))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => scheduleRefresh(TABLE_LABELS.promotions))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => scheduleRefresh(TABLE_LABELS.store_settings))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => scheduleRefresh(TABLE_LABELS.notifications))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_logs' }, () => scheduleRefresh(TABLE_LABELS.inventory_logs))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') onNotify?.('Realtime sync connected');
      });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [enabled, onNotify, onRefresh]);

  return null;
}
