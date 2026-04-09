export type PaymentMethod = 'onSite' | 'payNowKrw' | 'payNowUsd';

// TODO: 현장 결제 재오픈 시 true로 복구하고 기본 결제 수단도 함께 재검토
export const PAY_ON_SITE_ENABLED = false;
export const DEFAULT_RESERVATION_PAYMENT_METHOD: PaymentMethod = PAY_ON_SITE_ENABLED
  ? 'onSite'
  : 'payNowKrw';

export enum PaymentVariantKey {
  KOREA = 'KOREA',
  PAYPAL = 'PAYPAL',
}

export const PAYMENT_WIDGET_CONFIG: Record<
  Exclude<PaymentMethod, 'onSite'>,
  { variantKey: PaymentVariantKey; currency: 'KRW' | 'USD' }
> = {
  payNowKrw: { variantKey: PaymentVariantKey.KOREA, currency: 'KRW' },
  payNowUsd: { variantKey: PaymentVariantKey.PAYPAL, currency: 'USD' },
};

export const isPayNowPaymentMethod = (
  method: PaymentMethod
): method is Exclude<PaymentMethod, 'onSite'> => {
  return method === 'payNowKrw' || method === 'payNowUsd';
};
