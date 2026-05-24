import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Default API URL (Dynamic relative fallback for Monolith, with custom live path for Android APK compatibility)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // If running inside native Android App (Capacitor WebView), window.location.origin is a local file schema, so use the hosted Render server
  if (
    window.location.origin.includes('file://') || 
    (window.location.origin.includes('localhost') && !window.location.origin.includes('5000') && !window.location.origin.includes('5173'))
  ) {
    // Replace with your actual live Render Web Service URL once created
    return 'https://premium-study-platform.onrender.com/api'; 
  }
  
  // Local web dev server fallback
  if (window.location.origin.includes('localhost:5173')) {
    return 'http://localhost:5000/api';
  }
  
  // Otherwise, if running in production browser monolith, dynamically resolve relative path
  return window.location.origin + '/api';
};

export const API_URL = getApiUrl();
export const SERVER_URL = API_URL.replace('/api', '');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Apply default authorization header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const loadUser = async (authToken) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data && response.data.success) {
        setUser(response.data.user);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Session validation failed:', error.message);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data && response.data.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed, check credentials';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, mobile, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, mobile, password });
      if (response.data && response.data.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    clearAuth();
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data && response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user profile data:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isPremium: user?.premium === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
