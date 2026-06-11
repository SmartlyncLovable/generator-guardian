// src/lib/api.ts

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'Admin' | 'User' | 'admin' | 'user' | string;

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export interface LoginResponseData {
  id: number;
  name: string;
  role: UserRole;
  access_token: string;
  session_token: string;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | string;
  msg?: string;
  message?: string;
  data?: T;
  errors?: unknown;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  access_token?: string;
  session_token?: string;
  error?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8009/api';

const TOKEN_KEY = 'auth_token';

// ============================================================================
// TOKEN HELPERS
// ============================================================================

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const getAuthHeaders = (): HeadersInit => {
  const token = authStorage.getToken();

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================================================
// API IMPLEMENTATION
// ============================================================================

export const api = {
  // ---------- AUTH ----------

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<LoginResponseData> = await response.json();

      if (!response.ok || result.status !== 'success' || !result.data) {
        return {
          success: false,
          error: result.msg || result.message || 'Login failed.',
        };
      }

      const { id, name, role, access_token, session_token } = result.data;

      const user: User = {
        id,
        name,
        role,
      };

      authStorage.setToken(access_token);

      return {
        success: true,
        user,
        access_token,
        session_token,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to reach the server. Check your connection.',
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        authStorage.clearToken();
        return null;
      }

      const result = await response.json();

      const user = result?.user ?? result?.data?.user ?? null;

      if (!user) {
        authStorage.clearToken();
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        role: user.role ?? 'User',
      };
    } catch {
      authStorage.clearToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      authStorage.clearToken();
    }
  },
};