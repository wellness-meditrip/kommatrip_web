import type { AvailabilityOption, LanguagePreference } from '@/models/reservation';

export interface PaymentOrder {
  order_id: string;
  amount: number;
  original_amount?: number;
  currency: string;
  program_id: number;
}

export interface PostCreatePaymentOrderRequest {
  programId: number;
  currency: 'KRW' | 'USD';
  promotionCode?: string;
}

export interface PostCreatePaymentOrderResponse {
  message: string;
  order: PaymentOrder;
}

export interface PostValidatePromotionRequest {
  program_id: number;
  promotion_code: string;
  currency: 'KRW' | 'USD';
}

export interface PostValidatePromotionResponse {
  original_price: number;
  final_price: number;
  currency: 'KRW' | 'USD';
}

export interface ReservationDataForPaymentConfirm {
  program_id: number;
  preferred_contact: string;
  language_preference: LanguagePreference;
  availability_options: AvailabilityOption[];
  inquiries?: string;
  contact_line?: string;
  contact_whatsapp?: string;
  contact_kakao?: string;
  contact_phone?: string;
}

export interface PostConfirmPaymentRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
  programId: number;
  promotionCode?: string;
  reservationData: ReservationDataForPaymentConfirm;
}

export interface PostConfirmPaymentResponse {
  success?: boolean;
  status?: number;
  error_code?: string;
  message: string;
  payment_status?: string;
  payment?: {
    id?: number;
    order_id?: string;
    payment_key?: string;
    amount?: number;
    currency?: string;
    status?: string;
    reservation_id?: number;
  };
  reservation?: {
    id?: number;
    reservation_code?: string;
    program_id?: number;
    status?: string;
  };
}
