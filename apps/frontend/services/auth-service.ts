/**
 * Auth Service
 * Handles authentication API calls: login, register, refresh, getMe.
 * Uses the central apiClient for all requests.
 */
import { apiClient, setTokens, clearTokens, getErrorMessage, getRefreshToken } from './api-client';

// ─── Types ────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  roles: string[];
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface OAuthLoginPayload {
  accessToken: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// ─── Service ──────────────────────────────────────────────────────

/**
 * Login with email and password.
 * Stores tokens in localStorage on success.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ data: AuthResponse }>('/auth/login', payload);
  setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data;
}

/**
 * Register a new account.
 * Stores tokens in localStorage on success.
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<{
    data: {
      success: boolean;
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }
  }>('/auth/register', payload);
  setTokens(data.data.accessToken, data.data.refreshToken);
  return {
    user: data.data.user,
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
  };
}

/**
 * OAuth Login or Register
 */
export async function oauthLogin(payload: OAuthLoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ data: AuthResponse }>('/auth/oauth-login', payload);
  setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data;
}

/**
 * Refresh the access token using the stored refresh token.
 */
export async function refreshToken(
  token: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken: token });
  setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data;
}

/**
 * Get the currently authenticated user's profile.
 */
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
}

/**
 * Logout: clear tokens from storage.
 */
export async function logout() {
  const token = getRefreshToken();
  try { if (token) await apiClient.post('/auth/logout', { refreshToken: token }); }
  finally { clearTokens(); }
}

export { getErrorMessage };
