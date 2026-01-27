import { useMutation } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { postConfirmPayment, postCreatePaymentOrder } from '@/apis/payment';
import {
  PostConfirmPaymentRequest,
  PostConfirmPaymentResponse,
  PostCreatePaymentOrderRequest,
  PostCreatePaymentOrderResponse,
} from '@/models/payment';

export const usePostCreatePaymentOrderMutation = () => {
  return useMutation<PostCreatePaymentOrderResponse, Error, PostCreatePaymentOrderRequest>({
    mutationKey: QUERY_KEYS.POST_PAYMENT_ORDER,
    mutationFn: postCreatePaymentOrder,
  });
};

export const usePostConfirmPaymentMutation = () => {
  return useMutation<PostConfirmPaymentResponse, Error, PostConfirmPaymentRequest>({
    mutationKey: QUERY_KEYS.POST_PAYMENT_VALIDATE,
    mutationFn: postConfirmPayment,
  });
};
