'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Heart, Minus, PlayCircle, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react';
import { money, seedProducts } from '@/lib/demo-data';
import { loadState, localCart, setLocalCart } from '@/lib/storage';
import type { Product } from '@/lib/types';

type Tab = 'details' | 'specification' | 'warranty' | 'reviews';
const cleanLabel = (value: string) => value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const galleryFor = (product: Product) => [
  { id: 'front', label: 'Front', icon: product.image },
  { id: 'angle', label: 'Angle', icon: product.image },
  { id: 'box', label: 'Box', icon: '📦' },
  { id: 'video', label: 'Video', icon: '▶️' },
];

export function LiveProfessionalProductDetail({ slug }: { slug: string }) {
  const fallback = seedProducts.find((item) => item.slug === slug) || seedProducts[0];
  const [product, setProduct] = useState<Product>(fallback);
  const [related, setRelated] = useState<Product[]>(seedProducts.filter((item) => item.id !== fallback.id).slice(0, 4));
  const gallery = useMemo(() => galleryFor(product), [product]);
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [tab, setTab] = useState<Tab>('details');
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Graphite');
  const [selectedVariant, setSelectedVariant] = useState(Object.values(product.specs)[0] || 'Standard');
  const [selectedWarranty, setSelectedWarranty] = useState('Official Warranty');

  useEffect(() => {
    let mounted = true;
    loadState().then((state) => {
      if (!mounted) return;
      const liveProduct = state.products.find((item) => item.slug === slug) || fallback;
      setProduct(liveProduct);
      setRelated(state.products.filter((item) => item.id !== liveProduct.id).slice(0, 4));
      setSelectedVariant(Object.values(liveProduct.specs)[0] || 'Standard');
      setActiveImage(galleryFor(liveProduct)[0]);
    });
    return () => { mounted = false; };
  }, [slug]);

  const addToCart = (checkout = false) => {
    const cart = localCart();
    const next = cart.some((item) => item.productId === product.id)
      ? cart.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + qty } : item)
      : [...cart, { productId: product.id, quantity: qty }];
    setLocalCart(next);
    if (checkout) window.location.href = '/checkout';
  };

  const share = async () => {
    const url = window.location.href;
    if ('share' in navigator) {
      await navigator.share({ title: product.name, text: product.description, url });
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const discount = Math.max(0, product.compare_at_price - product.price);
  const monthly = Math.max(1, Math.round(product.price / 12));

  return (
    <main className="pdp-page">
      <div className="pdp-topbar"><a href="/" className="pdp-brand"><span>🛒</span><b>BJ ELECTRONICS</b></a><a href="/products" className="pdp-back">← Continue Shopping</a></div>
      <section className="pdp-shell">
        <div className="pdp-gallery card">
          <div className="pdp-main-media product-visual">
            {activeImage.id === 'video' ? <div className="pdp-video-card"><PlayCircle size={72}/><h3>Product overview video</h3><p>Design, features, warranty and delivery highlights.</p></div> : <div className="pdp-emoji-preview">{activeImage.icon}</div>}
            <span className="pdp-sale-badge">-{product.discount_percent}% OFF</span>
          </div>
          <div className="pdp-thumbs">{gallery.map((item) => <button key={item.id} onClick={() => setActiveImage(item)} className={activeImage.id === item.id ? 'active' : ''}><span>{item.icon}</span><small>{item.label}</small></button>)}</div>
        </div>
        <div className="pdp-info card">
          <div className="pdp-breadcrumb">Home / {cleanLabel(product.category_slug)} / {product.brand}</div>
          <div className="pdp-title-row"><div><span className="badge-blue">{product.brand}</span><h1>{product.name}</h1></div><button className="pdp-icon-btn" onClick={share}>{copied ? <Copy size={20}/> : <Share2 size={20}/>}</button></div>
          <div className="pdp-rating"><span>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor"/>)}</span><b>{product.rating}</b><em>({product.review_count} verified reviews)</em><strong>SKU: {product.sku}</strong></div>
          <div className="pdp-price-box"><div><strong>{money(product.price)}</strong><del>{money(product.compare_at_price)}</del></div><p>You save {money(discount)} · EMI from {money(monthly)}/month</p></div>
          <div className="pdp-options"><OptionGroup title="Color" values={['Graphite', 'Blue', 'Silver']} selected={selectedColor} setSelected={setSelectedColor}/><OptionGroup title="Variant" values={[selectedVariant, 'Premium Bundle', 'Extended Pack']} selected={selectedVariant} setSelected={setSelectedVariant}/><OptionGroup title="Warranty" values={['Official Warranty', '1 Year Extended', '2 Years Care+']} selected={selectedWarranty} setSelected={setSelectedWarranty}/></div>
          <div className="pdp-quantity"><span>Quantity</span><div><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16}/></button><b>{qty}</b><button onClick={() => setQty(qty + 1)}><Plus size={16}/></button></div><strong className={product.stock <= product.low_stock_threshold ? 'low' : ''}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</strong></div>
          <div className="pdp-actions"><button className="btn" onClick={() => addToCart(false)}><ShoppingCart size={18}/> Add to Cart</button><button className="btn pdp-buy" onClick={() => addToCart(true)}><Zap size={18}/> Buy Now</button><button className="btn-soft"><Heart size={18}/> Wishlist</button></div>
          <div className="pdp-trust-grid"><Trust icon={<ShieldCheck/>} title="Official Warranty" text="Brand warranty support"/><Trust icon={<Truck/>} title="Fast Delivery" text="Inside Dhaka 24-48h"/><Trust icon={<RotateCcw/>} title="Easy Return" text="7 days replacement"/><Trust icon={<CheckCircle2/>} title="Secure Payment" text="COD, bKash, Nagad, Card"/></div>
        </div>
      </section>
      <section className="pdp-tabs card"><div className="pdp-tab-head">{(['details','specification','warranty','reviews'] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? 'active' : ''}>{item}</button>)}</div>{tab === 'details' && <div className="pdp-tab-body"><h2>Product Details</h2><p>{product.description}</p><ul><li>Premium selected electronics for Bangladesh customers.</li><li>Checked by BJ ELECTRONICS before dispatch.</li><li>Supports COD, bKash, Nagad and card payment labels.</li></ul></div>}{tab === 'specification' && <div className="pdp-spec-grid">{Object.entries(product.specs).map(([key, value]) => <div key={key}><span>{key}</span><b>{value}</b></div>)}<div><span>Brand</span><b>{product.brand}</b></div><div><span>Category</span><b>{cleanLabel(product.category_slug)}</b></div><div><span>Stock</span><b>{product.stock}</b></div></div>}{tab === 'warranty' && <div className="pdp-tab-body"><h2>Warranty & Delivery Information</h2><p>Official warranty is handled according to brand policy. Delivery fee is calculated during checkout.</p></div>}{tab === 'reviews' && <div className="pdp-review-grid"><Review name="Verified Buyer" text="Good packaging, fast delivery and product matched the description."/><Review name="BJ Customer" text="Clear warranty information and responsive support."/></div>}</section>
      <section className="pdp-related"><h2>Related Products</h2><div className="pdp-related-grid">{related.map((item) => <a key={item.id} href={`/product/${item.slug}`} className="card"><div>{item.image}</div><b>{item.name}</b><span>{money(item.price)}</span></a>)}</div></section>
    </main>
  );
}

function OptionGroup({ title, values, selected, setSelected }: { title: string; values: string[]; selected: string; setSelected: (value: string) => void }) { return <div><h3>{title}</h3><div>{values.filter(Boolean).map((value) => <button key={value} className={selected === value ? 'active' : ''} onClick={() => setSelected(value)}>{value}</button>)}</div></div>; }
function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div>{icon}<b>{title}</b><span>{text}</span></div>; }
function Review({ name, text }: { name: string; text: string }) { return <div className="pdp-review"><b>{name}</b><p>{text}</p><span>★★★★★</span></div>; }
