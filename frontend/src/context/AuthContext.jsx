import { createContext, useContext, useMemo, useState } from 'react';
import { getToken, removeToken, setToken } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken());

  const login = (nextToken) => {
    setToken(nextToken);
    setTokenState(nextToken);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
};
