import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ERROR_CODES } from '@/constants/error-codes';
import { useAuthStore } from '@/store/auth';
import { deleteCookie, getCookie } from '@/utils/cookie';
import { waitForAuthReady } from '@/utils/auth-refresh';
import { normalizeError } from '@/utils/error-handler';
import { PostTokenReissueResponse } from '@/models/auth';
import { AUTH_COOKIE_KEYS } from '@/constants';

type Role = 'admin' | 'user';
interface Props {
  baseURL: string;
  role: Role;
}

export const createHttpClient = ({ baseURL }: Props) => {
  const axiosInstance = axios.create({ baseURL, timeout: 5000, withCredentials: true });
  const api: HttpClient = axiosInstance;
  let refreshInFlight: Promise<string> | null = null;
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string | null, error?: unknown) => void> = [];

  const subscribeTokenRefresh = (callback: (token: string | null, error?: unknown) => void) => {
    refreshSubscribers.push(callback);
  };

  const notifyRefreshSuccess = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
  };

  const notifyRefreshFailure = (error: unknown) => {
    refreshSubscribers.forEach((callback) => callback(null, error));
    refreshSubscribers = [];
  };

  const clearRefreshCookieState = () => {
    deleteCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
    void axios
      .post('/api/auth/logout', {}, { withCredentials: true })
      .catch((err) => console.error('[HttpClient] failed to clear refresh cookies', err));
  };

  const getNewAccessToken = async (): Promise<string> => {
    try {
      // refreshToken은 쿠키에서 자동으로 전송됨 (withCredentials: true)
      const response = await axios.post<PostTokenReissueResponse>('/api/users/token/reissue', {});
      const accessToken = response.data.tokens.access_token;

      if (!accessToken) {
        console.error('[HttpClient] No access token in response', response.data);
        throw new Error('No access token in response');
      }

      // zustand store에 저장
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[HttpClient] getNewAccessToken error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('[HttpClient] getNewAccessToken error:', error);
      }
      throw error;
    }
  };

  const refreshAccessToken = async (): Promise<string> => {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = getNewAccessToken().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  };

  api.interceptors.request.use(async (config) => {
    // zustand store에서 accessToken 가져오기
    const token = useAuthStore.getState().accessToken;
    const headers = config.headers ?? {};
    const authHeader =
      typeof (headers as { get?: (key: string) => string | null }).get === 'function'
        ? (headers as { get: (key: string) => string | null }).get('Authorization')
        : (headers as { Authorization?: string; authorization?: string }).Authorization ||
          (headers as { Authorization?: string; authorization?: string }).authorization;
    const hasRefreshToken = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
    if (!token && !authHeader && hasRefreshToken) {
      try {
        await waitForAuthReady();
      } catch (err) {
        console.error('[HttpClient] Waiting for auth refresh failed', err);
      }
    }

    const effectiveToken = useAuthStore.getState().accessToken;
    if (effectiveToken) {
      const baseHeaders =
        typeof (config.headers as { toJSON?: () => Record<string, string> }).toJSON === 'function'
          ? (config.headers as { toJSON: () => Record<string, string> }).toJSON()
          : (config.headers as Record<string, string> | undefined);
      const mergedHeaders = { ...(baseHeaders ?? {}), Authorization: `Bearer ${effectiveToken}` };
      config.headers = AxiosHeaders.from(mergedHeaders);
    }
    return config;
  });

  api.interceptors.response.use(
    (response: AxiosResponse) => response.data?.response ?? response.data,
    async (error) => {
      const originalRequest = error.config;

      // 에러 응답 구조 확인 (백엔드가 detail만 줄 수도 있음)
      const responseData = error.response?.data;
      const onyuError = responseData?.error;
      const backendDetail = responseData?.detail;
      const backendMessageField = responseData?.message;
      const backendMessage = onyuError?.message ?? backendDetail ?? backendMessageField;

      // 498(토큰 만료) 또는 TOKEN_EXPIRED 코드면 재발급 시도
      const statusCode = error.response?.status;
      const isTokenExpiredStatus = statusCode === 498;
      const isTokenExpiredCode = onyuError?.code === ERROR_CODES.TOKEN_EXPIRED;
      const isTokenExpiredMessage = backendMessage === '토큰이 만료되었습니다.';
      const isInvalidTokenMessage = backendMessage === '유효하지 않은 토큰입니다.';
      const isNotAuthenticatedMessage = backendMessage === 'Not authenticated';
      const hasRefreshToken = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
      const shouldRefresh =
        isTokenExpiredStatus ||
        isTokenExpiredCode ||
        isTokenExpiredMessage ||
        (statusCode === 400 && isNotAuthenticatedMessage && hasRefreshToken) ||
        (statusCode === 401 && isInvalidTokenMessage && hasRefreshToken) ||
        (statusCode === 403 && isNotAuthenticatedMessage && hasRefreshToken);

      if (shouldRefresh) {
        // 이미 재시도한 요청이면 무한 루프 방지
        if (originalRequest._retry) {
          console.error('[HttpClient] Token refresh already attempted - clearing auth');
          useAuthStore.getState().clearAuth();
          clearRefreshCookieState();
          return Promise.reject(normalizeError(error));
        }

        originalRequest._retry = true;
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token, refreshError) => {
            if (refreshError || !token) {
              return reject(normalizeError(refreshError ?? error));
            }

            const retryHeaders =
              typeof (originalRequest.headers as { toJSON?: () => Record<string, string> })
                .toJSON === 'function'
                ? (originalRequest.headers as { toJSON: () => Record<string, string> }).toJSON()
                : (originalRequest.headers as Record<string, string> | undefined);
            const mergedHeaders = {
              ...(retryHeaders ?? {}),
              Authorization: `Bearer ${token}`,
            };
            originalRequest.headers = AxiosHeaders.from(mergedHeaders);
            resolve(api(originalRequest));
          });

          if (!isRefreshing) {
            isRefreshing = true;
            refreshAccessToken()
              .then((newAccessToken) => {
                useAuthStore.getState().setAccessToken(newAccessToken);
                notifyRefreshSuccess(newAccessToken);
              })
              .catch((err) => {
                console.error('[HttpClient] Token refresh failed in interceptor:', err);
                useAuthStore.getState().clearAuth();
                clearRefreshCookieState();
                notifyRefreshFailure(normalizeError(err));
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
        });
      }

      // 다른 에러 처리
      if (statusCode === 401) {
        const isInvalidTokenMessage = backendMessage === '유효하지 않은 토큰입니다.';
        const isMissingUserMessage = backendMessage === '사용자 정보를 확인할 수 없습니다.';
        if (isInvalidTokenMessage || isMissingUserMessage) {
          useAuthStore.getState().clearAuth();
          clearRefreshCookieState();
          return Promise.reject(normalizeError(error));
        }
      }

      if (onyuError && onyuError.code) {
        if (onyuError.code === 1001) {
          useAuthStore.getState().clearAuth();
          clearRefreshCookieState();
          return Promise.reject(normalizeError(error));
        }

        if (onyuError.code === ERROR_CODES.NO_USER_EXIST) {
          useAuthStore.getState().clearAuth();
          clearRefreshCookieState();
          return Promise.reject(normalizeError(error));
        }
      }

      return Promise.reject(normalizeError(error));
    }
  );

  return { api };
};

export interface HttpClient extends AxiosInstance {
  get<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}
