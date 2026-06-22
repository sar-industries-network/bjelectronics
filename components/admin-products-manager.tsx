'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, CheckCircle2, Eye, Filter, ImagePlus, LayoutDashboard, ListFilter, Package, PackagePlus, Pencil, Plus, RefreshCcw, Save, Search, Settings, Sparkles, Star, Trash2, UploadCloud, Video } from 'lucide-react';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

type ProductRecord = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_slug: string | null;
  brand: string | null;
  description: string | null;
  image: string | null;
  price: number;
  compare_at_price: number;
  discount_percent: number;
  stock: number;
  low_stock_threshold: number;
  rating: number;
  review_count: number;
  featured: boolean;
  flash_deal: boolean;
  active: boolean;
  specs: Record<string, unknown> | null;
  updated_at?: string;
  created_at?: string;
};

type CategoryRecord = { id: string; name: string; slug: string; icon?: string | null; active?: boolean };
type ViewMode = 'table' | 'cards';
type SortKey = 'updated' | 'name' | 'price-high' | 'price-low' | 'stock-low';

type ProductForm = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category_slug: string;
  description: string;
  image: string;
  gallery: string;
  video: string;
  price: string;
  compare_at_price: string;
  discount_percent: string;
  stock: string;
  low_stock_threshold: string;
  rating: string;
  review_count: string;
  featured: boolean;
  flash_deal: boolean;
  active: boolean;
  specs: string;
};

const emptyForm: ProductForm = {
  id: '',
  sku: '',
  name: '',
  slug: '',
  brand: '',
  category_slug: '',
  description: '',
  image: '',
  gallery: '',
  video: '',
  price: '0',
  compare_at_price: '0',
  discount_percent: '0',
  stock: '0',
  low_stock_threshold: '5',
  rating: '4.5',
  review_count: '0',
  featured: false,
  flash_deal: false,
  active: true,
  specs: '{\n  "Warranty": "Official warranty",\n  "Condition": "Brand new"\n}',
};

function uid(prefix = 'prd') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function numberValue(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function galleryFromSpecs(specs: Record<string, unknown> | null) {
  const value = specs?.gallery;
  return Array.isArray(value) ? value.join('\n') : '';
}

function videoFromSpecs(specs: Record<string, unknown> | null) {
  const value = specs?.video;
  return typeof value === 'string' ? value : '';
}

function formFromProduct(product: ProductRecord): ProductForm {
  return {
    id: product.id,
    sku: product.sku || '',
    name: product.name || '',
    slug: product.slug || '',
    brand: product.brand || '',
    category_slug: product.category_slug || '',
    description: product.description || '',
    image: product.image || '',
    gallery: galleryFromSpecs(product.specs),
    video: videoFromSpecs(product.specs),
    price: String(product.price || 0),
    compare_at_price: String(product.compare_at_price || 0),
    discount_percent: String(product.discount_percent || 0),
    stock: String(product.stock || 0),
    low_stock_threshold: String(product.low_stock_threshold || 5),
    rating: String(product.rating || 0),
    review_count: String(product.review_count || 0),
    featured: Boolean(product.featured),
    flash_deal: Boolean(product.flash_deal),
    active: Boolean(product.active),
    specs: JSON.stringify(product.specs || { Warranty: 'Official warranty', Condition: 'Brand new' }, null, 2),
  };
}

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`;
}

export function AdminProductsManager() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [selected, setSelected] = useState<ProductRecord | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [view, setView] = useState<ViewMode>('table');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    if (!supabaseClientConfigured) {
      setError('Supabase environment variables are missing.');
      return;
    }
    const [productResult, categoryResult] = await Promise.all([
      supabase.from('products').select('*').order('updated_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug,icon,active').order('sort_order', { ascending: true }),
    ]);
    if (productResult.error) setError(productResult.error.message);
    else setProducts((productResult.data || []) as ProductRecord[]);
    if (!categoryResult.error) setCategories((categoryResult.data || []) as CategoryRecord[]);
  };

  useEffect(() => {
    load();
    if (!supabaseClientConfigured) return;
    const channel = supabase
      .channel('admin-products-manager-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const low = products.filter((p) => Number(p.stock || 0) <= Number(p.low_stock_threshold || 0)).length;
    const value = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0);
    return { total, active, low, value };
  }, [products]);

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    const list = products.filter((p) => {
      const matchText = !text || `${p.name} ${p.sku} ${p.brand} ${p.slug}`.toLowerCase().includes(text);
      const matchCategory = category === 'all' || p.category_slug === category;
      const matchStatus = status === 'all' || (status === 'active' ? p.active : !p.active) || (status === 'low' && Number(p.stock || 0) <= Number(p.low_stock_threshold || 0));
      return matchText && matchCategory && matchStatus;
    });
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      if (sort === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (sort === 'stock-low') return Number(a.stock || 0) - Number(b.stock || 0);
      return String(b.updated_at || '').localeCompare(String(a.updated_at || ''));
    });
  }, [products, query, category, status, sort]);

  const startNew = () => {
    setSelected(null);
    setForm({ ...emptyForm, id: uid(), sku: `BJE-${Date.now().toString().slice(-6)}` });
    setNotice('Creating a new product draft.');
  };

  const editProduct = (product: ProductRecord) => {
    setSelected(product);
    setForm(formFromProduct(product));
    setNotice(`Editing ${product.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [key]: value, slug: key === 'name' && !selected ? slugify(String(value)) : current.slug }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      let specs: Record<string, unknown> = {};
      try {
        specs = JSON.parse(form.specs || '{}');
      } catch {
        throw new Error('Specs must be valid JSON.');
      }
      const gallery = form.gallery.split('\n').map((item) => item.trim()).filter(Boolean);
      if (gallery.length) specs.gallery = gallery;
      if (form.video.trim()) specs.video = form.video.trim();

      const payload = {
        id: form.id || uid(),
        sku: form.sku || `BJE-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        slug: form.slug || slugify(form.name),
        brand: form.brand || null,
        category_slug: form.category_slug || null,
        description: form.description || null,
        image: form.image || '📦',
        price: numberValue(form.price),
        compare_at_price: numberValue(form.compare_at_price),
        discount_percent: numberValue(form.discount_percent),
        stock: Math.max(0, Math.trunc(numberValue(form.stock))),
        low_stock_threshold: Math.max(0, Math.trunc(numberValue(form.low_stock_threshold, 5))),
        rating: numberValue(form.rating, 4.5),
        review_count: Math.max(0, Math.trunc(numberValue(form.review_count))),
        featured: form.featured,
        flash_deal: form.flash_deal,
        active: form.active,
        specs,
        updated_at: new Date().toISOString(),
      };
      if (!payload.name) throw new Error('Product name is required.');
      if (!payload.slug) throw new Error('Product slug is required.');
      const result = await supabase.from('products').upsert(payload).select('*').single();
      if (result.error) throw result.error;
      setNotice('Product saved and synced live.');
      setSelected(result.data as ProductRecord);
      setForm(formFromProduct(result.data as ProductRecord));
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (product: ProductRecord) => {
    const ok = window.confirm(`Delete ${product.name}?`);
    if (!ok) return;
    setBusy(true);
    const result = await supabase.from('products').delete().eq('id', product.id);
    setBusy(false);
    if (result.error) setError(result.error.message);
    else {
      setNotice('Product deleted.');
      if (selected?.id === product.id) {
        setSelected(null);
        setForm(emptyForm);
      }
      await load();
    }
  };

  return (
    <main className="admin-products-page min-h-screen bg-slate-50 text-slate-950 dark:bg-[#07111f] dark:text-white">
      <aside className="admin-products-sidebar">
        <a href="/admin" className="admin-brand"><span>🛒</span><b>BJ Admin</b></a>
        <nav>
          <a href="/admin"><LayoutDashboard size={18} /> Overview</a>
          <a href="/admin/products" className="active"><Package size={18} /> Products</a>
          <a href="/admin/orders"><Boxes size={18} /> Orders</a>
          <a href="/admin/inventory"><ListFilter size={18} /> Inventory</a>
          <a href="/admin/settings"><Settings size={18} /> Settings</a>
        </nav>
        <div className="admin-sidebar-card">
          <Sparkles size={18} />
          <b>SAR INDUSTRIES NETWORK</b>
          <p>Advanced product operations, live sync and inventory control.</p>
        </div>
      </aside>

      <section className="admin-products-main">
        <header className="admin-products-hero">
          <div>
            <span className="admin-eyebrow"><CheckCircle2 size={16} /> Live Supabase Management</span>
            <h1>Professional Product Management</h1>
            <p>Manage product data, media placeholders, gallery URLs, video links, stock, pricing, flags and live storefront sync.</p>
          </div>
          <div className="admin-hero-actions">
            <button className="btn-soft" onClick={load}><RefreshCcw size={16} /> Refresh</button>
            <button className="btn" onClick={startNew}><PackagePlus size={17} /> New Product</button>
          </div>
        </header>

        <section className="admin-product-stats">
          <StatCard icon={<Package />} label="Total Products" value={stats.total} />
          <StatCard icon={<CheckCircle2 />} label="Active Products" value={stats.active} />
          <StatCard icon={<Filter />} label="Low Stock" value={stats.low} tone="red" />
          <StatCard icon={<BarChart3 />} label="Inventory Value" value={money(stats.value)} />
        </section>

        {notice && <div className="admin-notice ok">{notice}</div>}
        {error && <div className="admin-notice bad">{error}</div>}

        <section className="admin-products-grid-layout">
          <form className="admin-product-form card" onSubmit={save}>
            <div className="form-head">
              <div><span className="admin-eyebrow"><Plus size={15} /> Product Editor</span><h2>{selected ? 'Edit product' : 'Create product'}</h2></div>
              <button className="btn" disabled={busy}><Save size={16} /> {busy ? 'Saving...' : 'Save Live'}</button>
            </div>

            <div className="media-zone">
              <div className="media-placeholder main"><ImagePlus size={28} /><b>Main Image</b><span>{form.image || 'Emoji, URL or image path placeholder'}</span></div>
              <div className="media-placeholder"><UploadCloud size={24} /><b>Gallery</b><span>{form.gallery ? `${form.gallery.split('\n').filter(Boolean).length} item(s)` : 'Multiple image URLs'}</span></div>
              <div className="media-placeholder"><Video size={24} /><b>Video</b><span>{form.video || 'YouTube / file URL placeholder'}</span></div>
            </div>

            <div className="form-grid">
              <Field label="Product Name"><input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Samsung Galaxy S24 Ultra" /></Field>
              <Field label="SKU"><input value={form.sku} onChange={(e) => updateForm('sku', e.target.value)} placeholder="BJE-000001" /></Field>
              <Field label="Slug"><input value={form.slug} onChange={(e) => updateForm('slug', slugify(e.target.value))} placeholder="product-slug" /></Field>
              <Field label="Brand"><input value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} placeholder="Samsung" /></Field>
              <Field label="Category"><select value={form.category_slug} onChange={(e) => updateForm('category_slug', e.target.value)}><option value="">Select category</option>{categories.map((c) => <option value={c.slug} key={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Main image / icon"><input value={form.image} onChange={(e) => updateForm('image', e.target.value)} placeholder="📱 or /products/image.png" /></Field>
              <Field label="Price"><input type="number" value={form.price} onChange={(e) => updateForm('price', e.target.value)} /></Field>
              <Field label="Compare price"><input type="number" value={form.compare_at_price} onChange={(e) => updateForm('compare_at_price', e.target.value)} /></Field>
              <Field label="Discount %"><input type="number" value={form.discount_percent} onChange={(e) => updateForm('discount_percent', e.target.value)} /></Field>
              <Field label="Stock"><input type="number" value={form.stock} onChange={(e) => updateForm('stock', e.target.value)} /></Field>
              <Field label="Low stock alert"><input type="number" value={form.low_stock_threshold} onChange={(e) => updateForm('low_stock_threshold', e.target.value)} /></Field>
              <Field label="Rating"><input type="number" step="0.1" value={form.rating} onChange={(e) => updateForm('rating', e.target.value)} /></Field>
            </div>

            <Field label="Description"><textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Write product description..." rows={4} /></Field>
            <Field label="Gallery attachments"><textarea value={form.gallery} onChange={(e) => updateForm('gallery', e.target.value)} placeholder="One image URL/path per line" rows={4} /></Field>
            <Field label="Video attachment"><input value={form.video} onChange={(e) => updateForm('video', e.target.value)} placeholder="Video URL placeholder" /></Field>
            <Field label="Specs JSON"><textarea value={form.specs} onChange={(e) => updateForm('specs', e.target.value)} rows={6} /></Field>

            <div className="flag-row">
              <label><input type="checkbox" checked={form.active} onChange={(e) => updateForm('active', e.target.checked)} /> Active</label>
              <label><input type="checkbox" checked={form.featured} onChange={(e) => updateForm('featured', e.target.checked)} /> Featured</label>
              <label><input type="checkbox" checked={form.flash_deal} onChange={(e) => updateForm('flash_deal', e.target.checked)} /> Flash Deal</label>
            </div>
          </form>

          <section className="admin-products-panel card">
            <div className="panel-toolbar">
              <div className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product, SKU, brand..." /></div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
              <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="low">Low stock</option></select>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}><option value="updated">Latest update</option><option value="name">Name A-Z</option><option value="price-high">Price high</option><option value="price-low">Price low</option><option value="stock-low">Stock low</option></select>
              <div className="view-toggle"><button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} type="button">Table</button><button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')} type="button">Cards</button></div>
            </div>

            {view === 'table' ? <ProductTable products={filtered} onEdit={editProduct} onDelete={removeProduct} /> : <ProductCards products={filtered} onEdit={editProduct} onDelete={removeProduct} />}
          </section>
        </section>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: 'red' }) {
  return <div className={`admin-stat ${tone === 'red' ? 'danger' : ''}`}><span>{icon}</span><small>{label}</small><b>{value}</b></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function ProductTable({ products, onEdit, onDelete }: { products: ProductRecord[]; onEdit: (p: ProductRecord) => void; onDelete: (p: ProductRecord) => void }) {
  return <div className="product-table-wrap"><table className="admin-product-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><div className="product-mini"><span>{p.image || '📦'}</span><div><b>{p.name}</b><small>{p.sku} · {p.brand || 'No brand'}</small></div></div></td><td>{p.category_slug || 'Uncategorized'}</td><td><b>{money(p.price)}</b><small>{p.compare_at_price ? money(p.compare_at_price) : ''}</small></td><td><span className={p.stock <= p.low_stock_threshold ? 'stock-bad' : 'stock-ok'}>{p.stock}</span></td><td><span className={p.active ? 'status-on' : 'status-off'}>{p.active ? 'Active' : 'Inactive'}</span></td><td><div className="row-actions"><button onClick={() => onEdit(p)}><Pencil size={15} /></button><a href={`/product/${p.slug}`} target="_blank"><Eye size={15} /></a><button onClick={() => onDelete(p)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{!products.length && <div className="empty-panel">No products match your filters.</div>}</div>;
}

function ProductCards({ products, onEdit, onDelete }: { products: ProductRecord[]; onEdit: (p: ProductRecord) => void; onDelete: (p: ProductRecord) => void }) {
  return <div className="admin-product-card-grid">{products.map((p) => <article key={p.id} className="admin-product-card"><div className="product-card-media">{p.image || '📦'}</div><div><span className={p.active ? 'status-on' : 'status-off'}>{p.active ? 'Active' : 'Inactive'}</span><h3>{p.name}</h3><p>{p.brand || 'No brand'} · {p.category_slug || 'Uncategorized'}</p><b>{money(p.price)}</b><small>Stock {p.stock} · Rating <Star size={12} /> {p.rating}</small></div><div className="row-actions"><button onClick={() => onEdit(p)}><Pencil size={15} /></button><a href={`/product/${p.slug}`} target="_blank"><Eye size={15} /></a><button onClick={() => onDelete(p)}><Trash2 size={15} /></button></div></article>)}{!products.length && <div className="empty-panel">No product cards to show.</div>}</div>;
}
