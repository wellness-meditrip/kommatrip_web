import type { GetReservationDetailResponse, ReservationDetail } from '@/models/reservation';
import type { BookingDetailData } from './types';

export function getReservationId(queryValue: string | string[] | undefined): string {
  return typeof queryValue === 'string' ? queryValue : '';
}

export function readStoredBookingDetail(reservationId: string): BookingDetailData | null {
  if (!reservationId || typeof window === 'undefined') return null;

  const stored = window.sessionStorage.getItem(`booking_detail_${reservationId}`);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as BookingDetailData;
  } catch {
    window.sessionStorage.removeItem(`booking_detail_${reservationId}`);
    return null;
  }
}

export function unwrapReservationDetail(
  reservationDetailResponse: GetReservationDetailResponse
): ReservationDetail {
  return 'reservation' in reservationDetailResponse
    ? reservationDetailResponse.reservation
    : reservationDetailResponse;
}
