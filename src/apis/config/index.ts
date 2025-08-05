import axios, { AxiosResponse } from 'axios';
import { createHttpClient, HttpClient } from './createHttpClient';

export const { api } = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  role: 'user',
});

export const guestApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  timeout: 5000,
});

guestApi.interceptors.response.use(
  // (response: AxiosResponse) => response.data?.response,
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error)
);
