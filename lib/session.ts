export type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

export const getSessionUser = (): SessionUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('session_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const setSessionUser = (user: SessionUser): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('session_user', JSON.stringify(user));
};

export const clearSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session_user');
};

export const isAdminUser = (): boolean => {
  const u = getSessionUser();
  return Boolean(u?.email?.includes('admin'));
};
