// ═══════════════════════════════════════
// API Client — Cloud Run 後端串接
// 取代 firebaseConfig.ts
// ═══════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://lingxi-api-XXXXX.run.app';

const TOKEN_KEY = 'lingxi_jwt_token';
const REFRESH_KEY = 'lingxi_refresh_token';

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
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, noAuth = false, timeout = 15000, retries = 2 } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

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
