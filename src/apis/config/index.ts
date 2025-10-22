import axios, { AxiosResponse } from 'axios';
import { createHttpClient, HttpClient } from './createHttpClient';

// export const { api } = createHttpClient({
//   baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
//   role: 'user',
// });

export const { api: reviewApi } = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_REVIEW_API_URL ?? '',
  role: 'user',
});

export const guestReservationApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RESERVATION_API_URL ?? '',
  timeout: 30000, // 30초로 증가
});

guestReservationApi.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error)
);

export const api: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
});

export const guestApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
});

export const guestHospitalApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOSPITAL_API_URL ?? '',
});

export const guestReviewApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REVIEW_API_URL ?? '',
});

export const programApi: HttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
});

guestApi.interceptors.response.use(
  // (response: AxiosResponse) => response.data?.response,
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error)
);

guestHospitalApi.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error)
);

guestReviewApi.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error)
);
