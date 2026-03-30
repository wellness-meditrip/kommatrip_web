import axios, { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { AdminAuthTokens } from '@/models';
import { useAdminAuthStore } from '@/store/admin-auth';
import { applyAdminAuthSession, clearClientAdminAuthSession } from '@/utils/admin-auth-session';
import { normalizeError } from '@/utils/error-handler';

type AdminRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const ADMIN_AUTH_LOGIN_PATH = '/api/admin/auth/login';
const ADMIN_AUTH_REGISTER_PATH = '/api/admin/auth/register';
const ADMIN_AUTH_REISSUE_PATH = '/api/admin/auth/token/reissue';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractDataEnvelope = (payload: unknown): unknown => {
  if (!isRecord(payload)) return payload;
  if (typeof payload.data !== 'undefined') return payload.data;
  return payload;
};

const extractAdminTokens = (payload: unknown): AdminAuthTokens | null => {
  const source = extractDataEnvelope(payload);
  if (!isRecord(source)) return null;
  const tokens = isRecord(source.tokens) ? source.tokens : null;
  if (!tokens) return null;
  if (typeof tokens.access_token !== 'string') return null;
  const tokenType = tokens.token_type === 'bearer' ? 'bearer' : 'Bearer';

  return {
    access_token: tokens.access_token,
    ...(typeof tokens.refresh_token === 'string' ? { refresh_token: tokens.refresh_token } : {}),
    token_type: tokenType,
  };
};

const shouldSkipRefresh = (config?: Partial<AdminRequestConfig>) => {
  const url = config?.url ?? '';
  return (
    url.includes(ADMIN_AUTH_LOGIN_PATH) ||
    url.includes(ADMIN_AUTH_REGISTER_PATH) ||
    url.includes(ADMIN_AUTH_REISSUE_PATH)
  );
};

export const adminApi = axios.create({
  baseURL: '',
  timeout: 10000,
  withCredentials: true,
});

let refreshInFlight: Promise<string> | null = null;

const requestAdminAccessToken = async () => {
  const response = await axios.post(ADMIN_AUTH_REISSUE_PATH, undefined, {
    withCredentials: true,
  });
  const tokens = extractAdminTokens(response.data);

  if (!tokens?.access_token) {
    throw new Error('Missing admin access token');
  }

  const didApplySession = applyAdminAuthSession(extractDataEnvelope(response.data));
  if (!didApplySession) {
    throw new Error('Missing admin session payload during token refresh');
  }
  return tokens.access_token;
};

const refreshAdminAccessToken = async () => {
  if (!refreshInFlight) {
    refreshInFlight = requestAdminAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
};

adminApi.interceptors.request.use((config) => {
  const accessToken = useAdminAuthStore.getState().accessToken;
  if (!accessToken) return config;

  const baseHeaders =
    typeof config.headers?.toJSON === 'function'
      ? config.headers.toJSON()
      : (config.headers as Record<string, string> | undefined);

  config.headers = AxiosHeaders.from({
    ...(baseHeaders ?? {}),
    Authorization: `Bearer ${accessToken}`,
  });

  return config;
});

adminApi.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    const originalRequest = error.config as AdminRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 498 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest)
    ) {
      originalRequest._retry = true;

      try {
        const nextAccessToken = await refreshAdminAccessToken();
        const baseHeaders =
          typeof originalRequest.headers?.toJSON === 'function'
            ? originalRequest.headers.toJSON()
            : (originalRequest.headers as Record<string, string> | undefined);

        originalRequest.headers = AxiosHeaders.from({
          ...(baseHeaders ?? {}),
          Authorization: `Bearer ${nextAccessToken}`,
        });

        return adminApi(originalRequest);
      } catch (refreshError) {
        await clearClientAdminAuthSession();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    if (status === 401 || status === 403) {
      await clearClientAdminAuthSession();
    }

    return Promise.reject(normalizeError(error));
  }
);
