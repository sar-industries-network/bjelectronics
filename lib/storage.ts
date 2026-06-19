import { seedState, uid } from './demo-data';
import type { AppState, CartItem, Category, Customer, Order, Product, Promotion, StoreSettings } from './types';

type Table = keyof Pick<AppState, 'products' | 'categories' | 'orders' | 'customers' | 'promotions'>;
const STORE_KEY = 'bj_enterprise_state_v2';
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@bjelectronics.com';
const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Admin@1234';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_PROJECT_ID'));

function getLocalState(): AppState {
  if (typeof window === 'undefined') return seedState();
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seeded = seedState();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as AppState;
    return { ...seedState(), ...parsed };
  } catch {
    const seeded = seedState();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}
function setLocalState(next: AppState) { if (typeof window !== 'undefined') localStorage.setItem(STORE_KEY, JSON.stringify(next)); }

async function sb(path: string, init: RequestInit = {}) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey!,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return [];
  return res.json();
}

export async function seedIfNeeded() {
  const seeded = seedState();
  if (!isSupabaseConfigured) {
    getLocalState();
    return;
  }
  try {
    const existing = await sb('products?select=id&limit=1');
    if (Array.isArray(existing) && existing.length) return;
    await Promise.all([
      sb('categories', { method: 'POST', body: JSON.stringify(seeded.categories) }),
      sb('products', { method: 'POST', body: JSON.stringify(seeded.products) }),
      sb('store_settings', { method: 'POST', body: JSON.stringify([{ id: 'default', ...seeded.settings }]) }),
      sb('promotions', { method: 'POST', body: JSON.stringify(seeded.promotions) }),
      sb('customers', { method: 'POST', body: JSON.stringify(seeded.customers) }),
      sb('orders', { method: 'POST', body: JSON.stringify(seeded.orders) })
    ]);
  } catch (e) {
    console.warn('Supabase seed skipped, falling back locally:', e);
    getLocalState();
  }
}

export async function loadState(): Promise<AppState> {
  if (!isSupabaseConfigured) return getLocalState();
  try {
    const [products, categories, orders, customers, promotions, settingsRows] = await Promise.all([
      sb('products?select=*&order=created_at.desc'),
      sb('categories?select=*&order=sort_order.asc'),
      sb('orders?select=*&order=created_at.desc'),
      sb('customers?select=*&order=created_at.desc'),
      sb('promotions?select=*&order=created_at.desc'),
      sb('store_settings?select=*&id=eq.default&limit=1')
    ]);
    const local = getLocalState();
    return { ...local, products, categories, orders, customers, promotions, settings: settingsRows?.[0] || local.settings };
  } catch (e) {
    console.warn('Supabase load failed, using local state:', e);
    return getLocalState();
  }
}

export async function saveEntity<T extends { id: string }>(table: Table, item: T): Promise<T> {
  const nextItem = { ...item, id: item.id || uid(table), updated_at: new Date().toISOString() } as T;
  if (isSupabaseConfigured) {
    try {
      const [saved] = await sb(table, { method: 'POST', body: JSON.stringify(nextItem), headers: { Prefer: 'resolution=merge-duplicates,return=representation' } });
      return saved || nextItem;
    } catch (e) { console.warn('Supabase save failed, saving locally:', e); }
  }
  const state = getLocalState();
  const list = state[table] as unknown as T[];
  const index = list.findIndex((x) => x.id === nextItem.id);
  const updated = index >= 0 ? list.map((x) => x.id === nextItem.id ? nextItem : x) : [nextItem, ...list];
  setLocalState({ ...state, [table]: updated });
  return nextItem;
}

export async function deleteEntity(table: Table, id: string) {
  if (isSupabaseConfigured) {
    try { await sb(`${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }); return; } catch (e) { console.warn('Supabase delete failed, deleting locally:', e); }
  }
  const state = getLocalState();
  setLocalState({ ...state, [table]: (state[table] as any[]).filter((x) => x.id !== id) });
}

export async function createOrder(order: Order) {
  const saved = await saveEntity<Order>('orders', order);
  const state = getLocalState();
  const exists = state.customers.find((c) => c.phone === order.phone || c.email === order.email);
  const customer: Customer = exists ? { ...exists, total_orders: exists.total_orders + 1, total_spent: exists.total_spent + order.total, last_order_at: order.created_at } : { id: uid('cust'), name: order.customer_name, phone: order.phone, email: order.email, address: order.address, total_orders: 1, total_spent: order.total, last_order_at: order.created_at, created_at: order.created_at };
  await saveEntity<Customer>('customers', customer);
  return saved;
}

export async function saveSettings(settings: StoreSettings) {
  const next = { ...settings, updated_at: new Date().toISOString() };
  if (isSupabaseConfigured) {
    try {
      const [saved] = await sb('store_settings', { method: 'POST', body: JSON.stringify({ id: 'default', ...next }), headers: { Prefer: 'resolution=merge-duplicates,return=representation' } });
      return saved || next;
    } catch (e) { console.warn('Supabase settings save failed, saving locally:', e); }
  }
  const state = getLocalState();
  setLocalState({ ...state, settings: next });
  return next;
}

export function getSession() { if (typeof window === 'undefined') return false; return sessionStorage.getItem('bj_admin_session') === 'true'; }
export function login(email: string, password: string) { const ok = email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword; if (ok && typeof window !== 'undefined') sessionStorage.setItem('bj_admin_session', 'true'); return ok; }
export function logout() { if (typeof window !== 'undefined') sessionStorage.removeItem('bj_admin_session'); }
export function localCart(): CartItem[] { return getLocalState().cart || []; }
export function setLocalCart(cart: CartItem[]) { const s = getLocalState(); setLocalState({ ...s, cart }); }
export function localWishlist(): string[] { return getLocalState().wishlist || []; }
export function setLocalWishlist(wishlist: string[]) { const s = getLocalState(); setLocalState({ ...s, wishlist }); }
