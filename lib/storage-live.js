export const isSupabaseConfigured = false;
export async function seedIfNeeded() {}
export async function loadState() { return { products: [], categories: [], orders: [], customers: [], promotions: [], settings: {}, wishlist: [], cart: [] }; }
export async function saveEntity(table, item) { return item; }
export async function deleteEntity() {}
export async function createOrder(order) { return order; }
export async function saveSettings(settings) { return settings; }
export function getSession() { return false; }
export function login() { return false; }
export function logout() {}
export function localCart() { return []; }
export function setLocalCart() {}
export function localWishlist() { return []; }
export function setLocalWishlist() {}
