import type { ReservationCancellationReasonKey } from '@/constants';
import type { ReservationDetail } from '@/models/reservation';

export type BookingStatus = 'request' | 'confirmed' | 'canceled' | 'completed';
export type BookingStatusTextColor = 'text_disabled' | 'white' | 'text_secondary';
export type BookingPolicyKind = 'none' | 'refundPolicy' | 'refundNotice';

export interface BookingDateItem {
  date?: string;
  time?: string;
}

export interface BookingDetailData {
  id: number;
  displayOrderId?: string;
  companyId?: number;
  programId?: number;
  status: BookingStatus | string;
  title: string;
  image: string;
  clinicName?: string;
  requestDate?: string;
  bookingDates?: BookingDateItem[];
  guestInfo?: { name?: string; contact?: string; contactMethod?: string; language?: string };
  providerInfo?: { id?: number; name?: string; address?: string; image?: string };
  paymentInfo?: {
    method?: string;
    currency?: string | null;
    amount?: string;
    finalAmount?: string;
    refundAmount?: string | null;
  };
  hasReview?: boolean;
}

export interface BookingDetailActionButton {
  key: 'cancel' | 'bookAgain' | 'writeReview';
  label: string;
  variant: 'primary' | 'secondary';
}

export interface BookingDetailDisplayModel {
  header: {
    image: string;
    title: string;
    requestDate: string;
  };
  bookingInfo: {
    displayOrderId: string;
    dates: BookingDateItem[];
  };
  guestInfo: {
    name: string;
    contactValue: string;
    contactMethodLabel?: string;
    language: string;
  };
  providerInfo: {
    id?: number;
    name: string;
    address: string;
    image: string;
  };
  paymentInfo: {
    method: string;
    currency: string | null;
    amount: string;
    finalAmount: string;
    refundAmount?: string | null;
  };
  programId?: number;
}

export interface BookingDetailViewModel {
  reservationId: string;
  header: BookingDetailDisplayModel['header'] & {
    status: {
      value: BookingStatus;
      label: string;
      textColor: BookingStatusTextColor;
    };
  };
  bookingInfo: BookingDetailDisplayModel['bookingInfo'];
  guestInfo: BookingDetailDisplayModel['guestInfo'];
  providerInfo: BookingDetailDisplayModel['providerInfo'];
  paymentInfo: BookingDetailDisplayModel['paymentInfo'];
  programId?: number;
  policy: {
    kind: BookingPolicyKind;
    openRefundPolicy: () => void;
  };
  actions: {
    buttons: BookingDetailActionButton[];
    cancellationReasons: { value: ReservationCancellationReasonKey; label: string }[];
    markCanceled: () => void;
  };
}

export interface BookingDetailFormatters {
  formatDateTimeString: (value?: string | null) => string;
  formatAmount: (value?: number | null, currency?: string | null) => string;
  resolveProgramPrice: (reservation: ReservationDetail) => number | undefined;
  buildBookingDates: (reservation: ReservationDetail) => BookingDateItem[];
  resolveContactChannel: (preferredContact?: string | null) =>
    | {
        key: string;
        label: string;
        getValue: (reservation: ReservationDetail) => string | null | undefined;
      }
    | undefined;
  resolveGuestLanguage: (languagePreference?: string | null) => string;
  buildContactValue: (reservation: ReservationDetail) => string;
}
