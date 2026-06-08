import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Sync token with local storage and axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchMe();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to authenticate session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setToken(res.data.access_token);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check credentials.';
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      // Auto login after registration
      const loginRes = await login(userData.email, userData.password);
      return loginRes;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Email might be in use.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchMe, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
