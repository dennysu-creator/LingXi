// ═══════════════════════════════════════
// 認證狀態管理（Zustand）
// 登入 / 註冊 / Apple Sign-In / Token 管理
// ═══════════════════════════════════════

import { create } from 'zustand';
import { api, setTokens, clearTokens, getToken } from '@/services/api-client';
import type { PlanType } from '@/stores/user-store';

// ─── 用戶型別 ───

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  planType: PlanType;
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
  isNewUser?: boolean;
}

interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  planType: PlanType;
}

// ─── Store 型別 ───

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<{ isNewUser?: boolean }>;
  register: (email: string, password: string, name: string) => Promise<{ isNewUser?: boolean }>;
  loginWithApple: (identityToken: string) => Promise<{ isNewUser?: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updatePlan: (planType: PlanType) => void;
  clearError: () => void;
}

// ─── Store 實現 ───

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password }, { noAuth: true });

      await setTokens(data.accessToken, data.refreshToken);

      set({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null,
      });

      return { isNewUser: data.isNewUser };
    } catch (err: any) {
      const message = err?.message || '登入失敗';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = await api.post<AuthResponse>('/auth/register', { email, password, name }, { noAuth: true });

      await setTokens(data.accessToken, data.refreshToken);

      set({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null,
      });

      return { isNewUser: true };
    } catch (err: any) {
      const message = err?.message || '註冊失敗';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  loginWithApple: async (identityToken: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = await api.post<AuthResponse>('/auth/apple', { identityToken }, { noAuth: true });

      await setTokens(data.accessToken, data.refreshToken);

      set({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null,
      });

      return { isNewUser: data.isNewUser };
    } catch (err: any) {
      const message = err?.message || 'Apple 登入失敗';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      // 嘗試通知後端登出（忽略錯誤）
      await api.post('/auth/logout').catch(() => {});
    } finally {
      await clearTokens();
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const token = await getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return false;
    }

    set({ isLoading: true });

    try {
      const profile = await api.get<ProfileResponse>('/api/user/profile');

      set({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          planType: profile.planType,
        },
        error: null,
      });

      return true;
    } catch {
      // Token 無效或過期 → 清除認證狀態
      await clearTokens();
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      return false;
    }
  },

  updatePlan: (planType: PlanType) => {
    const { user } = get();
    if (!user) return;

    set({
      user: { ...user, planType },
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
