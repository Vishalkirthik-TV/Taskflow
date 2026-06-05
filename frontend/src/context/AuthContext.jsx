import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const setAuthData = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await getMe();
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [logout]);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    setAuthData(data.data.user, data.data.token);
    return data;
  };

  const register = async (userData) => {
    const { data } = await registerApi(userData);
    setAuthData(data.data.user, data.data.token);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
