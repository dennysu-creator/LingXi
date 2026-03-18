// ═══════════════════════════════════════
// 認證狀態管理（Zustand）
// 登入 / 註冊 / Apple Sign-In / Token 管理
// ═══════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiError, setTokens, clearTokens, getToken } from '@/services/api-client';
import type { PlanType } from '@/stores/user-store';
import { useUserStore } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
import { useChatStore } from '@/stores/chat-store';

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
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  calendarType?: 'solar' | 'lunar';
  gender?: 'male' | 'female';
  destinyData?: Record<string, unknown> | null;
  planType: PlanType;
}

function syncProfileToLocalStores(profile: ProfileResponse) {
  useUserStore.getState().syncProfile({
    name: profile.name,
    birthYear: profile.birthYear,
    birthMonth: profile.birthMonth,
    birthDay: profile.birthDay,
    birthHour: profile.birthHour,
    calendarType: profile.calendarType,
    gender: profile.gender,
    planType: profile.planType,
    destinyData: profile.destinyData,
  });

  const petStore = usePetStore.getState();
  if (!petStore.petId && profile.birthMonth > 0 && profile.birthDay > 0) {
    petStore.initPet(profile.birthMonth, profile.birthDay);
  }
}

function resetLocalStores() {
  useUserStore.getState().resetState();
  usePetStore.getState().resetState();
  useChatStore.getState().resetState();
}

// ─── Store 型別 ───

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<{ isNewUser?: boolean }>;
  register: (email: string, password: string, name: string, birthData?: { birthYear: number; birthMonth: number; birthDay: number }) => Promise<{ isNewUser?: boolean }>;
  loginWithApple: (identityToken: string) => Promise<{ isNewUser?: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updatePlan: (planType: PlanType) => void;
  clearError: () => void;
}

// ─── Store 實現 ───

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password }, { noAuth: true });

      await setTokens(data.accessToken, data.refreshToken);
      let nextUser = data.user;
      try {
        const profile = await api.get<ProfileResponse>('/user/profile');
        syncProfileToLocalStores(profile);
        nextUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          planType: profile.planType,
        };
      } catch {
        useUserStore.getState().setPremium(data.user.planType);
      }

      set({
        isAuthenticated: true,
        isLoading: false,
        user: nextUser,
        error: null,
      });

      return { isNewUser: data.isNewUser };
    } catch (err: any) {
      const message = err?.message || '登入失敗';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (email: string, password: string, name: string, birthData?: { birthYear: number; birthMonth: number; birthDay: number }) => {
    set({ isLoading: true, error: null });

    try {
      const data = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        name,
        birthYear: birthData?.birthYear ?? 2000,
        birthMonth: birthData?.birthMonth ?? 1,
        birthDay: birthData?.birthDay ?? 1,
      }, { noAuth: true });

      await setTokens(data.accessToken, data.refreshToken);
      useUserStore.getState().setPremium(data.user.planType);

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
      if (!data.isNewUser) {
        try {
          const profile = await api.get<ProfileResponse>('/user/profile');
          syncProfileToLocalStores(profile);
          data.user = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            planType: profile.planType,
          };
        } catch {
          useUserStore.getState().setPremium(data.user.planType);
        }
      } else {
        useUserStore.getState().setPremium(data.user.planType);
      }

      set({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null,
      });

      return { isNewUser: data.isNewUser };
    } catch (err: any) {
      let message = err?.message || 'Apple 登入失敗';
      // Expo Go 的 Bundle ID 與正式版不同，Apple Sign-In 會失敗
      if (message.includes('audience') || message.includes('jwt')) {
        message = 'Apple 登入在 Expo Go 中不可用，請使用 Email 登入，或使用開發版本測試';
      }
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
      resetLocalStores();
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
      resetLocalStores();
      set({ isAuthenticated: false, user: null, isLoading: false });
      return false;
    }

    set({ isLoading: true });

    try {
      const profile = await api.get<ProfileResponse>('/user/profile');
      syncProfileToLocalStores(profile);

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
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        set({
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }

      // Token 無效或過期 → 清除認證狀態
      await clearTokens();
      resetLocalStores();
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
    useUserStore.getState().setPremium(planType);
    if (!user) return;

    set({
      user: { ...user, planType },
    });
  },

  clearError: () => {
    set({ error: null });
  },
}),
    {
      name: 'lingxi-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
);
