'use client';

import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { money } from '@/lib/demo-data';
import type { Product } from '@/lib/types';
import { StoreLink, StorefrontContext } from './storefront-core';

export type ProductDisplayContext = StorefrontContext & {
  addToCart: (id: string, quantity?: number) => void;
  toggleWish: (id: string) => void;
};

const isImageUrl = (value: string) => /^(https?:\/\/|\/|data:image\/)/i.test(String(value || '').trim());

export function StoreSectionHead({ title, sub, action, ctx }: { title: string; sub?: string; action?: string; ctx: StorefrontContext }) {
  return <div className="store-section-head mb-5 flex items-end justify-between gap-4"><div><span className="store-section-kicker">BJ ELECTRONICS</span><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action && <button className="btn-soft" onClick={() => ctx.navigate('/products')}>{action}</button>}</div>;
}

export function StoreProductGrid({ products, ctx }: { products: Product[]; ctx: ProductDisplayContext }) {
  return <div className="amazon-product-grid store-product-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{products.map((product) => <StoreProductCard key={product.id} product={product} ctx={ctx}/>)}</div>;
}

export function StoreProductCard({ product, ctx }: { product: Product; ctx: ProductDisplayContext }) {
  const wished = ctx.state.wishlist.includes(product.id);
  const lowStock = Number(product.stock || 0) <= Number(product.low_stock_threshold || 0);
  return <article className="amazon-product-card store-product-card card group relative p-4"><div className="store-product-badges"><span className="badge-red">-{product.discount_percent}%</span>{lowStock && <span className="store-stock-badge">Low stock</span>}</div><button type="button" aria-label="Toggle wishlist" onClick={() => ctx.toggleWish(product.id)} className="store-wish-btn absolute right-3 top-3"><Heart size={16} fill={wished ? 'currentColor' : 'none'}/></button><StoreLink href={`/product/${product.slug}`} ctx={ctx}><div className="product-image-box store-product-media grid h-36 place-items-center rounded-3xl bg-blue-50 text-6xl transition group-hover:scale-105 dark:bg-white/10">{isImageUrl(product.image) ? <img src={product.image} alt={product.name} loading="lazy"/> : <span>{product.image || '📦'}</span>}</div><div className="store-product-content"><small>{product.brand}</small><h3>{product.name}</h3></div></StoreLink><div className="store-rating"><Star size={14} fill="currentColor"/><b>{product.rating}</b><span>({product.review_count})</span></div><div className="store-price-row"><b>{money(product.price)}</b><span>{money(product.compare_at_price)}</span></div><button className="add-cart-btn btn mt-4 w-full" onClick={() => ctx.addToCart(product.id)}><ShoppingCart size={16}/>Add to Cart</button></article>;
}

export function StoreEmpty({ text }: { text: string }) {
  return <div className="card py-12 text-center text-slate-500">{text}</div>;
}
