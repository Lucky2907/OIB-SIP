import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext login called with:', email); // Debug log
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response); // Debug log
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      // Don't show toast here, let the page handle it
      return response.data;
    } catch (error) {
      console.error('AuthContext login error:', error); // Debug log
      // Don't show toast here either, let the page handle it
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
