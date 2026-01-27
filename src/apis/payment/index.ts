import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import {
  PostConfirmPaymentRequest,
  PostConfirmPaymentResponse,
  PostCreatePaymentOrderRequest,
  PostCreatePaymentOrderResponse,
} from '@/models/payment';

export const postCreatePaymentOrder = async (data: PostCreatePaymentOrderRequest) => {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post<PostCreatePaymentOrderResponse>('/api/payments/orders', data, {
    headers,
  });
  return response.data;
};

export const postConfirmPayment = async (data: PostConfirmPaymentRequest) => {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post<PostConfirmPaymentResponse>('/api/payments/confirm', data, {
    headers,
  });
  return response.data;
};
