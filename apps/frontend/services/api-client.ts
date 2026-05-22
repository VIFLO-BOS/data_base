/**
 * API Client
 * Central Axios instance for all frontend ↔ backend communication.
 * Handles base URL, auth headers, token refresh, and error normalization.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Detect network-level or server-level errors that are NOT auth failures.
 * These should never trigger a logout — they mean the server is unreachable,
 * not that the user's token is invalid.
 */
export function isNetworkOrServerError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  // No response at all → network timeout, DNS failure, server down
  if (!error.response) return true;
  // Server errors (5xx) → backend/database crashed, not an auth issue
  if (error.response.status >= 500) return true;
  // Axios timeout
  if (error.code === 'ECONNABORTED') return true;
  return false;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Token helpers ────────────────────────────────────────────────
function shouldRemember(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('remember_me') === 'true';
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string) {
  if (shouldRemember()) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  } else {
    // Session only — cleared when browser/tab is closed
    sessionStorage.setItem('access_token', access);
    sessionStorage.setItem('refresh_token', refresh);
    // Make sure no stale persistent tokens exist
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  localStorage.removeItem('remember_me');
}

// ─── Request interceptor: attach Bearer token ─────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 + token refresh ─────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/me'); // <-- exclude /auth/me from retry to avoid double-logout

    // Only attempt refresh on 401, not on auth-related endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        setTokens(data.data.accessToken, data.data.refreshToken);
        processQueue(null, data.data.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Only force-logout if the refresh itself got a 401 (token truly invalid).
        // If it's a network/server error, keep the user logged in.
        if (!isNetworkOrServerError(refreshError)) {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:logout'));
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Extract a user-friendly error message from an Axios error.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Network-level errors: no response from server
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your connection and try again.';
      }
      return 'Unable to reach the server. Please check your internet connection.';
    }
    // Server errors
    if (error.response.status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }
    const data = error.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.message) return error.message;
  }
  return 'An unexpected error occurred';
}
