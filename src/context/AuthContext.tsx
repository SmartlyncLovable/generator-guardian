import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
//import { User } from '../lib';
import type { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8009/api';

const TOKEN_KEY = 'auth_token';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getAuthHeaders = () => {
  const token = getStoredToken();

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};


// Helper to extract user from Laravel's APIResponse shape:
// { status, message, data: { ... } } or fallback { user: { ... } }
const extractUser = (data: any) => data?.data ?? data?.user ?? null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------
   * Restore session on page refresh
   * --------------------------------------------- */
  useEffect(() => {
    const checkSession = async () => {
      const token = getStoredToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          clearStoredToken();
          setUser(null);
          return;
        }

        const data = await res.json();
        const sessionUser = extractUser(data);

        if (sessionUser) {
          setUser(sessionUser);
        } else {
          clearStoredToken();
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /* ---------------------------------------------
   * LOGIN
   * --------------------------------------------- */
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Handle error status codes explicitly
      switch (res.status) {
        case 401:
          return { success: false, error: 'Invalid email or password.' };
        case 403:
          return { success: false, error: data.message || 'Your account has been suspended. Please contact support.' };
        case 422:
          return { success: false, error: data.message || 'Please check your input and try again.' };
        case 500:
          return { success: false, error: 'A server error occurred. Please try again later.' };
      }

      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed. Please try again.' };
      }

      if (data.status === 'success') {
        const token = data?.data?.access_token;

        if (!token) {
          return {
            success: false,
            error: 'Login succeeded but no access token was returned.',
          };
        }

        setStoredToken(token);

        const sessionUser = extractUser(data);
        setUser(sessionUser);

        return { success: true };
      }

      return { success: false, error: data.message || 'Login failed.' };

    } catch {
      return { success: false, error: 'Unable to reach the server. Check your connection.' };
    }
  };

  /* ---------------------------------------------
   * REGISTER
   * --------------------------------------------- */
  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setUser(extractUser(data));
        return { success: true };
      }

      return {
        success: false,
        error: data.message || data.error || 'Registration failed.',
      };
    } catch {
      return { success: false, error: 'Unable to reach the server. Check your connection.' };
    }
  };

  /* ---------------------------------------------
   * LOGOUT
   * --------------------------------------------- */
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Logout failed silently — clear user regardless
    } finally {
      clearStoredToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------------------------------------
 * Hook
 * --------------------------------------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}