import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const hasConfig = url.startsWith('http') && Boolean(key);

// Build-safe client: Next static export must not crash when env values are missing locally.
export const supabase = createClient(
  hasConfig ? url : 'https://placeholder.supabase.co',
  hasConfig ? key : 'placeholder-anon-key'
);

export const supabaseRuntimeConfigured = hasConfig;
