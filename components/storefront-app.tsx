'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Search, ShoppingCart, Truck, X } from 'lucide-react';
import { createOrder, loadState, localCart, localWishlist, seedIfNeeded, setLocalCart, setLocalWishlist } from '@/lib/storage';
import { money, orderNo, seedSettings, uid } from '@/lib/demo-data';
import type { AppState, Order, Product } from '@/lib/types';
import { MobileStoreNavCore, StickyCartBarCore, StoreFooterCore, StoreHeaderCore, StoreLink } from './storefront-core';
import { StoreEmpty, StoreProductGrid, StoreSectionHead } from './storefront-products';

type Toast = { id: string; text: string; tone?: 'ok' | 'bad' };
type StoreCtx = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (href: string) => void;
  toast: (text: string, tone?: 'ok' | 'bad') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  addToCart: (id: string, quantity?: number) => void;
  updateQty: (id: string, quantity: number) => void;
  toggleWish: (id: string) => void;
  cartTotals: { subtotal: number; shipping: number; total: number };
};

const defaultState: AppState = { products: [], categories: [], orders: [], customers: [], promotions: [], settings: seedSettings, wishlist: [], cart: [] };

export function StorefrontApp() {
  const [path, setPath] = useState('/');
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const start = async () => {
      setPath(window.location.pathname || '/');
      const savedTheme = (localStorage.getItem('bj_theme') as 'light' | 'dark') || 'light';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      await seedIfNeeded();
      const loaded = await loadState();
      loaded.cart = localCart();
      loaded.wishlist = localWishlist();
      setState(loaded);
      setLoading(false);
    };
    start();
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (href: string) => {
    window.history.pushState({}, '', href);
    setPath(href.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toast = (text: string, tone: Toast['tone'] = 'ok') => {
    const id = uid('toast');
    setToasts((items) => [...items, { id, text, tone }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 2600);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('bj_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    setState((current) => ({ ...current, settings: { ...current.settings, active_theme: next } }));
  };

  const addToCart = (productId: string, quantity = 1) => {
    const next = [...state.cart];
    const item = next.find((entry) => entry.productId === productId);
    if (item) item.quantity += quantity;
    else next.push({ productId, quantity });
    setLocalCart(next);
    setState((current) => ({ ...current, cart: next }));
    toast('Added to cart');
  };

  const updateQty = (productId: string, quantity: number) => {
    const next = quantity <= 0 ? state.cart.filter((item) => item.productId !== productId) : state.cart.map((item) => item.productId === productId ? { ...item, quantity } : item);
    setLocalCart(next);
    setState((current) => ({ ...current, cart: next }));
  };

  const toggleWish = (productId: string) => {
    const next = state.wishlist.includes(productId) ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId];
    setLocalWishlist(next);
    setState((current) => ({ ...current, wishlist: next }));
    toast(next.includes(productId) ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const cartTotals = useMemo(() => {
    const subtotal = state.cart.reduce((sum, item) => sum + ((state.products.find((product) => product.id === item.productId)?.price || 0) * item.quantity), 0);
    const shipping = subtotal ? (subtotal > 5000 ? 0 : 80) : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [state.cart, state.products]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#07111f] dark:text-white"><div className="card text-center"><div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-brand-blue"/><b>Loading BJ ELECTRONICS...</b></div></div>;

  const route = path.replace(/\/$/, '') || '/';
  const ctx: StoreCtx = { state, setState, navigate, toast, theme, toggleTheme, addToCart, updateQty, toggleWish, cartTotals };
  const page = route.startsWith('/products') ? <ProductsPage ctx={ctx}/> : route.startsWith('/product/') ? <ProductDetailPage ctx={ctx} slug={route.split('/')[2]}/> : route.startsWith('/categories/') ? <ProductsPage ctx={ctx} category={route.split('/')[2]}/> : route === '/cart' ? <CartPage ctx={ctx}/> : route === '/checkout' ? <CheckoutPage ctx={ctx}/> : route.startsWith('/order-success/') ? <OrderSuccessPage orderNoValue={route.split('/')[2]}/> : route === '/track-order' ? <TrackOrderPage ctx={ctx}/> : route === '/wishlist' ? <WishlistPage ctx={ctx}/> : route === '/account' ? <AccountPage/> : <HomePage ctx={ctx}/>;

  return <><ToastStack toasts={toasts}/><StoreHeaderCore ctx={ctx}/>{page}<StoreFooterCore ctx={ctx}/><StickyCartBarCore ctx={ctx} route={route}/><MobileStoreNavCore ctx={ctx} route={route}/></>;
}

function ToastStack({ toasts }: { toasts: Toast[] }) { return <div className="fixed right-4 top-4 z-[100] space-y-2">{toasts.map((toast) => <div key={toast.id} className={`rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-glow ${toast.tone === 'bad' ? 'bg-brand-red' : 'bg-brand-blue'}`}>{toast.text}</div>)}</div>; }
function HomePage({ ctx }: { ctx: StoreCtx }) { const featured = ctx.state.products.filter((product) => product.featured && product.active).slice(0, 6); return <main className="mobile-store-shell"><section className="home-hero-wrap container-x grid gap-5 py-8 lg:grid-cols-[240px_1fr_300px]"><aside className="card hidden space-y-2 lg:block"><h3 className="mb-3 font-black">All Categories</h3>{ctx.state.categories.map((category) => <StoreLink key={category.id} href={`/categories/${category.slug}`} className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-bold hover:bg-blue-50 hover:text-brand-blue dark:hover:bg-white/10" ctx={ctx}><span>{category.icon} {category.name}</span><span>›</span></StoreLink>)}</aside><div className="hero-card card product-visual min-h-[430px] overflow-hidden p-8"><span className="badge-blue">{ctx.state.settings.hero_eyebrow}</span><h1 className="mt-5 max-w-xl text-4xl font-black leading-tight md:text-6xl">Future Meets Innovation<br/><span className="text-brand-blue">{ctx.state.settings.hero_title}</span></h1><p className="mt-4 max-w-lg text-slate-600 dark:text-slate-300">{ctx.state.settings.hero_subtitle}</p><div className="mt-7 flex flex-wrap gap-3"><button className="btn" onClick={() => ctx.navigate('/products')}>Shop Now</button><button className="btn-soft" onClick={() => ctx.navigate('/track-order')}>Track Order</button></div><div className="hero-devices mt-10 grid grid-cols-4 gap-3 text-center text-5xl"><div>📱</div><div>💻</div><div>🎧</div><div>⌚</div></div></div><div className="grid gap-4"><Promo title="BANK OFFER" text={ctx.state.settings.bank_offer_text} tone="red"/><Promo title="EASY EMI" text={ctx.state.settings.emi_offer_text} tone="blue"/></div></section><section className="mobile-category-section container-x py-4"><div className="mobile-category-strip scrollbar-hide flex gap-3 overflow-x-auto pb-2">{ctx.state.categories.slice(0, 8).map((category) => <StoreLink key={category.id} href={`/categories/${category.slug}`} className="category-tile card min-w-[160px] p-4" ctx={ctx}><div className="text-3xl">{category.icon}</div><b>{category.name}</b><p className="text-xs text-slate-500">Up to 20% Off</p></StoreLink>)}</div></section><section className="flash-section container-x py-8"><StoreSectionHead title="⚡ Flash Deals" sub="Ends in: 08 : 45 : 32" action="View All Deals" ctx={ctx}/><StoreProductGrid products={featured} ctx={ctx}/></section><Benefits/></main>; }
function Promo({ title, text, tone }: { title: string; text: string; tone: 'red' | 'blue' }) { return <div className="card product-visual"><span className={tone === 'red' ? 'badge-red' : 'badge-blue'}>{title}</span><h3 className="mt-4 text-2xl font-black">{text}</h3><button className="btn-soft mt-5">Learn More →</button></div>; }
function ProductsPage({ ctx, category }: { ctx: StoreCtx; category?: string }) { const [q, setQ] = useState(''); const [sort, setSort] = useState('featured'); const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams(); const search = q || params.get('q') || ''; let list = ctx.state.products.filter((product) => product.active); if (category) list = list.filter((product) => product.category_slug === category); if (search) list = list.filter((product) => `${product.name} ${product.brand} ${product.sku}`.toLowerCase().includes(search.toLowerCase())); if (sort === 'price-low') list.sort((a, b) => a.price - b.price); if (sort === 'price-high') list.sort((a, b) => b.price - a.price); return <main className="container-x py-10"><StoreSectionHead title="Product Catalogue" sub="Search, filter and shop BJ ELECTRONICS products" ctx={ctx}/><div className="card mb-5 grid gap-3 md:grid-cols-[1fr_220px]"><input className="input" placeholder="Search product..." value={q} onChange={(event) => setQ(event.target.value)}/><select className="input" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price low to high</option><option value="price-high">Price high to low</option></select></div><div className="mb-5 flex flex-wrap gap-2"><button className="btn-soft" onClick={() => ctx.navigate('/products')}>All</button>{ctx.state.categories.map((item) => <button key={item.id} className="btn-soft" onClick={() => ctx.navigate(`/categories/${item.slug}`)}>{item.icon} {item.name}</button>)}</div><StoreProductGrid products={list} ctx={ctx}/>{!list.length && <StoreEmpty text="No products found."/>}</main>; }
function ProductDetailPage({ ctx, slug }: { ctx: StoreCtx; slug: string }) { const product = ctx.state.products.find((item) => item.slug === slug); if (!product) return <StoreEmpty text="Product not found."/>; return <main className="container-x grid gap-8 py-10 lg:grid-cols-2"><div className="card product-visual grid min-h-[520px] place-items-center text-9xl">{product.image}</div><div className="card"><span className="badge-blue">{product.brand}</span><h1 className="mt-4 text-4xl font-black">{product.name}</h1><p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{product.description}</p><div className="mt-5 flex items-center gap-3"><b className="text-4xl text-brand-blue">{money(product.price)}</b><span className="text-slate-400 line-through">{money(product.compare_at_price)}</span><span className="badge-red">-{product.discount_percent}%</span></div><p className="mt-4 text-sm text-amber-500">★ {product.rating} ({product.review_count} reviews) · Stock: {product.stock}</p><div className="mt-6 flex flex-wrap gap-3"><button className="btn" onClick={() => ctx.addToCart(product.id)}><ShoppingCart size={18}/>Add to Cart</button><button className="btn-soft" onClick={() => ctx.toggleWish(product.id)}><Heart size={18}/>Wishlist</button></div><div className="mt-6 grid gap-2">{Object.entries(product.specs || {}).map(([key, value]) => <div className="flex justify-between rounded-2xl bg-slate-50 p-3 dark:bg-white/10" key={key}><span>{key}</span><b>{value}</b></div>)}</div></div></main>; }
function CartPage({ ctx }: { ctx: StoreCtx }) { const items = ctx.state.cart.map((item) => ({ ...item, product: ctx.state.products.find((product) => product.id === item.productId) })).filter((item): item is { productId: string; quantity: number; product: Product } => Boolean(item.product)); return <main className="cart-mobile-page container-x py-10"><StoreSectionHead title="Shopping Cart" ctx={ctx}/><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-3">{items.map((item) => <div className="card flex items-center gap-4" key={item.productId}><div className="text-5xl">{item.product.image}</div><div className="flex-1"><b>{item.product.name}</b><p className="text-brand-blue">{money(item.product.price)}</p></div><input className="input w-24" type="number" min="1" value={item.quantity} onChange={(event) => ctx.updateQty(item.productId, Number(event.target.value))}/><button className="btn-soft" onClick={() => ctx.updateQty(item.productId, 0)}><X size={16}/></button></div>)}{!items.length && <StoreEmpty text="Your cart is empty."/>}</div><CheckoutSummary ctx={ctx}/></div></main>; }
function CheckoutSummary({ ctx }: { ctx: StoreCtx }) { return <div className="card h-fit"><h3 className="text-xl font-black">Order Summary</h3><div className="mt-5 space-y-3"><Row label="Subtotal" value={money(ctx.cartTotals.subtotal)}/><Row label="Shipping" value={money(ctx.cartTotals.shipping)}/><Row label="Total" value={money(ctx.cartTotals.total)} big/></div><button className="btn mt-6 w-full" onClick={() => ctx.navigate('/checkout')}>Proceed to Checkout</button></div>; }
function Row({ label, value, big }: { label: string; value: string; big?: boolean }) { return <div className={`flex justify-between ${big ? 'border-t pt-3 text-xl font-black dark:border-white/10' : 'text-sm'}`}><span>{label}</span><span>{value}</span></div>; }
function CheckoutPage({ ctx }: { ctx: StoreCtx }) { const [form, setForm] = useState({ customer_name: '', phone: '', email: '', division: 'Dhaka', district: 'Dhaka', area: '', address: '', delivery_zone: 'inside_dhaka' as 'inside_dhaka' | 'outside_dhaka', payment_method: 'COD' as 'COD' | 'bKash' | 'Nagad' | 'Card', notes: '' }); const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!form.customer_name || !form.phone || !form.address) return ctx.toast('Name, phone and address are required', 'bad'); const items = ctx.state.cart.map((cartItem) => { const product = ctx.state.products.find((entry) => entry.id === cartItem.productId); if (!product) return null; return { productId: product.id, name: product.name, price: product.price, quantity: cartItem.quantity, total: product.price * cartItem.quantity }; }).filter(Boolean) as Order['items']; if (!items.length) return ctx.toast('Cart is empty', 'bad'); const shipping = form.delivery_zone === 'inside_dhaka' ? 80 : 140; const subtotal = items.reduce((sum, item) => sum + item.total, 0); const created_at = new Date().toISOString(); const order: Order = { id: uid('ord'), order_number: orderNo(), ...form, payment_status: form.payment_method === 'COD' ? 'Pending' : 'Paid', order_status: 'Processing', items, subtotal, shipping_fee: shipping, discount: 0, total: subtotal + shipping, created_at, updated_at: created_at }; await createOrder(order); setLocalCart([]); ctx.setState((current) => ({ ...current, cart: [], orders: [order, ...current.orders] })); ctx.toast('Order placed successfully'); ctx.navigate(`/order-success/${order.order_number}`); }; return <main className="container-x py-10"><StoreSectionHead title="Checkout" ctx={ctx}/><form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={submit}><div className="card grid gap-4 md:grid-cols-2"><input className="input" placeholder="Full name" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })}/><input className="input" placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })}/><input className="input" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })}/><input className="input" placeholder="Division" value={form.division} onChange={(event) => setForm({ ...form, division: event.target.value })}/><input className="input" placeholder="District" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}/><input className="input" placeholder="Area" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })}/><textarea className="input md:col-span-2" placeholder="Full address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })}/><select className="input" value={form.delivery_zone} onChange={(event) => setForm({ ...form, delivery_zone: event.target.value as 'inside_dhaka' | 'outside_dhaka' })}><option value="inside_dhaka">Inside Dhaka</option><option value="outside_dhaka">Outside Dhaka</option></select><select className="input" value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value as 'COD' | 'bKash' | 'Nagad' | 'Card' })}><option>COD</option><option>bKash</option><option>Nagad</option><option>Card</option></select></div><div className="card h-fit"><CheckoutSummary ctx={ctx}/><button className="btn mt-4 w-full" type="submit">Place Order</button></div></form></main>; }
function OrderSuccessPage({ orderNoValue }: { orderNoValue: string }) { return <main className="container-x py-16"><div className="card mx-auto max-w-xl text-center"><div className="text-6xl">✅</div><h1 className="mt-4 text-3xl font-black">Order placed successfully</h1><p className="mt-2 text-slate-600 dark:text-slate-300">Your order number is:</p><b className="mt-4 block text-2xl text-brand-blue">{decodeURIComponent(orderNoValue)}</b></div></main>; }
function TrackOrderPage({ ctx }: { ctx: StoreCtx }) { const [q, setQ] = useState(''); const results = ctx.state.orders.filter((order) => order.order_number.toLowerCase().includes(q.toLowerCase()) || order.phone.includes(q)); return <main className="container-x py-10"><StoreSectionHead title="Track Order" ctx={ctx}/><div className="card"><input className="input" placeholder="Enter order number or phone" value={q} onChange={(event) => setQ(event.target.value)}/><div className="mt-5 space-y-3">{q && results.map((order) => <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10" key={order.id}><b>{order.order_number}</b><p>{order.customer_name} · {order.order_status} · {money(order.total)}</p></div>)}{q && !results.length && <p>No order found.</p>}</div></div></main>; }
function WishlistPage({ ctx }: { ctx: StoreCtx }) { return <main className="container-x py-10"><StoreSectionHead title="Wishlist" ctx={ctx}/><StoreProductGrid products={ctx.state.products.filter((product) => ctx.state.wishlist.includes(product.id))} ctx={ctx}/></main>; }
function AccountPage() { return <main className="container-x py-10"><div className="card mx-auto max-w-xl"><h1 className="text-3xl font-black">Customer Account</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Customer login can be connected to Supabase Auth in the next security hardening step.</p></div></main>; }
function Benefits() { return <section className="container-x grid gap-3 py-8 md:grid-cols-3 lg:grid-cols-6">{[['100% Authentic','Genuine Products'],['Official Warranty','Brand Warranty'],['Fast Delivery','Across Bangladesh'],['7 Days Return','Hassle Free'],['Secure Payment','100% Secure'],['24/7 Support','Dedicated Support']].map(([title, text]) => <div key={title} className="card text-center"><Truck className="mx-auto text-brand-blue"/><b>{title}</b><p className="text-xs text-slate-500">{text}</p></div>)}</section>; }
