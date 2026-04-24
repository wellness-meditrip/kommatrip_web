import type { ReservationDetail } from '@/models/reservation';
import { DEFAULT_BOOKING_DATES, FALLBACK_IMAGE, FALLBACK_TEXT } from './constants';
import type {
  BookingDetailData,
  BookingDetailDisplayModel,
  BookingDetailFormatters,
} from './types';

interface BuildBookingDetailDataParams {
  reservation: ReservationDetail;
  previousDetail: BookingDetailData | null;
  formatters: BookingDetailFormatters;
  payOnlineLabel: (currency: string) => string;
  payOnSiteLabel: string;
}

export function buildBookingDetailData({
  reservation,
  previousDetail,
  formatters,
  payOnlineLabel,
  payOnSiteLabel,
}: BuildBookingDetailDataParams): BookingDetailData {
  const hasOnlinePayment = Boolean(reservation.display_order_id?.trim());
  const programInfo = reservation.program_info;
  const paymentCurrency =
    typeof reservation.currency === 'string' && reservation.currency.trim()
      ? reservation.currency.trim().toUpperCase()
      : 'KRW';
  const heroImage =
    programInfo?.primary_image_url ||
    programInfo?.image_urls?.[0] ||
    previousDetail?.image ||
    FALLBACK_IMAGE;
  const programPrice = formatters.resolveProgramPrice(reservation);
  const contactChannel = formatters.resolveContactChannel(reservation.preferred_contact);

  return {
    id: reservation.id,
    displayOrderId:
      reservation.display_order_id || reservation.reservation_code || `${reservation.id}`,
    companyId: reservation.company_id,
    programId: programInfo?.id,
    status: reservation.status ?? previousDetail?.status ?? 'request',
    title: programInfo?.name || previousDetail?.title || FALLBACK_TEXT,
    image: heroImage,
    clinicName: previousDetail?.clinicName,
    requestDate: formatters.formatDateTimeString(reservation.created_at),
    bookingDates: formatters.buildBookingDates(reservation),
    guestInfo: {
      name: reservation.user_name || previousDetail?.guestInfo?.name || FALLBACK_TEXT,
      contact: formatters.buildContactValue(reservation),
      contactMethod: contactChannel?.label,
      language: formatters.resolveGuestLanguage(reservation.language_preference),
    },
    providerInfo: {
      id: reservation.company_id,
      name: previousDetail?.providerInfo?.name || previousDetail?.clinicName || FALLBACK_TEXT,
      address:
        reservation.company_address || previousDetail?.providerInfo?.address || FALLBACK_TEXT,
      image: previousDetail?.providerInfo?.image || heroImage,
    },
    paymentInfo: {
      method: hasOnlinePayment ? payOnlineLabel(paymentCurrency) : payOnSiteLabel,
      currency: hasOnlinePayment ? (reservation.currency ?? 'KRW') : null,
      amount: formatters.formatAmount(programPrice, paymentCurrency),
      finalAmount: formatters.formatAmount(
        typeof reservation.payment_amount === 'number' ? reservation.payment_amount : programPrice,
        paymentCurrency
      ),
      refundAmount: reservation.refund_info
        ? formatters.formatAmount(reservation.refund_info.amount, reservation.refund_info.currency)
        : null,
    },
    hasReview: previousDetail?.hasReview ?? false,
  };
}

export function buildBookingDetailDisplayModel(
  detail: BookingDetailData | null
): BookingDetailDisplayModel {
  const guestInfo = detail?.guestInfo;
  const providerInfo = detail?.providerInfo;
  const paymentInfo = detail?.paymentInfo;
  const heroImage = detail?.image || FALLBACK_IMAGE;

  return {
    header: {
      image: heroImage,
      title: detail?.title || FALLBACK_TEXT,
      requestDate: detail?.requestDate || FALLBACK_TEXT,
    },
    bookingInfo: {
      displayOrderId: detail?.displayOrderId || FALLBACK_TEXT,
      dates: detail?.bookingDates?.length ? detail.bookingDates : DEFAULT_BOOKING_DATES,
    },
    guestInfo: {
      name: guestInfo?.name || FALLBACK_TEXT,
      contactValue: guestInfo?.contact || FALLBACK_TEXT,
      contactMethodLabel: guestInfo?.contactMethod || undefined,
      language: guestInfo?.language || FALLBACK_TEXT,
    },
    providerInfo: {
      id: providerInfo?.id ?? detail?.companyId,
      name: providerInfo?.name || detail?.clinicName || FALLBACK_TEXT,
      address: providerInfo?.address || FALLBACK_TEXT,
      image: providerInfo?.image || heroImage,
    },
    paymentInfo: {
      method: paymentInfo?.method || FALLBACK_TEXT,
      currency: paymentInfo?.currency ?? null,
      amount: paymentInfo?.amount || FALLBACK_TEXT,
      finalAmount: paymentInfo?.finalAmount || FALLBACK_TEXT,
      refundAmount: paymentInfo?.refundAmount ?? null,
    },
    programId: detail?.programId,
  };
}
