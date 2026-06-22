import { seedState } from './demo-data';
export const isSupabaseConfigured = false;
export async function seedIfNeeded() {}
export async function loadState() { return seedState(); }
export async function saveEntity(table, item) { return item; }
export async function deleteEntity() {}
export async function createOrder(order) { return order; }
export async function saveSettings(settings) { return settings; }
export function getSession() { return true; }
export function login() { return true; }
export function logout() {}
export function localCart() { return []; }
export function setLocalCart() {}
export function localWishlist() { return []; }
export function setLocalWishlist() {}
