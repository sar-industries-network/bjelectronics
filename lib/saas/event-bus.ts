import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

export type SaasEvent = {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id?: string | null;
  payload?: Record<string, unknown>;
  status: string;
  created_at: string;
};

export type SaasOutboxItem = {
  id: string;
  event_id?: string | null;
  target: string;
  payload?: Record<string, unknown>;
  status: string;
  attempts: number;
  created_at: string;
};

export async function loadSaasEvents(limit = 50) {
  if (!supabaseClientConfigured) return { events: [], outbox: [] };
  const [events, outbox] = await Promise.all([
    supabase.from('saas_events').select('*').order('created_at', { ascending: false }).limit(limit),
    supabase.from('saas_outbox').select('*').order('created_at', { ascending: false }).limit(limit),
  ]);
  return {
    events: (events.data || []) as SaasEvent[],
    outbox: (outbox.data || []) as SaasOutboxItem[],
  };
}

export async function emitSaasEvent(eventType: string, entityType: string, entityId: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.rpc('saas_emit_event', {
    p_event_type: eventType,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_payload: payload,
  });
  if (error) throw error;
  return data as string;
}

export function subscribeSaasEvents(onChange: () => void) {
  if (!supabaseClientConfigured) return () => undefined;
  const channel = supabase
    .channel('saas-level-2-event-bus')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'saas_events' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'saas_outbox' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'saas_order_timeline' }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
