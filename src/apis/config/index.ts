import axios, { AxiosResponse } from 'axios';
import { createHttpClient, HttpClient } from './createHttpClient';
import { normalizeError } from '@/utils/error-handler';

export const { api } = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  role: 'user',
});

// export const api: HttpClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
// });

export const guestApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  timeout: 5000,
  withCredentials: false, // allow_credentials: false인 API들(회원가입, 로그인, 이메일 인증, 비밀번호 재설정)에 사용
});

guestApi.interceptors.response.use(
  // (response: AxiosResponse) => response.data?.response,
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(normalizeError(error))
);
