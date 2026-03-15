import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getBackendBaseUrl } from '@/server/config/backend-url';

const DEFAULT_TIMEOUT_MS = 10000;

export const requestBackend = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const { headers, ...restConfig } = config;

  return axios.request<T>({
    baseURL: getBackendBaseUrl(),
    timeout: DEFAULT_TIMEOUT_MS,
    ...restConfig,
    headers: {
      Accept: 'application/json',
      ...(headers ?? {}),
    },
  });
};

export const postBackend = async <T = unknown>(
  path: string,
  body?: unknown,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
) =>
  requestBackend<T>({
    ...(config ?? {}),
    method: 'POST',
    url: path,
    data: body,
  });

export const resolveBackendPayload = <T = unknown>(data: unknown): T => {
  if (data && typeof data === 'object' && 'response' in data) {
    return (data as { response: T }).response;
  }
  return data as T;
};
