import {
  RESERVATION_CANCELLATION_REASONS,
  type ReservationCancellationReasonKey,
} from '@/constants';
import {
  normalizeReservationStatus,
  shouldShowReservationRefundNotice,
  shouldShowReservationRefundPolicy,
} from '@/utils/reservation-policy';
import type {
  BookingDetailActionButton,
  BookingPolicyKind,
  BookingStatus,
  BookingStatusTextColor,
} from './types';

export function resolveBookingStatus(value?: string | null): BookingStatus {
  const normalizedStatus = normalizeReservationStatus(value);
  return normalizedStatus === 'unknown' ? 'request' : normalizedStatus;
}

export function resolveStatusTextColor(status: BookingStatus): BookingStatusTextColor {
  if (status === 'canceled') return 'text_disabled';
  if (status === 'confirmed' || status === 'completed') return 'white';
  return 'text_secondary';
}

export function resolvePolicyKind(
  currency: string | null | undefined,
  status?: string | null
): BookingPolicyKind {
  if (shouldShowReservationRefundPolicy({ currency, status })) {
    return 'refundPolicy';
  }

  if (shouldShowReservationRefundNotice({ currency, status })) {
    return 'refundNotice';
  }

  return 'none';
}

export function buildActionButtons(
  status: BookingStatus,
  labels: Record<BookingDetailActionButton['key'], string>
): BookingDetailActionButton[] {
  switch (status) {
    case 'canceled':
      return [{ key: 'bookAgain', label: labels.bookAgain, variant: 'secondary' }];
    case 'confirmed':
    case 'request':
      return [{ key: 'cancel', label: labels.cancel, variant: 'primary' }];
    case 'completed':
      return [
        { key: 'bookAgain', label: labels.bookAgain, variant: 'secondary' },
        { key: 'writeReview', label: labels.writeReview, variant: 'primary' },
      ];
    default:
      return [{ key: 'cancel', label: labels.cancel, variant: 'primary' }];
  }
}

export function buildCancellationReasons(
  labels: Record<ReservationCancellationReasonKey, string>
): { value: ReservationCancellationReasonKey; label: string }[] {
  return RESERVATION_CANCELLATION_REASONS.map((item) => ({
    value: item.key,
    label: labels[item.key],
  }));
}
