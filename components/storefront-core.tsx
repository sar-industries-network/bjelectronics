'use client';

import React, { useState } from 'react';
import { Heart, Home, Menu, Moon, Search, ShoppingCart, Sun, Users } from 'lucide-react';
import { money } from '@/lib/demo-data';
import type { AppState } from '@/lib/types';

export type StorefrontContext = {
  state: AppState;
  navigate: (href: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  cartTotals: { subtotal: number; shipping: number; total: number };
};

export function StoreLink({ href, children, className, ctx }: { href: string; children: React.ReactNode; className?: string; ctx: StorefrontContext }) {
  const dedicatedRoute = href.startsWith('/product/');
  if (dedicatedRoute) return <a href={href} className={className}>{children}</a>;
  return <a href={href} className={className} onClick={(event) => { event.preventDefault(); ctx.navigate(href); }}>{children}</a>;
}

export function StoreLogo({ dark = false }: { dark?: boolean }) {
  return <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue text-white shadow-glow"><ShoppingCart size={22}/></div><div className="leading-tight"><b className="text-lg"><span className="text-brand-blue">BJ</span> <span className={dark ? 'text-white' : 'text-slate-950 dark:text-white'}>ELECTRONICS</span></b><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium Store</div></div></div>;
}

export function StoreThemeButton({ ctx }: { ctx: StorefrontContext }) {
  return <button onClick={ctx.toggleTheme} className="btn-soft h-11 w-11 p-0" title="Switch theme">{ctx.theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}

export function StoreHeaderCore({ ctx }: { ctx: StorefrontContext }) {
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const settings = ctx.state.settings;
  const navCats = ctx.state.categories.slice(0, 7);
  return <header className="store-header sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/85">
    <div className="mobile-utility bg-brand-ink text-xs text-white"><div className="container-x flex flex-wrap items-center justify-between gap-2 py-2"><span>📍 {settings.delivery_location}</span><span>☎ Hotline: {settings.hotline} (9AM - 9PM)</span><div className="flex gap-4"><StoreLink href="/track-order" ctx={ctx}>Track Order</StoreLink><span>Help Center</span><span>বাংলা ▾</span></div></div></div>
    <div className="mobile-header-main container-x flex items-center gap-3 py-4"><button className="mobile-menu-btn btn-soft lg:hidden" onClick={() => setMenu(!menu)}><Menu size={18}/></button><StoreLink href="/" ctx={ctx}><StoreLogo /></StoreLink><form className="hidden flex-1 md:flex" onSubmit={(event) => { event.preventDefault(); ctx.navigate(`/products?q=${encodeURIComponent(q)}`); }}><input className="input rounded-r-none" placeholder="Search for products, brands and more..." value={q} onChange={(event) => setQ(event.target.value)} /><button className="btn rounded-l-none"><Search size={17}/>Search</button></form><StoreThemeButton ctx={ctx}/><StoreLink href="/account" className="btn-soft hidden md:inline-flex" ctx={ctx}>Account</StoreLink><StoreLink href="/wishlist" className="btn-soft relative" ctx={ctx}><Heart size={18}/><span className="absolute -right-1 -top-1 rounded-full bg-brand-blue px-1.5 text-[10px] text-white">{ctx.state.wishlist.length}</span></StoreLink><StoreLink href="/cart" className="btn-soft relative" ctx={ctx}><ShoppingCart size={18}/><span className="absolute -right-1 -top-1 rounded-full bg-brand-blue px-1.5 text-[10px] text-white">{ctx.state.cart.length}</span></StoreLink></div>
    <div className="mobile-search-wrap container-x pb-4 md:hidden"><form className="mobile-search flex" onSubmit={(event) => { event.preventDefault(); ctx.navigate(`/products?q=${encodeURIComponent(q)}`); }}><input className="input rounded-r-none" placeholder="Search products..." value={q} onChange={(event) => setQ(event.target.value)} /><button className="btn rounded-l-none">Go</button></form></div>
    <nav className={`${menu ? 'block' : 'hidden'} border-t border-slate-200/70 dark:border-white/10 lg:block`}><div className="container-x flex flex-wrap gap-2 py-3"><StoreLink href="/products" className="btn" ctx={ctx}><Menu size={16}/>All Categories</StoreLink>{navCats.map((category) => <StoreLink key={category.id} href={`/categories/${category.slug}`} className="nav-pill" ctx={ctx}>{category.name}</StoreLink>)}<StoreLink href="/products" className="nav-pill text-brand-red" ctx={ctx}>Deals</StoreLink></div></nav>
  </header>;
}

export function StoreFooterCore({ ctx }: { ctx: StorefrontContext }) {
  return <footer className="store-footer mt-16 bg-[#07111f] text-white"><div className="container-x grid gap-8 py-12 md:grid-cols-4"><div className="space-y-4 md:col-span-1"><StoreLogo dark/><p className="text-sm leading-7 text-slate-300">Your trusted online electronics store in Bangladesh. We bring you quality products, best prices, and excellent customer service.</p><div className="flex gap-2"><span className="btn-soft bg-white/10 text-white">f</span><span className="btn-soft bg-white/10 text-white">▶</span><span className="btn-soft bg-white/10 text-white">◎</span></div></div><FooterColumn title="Shop" items={['Smartphones','Laptops','Audio','Wearables','Accessories','TV & Display']}/><FooterColumn title="Customer Service" items={['Help Center','Track Order','Returns & Refunds','Shipping & Delivery','Warranty Policy']}/><div><h3 className="mb-4 font-black">Subscribe to our newsletter</h3><p className="mb-4 text-sm text-slate-300">Get the latest updates on new products and offers.</p><div className="flex"><input className="input rounded-r-none border-white/10 bg-white/10 text-white" placeholder="Enter your email"/><button className="btn rounded-l-none">Subscribe</button></div><p className="mt-5 text-sm text-slate-400">We accept: VISA · Mastercard · DBBL Nexus · AMEX · bKash · Nagad</p></div></div><div className="border-t border-white/10 py-5 text-center text-sm text-slate-300">{ctx.state.settings.footer_credit}</div></footer>;
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="mb-4 font-black">{title}</h3><div className="space-y-2 text-sm text-slate-300">{items.map((item) => <div key={item}>{item}</div>)}</div></div>;
}

export function StickyCartBarCore({ ctx, route }: { ctx: StorefrontContext; route: string }) {
  if (!ctx.state.cart.length || route === '/checkout' || route === '/cart') return null;
  return <div className="mobile-sticky-cart"><div><b>{ctx.state.cart.reduce((sum, item) => sum + item.quantity, 0)} item(s)</b><span>{money(ctx.cartTotals.total)}</span></div><button onClick={() => ctx.navigate('/checkout')}>Checkout</button></div>;
}

export function MobileStoreNavCore({ ctx, route }: { ctx: StorefrontContext; route: string }) {
  const item = (href: string, label: string, icon: React.ReactNode, count?: number) => <StoreLink href={href} ctx={ctx} className={`mobile-nav-item ${route === href || (href !== '/' && route.startsWith(href)) ? 'active' : ''}`}><span className="relative">{icon}{count ? <em>{count}</em> : null}</span><small>{label}</small></StoreLink>;
  return <nav className="mobile-bottom-nav">{item('/','Home',<Home size={19}/>)}{item('/products','Shop',<Search size={19}/>)}{item('/wishlist','Wishlist',<Heart size={19}/>,ctx.state.wishlist.length)}{item('/cart','Cart',<ShoppingCart size={19}/>,ctx.state.cart.length)}{item('/account','Account',<Users size={19}/>)}</nav>;
}
