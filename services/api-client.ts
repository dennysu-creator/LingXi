// ═══════════════════════════════════════
// API Client — Cloud Run 後端串接
// 取代 firebaseConfig.ts
// ═══════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getDeviceIdAsync, getPlatformTag } from '@/hooks/useDeviceId';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://lingxi-api-440150253440.asia-east1.run.app';


const TOKEN_KEY = 'lingxi_jwt_token';
const REFRESH_KEY = 'lingxi_refresh_token';

// ─── Device headers for attestation / analytics ──────────────
async function getDeviceHeaders(): Promise<Record<string, string>> {
  try {
    if (Platform.OS === 'web') return {};
    const deviceId = await getDeviceIdAsync();
    return {
      'X-Device-Key': deviceId,
      'X-Device-Platform': getPlatformTag(),
    };
  } catch {
    return {};
  }
}

// ─── Idempotency key for AI calls ────────────────────────────
let _cryptoMod: typeof import('expo-crypto') | null = null;
function generateIdempotencyKey(): string {
  try {
    if (!_cryptoMod) _cryptoMod = require('expo-crypto');
    if (_cryptoMod?.randomUUID) return _cryptoMod.randomUUID();
  } catch {
    // Fall through to timestamp-based key.
  }
  const rand = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `${Date.now()}-${rand}`.slice(0, 64);
}

// ─── Token 管理 ───

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export async function setTokens(token: string, refreshToken?: string): Promise<void> {
  cachedToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export async function clearTokens(): Promise<void> {
  cachedToken = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

// ─── API 錯誤型別 ───

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ─── Token Refresh ───

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

// ─── 通用 API 呼叫 ───

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  noAuth?: boolean;
  timeout?: number;
  retries?: number;
  /** Enable idempotency header for safely retryable mutations (AI calls). */
  idempotent?: boolean;
  /** Reuse an explicit key across retries (caller-provided). */
  idempotencyKey?: string;
}

// Track idempotency key across retries for a single logical request.
export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, noAuth = false, timeout = 15000, retries = 2, idempotent = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Device headers (best-effort, never block).
  Object.assign(requestHeaders, await getDeviceHeaders());

  // Idempotency for AI/write calls — preserved across retries.
  if (idempotent) {
    const key = options.idempotencyKey || generateIdempotencyKey();
    options.idempotencyKey = key; // pin for any retry
    requestHeaders['X-Idempotency-Key'] = key;
  }

  if (!noAuth) {
    let token = await getToken();
    if (!token) {
      throw new ApiError('未登入', 401, 'UNAUTHORIZED');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Token 過期 → 嘗試刷新
    if (res.status === 401 && !noAuth) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
        const retryRes = await fetch(`${API_BASE}${path}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: retryController.signal,
        });
        clearTimeout(retryTimeoutId);
        if (!retryRes.ok) {
          const errData = await retryRes.json().catch(() => ({}));
          throw new ApiError(errData.error || errData.message || '請求失敗', retryRes.status, errData.code);
        }
        return retryRes.json();
      }
      throw new ApiError('登入已過期，請重新登入', 401, 'TOKEN_EXPIRED');
    }

    // 5xx server error — retry (handles Cloud Run cold starts)
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return apiRequest<T>(path, { ...options, retries: retries - 1 });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(errData.error || errData.message || '請求失敗', res.status, errData.code);
    }

    // 204 No Content
    if (res.status === 204) return {} as T;

    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('請求逾時', 408, 'TIMEOUT');
    }
    // 網路錯誤重試
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return apiRequest<T>(path, { ...options, retries: retries - 1 });
    }
    throw new ApiError('網路連線失敗', 0, 'NETWORK_ERROR');
  }
}

// ─── 便捷方法 ───

export const api = {
  get: <T = any>(path: string, opts?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),

  post: <T = any>(path: string, body?: any, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),

  put: <T = any>(path: string, body?: any, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),

  delete: <T = any>(path: string, opts?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};

export default api;
