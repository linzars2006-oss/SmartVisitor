import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setUser({
              _id: res.data._id,
              name: res.data.name,
              email: res.data.email,
              phone: res.data.phone,
              role: res.data.role,
            });
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
        };
        setUser(userData);
        return userData;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (name, email, phone, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password, role });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
        };
        setUser(userData);
        return userData;
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (name, phone, password) => {
    try {
      const res = await api.put('/auth/profile', { name, phone, password });
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
        };
        setUser(userData);
        return userData;
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
