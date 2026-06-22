'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Heart, HelpCircle, Minus, PlayCircle, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react';
import { money, seedProducts } from '@/lib/demo-data';
import { loadState, localCart, localWishlist, setLocalCart, setLocalWishlist } from '@/lib/storage';
import type { Product } from '@/lib/types';

type Tab = 'overview' | 'specification' | 'delivery' | 'reviews' | 'faq';
type GalleryItem = { id: string; label: string; icon: string };

type OptionGroupProps = { title: string; values: string[]; selected: string; setSelected: (value: string) => void };

const cleanLabel = (value: string) => value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const galleryFor = (product: Product): GalleryItem[] => [
  { id: 'front', label: 'Front', icon: product.image },
  { id: 'angle', label: 'Angle', icon: product.image },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { id: 'box', label: 'Box', icon: '📦' },
  { id: 'video', label: 'Video', icon: '▶️' },
];
const variantPrice = (variant: string) => variant === 'Premium Bundle' ? 1200 : variant === 'Extended Pack' ? 2200 : 0;
const warrantyPrice = (warranty: string) => warranty === '1 Year Extended' ? 499 : warranty === '2 Years Care+' ? 899 : 0;

export function LiveProfessionalProductDetail({ slug }: { slug: string }) {
  const fallback = seedProducts.find((item) => item.slug === slug) || seedProducts[0];
  const [product, setProduct] = useState<Product>(fallback);
  const [related, setRelated] = useState<Product[]>(seedProducts.filter((item) => item.id !== fallback.id).slice(0, 4));
  const gallery = useMemo(() => galleryFor(product), [product]);
  const [activeImage, setActiveImage] = useState<GalleryItem>(gallery[0]);
  const [tab, setTab] = useState<Tab>('overview');
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('Dhaka');
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [compare, setCompare] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
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
      setWishlisted(localWishlist().includes(liveProduct.id));
    });
    return () => { mounted = false; };
  }, [slug]);

  const specs = useMemo(() => Object.entries(product.specs || {}), [product.specs]);
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
    flash(checkout ? 'Added to cart. Opening checkout...' : 'Added to cart successfully');
    if (checkout) setTimeout(() => { window.location.href = '/checkout'; }, 350);
  };

  const toggleWishlist = () => {
    const current = localWishlist();
    const next = current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id];
    setLocalWishlist(next);
    setWishlisted(next.includes(product.id));
    flash(next.includes(product.id) ? 'Added to wishlist' : 'Removed from wishlist');
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

  const share = async () => {
    const url = window.location.href;
    const nav = navigator as any;
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
            {activeImage.id === 'video' ? <div className="pdp-video-card"><PlayCircle size={72}/><h3>Product overview video</h3><p>Design, features, warranty, unboxing and delivery highlights.</p><button type="button" onClick={() => flash('Video preview mode enabled')}>Play Preview</button></div> : <div className="pdp-emoji-preview">{activeImage.icon}</div>}
            <span className="pdp-sale-badge">-{product.discount_percent}% OFF</span>
            <span className="pdp-live-badge">{isLowStock ? 'Low stock' : 'Live stock'}: {product.stock}</span>
          </div>
          <div className="pdp-thumbs">{gallery.map((item) => <button type="button" key={item.id} onClick={() => setActiveImage(item)} className={activeImage.id === item.id ? 'active' : ''} aria-pressed={activeImage.id === item.id}><span>{item.icon}</span><small>{item.label}</small></button>)}</div>
          <div className="pdp-gallery-tools"><button type="button" onClick={share}><Share2 size={16}/> Share</button><button type="button" onClick={() => setCompare(!compare)} aria-pressed={compare}>{compare ? <CheckCircle2 size={16}/> : <Plus size={16}/>} Compare</button><button type="button" onClick={toggleWishlist} aria-pressed={wishlisted}><Heart size={16} fill={wishlisted ? 'currentColor' : 'none'}/> Wishlist</button></div>
        </div>

        <div className="pdp-info card">
          <div className="pdp-breadcrumb">Home / {cleanLabel(product.category_slug)} / {product.brand}</div>
          <div className="pdp-title-row"><div><span className="badge-blue">{product.brand}</span><h1>{product.name}</h1></div><button type="button" className="pdp-icon-btn" onClick={share}>{copied ? <Copy size={20}/> : <Share2 size={20}/>}</button></div>
          <div className="pdp-rating"><span>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor"/>)}</span><b>{product.rating}</b><em>({product.review_count} verified reviews)</em><strong>SKU: {product.sku}</strong></div>

          <div className="pdp-price-box"><div><strong>{money(finalPrice)}</strong><del>{money(product.compare_at_price)}</del></div><p>You save {money(discount)} · EMI from {money(monthly)}/month · selected configuration included</p></div>
          <div className="pdp-meta-grid"><Meta title="Category" value={cleanLabel(product.category_slug)}/><Meta title="Brand" value={product.brand}/><Meta title="Warranty" value={selectedWarranty}/><Meta title="Availability" value={isOutOfStock ? 'Out of stock' : 'Ready to order'}/></div>
          <div className="pdp-offers"><Offer title="Bank Offer" text="Up to 10% instant discount on selected bank cards"/><Offer title="EMI Available" text={`0% EMI from ${money(monthly)}/month`}/><Offer title="Member Deal" text="Free delivery on selected flash deals"/></div>

          <div className="pdp-options"><OptionGroup title="Color" values={['Graphite', 'Blue', 'Silver']} selected={selectedColor} setSelected={setSelectedColor}/><OptionGroup title="Variant" values={[Object.values(product.specs)[0] || 'Standard', 'Premium Bundle', 'Extended Pack']} selected={selectedVariant} setSelected={setSelectedVariant}/><OptionGroup title="Warranty" values={['Official Warranty', '1 Year Extended', '2 Years Care+']} selected={selectedWarranty} setSelected={setSelectedWarranty}/></div>
          <div className="pdp-config-summary"><b>Selected:</b><span>{selectedColor}</span><span>{selectedVariant}</span><span>{selectedWarranty}</span></div>
          {compare && <div className="pdp-compare-panel"><b>Compare Ready</b><span>{product.name}</span><span>{money(finalPrice)}</span><span>{product.stock} stock</span></div>}

          <div className="pdp-delivery-check"><div><Truck size={18}/><b>Check delivery</b></div><div><input value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} placeholder="Enter area or city"/><button type="button" onClick={() => setDeliveryChecked(true)}>Check</button></div>{deliveryChecked && <p>{deliveryText}</p>}</div>
          <div className="pdp-quantity"><span>Quantity</span><div><button type="button" onClick={() => changeQty(qty - 1)}><Minus size={16}/></button><b>{qty}</b><button type="button" onClick={() => changeQty(qty + 1)}><Plus size={16}/></button></div><strong className={isLowStock ? 'low' : ''}>{isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}</strong></div>
          <div className="pdp-stock-meter"><i style={{ width: `${stockPercent}%` }}/></div>
          <div className="pdp-actions"><button type="button" className="btn" disabled={isOutOfStock} onClick={() => addToCart(false)}><ShoppingCart size={18}/> Add to Cart</button><button type="button" className="btn pdp-buy" disabled={isOutOfStock} onClick={() => addToCart(true)}><Zap size={18}/> Buy Now</button><button type="button" className="btn-soft" onClick={toggleWishlist}><Heart size={18} fill={wishlisted ? 'currentColor' : 'none'}/> Wishlist</button></div>
          <div className="pdp-trust-grid"><Trust icon={<ShieldCheck/>} title="Official Warranty" text="Brand warranty support"/><Trust icon={<Truck/>} title="Fast Delivery" text="Inside Dhaka 24-48h"/><Trust icon={<RotateCcw/>} title="Easy Return" text="7 days replacement"/><Trust icon={<CheckCircle2/>} title="Secure Payment" text="COD, bKash, Nagad, Card"/></div>
        </div>
      </section>

      <section className="pdp-tabs card"><div className="pdp-tab-head">{(['overview','specification','delivery','reviews','faq'] as Tab[]).map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={tab === item ? 'active' : ''}>{item}</button>)}</div>{tab === 'overview' && <div className="pdp-tab-body"><h2>Product Details</h2><p>{product.description}</p><div className="pdp-highlights">{highlightItems.map((item) => <span key={item}>✓ {item}</span>)}</div><ul><li>Professional quality checked before dispatch.</li><li>Variation summary: {selectedColor}, {selectedVariant}, {selectedWarranty}.</li><li>Supports COD, bKash, Nagad and card payment labels.</li></ul></div>}{tab === 'specification' && <div className="pdp-spec-grid">{specs.map(([key, value]) => <div key={key}><span>{key}</span><b>{value}</b></div>)}<div><span>Brand</span><b>{product.brand}</b></div><div><span>Category</span><b>{cleanLabel(product.category_slug)}</b></div><div><span>Stock</span><b>{product.stock}</b></div><div><span>Selected Color</span><b>{selectedColor}</b></div><div><span>Selected Variant</span><b>{selectedVariant}</b></div><div><span>Selected Warranty</span><b>{selectedWarranty}</b></div></div>}{tab === 'delivery' && <div className="pdp-tab-body"><h2>Delivery & Return Information</h2><p>{deliveryText}. Delivery fee is calculated during checkout. Products are packed securely and checked before dispatch.</p></div>}{tab === 'reviews' && <div className="pdp-review-grid"><Review name="Verified Buyer" text="Good packaging, fast delivery and product matched the description."/><Review name="BJ Customer" text="Clear warranty information and responsive support."/></div>}{tab === 'faq' && <div className="pdp-faq"><FAQ q="Is this product official?" a="Yes, BJ ELECTRONICS lists products with official warranty information where available."/><FAQ q="Can I buy with cash on delivery?" a="Yes, COD is supported along with bKash, Nagad and card labels."/><FAQ q="Can I return the item?" a="Return and replacement are handled under store and brand policy."/></div>}</section>

      <section className="pdp-related"><h2>Related Products</h2><div className="pdp-related-grid">{related.map((item) => <a key={item.id} href={`/product/${item.slug}`} className="card"><div>{item.image}</div><b>{item.name}</b><span>{money(item.price)}</span></a>)}</div></section>
      <div className="pdp-mobile-action"><div><b>{money(finalPrice)}</b><span>{isOutOfStock ? 'Out of stock' : 'Ready to order'}</span></div><button type="button" onClick={() => addToCart(true)} disabled={isOutOfStock}>Buy Now</button></div>
    </main>
  );
}

function OptionGroup({ title, values, selected, setSelected }: OptionGroupProps) { return <div><h3>{title}</h3><div>{unique(values).map((value) => <button type="button" key={value} className={selected === value ? 'active' : ''} onClick={() => setSelected(value)}>{value}</button>)}</div></div>; }
function Meta({ title, value }: { title: string; value: string }) { return <div><span>{title}</span><b>{value}</b></div>; }
function Offer({ title, text }: { title: string; text: string }) { return <div><b>{title}</b><span>{text}</span></div>; }
function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div>{icon}<b>{title}</b><span>{text}</span></div>; }
function Review({ name, text }: { name: string; text: string }) { return <div className="pdp-review"><b>{name}</b><p>{text}</p><span>★★★★★</span></div>; }
function FAQ({ q, a }: { q: string; a: string }) { return <details><summary><HelpCircle size={16}/>{q}</summary><p>{a}</p></details>; }
