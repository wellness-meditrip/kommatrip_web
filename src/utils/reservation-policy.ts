export const RESERVATION_REFUND_POLICY_URL =
  'https://www.notion.so/English-Cancellation-and-Refund-policy-2958bf64ec2180308ca5ec2b72d0b815?source=copy_link';

export type NormalizedReservationStatus =
  | 'request'
  | 'confirmed'
  | 'canceled'
  | 'completed'
  | 'unknown';

const normalizeComparableValue = (value?: string | null) => {
  return (value ?? '').toLowerCase().replace(/[\s_-]/g, '');
};

const normalizeCurrency = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase();
  return normalized === 'KRW' || normalized === 'USD' ? normalized : null;
};

export const normalizeReservationStatus = (status?: string | null): NormalizedReservationStatus => {
  const value = normalizeComparableValue(status);

  if (!value) return 'unknown';
  if (value.includes('confirm')) return 'confirmed';
  if (value.includes('cancel')) return 'canceled';
  if (value.includes('complete') || value.includes('done')) return 'completed';
  if (value.includes('pending') || value.includes('wait') || value.includes('request')) {
    return 'request';
  }

  return 'unknown';
};

export const isReservationPaidOnline = (currency?: string | null) => {
  return Boolean(normalizeCurrency(currency));
};

interface ReservationRefundVisibilityParams {
  currency?: string | null;
  status?: string | null;
}

export const shouldShowReservationRefundPolicy = ({
  currency,
  status,
}: ReservationRefundVisibilityParams) => {
  const normalizedStatus = normalizeReservationStatus(status);
  return (
    isReservationPaidOnline(currency) &&
    (normalizedStatus === 'request' || normalizedStatus === 'confirmed')
  );
};

export const shouldShowReservationRefundNotice = ({
  currency,
  status,
}: ReservationRefundVisibilityParams) => {
  return isReservationPaidOnline(currency) && normalizeReservationStatus(status) === 'canceled';
};
