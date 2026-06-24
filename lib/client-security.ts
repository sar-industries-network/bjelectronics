const TOKEN_KEY = 'bj_csrf_token';
const LIMIT_PREFIX = 'bj_rate_limit:';

export function getCsrfToken() {
  if (typeof window === 'undefined') return 'server-render';
  let token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    token = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function validateClientSubmission(scope: string) {
  if (typeof window === 'undefined') return true;
  const token = getCsrfToken();
  const sameOrigin = !document.referrer || new URL(document.referrer).origin === window.location.origin;
  if (!token || token.length < 32) throw new Error(`${scope} security token is invalid.`);
  if (!sameOrigin) throw new Error(`${scope} blocked because the referring origin is not trusted.`);
  return true;
}

export function rateLimitClient(key: string, limit: number, windowMs: number) {
  if (typeof window === 'undefined') return true;
  const now = Date.now();
  const storageKey = `${LIMIT_PREFIX}${key}`;
  const history = JSON.parse(localStorage.getItem(storageKey) || '[]') as number[];
  const active = history.filter((stamp) => now - stamp < windowMs);
  if (active.length >= limit) return false;
  active.push(now);
  localStorage.setItem(storageKey, JSON.stringify(active));
  return true;
}

export const SECURITY_LIMITS = {
  adminSignin: { limit: 5, windowMs: 15 * 60 * 1000 },
  checkout: { limit: 6, windowMs: 10 * 60 * 1000 },
  support: { limit: 4, windowMs: 10 * 60 * 1000 },
  featureRequest: { limit: 3, windowMs: 20 * 60 * 1000 },
};
