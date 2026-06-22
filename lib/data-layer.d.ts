import type { AppState, CartItem, Customer, Order, StoreSettings } from './types';

type Table = keyof Pick<AppState, 'products' | 'categories' | 'orders' | 'customers' | 'promotions'>;
export const isSupabaseConfigured: boolean;
export function seedIfNeeded(): Promise<void>;
export function loadState(): Promise<AppState>;
export function saveEntity<T extends { id: string }>(table: Table, item: T): Promise<T>;
export function deleteEntity(table: Table, id: string): Promise<void>;
export function createOrder(order: Order): Promise<Order>;
export function saveSettings(settings: StoreSettings): Promise<StoreSettings>;
export function getSession(): boolean;
export function login(email: string, password: string): boolean;
export function logout(): void;
export function localCart(): CartItem[];
export function setLocalCart(cart: CartItem[]): void;
export function localWishlist(): string[];
export function setLocalWishlist(wishlist: string[]): void;
