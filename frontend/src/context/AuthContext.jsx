import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('club_token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('club_token');
    return t ? parseJwt(t) : null;
  });

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('club_token', newToken);
    setToken(newToken);
    setUser(userData || parseJwt(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('club_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
