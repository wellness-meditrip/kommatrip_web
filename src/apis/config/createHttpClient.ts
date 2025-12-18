import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ERROR_CODES } from '@/constants/error-codes';
import { useAuthStore } from '@/store/auth';

type Role = 'admin' | 'user';
interface Props {
  baseURL: string;
  role: Role;
}

export const createHttpClient = ({ baseURL, role }: Props) => {
  const axiosInstance = axios.create({ baseURL, timeout: 5000, withCredentials: true });
  const api: HttpClient = axiosInstance;

  api.interceptors.request.use((config) => {
    // zustand store에서 accessToken 가져오기
    const token = useAuthStore.getState().accessToken;
    console.log('[HttpClient] Request interceptor', {
      url: config.url,
      hasToken: !!token,
      tokenLength: token?.length,
    });
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response: AxiosResponse) => response.data?.response,
    async (error) => {
      const originalRequest = error.config;

      // 에러 응답 구조 확인
      const daengleError = error.response?.data?.error;

      // 498 Unauthorized + TOKEN_EXPIRED 에러 발생 시 토큰 재발급
      const isUnauthorized = error.response?.status === 498;
      const isTokenExpired = daengleError?.code === ERROR_CODES.TOKEN_EXPIRED;

      if (isUnauthorized && isTokenExpired) {
        // 이미 재시도한 요청이면 무한 루프 방지
        if (originalRequest._retry) {
          console.error('[HttpClient] Token refresh already attempted - clearing auth');
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        console.log('[HttpClient] 401 + TOKEN_EXPIRED - refreshing token...');
        originalRequest._retry = true;

        try {
          const newAccessToken = await getNewAccessToken({ role });
          console.log('[HttpClient] New accessToken received', {
            hasToken: !!newAccessToken,
            tokenLength: newAccessToken.length,
          });
          useAuthStore.getState().setAccessToken(newAccessToken);
          console.log('[HttpClient] New accessToken stored in zustand store');

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (err) {
          console.error('[HttpClient] Token refresh failed in interceptor:', err);
          useAuthStore.getState().clearAuth();
          return Promise.reject(err);
        }
      }

      // 다른 에러 처리
      if (daengleError && daengleError.code) {
        if (daengleError.code === 1001) {
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        if (daengleError.code === ERROR_CODES.NO_USER_EXIST) {
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  const getNewAccessToken = async ({ role }: { role: Role }): Promise<string> => {
    try {
      console.log('[HttpClient] getNewAccessToken called', { role });
      // refreshToken은 쿠키에서 자동으로 전송됨 (withCredentials: true)
      const response = await axios.post<
        { accessToken: string } | { tokens: { access_token: string } }
      >(
        '/token/reissue',
        {},
        {
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          withCredentials: true,
        }
      );

      console.log('[HttpClient] Token reissue response received', {
        hasData: !!response.data,
        responseKeys: Object.keys(response.data || {}),
      });

      // 응답 구조에 따라 accessToken 추출
      type TokenReissueResponse = { accessToken: string } | { tokens: { access_token: string } };
      const data = response.data as TokenReissueResponse;
      const accessToken = 'accessToken' in data ? data.accessToken : data.tokens?.access_token;

      if (!accessToken) {
        console.error('[HttpClient] No access token in response', response.data);
        throw new Error('No access token in response');
      }

      console.log('[HttpClient] AccessToken extracted', {
        hasToken: !!accessToken,
        tokenLength: accessToken.length,
      });

      // zustand store에 저장
      useAuthStore.getState().setAccessToken(accessToken);
      console.log('[HttpClient] AccessToken stored in zustand store');
      return accessToken;
    } catch (error) {
      console.error('[HttpClient] getNewAccessToken error:', error);
      throw error;
    }
  };

  return { api };
};

export interface HttpClient extends AxiosInstance {
  get<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}
