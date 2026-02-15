const TOKEN_KEY = 'auth_token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const parseJwtPayload = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const payload = parseJwtPayload();
  return payload?.role || payload?.user_role || null;
};
