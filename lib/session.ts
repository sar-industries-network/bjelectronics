export const getSessionUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('session_user');
  return raw ? JSON.parse(raw) : null;
};

export const setSessionUser = (user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('session_user', JSON.stringify(user));
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session_user');
};

export const isAdminUser = () => {
  const u = getSessionUser();
  return u?.email?.includes('admin');
};
