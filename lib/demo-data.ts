import type { AppState, Category, Customer, Order, Product, Promotion, StoreSettings } from './types';

const now = () => new Date().toISOString();
export const money = (n: number) => `৳ ${Math.round(n).toLocaleString('en-BD')}`;
export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
export const orderNo = () => `BJ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;

export const seedCategories: Category[] = [
  { id: 'cat_smartphones', name: 'Smartphones', slug: 'smartphones', icon: '📱', description: 'Latest Android and iOS smartphones.', active: true, sort_order: 1 },
  { id: 'cat_laptops', name: 'Laptops & Desktops', slug: 'laptops-desktops', icon: '💻', description: 'Work, gaming and student computers.', active: true, sort_order: 2 },
  { id: 'cat_audio', name: 'Audio', slug: 'audio', icon: '🎧', description: 'Earbuds, headphones and speakers.', active: true, sort_order: 3 },
  { id: 'cat_wearables', name: 'Wearables', slug: 'wearables', icon: '⌚', description: 'Smartwatches and fitness bands.', active: true, sort_order: 4 },
  { id: 'cat_accessories', name: 'Accessories', slug: 'accessories', icon: '🔌', description: 'Chargers, cables and power accessories.', active: true, sort_order: 5 },
  { id: 'cat_home', name: 'Home Appliances', slug: 'home-appliances', icon: '🏠', description: 'Smart home and home gadgets.', active: true, sort_order: 6 },
  { id: 'cat_tv', name: 'TV & Display', slug: 'tv-display', icon: '📺', description: 'Televisions and monitors.', active: true, sort_order: 7 },
  { id: 'cat_gaming', name: 'Gaming', slug: 'gaming', icon: '🎮', description: 'Gaming accessories and gadgets.', active: true, sort_order: 8 },
  { id: 'cat_camera', name: 'Cameras', slug: 'cameras', icon: '📷', description: 'Cameras and accessories.', active: true, sort_order: 9 },
  { id: 'cat_network', name: 'Network & IT', slug: 'network-it', icon: '📡', description: 'Routers, switches and IT accessories.', active: true, sort_order: 10 }
];

const product = (p: Partial<Product> & Pick<Product, 'id'|'sku'|'name'|'slug'|'category_slug'|'brand'|'price'|'compare_at_price'|'stock'|'image'>): Product => ({
  description: 'Premium electronics product with official warranty, fast delivery across Bangladesh, and secure checkout support.',
  specs: { Warranty: 'Official warranty', Delivery: 'Across Bangladesh', Payment: 'COD / bKash / Nagad / Card' },
  discount_percent: Math.max(0, Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)),
  low_stock_threshold: 10,
  rating: 4.6,
  review_count: 156,
  featured: true,
  flash_deal: true,
  active: true,
  created_at: now(),
  updated_at: now(),
  ...p
});

export const seedProducts: Product[] = [
  product({ id: 'prod_a55', sku: 'BJ-SAM-A55-128', name: 'Samsung Galaxy A55 5G', slug: 'samsung-galaxy-a55-5g', category_slug: 'smartphones', brand: 'Samsung', price: 38999, compare_at_price: 47499, stock: 38, image: '📱', review_count: 256, specs: { Storage: '8GB / 128GB', Display: 'Super AMOLED', Warranty: 'Official' } }),
  product({ id: 'prod_hp15', sku: 'BJ-HP-PAV15-I5', name: 'HP Pavilion 15 Core i5', slug: 'hp-pavilion-15-core-i5', category_slug: 'laptops-desktops', brand: 'HP', price: 69900, compare_at_price: 81990, stock: 14, image: '💻', review_count: 189, specs: { CPU: 'Intel Core i5', RAM: '8GB', SSD: '512GB' } }),
  product({ id: 'prod_haylou', sku: 'BJ-HAY-X1-PRO', name: 'Haylou X1 Pro Earbuds', slug: 'haylou-x1-pro-earbuds', category_slug: 'audio', brand: 'Haylou', price: 1399, compare_at_price: 1999, stock: 92, image: '🎧', review_count: 342 }),
  product({ id: 'prod_mibro', sku: 'BJ-MIBRO-LITE2', name: 'Mibro Watch Lite 2', slug: 'mibro-watch-lite-2', category_slug: 'wearables', brand: 'Mibro', price: 3299, compare_at_price: 4399, stock: 27, image: '⌚', review_count: 128 }),
  product({ id: 'prod_baseus', sku: 'BJ-BAS-PB-10K', name: 'Baseus 10000mAh Power Bank', slug: 'baseus-10000mah-power-bank', category_slug: 'accessories', brand: 'Baseus', price: 1599, compare_at_price: 1999, stock: 58, image: '🔋', review_count: 211 }),
  product({ id: 'prod_anker', sku: 'BJ-ANK-R50I', name: 'Anker Soundcore R50i', slug: 'anker-soundcore-r50i', category_slug: 'audio', brand: 'Anker', price: 2799, compare_at_price: 3599, stock: 44, image: '🔊', review_count: 153 }),
  product({ id: 'prod_tv', sku: 'BJ-TV-55UHD', name: '55 Inch 4K Smart TV', slug: '55-inch-4k-smart-tv', category_slug: 'tv-display', brand: 'Vision', price: 52900, compare_at_price: 59900, stock: 11, image: '📺', review_count: 87, featured: false }),
  product({ id: 'prod_router', sku: 'BJ-TP-AX1800', name: 'AX1800 Dual Band Router', slug: 'ax1800-dual-band-router', category_slug: 'network-it', brand: 'TP-Link', price: 3990, compare_at_price: 4990, stock: 7, image: '📡', review_count: 64, featured: false })
];

export const seedSettings: StoreSettings = {
  store_name: 'BJ ELECTRONICS', logo_text: 'BJ ELECTRONICS', hotline: '09612-345678', delivery_location: 'Delivering to Dhaka 1205', hero_eyebrow: 'NEW ARRIVAL', hero_title: 'Upgrade Your Digital Life', hero_subtitle: 'Discover the latest electronics with best prices in Bangladesh.', footer_credit: 'All rights Reserved@2026. Build & Developed By SAR INDUSTRIES NETWORK.', bank_offer_text: 'Up to 10% Instant Discount on Select Bank Cards', emi_offer_text: 'EMI Starting from BDT 1,167/month with 0% Interest up to 12 Months', currency: 'BDT', active_theme: 'light', updated_at: now()
};

export const seedPromotions: Promotion[] = [
  { id: 'promo_bank', title: 'BANK OFFER', subtitle: 'Up to 10% Instant Discount', type: 'bank', discount_value: 10, active: true, starts_at: now(), ends_at: '2026-12-31T23:59:59Z' },
  { id: 'promo_emi', title: 'EASY EMI', subtitle: '0% Interest up to 12 Months', type: 'emi', discount_value: 0, active: true, starts_at: now(), ends_at: '2026-12-31T23:59:59Z' }
];

export const seedCustomers: Customer[] = [
  { id: 'cust_rafiq', name: 'Rafiqul Islam', phone: '01710000001', email: 'rafiq@example.com', address: 'Dhanmondi, Dhaka', total_orders: 2, total_spent: 12590, last_order_at: now(), created_at: now() },
  { id: 'cust_nusrat', name: 'Nusrat Jahan', phone: '01810000002', email: 'nusrat@example.com', address: 'Uttara, Dhaka', total_orders: 1, total_spent: 8990, last_order_at: now(), created_at: now() }
];

export const seedOrders: Order[] = [
  { id: 'ord_demo1', order_number: 'BJ-2026-12563', customer_name: 'Rafiqul Islam', phone: '01710000001', email: 'rafiq@example.com', division: 'Dhaka', district: 'Dhaka', area: 'Dhanmondi', address: 'Road 12, Dhanmondi', delivery_zone: 'inside_dhaka', payment_method: 'bKash', payment_status: 'Paid', order_status: 'Delivered', items: [{ productId: 'prod_haylou', name: 'Haylou X1 Pro Earbuds', price: 1399, quantity: 2, total: 2798 }], subtotal: 2798, shipping_fee: 80, discount: 0, total: 2878, created_at: now(), updated_at: now() },
  { id: 'ord_demo2', order_number: 'BJ-2026-12562', customer_name: 'Nusrat Jahan', phone: '01810000002', email: 'nusrat@example.com', division: 'Dhaka', district: 'Dhaka', area: 'Uttara', address: 'Sector 7, Uttara', delivery_zone: 'inside_dhaka', payment_method: 'COD', payment_status: 'Pending', order_status: 'Processing', items: [{ productId: 'prod_baseus', name: 'Baseus 10000mAh Power Bank', price: 1599, quantity: 1, total: 1599 }], subtotal: 1599, shipping_fee: 80, discount: 0, total: 1679, created_at: now(), updated_at: now() }
];

export const seedState = (): AppState => ({ products: seedProducts, categories: seedCategories, orders: seedOrders, customers: seedCustomers, promotions: seedPromotions, settings: seedSettings, wishlist: [], cart: [] });
