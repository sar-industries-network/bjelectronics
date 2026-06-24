import { supabase, supabaseRuntimeConfigured } from './supabaseClient';
import { seedState, uid } from './demo-data';

const STORE_KEY = 'bj_enterprise_state_live';
export const isSupabaseConfigured = supabaseRuntimeConfigured;

const now = () => new Date().toISOString();
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const slug = (v) => String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function readLocal() {
  if (typeof window === 'undefined') return seedState();
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seeded = seedState();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try { return { ...seedState(), ...JSON.parse(raw) }; } catch { return seedState(); }
}
function writeLocal(state) { if (typeof window !== 'undefined') localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

function normProduct(r) { return { id: String(r.id), sku: r.sku || r.id, name: r.name || 'Product', slug: r.slug || slug(r.name || r.id), category_slug: r.category_slug || 'accessories', brand: r.brand || 'BJ ELECTRONICS', description: r.description || '', specs: r.specs && typeof r.specs === 'object' ? r.specs : {}, image: r.image || '📦', price: n(r.price), compare_at_price: n(r.compare_at_price), discount_percent: n(r.discount_percent), stock: n(r.stock), low_stock_threshold: n(r.low_stock_threshold, 5), rating: n(r.rating, 4.5), review_count: n(r.review_count), featured: r.featured === true, flash_deal: r.flash_deal === true, active: r.active !== false, created_at: r.created_at || now(), updated_at: r.updated_at || now() }; }
function normCategory(r) { return { id: String(r.id), name: r.name || 'Category', slug: r.slug || slug(r.name || r.id), icon: r.icon || '📦', description: r.description || '', active: r.active !== false, sort_order: n(r.sort_order) }; }
function normOrder(r) { const st = r.order_status || (r.status ? String(r.status).replace(/^./, c => c.toUpperCase()) : 'Processing'); return { id: String(r.id), order_number: r.order_number || r.id, customer_name: r.customer_name || 'Customer', phone: r.phone || '', email: r.email || '', division: r.division || 'Dhaka', district: r.district || 'Dhaka', area: r.area || '', address: r.address || r.shipping_address || '', delivery_zone: r.delivery_zone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka', payment_method: r.payment_method || 'COD', payment_status: r.payment_status || 'Pending', order_status: st, items: Array.isArray(r.items) ? r.items : [], subtotal: n(r.subtotal), shipping_fee: n(r.shipping_fee), discount: n(r.discount), total: n(r.total), notes: r.notes || '', created_at: r.created_at || now(), updated_at: r.updated_at || now() }; }
function normCustomer(r) { return { id: String(r.id), name: r.name || r.customer_name || 'Customer', phone: r.phone || '', email: r.email || '', address: r.address || '', total_orders: n(r.total_orders), total_spent: n(r.total_spent), last_order_at: r.last_order_at || undefined, created_at: r.created_at || now() }; }
function normPromo(r) { return { id: String(r.id), title: r.title || 'Promotion', subtitle: r.subtitle || '', type: r.type || 'offer', discount_value: n(r.discount_value), active: r.active !== false, starts_at: r.starts_at || now(), ends_at: r.ends_at || '', target_category: r.target_category || undefined }; }
function normSettings(r, f) { return { store_name: r?.store_name || f.store_name, logo_text: r?.logo_text || f.logo_text, hotline: r?.hotline || f.hotline, delivery_location: r?.delivery_location || f.delivery_location, hero_eyebrow: r?.hero_eyebrow || f.hero_eyebrow, hero_title: r?.hero_title || f.hero_title, hero_subtitle: r?.hero_subtitle || f.hero_subtitle, footer_credit: r?.footer_credit || f.footer_credit, bank_offer_text: r?.bank_offer_text || f.bank_offer_text, emi_offer_text: r?.emi_offer_text || f.emi_offer_text, currency: r?.currency || f.currency, active_theme: r?.active_theme === 'dark' ? 'dark' : 'light', updated_at: r?.updated_at || now() }; }
async function upsert(table, rows) { const { data, error } = await supabase.from(table).upsert(rows, { onConflict: 'id' }).select(); if (error) throw error; return data || []; }

export async function seedIfNeeded() {
  if (!isSupabaseConfigured) { readLocal(); return; }
  const seeded = seedState();
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error) throw error;
    if (data?.length) return;
    await upsert('categories', seeded.categories);
    await upsert('products', seeded.products.map(p => ({ ...p, specs: p.specs || {} })));
    await upsert('store_settings', [{ id: 'default', ...seeded.settings }]);
    await upsert('promotions', seeded.promotions);
    await upsert('customers', seeded.customers);
    await upsert('orders', seeded.orders.map(o => ({ ...o, status: o.order_status?.toLowerCase() })));
  } catch (e) { console.warn('Supabase seed skipped:', e); readLocal(); }
}

export async function loadState() {
  if (!isSupabaseConfigured) return readLocal();
  try {
    const [p, c, o, cu, pr, s] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('promotions').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('id', 'default').limit(1)
    ]);

    const publicError = [p.error, c.error, pr.error, s.error].find(Boolean);
    if (publicError) throw publicError;

    const local = readLocal();
    const state = {
      ...local,
      products: (p.data || []).map(normProduct),
      categories: (c.data || []).map(normCategory),
      orders: o.error ? local.orders : (o.data || []).map(normOrder),
      customers: cu.error ? local.customers : (cu.data || []).map(normCustomer),
      promotions: (pr.data || []).map(normPromo),
      settings: normSettings(s.data?.[0], local.settings)
    };
    writeLocal(state);
    return state;
  } catch (e) { console.warn('Supabase load failed:', e); return readLocal(); }
}

function prep(table, item) { const x = { ...item, id: item.id || uid(table), updated_at: now() }; if (table === 'products') { x.slug = x.slug || slug(x.name || x.id); x.specs = x.specs || {}; } if (table === 'categories') x.slug = x.slug || slug(x.name || x.id); if (table === 'orders') x.status = String(x.order_status || 'Processing').toLowerCase(); return x; }
export async function saveEntity(table, item) { const x = prep(table, item); if (isSupabaseConfigured) { try { return (await upsert(table, [x]))?.[0] || x; } catch (e) { console.warn('Supabase save failed:', e); } } const state = readLocal(); const list = state[table] || []; writeLocal({ ...state, [table]: list.some(i => i.id === x.id) ? list.map(i => i.id === x.id ? x : i) : [x, ...list] }); return x; }
export async function deleteEntity(table, id) { if (isSupabaseConfigured) { const { error } = await supabase.from(table).delete().eq('id', id); if (!error) return; console.warn(error); } const state = readLocal(); writeLocal({ ...state, [table]: (state[table] || []).filter(i => i.id !== id) }); }
export async function createOrder(order) { const x = prep('orders', order); if (isSupabaseConfigured) { try { const { error } = await supabase.from('orders').insert(x); if (error) throw error; return normOrder(x); } catch (e) { console.warn('Supabase checkout insert failed:', e); } } return saveEntity('orders', order); }
export async function saveSettings(settings) { const next = { ...settings, updated_at: now() }; if (isSupabaseConfigured) { try { return normSettings((await upsert('store_settings', [{ id: 'default', ...next }]))?.[0], next); } catch (e) { console.warn(e); } } const state = readLocal(); writeLocal({ ...state, settings: next }); return next; }
export function getSession() { return typeof window !== 'undefined' && sessionStorage.getItem('bj_admin_session') === 'true'; }
export function login() { if (typeof window !== 'undefined') sessionStorage.setItem('bj_admin_session', 'true'); return true; }
export function logout() { if (typeof window !== 'undefined') sessionStorage.removeItem('bj_admin_session'); }
export function localCart() { return readLocal().cart || []; }
export function setLocalCart(cart) { const s = readLocal(); writeLocal({ ...s, cart }); }
export function localWishlist() { return readLocal().wishlist || []; }
export function setLocalWishlist(wishlist) { const s = readLocal(); writeLocal({ ...s, wishlist }); }
