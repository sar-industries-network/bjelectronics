'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Heart, Minus, PlayCircle, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react';
import { money, seedProducts } from '@/lib/demo-data';
import type { Product } from '@/lib/types';

type Props = { slug: string };
type Tab = 'details' | 'specification' | 'warranty' | 'reviews';

function slugLabel(value: string) {
  return value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function buildGallery(product: Product) {
  return [
    { id: 'front', label: 'Front', icon: product.image },
    { id: 'angle', label: 'Angle', icon: product.image },
    { id: 'box', label: 'Box', icon: '📦' },
    { id: 'video', label: 'Video', icon: '▶️' },
  ];
}

export function ProfessionalProductDetail({ slug }: Props) {
  const product = seedProducts.find((item) => item.slug === slug) || seedProducts[0];
  const related = seedProducts.filter((item) => item.id !== product.id).slice(0, 4);
  const gallery = useMemo(() => buildGallery(product), [product]);
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [tab, setTab] = useState<Tab>('details');
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Graphite');
  const [selectedStorage, setSelectedStorage] = useState(Object.values(product.specs)[0] || 'Standard');
  const [selectedWarranty, setSelectedWarranty] = useState('Official Warranty');
  const [copied, setCopied] = useState(false);
  const saveCart = (checkout = false) => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('bj_enterprise_state_v3') : null;
    const state = raw ? JSON.parse(raw) : { cart: [] };
    const cart = Array.isArray(state.cart) ? state.cart : [];
    const next = cart.some((item: any) => item.productId === product.id)
      ? cart.map((item: any) => item.productId === product.id ? { ...item, quantity: item.quantity + qty } : item)
      : [...cart, { productId: product.id, quantity: qty }];
    localStorage.setItem('bj_enterprise_state_v3', JSON.stringify({ ...state, cart: next }));
    if (checkout) window.location.href = '/checkout';
  };
  const copyShareLink = async (url: string) => {
    const nav = navigator as any;
    if (typeof nav.clipboard?.writeText === 'function') {
      await nav.clipboard.writeText(url);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };
  const shareProduct = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://bjelectronics.shop/product/${product.slug}`;
    const nav = navigator as any;
    try {
      if (typeof nav.share === 'function') {
        await nav.share({ title: product.name, text: product.description, url });
        return;
      }
      await copyShareLink(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  const discount = Math.max(0, product.compare_at_price - product.price);
  const monthly = Math.max(1, Math.round(product.price / 12));

  return (
    <main className="pdp-page">
      <div className="pdp-topbar">
        <a href="/" className="pdp-brand"><span>🛒</span><b>BJ ELECTRONICS</b></a>
        <a href="/products" className="pdp-back">← Continue Shopping</a>
      </div>

      <section className="pdp-shell">
        <div className="pdp-gallery card">
          <div className="pdp-main-media product-visual">
            {activeImage.id === 'video' ? (
              <div className="pdp-video-card">
                <PlayCircle size={72} />
                <h3>Product overview video</h3>
                <p>Watch design, features, warranty and delivery highlights.</p>
              </div>
            ) : (
              <div className="pdp-emoji-preview">{activeImage.icon}</div>
            )}
            <span className="pdp-sale-badge">-{product.discount_percent}% OFF</span>
          </div>
          <div className="pdp-thumbs">
            {gallery.map((item) => (
              <button key={item.id} onClick={() => setActiveImage(item)} className={activeImage.id === item.id ? 'active' : ''}>
                <span>{item.icon}</span>
                <small>{item.label}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info card">
          <div className="pdp-breadcrumb">Home / {slugLabel(product.category_slug)} / {product.brand}</div>
          <div className="pdp-title-row">
            <div>
              <span className="badge-blue">{product.brand}</span>
              <h1>{product.name}</h1>
            </div>
            <button className="pdp-icon-btn" onClick={shareProduct}>{copied ? <Copy size={20}/> : <Share2 size={20}/>}</button>
          </div>
          <div className="pdp-rating"><span>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</span><b>{product.rating}</b><em>({product.review_count} verified reviews)</em><strong>SKU: {product.sku}</strong></div>

          <div className="pdp-price-box">
            <div><strong>{money(product.price)}</strong><del>{money(product.compare_at_price)}</del></div>
            <p>You save {money(discount)} · EMI from {money(monthly)}/month</p>
          </div>

          <div className="pdp-options">
            <OptionGroup title="Color" values={['Graphite', 'Blue', 'Silver']} selected={selectedColor} setSelected={setSelectedColor} />
            <OptionGroup title="Variant" values={[selectedStorage, 'Premium Bundle', 'Extended Pack']} selected={selectedStorage} setSelected={setSelectedStorage} />
            <OptionGroup title="Warranty" values={['Official Warranty', '1 Year Extended', '2 Years Care+']} selected={selectedWarranty} setSelected={setSelectedWarranty} />
          </div>

          <div className="pdp-quantity">
            <span>Quantity</span>
            <div><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16}/></button><b>{qty}</b><button onClick={() => setQty(qty + 1)}><Plus size={16}/></button></div>
            <strong className={product.stock <= product.low_stock_threshold ? 'low' : ''}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</strong>
          </div>

          <div className="pdp-actions">
            <button className="btn" onClick={() => saveCart(false)}><ShoppingCart size={18}/> Add to Cart</button>
            <button className="btn pdp-buy" onClick={() => saveCart(true)}><Zap size={18}/> Buy Now</button>
            <button className="btn-soft"><Heart size={18}/> Wishlist</button>
          </div>

          <div className="pdp-trust-grid">
            <Trust icon={<ShieldCheck/>} title="Official Warranty" text="Brand warranty support" />
            <Trust icon={<Truck/>} title="Fast Delivery" text="Inside Dhaka 24-48h" />
            <Trust icon={<RotateCcw/>} title="Easy Return" text="7 days replacement" />
            <Trust icon={<CheckCircle2/>} title="Secure Payment" text="COD, bKash, Nagad, Card" />
          </div>
        </div>
      </section>

      <section className="pdp-tabs card">
        <div className="pdp-tab-head">
          {(['details', 'specification', 'warranty', 'reviews'] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? 'active' : ''}>{item}</button>)}
        </div>
        {tab === 'details' && <div className="pdp-tab-body"><h2>Product Details</h2><p>{product.description}</p><ul><li>Premium selected electronics for Bangladesh customers.</li><li>Checked by BJ ELECTRONICS before dispatch.</li><li>Compatible with COD, bKash, Nagad and card payment labels.</li></ul></div>}
        {tab === 'specification' && <div className="pdp-spec-grid">{Object.entries(product.specs).map(([key, value]) => <div key={key}><span>{key}</span><b>{value}</b></div>)}<div><span>Brand</span><b>{product.brand}</b></div><div><span>Category</span><b>{slugLabel(product.category_slug)}</b></div><div><span>Stock</span><b>{product.stock}</b></div></div>}
        {tab === 'warranty' && <div className="pdp-tab-body"><h2>Warranty & Delivery Information</h2><p>Official warranty is handled according to brand policy. Delivery fee is calculated during checkout. Inside Dhaka delivery is usually faster than outside Dhaka.</p></div>}
        {tab === 'reviews' && <div className="pdp-review-grid"><Review name="Verified Buyer" text="Good packaging, fast delivery and product was exactly as described."/><Review name="BJ Customer" text="The warranty information and support were clear. Recommended."/></div>}
      </section>

      <section className="pdp-related">
        <h2>Related Products</h2>
        <div className="pdp-related-grid">
          {related.map((item) => <a key={item.id} href={`/product/${item.slug}`} className="card"><div>{item.image}</div><b>{item.name}</b><span>{money(item.price)}</span></a>)}
        </div>
      </section>
    </main>
  );
}

function OptionGroup({ title, values, selected, setSelected }: { title: string; values: string[]; selected: string; setSelected: (value: string) => void }) {
  return <div><h3>{title}</h3><div>{values.filter(Boolean).map((value) => <button key={value} className={selected === value ? 'active' : ''} onClick={() => setSelected(value)}>{value}</button>)}</div></div>;
}
function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div>{icon}<b>{title}</b><span>{text}</span></div>; }
function Review({ name, text }: { name: string; text: string }) { return <div className="pdp-review"><b>{name}</b><p>{text}</p><span>★★★★★</span></div>; }
