import { api } from '@/apis/config';
import {
  PostConfirmPaymentRequest,
  PostConfirmPaymentResponse,
  PostCreatePaymentOrderRequest,
  PostCreatePaymentOrderResponse,
} from '@/models/payment';

export const postCreatePaymentOrder = async (data: PostCreatePaymentOrderRequest) => {
  return await api.post<PostCreatePaymentOrderResponse>('/api/payments/orders', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const postConfirmPayment = async (data: PostConfirmPaymentRequest) => {
  return await api.post<PostConfirmPaymentResponse>('/api/payments/confirm', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
