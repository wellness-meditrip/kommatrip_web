import type { LanguagePreference, ReservationDetail } from '@/models/reservation';
import { CONTACT_CHANNELS, DEFAULT_BOOKING_DATES, FALLBACK_TEXT } from './constants';
import type { BookingDetailFormatters } from './types';

interface CreateBookingDetailFormattersParams {
  locale: string;
  languageLabelMap: Record<LanguagePreference, string>;
}

export function createBookingDetailFormatters({
  locale,
  languageLabelMap,
}: CreateBookingDetailFormattersParams): BookingDetailFormatters {
  const formatDateWithWeekday = (date: Date) => {
    const dateText = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    return `${dateText} (${weekday})`;
  };

  const formatTimeFromDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
  };

  const formatDateString = (value?: string | null) => {
    if (!value) return FALLBACK_TEXT;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return formatDateWithWeekday(parsed);
  };

  const formatTimeString = (value?: string | null) => {
    if (!value) return FALLBACK_TEXT;
    const parsed = new Date(`1970-01-01T${value}`);
    if (Number.isNaN(parsed.getTime())) return value;
    return formatTimeFromDate(parsed);
  };

  const formatDateTimeString = (value?: string | null) => {
    if (!value) return FALLBACK_TEXT;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return `${formatDateWithWeekday(parsed)} ${formatTimeFromDate(parsed)}`;
  };

  const formatAmount = (value?: number | null, currency?: string | null) => {
    if (typeof value !== 'number') return FALLBACK_TEXT;
    const currencyCode =
      typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'KRW';
    if (currencyCode === 'KRW') return `${Math.round(value).toLocaleString(locale)} KRW`;
    if (currencyCode === 'USD') return `${value.toLocaleString(locale)} USD`;
    return `${value.toLocaleString(locale)} ${currencyCode}`;
  };

  const resolveProgramPrice = (reservation: ReservationDetail): number | undefined => {
    const currency = (reservation.currency ?? '').toLowerCase();
    const priceInfo = reservation.program_info?.price_info;
    if (!priceInfo) return undefined;
    if (currency === 'usd' && typeof priceInfo.usd === 'number') return priceInfo.usd;
    if (typeof priceInfo.krw === 'number') return priceInfo.krw;
    if (typeof priceInfo.usd === 'number') return priceInfo.usd;
    return undefined;
  };

  const buildBookingDates = (reservation: ReservationDetail) => {
    if (reservation.availability_options?.length) {
      return reservation.availability_options.map((option) => ({
        date: formatDateString(option.date),
        time: option.times?.length
          ? option.times.map((time) => formatTimeString(time)).join(' / ')
          : FALLBACK_TEXT,
      }));
    }

    if (reservation.visit_date) {
      const visitDate = new Date(reservation.visit_date);
      if (!Number.isNaN(visitDate.getTime())) {
        return [
          {
            date: formatDateWithWeekday(visitDate),
            time: formatTimeFromDate(visitDate),
          },
        ];
      }
      return [{ date: reservation.visit_date, time: FALLBACK_TEXT }];
    }

    return DEFAULT_BOOKING_DATES;
  };

  const resolveContactChannel = (preferredContact?: string | null) => {
    const normalized = (preferredContact ?? '').toLowerCase();
    return CONTACT_CHANNELS.find((channel) => normalized.includes(channel.key));
  };

  const resolveGuestLanguage = (languagePreference?: string | null) => {
    if (languagePreference && languagePreference in languageLabelMap) {
      return languageLabelMap[languagePreference as LanguagePreference];
    }
    return languagePreference || FALLBACK_TEXT;
  };

  const buildContactValue = (reservation: ReservationDetail) => {
    const preferredChannel = resolveContactChannel(reservation.preferred_contact);
    if (preferredChannel) {
      return preferredChannel.getValue(reservation) || FALLBACK_TEXT;
    }

    return (
      reservation.contact_line ||
      reservation.contact_whatsapp ||
      reservation.contact_kakao ||
      reservation.contact_phone ||
      reservation.customer_email ||
      FALLBACK_TEXT
    );
  };

  return {
    formatDateTimeString,
    formatAmount,
    resolveProgramPrice,
    buildBookingDates,
    resolveContactChannel,
    resolveGuestLanguage,
    buildContactValue,
  };
}
