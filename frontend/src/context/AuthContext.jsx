import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, getCurrentUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if a token exists and is still valid by
  // calling /api/auth/me. This restores the session on refresh.
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getCurrentUser();
        setUser(data.user);
      } catch {
        // Token invalid/expired — axiosInstance already cleared it.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (username, email, password) => {
    const { data } = await signupUser(username, email, password);
    return data;
  };

  const refreshUser = async () => {
  try {
    const { data } = await getCurrentUser();
    setUser(data.user);
  } catch {
    // If this fails, the existing session-expiry handling
    // (interceptor clearing the token) will take over naturally
    // on the next authenticated request.
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, loading, login, signup, logout ,refreshUser};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};