export type PaymentMethod = 'onSite' | 'payNowKrw' | 'payNowUsd';

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
