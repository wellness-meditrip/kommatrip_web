import { bffApi } from '@/apis/config';
import {
  PostConfirmPaymentRequest,
  PostConfirmPaymentResponse,
  PostCreatePaymentOrderRequest,
  PostCreatePaymentOrderResponse,
  PostValidatePromotionRequest,
  PostValidatePromotionResponse,
} from '@/models/payment';

export const postValidatePromotion = async (data: PostValidatePromotionRequest) => {
  return await bffApi.post<PostValidatePromotionResponse>(
    '/api/payments/promotions/validate',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

export const postCreatePaymentOrder = async (data: PostCreatePaymentOrderRequest) => {
  return await bffApi.post<PostCreatePaymentOrderResponse>('/api/payments/orders', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const postConfirmPayment = async (data: PostConfirmPaymentRequest) => {
  return await bffApi.post<PostConfirmPaymentResponse>('/api/payments/confirm', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
