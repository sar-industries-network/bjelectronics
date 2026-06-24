'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Heart, HelpCircle, Minus, PlayCircle, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react';
import { money, seedProducts } from '@/lib/demo-data';
import { loadState, localCart, localWishlist, setLocalCart, setLocalWishlist } from '@/lib/storage';
import type { Product } from '@/lib/types';

type Tab = 'overview' | 'specification' | 'delivery' | 'reviews' | 'faq';
type GalleryItem = { id: string; label: string; src: string; kind: 'image' | 'emoji' | 'video' };
type OptionGroupProps = { title: string; values: string[]; selected: string; setSelected: (value: string) => void };

type ProductWithMedia = Product & { specs: Record<string, unknown> };

const cleanLabel = (value: string) => value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const isUrl = (value: string) => /^(https?:\/\/|\/|data:image\/)/i.test(String(value || '').trim());
const isVideo = (value: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(value) || /(youtube\.com|youtu\.be|vimeo\.com)/i.test(value);
const specValue = (product: ProductWithMedia, key: string) => product.specs?.[key];
const asText = (value: unknown, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;
const asStringList = (value: unknown) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const productWithMedia = (product: Product): ProductWithMedia => ({ ...product, specs: (product.specs || {}) as Record<string, unknown> });

function galleryFor(productInput: Product): GalleryItem[] {
  const product = productWithMedia(productInput);
  const items: GalleryItem[] = [];
  const main = product.image || '📦';
  items.push({ id: 'main', label: 'Main', src: main, kind: isUrl(main) ? 'image' : 'emoji' });

  const gallery = asStringList(specValue(product, 'gallery'));
  gallery.forEach((src, index) => {
    if (!items.some((item) => item.src === src)) {
      items.push({ id: `gallery-${index}`, label: `Image ${index + 1}`, src, kind: isUrl(src) ? 'image' : 'emoji' });
    }
  });

  const video = asText(specValue(product, 'video'));
  if (video) items.push({ id: 'video', label: 'Video', src: video, kind: 'video' });

  items.push({ id: 'lifestyle', label: 'Lifestyle', src: '✨', kind: 'emoji' });
  items.push({ id: 'box', label: 'Box', src: '📦', kind: 'emoji' });
  return items.slice(0, 8);
}

const variantPrice = (variant: string) => variant === 'Premium Bundle' ? 1200 : variant === 'Extended Pack' ? 2200 : 0;
const warrantyPrice = (warranty: string) => warranty === '1 Year Extended' ? 499 : warranty === '2 Years Care+' ? 899 : 0;

export function LiveProfessionalProductDetail({ slug }: { slug: string }) {
  const fallback = seedProducts.find((item) => item.slug === slug) || seedProducts[0];
  const [product, setProduct] = useState<Product>(fallback);
  const [related, setRelated] = useState<Product[]>(seedProducts.filter((item) => item.id !== fallback.id).slice(0, 4));
  const gallery = useMemo(() => galleryFor(product), [product]);
  const [activeImage, setActiveImage] = useState<GalleryItem>(galleryFor(fallback)[0]);
  const [tab, setTab] = useState<Tab>('overview');
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('Dhaka');
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [compare, setCompare] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Graphite');
  const [selectedVariant, setSelectedVariant] = useState(asText(Object.values(productWithMedia(product).specs)[0], 'Standard'));
  const [selectedWarranty, setSelectedWarranty] = useState('Official Warranty');

  useEffect(() => {
    let mounted = true;
    loadState().then((state) => {
      if (!mounted) return;
      const liveProduct = state.products.find((item) => item.slug === slug) || fallback;
      const liveMedia = galleryFor(liveProduct);
      setProduct(liveProduct);
      setRelated(state.products.filter((item) => item.id !== liveProduct.id && item.active).slice(0, 4));
      setSelectedVariant(asText(Object.values(productWithMedia(liveProduct).specs)[0], 'Standard'));
      setActiveImage(liveMedia[0]);
      setWishlisted(localWishlist().includes(liveProduct.id));
    });
    return () => { mounted = false; };
  }, [slug]);

  const mediaProduct = productWithMedia(product);
  const specs = useMemo(() => Object.entries(mediaProduct.specs || {}).filter(([key]) => !['gallery', 'video'].includes(key)), [mediaProduct.specs]);
  const maxQty = Math.max(1, product.stock || 1);
  const finalPrice = product.price + variantPrice(selectedVariant) + warrantyPrice(selectedWarranty);
  const discount = Math.max(0, product.compare_at_price - product.price);
  const monthly = Math.max(1, Math.round(finalPrice / 12));
  const stockPercent = Math.max(6, Math.min(100, Math.round((product.stock / Math.max(product.stock, product.low_stock_threshold * 4, 1)) * 100)));
  const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;
  const isOutOfStock = product.stock <= 0;
  const deliveryText = deliveryArea.toLowerCase().includes('dhaka') ? 'Delivery estimate: 24-48 hours inside Dhaka' : 'Delivery estimate: 2-5 working days outside Dhaka';
  const highlightItems = [
    `${product.brand} official product listing`,
    `${product.rating} rating from ${product.review_count} verified reviews`,
    isLowStock ? `Only ${product.stock} left in stock` : 'Ready stock available',
    `EMI starts from ${money(monthly)}/month`,
  ];

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const changeQty = (nextQty: number) => setQty(Math.max(1, Math.min(maxQty, nextQty)));

  const addToCart = (checkout = false) => {
    if (isOutOfStock) {
      flash('This product is currently out of stock');
      return;
    }
    const cart = localCart();
    const next = cart.some((item) => item.productId === product.id)
      ? cart.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(maxQty, item.quantity + qty) } : item)
      : [...cart, { productId: product.id, quantity: qty }];
    setLocalCart(next);
    window.dispatchEvent(new CustomEvent('bj-cart-updated', { detail: next }));
    flash(checkout ? 'Added to cart. Opening checkout...' : 'Added to cart successfully');
    if (checkout) setTimeout(() => { window.location.href = '/checkout'; }, 350);
  };

  const toggleWishlist = () => {
    const current = localWishlist();
    const next = current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id];
    setLocalWishlist(next);
    window.dispatchEvent(new CustomEvent('bj-wishlist-updated', { detail: next }));
    setWishlisted(next.includes(product.id));
    flash(next.includes(product.id) ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const copyShareLink = async (url: string) => {
    const nav = navigator as Navigator & { clipboard?: { writeText?: (text: string) => Promise<void> } };
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

  const share = async () => {
    const url = window.location.href;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (typeof nav.share === 'function') {
        await nav.share({ title: product.name, text: product.description, url });
        return;
      }
      await copyShareLink(url);
      setCopied(true);
      flash('Product link copied');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      flash('Unable to share right now');
    }
  };

  return (
    <main className="pdp-page pdp-plus pdp-refined">
      {notice && <div className="pdp-notice">⚡ {notice}</div>}
      <div className="pdp-topbar"><a href="/" className="pdp-brand"><span>🛒</span><b>BJ ELECTRONICS</b></a><a href="/products" className="pdp-back">← Continue Shopping</a></div>
      <section className="pdp-shell">
        <div className="pdp-gallery card">
          <div className="pdp-main-media product-visual">
            <ProductMedia item={activeImage} productName={product.name} />
            <span className="pdp-sale-badge">-{product.discount_percent}% OFF</span>
            <span className="pdp-live-badge">{isLowStock ? 'Low stock' : 'Live stock'}: {product.stock}</span>
          </div>
          <div className="pdp-thumbs">{gallery.map((item) => <button type="button" key={item.id} onClick={() => setActiveImage(item)} className={activeImage.id === item.id ? 'active' : ''} aria-pressed={activeImage.id === item.id}><ThumbMedia item={item}/><small>{item.label}</small></button>)}</div>
          <div className="pdp-gallery-tools"><button type="button" onClick={share}><Share2 size={16}/> Share</button><button type="button" onClick={() => setCompare(!compare)} aria-pressed={compare}>{compare ? <CheckCircle2 size={16}/> : <Plus size={16}/>} Compare</button><button type="button" onClick={toggleWishlist} aria-pressed={wishlisted}><Heart size={16} fill={wishlisted ? 'currentColor' : 'none'}/> Wishlist</button></div>
        </div>

        <div className="pdp-info card">
          <div className="pdp-breadcrumb">Home / {cleanLabel(product.category_slug)} / {product.brand}</div>
          <div className="pdp-title-row"><div><span className="badge-blue">{product.brand}</span><h1>{product.name}</h1></div><button type="button" className="pdp-icon-btn" onClick={share}>{copied ? <Copy size={20}/> : <Share2 size={20}/>}</button></div>
          <div className="pdp-rating"><span>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor"/>)}</span><b>{product.rating}</b><em>({product.review_count} verified reviews)</em><strong>SKU: {product.sku}</strong></div>

          <div className="pdp-price-box"><div><strong>{money(finalPrice)}</strong><del>{money(product.compare_at_price)}</del></div><p>You save {money(discount)} · EMI from {money(monthly)}/month · selected configuration included</p></div>
          <div className="pdp-meta-grid"><Meta title="Category" value={cleanLabel(product.category_slug)}/><Meta title="Brand" value={product.brand}/><Meta title="Warranty" value={selectedWarranty}/><Meta title="Availability" value={isOutOfStock ? 'Out of stock' : 'Ready to order'}/></div>
          <div className="pdp-offers"><Offer title="Bank Offer" text="Up to 10% instant discount on selected bank cards"/><Offer title="EMI Available" text={`0% EMI from ${money(monthly)}/month`}/><Offer title="Member Deal" text="Free delivery on selected flash deals"/></div>

          <div className="pdp-options"><OptionGroup title="Color" values={['Graphite', 'Blue', 'Silver']} selected={selectedColor} setSelected={setSelectedColor}/><OptionGroup title="Variant" values={[selectedVariant, 'Premium Bundle', 'Extended Pack']} selected={selectedVariant} setSelected={setSelectedVariant}/><OptionGroup title="Warranty" values={['Official Warranty', '1 Year Extended', '2 Years Care+']} selected={selectedWarranty} setSelected={setSelectedWarranty}/></div>
          <div className="pdp-config-summary"><b>Selected:</b><span>{selectedColor}</span><span>{selectedVariant}</span><span>{selectedWarranty}</span></div>
          {compare && <div className="pdp-compare-panel"><b>Compare Ready</b><span>{product.name}</span><span>{money(finalPrice)}</span><span>{product.stock} stock</span></div>}

          <div className="pdp-delivery-check"><div><Truck size={18}/><b>Check delivery</b></div><div><input value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} placeholder="Enter area or city"/><button type="button" onClick={() => setDeliveryChecked(true)}>Check</button></div>{deliveryChecked && <p>{deliveryText}</p>}</div>
          <div className="pdp-quantity"><span>Quantity</span><div><button type="button" onClick={() => changeQty(qty - 1)}><Minus size={16}/></button><b>{qty}</b><button type="button" onClick={() => changeQty(qty + 1)}><Plus size={16}/></button></div><strong className={isLowStock ? 'low' : ''}>{isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}</strong></div>
          <div className="pdp-stock-meter"><i style={{ width: `${stockPercent}%` }}/></div>
          <div className="pdp-actions"><button type="button" className="btn" disabled={isOutOfStock} onClick={() => addToCart(false)}><ShoppingCart size={18}/> Add to Cart</button><button type="button" className="btn pdp-buy" disabled={isOutOfStock} onClick={() => addToCart(true)}><Zap size={18}/> Buy Now</button><button type="button" className="btn-soft" onClick={toggleWishlist}><Heart size={18} fill={wishlisted ? 'currentColor' : 'none'}/> Wishlist</button></div>
          <div className="pdp-trust-grid"><Trust icon={<ShieldCheck/>} title="Official Warranty" text="Brand warranty support"/><Trust icon={<Truck/>} title="Fast Delivery" text="Inside Dhaka 24-48h"/><Trust icon={<RotateCcw/>} title="Easy Return" text="7 days replacement"/><Trust icon={<CheckCircle2/>} title="Secure Payment" text="COD, bKash, Nagad, Card"/></div>
        </div>
      </section>

      <section className="pdp-tabs card"><div className="pdp-tab-head">{(['overview','specification','delivery','reviews','faq'] as Tab[]).map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={tab === item ? 'active' : ''}>{item}</button>)}</div>{tab === 'overview' && <div className="pdp-tab-body"><h2>Product Details</h2><p>{product.description}</p><div className="pdp-highlights">{highlightItems.map((item) => <span key={item}>✓ {item}</span>)}</div><ul><li>Professional quality checked before dispatch.</li><li>Variation summary: {selectedColor}, {selectedVariant}, {selectedWarranty}.</li><li>Supports COD, bKash, Nagad and card payment labels.</li></ul></div>}{tab === 'specification' && <div className="pdp-spec-grid">{specs.map(([key, value]) => <div key={key}><span>{key}</span><b>{String(value)}</b></div>)}<div><span>Brand</span><b>{product.brand}</b></div><div><span>Category</span><b>{cleanLabel(product.category_slug)}</b></div><div><span>Stock</span><b>{product.stock}</b></div></div>}{tab === 'delivery' && <div className="pdp-tab-body"><h2>Delivery & Warranty</h2><p>{deliveryText}. Every order is inspected before dispatch. Official warranty support is available from BJ ELECTRONICS.</p></div>}{tab === 'reviews' && <div className="pdp-review-grid"><Review name="Verified Customer" text="Excellent product, fast delivery and clean packaging."/><Review name="BJ Member" text="Good price and smooth warranty support."/></div>}{tab === 'faq' && <div className="pdp-faq"><FAQ q="Is this product original?" a="Yes, this page highlights official warranty and verified product details."/><FAQ q="Can I pay cash on delivery?" a="Yes, COD is available for supported areas."/><FAQ q="Can I return the product?" a="Eligible products support replacement according to the store policy."/></div>}</section>

      <section className="pdp-related"><h2>Related Products</h2><div className="pdp-related-grid">{related.map((item) => <a key={item.id} href={`/product/${item.slug}`} className="card"><div><RelatedMedia product={item}/></div><b>{item.name}</b><span>{money(item.price)}</span></a>)}</div></section>
      <div className="pdp-mobile-action"><div><b>{money(finalPrice)}</b><span>{isOutOfStock ? 'Out of stock' : 'Ready to order'}</span></div><button type="button" onClick={() => addToCart(true)} disabled={isOutOfStock}>Buy Now</button></div>
    </main>
  );
}

function ProductMedia({ item, productName }: { item: GalleryItem; productName: string }) {
  if (item.kind === 'video') {
    return <div className="pdp-video-card"><PlayCircle size={72}/><h3>Product overview video</h3><p>Design, features, warranty, unboxing and delivery highlights.</p>{isUrl(item.src) ? <a href={item.src} target="_blank" rel="noreferrer">Open Video</a> : <button type="button">Play Preview</button>}</div>;
  }
  if (item.kind === 'image' && isUrl(item.src)) return <img className="pdp-media-img" src={item.src} alt={productName} loading="eager"/>;
  return <div className="pdp-emoji-preview">{item.src || '📦'}</div>;
}
function ThumbMedia({ item }: { item: GalleryItem }) {
  if (item.kind === 'image' && isUrl(item.src)) return <img className="pdp-thumb-img" src={item.src} alt={item.label} loading="lazy"/>;
  if (item.kind === 'video') return <span>▶️</span>;
  return <span>{item.src || '📦'}</span>;
}
function RelatedMedia({ product }: { product: Product }) {
  return isUrl(product.image) ? <img className="pdp-related-img" src={product.image} alt={product.name} loading="lazy"/> : <span>{product.image || '📦'}</span>;
}
function OptionGroup({ title, values, selected, setSelected }: OptionGroupProps) { return <div><h3>{title}</h3><div>{unique(values).map((value) => <button type="button" key={value} className={selected === value ? 'active' : ''} onClick={() => setSelected(value)}>{value}</button>)}</div></div>; }
function Meta({ title, value }: { title: string; value: string }) { return <div><span>{title}</span><b>{value}</b></div>; }
function Offer({ title, text }: { title: string; text: string }) { return <div><b>{title}</b><span>{text}</span></div>; }
function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div>{icon}<b>{title}</b><span>{text}</span></div>; }
function Review({ name, text }: { name: string; text: string }) { return <div className="pdp-review"><b>{name}</b><p>{text}</p><span>★★★★★</span></div>; }
function FAQ({ q, a }: { q: string; a: string }) { return <details><summary><HelpCircle size={16}/>{q}</summary><p>{a}</p></details>; }
