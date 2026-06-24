'use client';

import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { money } from '@/lib/demo-data';
import type { Product } from '@/lib/types';
import { StoreLink, StorefrontContext } from './storefront-core';

export type ProductDisplayContext = StorefrontContext & {
  addToCart: (id: string, quantity?: number) => void;
  toggleWish: (id: string) => void;
};

export function StoreSectionHead({ title, sub, action, ctx }: { title: string; sub?: string; action?: string; ctx: StorefrontContext }) {
  return <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-black md:text-3xl">{title}</h2>{sub && <p className="text-sm text-brand-red font-bold">{sub}</p>}</div>{action && <button className="btn-soft" onClick={() => ctx.navigate('/products')}>{action}</button>}</div>;
}

export function StoreProductGrid({ products, ctx }: { products: Product[]; ctx: ProductDisplayContext }) {
  return <div className="amazon-product-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{products.map((product) => <StoreProductCard key={product.id} product={product} ctx={ctx}/>)}</div>;
}

export function StoreProductCard({ product, ctx }: { product: Product; ctx: ProductDisplayContext }) {
  const wished = ctx.state.wishlist.includes(product.id);
  return <div className="amazon-product-card card group relative p-4"><span className="badge-red absolute left-3 top-3">-{product.discount_percent}%</span><button onClick={() => ctx.toggleWish(product.id)} className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-brand-red dark:bg-black/30"><Heart size={16} fill={wished ? 'currentColor' : 'none'}/></button><StoreLink href={`/product/${product.slug}`} ctx={ctx}><div className="product-image-box grid h-36 place-items-center rounded-3xl bg-blue-50 text-6xl transition group-hover:scale-105 dark:bg-white/10">{product.image}</div><h3 className="mt-4 min-h-[48px] font-black">{product.name}</h3></StoreLink><p className="text-sm text-amber-500">★ {product.rating} <span className="text-slate-400">({product.review_count})</span></p><div className="mt-2 flex items-center gap-2"><b className="text-brand-blue">{money(product.price)}</b><span className="text-xs text-slate-400 line-through">{money(product.compare_at_price)}</span></div><button className="add-cart-btn btn mt-4 w-full" onClick={() => ctx.addToCart(product.id)}><ShoppingCart size={16}/>Add to Cart</button></div>;
}

export function StoreEmpty({ text }: { text: string }) {
  return <div className="card py-12 text-center text-slate-500">{text}</div>;
}
