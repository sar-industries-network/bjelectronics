export type Category = { id: string; name: string; slug: string; icon: string; description: string; active: boolean; sort_order: number };
export type Product = {
  id: string; sku: string; name: string; slug: string; category_slug: string; brand: string; description: string; specs: Record<string, string>;
  image: string; price: number; compare_at_price: number; discount_percent: number; stock: number; low_stock_threshold: number;
  rating: number; review_count: number; featured: boolean; flash_deal: boolean; active: boolean; created_at: string; updated_at: string;
};
export type CartItem = { productId: string; quantity: number };
export type OrderItem = { productId: string; name: string; price: number; quantity: number; total: number };
export type Order = {
  id: string; order_number: string; customer_name: string; phone: string; email: string; division: string; district: string; area: string; address: string;
  delivery_zone: 'inside_dhaka' | 'outside_dhaka'; payment_method: 'COD' | 'bKash' | 'Nagad' | 'Card'; payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded'; order_status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[]; subtotal: number; shipping_fee: number; discount: number; total: number; notes?: string; created_at: string; updated_at: string;
};
export type Customer = { id: string; name: string; phone: string; email: string; address: string; total_orders: number; total_spent: number; last_order_at?: string; created_at: string };
export type Promotion = { id: string; title: string; subtitle: string; type: string; discount_value: number; active: boolean; starts_at: string; ends_at: string; target_category?: string };
export type StoreSettings = {
  store_name: string; logo_text: string; hotline: string; delivery_location: string; hero_eyebrow: string; hero_title: string; hero_subtitle: string; footer_credit: string; bank_offer_text: string; emi_offer_text: string; currency: string; active_theme: 'light' | 'dark'; updated_at: string;
};
export type AppState = { products: Product[]; categories: Category[]; orders: Order[]; customers: Customer[]; promotions: Promotion[]; settings: StoreSettings; wishlist: string[]; cart: CartItem[] };
