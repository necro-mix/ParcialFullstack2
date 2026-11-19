const ACCESS_TOKEN_KEY = 'apiAccessToken';
const REFRESH_TOKEN_KEY = 'apiRefreshToken';
const SESSION_KEY = 'sesionActiva';

function emitCustomEvent(name) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(name));
  }
}

export function canViewRole(viewerRole, targetRole) {
  if (viewerRole === 'admin') return true;
  const roleRank = { usuario: 1, moderador: 2, admin: 3 };
  return Boolean(roleRank[viewerRole] && roleRank[targetRole] && roleRank[viewerRole] >= roleRank[targetRole]);
}

export function getSession() {
  if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return null;
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function getUserByEmail(correo) {
  const normalizedEmail = String(correo || '').trim().toLowerCase();
  const session = getSession();
  return session && String(session.correo || '').trim().toLowerCase() === normalizedEmail
    ? session
    : undefined;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  emitCustomEvent('sessionchange');
}
