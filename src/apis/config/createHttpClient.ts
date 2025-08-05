import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ERROR_CODES } from '@/constants/error-codes';

type Role = 'user' | 'groomer' | 'vet';

interface Props {
  baseURL: string;
  role: Role;
}

export const createHttpClient = ({ baseURL, role }: Props) => {
  const axiosInstance = axios.create({ baseURL, timeout: 5000, withCredentials: true });
  const api: HttpClient = axiosInstance;

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response: AxiosResponse) => response.data?.response,
    async (error) => {
      const originalRequest = error.config;

      const daengleError = error.response.data.error;

      // if (daengleError.code === ERROR_CODES.FORBIDDEN) {
      //   window.location.href = '/login';
      //   return Promise.reject(error);
      // }

      if (daengleError.code === 1001) {
        localStorage.clear();
        return Promise.reject(error);
      }

      if (daengleError.code === ERROR_CODES.NO_USER_EXIST) {
        localStorage.clear();
        return Promise.reject(error);
      }

      if (daengleError.code === ERROR_CODES.TOKEN_EXPIRED) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await getNewAccessToken({ role });
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.clear();
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  const getNewAccessToken = async ({ role }: { role: Role }): Promise<string> => {
    try {
      const response = await axios.post<{ accessToken: string }>(
        `/${role}/refresh-token`,
        {},
        {
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          withCredentials: true,
        }
      );

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } catch (error) {
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
