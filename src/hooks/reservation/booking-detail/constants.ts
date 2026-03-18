import type { ReservationDetail } from '@/models/reservation';
import type { BookingDateItem } from './types';

export const FALLBACK_TEXT = '-';
export const FALLBACK_IMAGE = '/default.png';
export const DEFAULT_BOOKING_DATES: BookingDateItem[] = [
  { date: FALLBACK_TEXT, time: FALLBACK_TEXT },
];
export const LOCALE_FORMAT_MAP = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
} as const;

export const CONTACT_CHANNELS = [
  {
    key: 'line',
    label: 'Line',
    getValue: (reservation: ReservationDetail) => reservation.contact_line,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    getValue: (reservation: ReservationDetail) => reservation.contact_whatsapp,
  },
  {
    key: 'kakao',
    label: 'Kakao',
    getValue: (reservation: ReservationDetail) => reservation.contact_kakao,
  },
  {
    key: 'phone',
    label: 'Phone',
    getValue: (reservation: ReservationDetail) => reservation.contact_phone,
  },
] as const;
