import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import {
  RESERVATION_CANCELLATION_REASONS,
  type ReservationCancellationReasonKey,
} from '@/constants';
import type { LanguagePreference } from '@/models/reservation';
import { useGetReservationDetailQuery } from '@/queries/reservation';
import { useAuthStore } from '@/store/auth';
import { RESERVATION_REFUND_POLICY_URL } from '@/utils/reservation-policy';
import {
  buildActionButtons,
  buildCancellationReasons,
  resolveBookingStatus,
  resolvePolicyKind,
  resolveStatusTextColor,
} from './booking-detail/actions';
import { LOCALE_FORMAT_MAP } from './booking-detail/constants';
import { createBookingDetailFormatters } from './booking-detail/formatters';
import { buildBookingDetailData, buildBookingDetailDisplayModel } from './booking-detail/mapper';
import {
  getReservationId,
  readStoredBookingDetail,
  unwrapReservationDetail,
} from './booking-detail/storage';
import type { BookingDetailData, BookingDetailViewModel } from './booking-detail/types';

export type {
  BookingDetailActionButton,
  BookingDetailViewModel,
  BookingPolicyKind,
  BookingStatus,
  BookingStatusTextColor,
} from './booking-detail/types';

export function useBookingDetailViewModel(): BookingDetailViewModel {
  const router = useRouter();
  const t = useTranslations('booking-detail');
  const tReservation = useTranslations('reservation');
  const accessToken = useAuthStore((state) => state.accessToken);
  const [detail, setDetail] = useState<BookingDetailData | null>(null);

  const reservationId = useMemo(
    () => getReservationId(router.query.reservationId),
    [router.query.reservationId]
  );

  useEffect(() => {
    setDetail(readStoredBookingDetail(reservationId));
  }, [reservationId]);

  const locale = useMemo(() => {
    const currentLocale = router.locale as keyof typeof LOCALE_FORMAT_MAP | undefined;
    return currentLocale ? LOCALE_FORMAT_MAP[currentLocale] : LOCALE_FORMAT_MAP.en;
  }, [router.locale]);

  const languageLabelMap = useMemo<Record<LanguagePreference, string>>(
    () => ({
      korean: tReservation('form.contact.languages.korean'),
      english: tReservation('form.contact.languages.english'),
      chinese: tReservation('form.contact.languages.chinese'),
      japanese: tReservation('form.contact.languages.japanese'),
    }),
    [tReservation]
  );

  const formatters = useMemo(
    () => createBookingDetailFormatters({ locale, languageLabelMap }),
    [languageLabelMap, locale]
  );

  const mapReservationDetail = useCallback(
    (
      reservation: ReturnType<typeof unwrapReservationDetail>,
      previousDetail: BookingDetailData | null
    ) => {
      return buildBookingDetailData({
        reservation,
        previousDetail,
        formatters,
        payOnlineLabel: (currency) => t('labels.payOnline', { currency }),
        payOnSiteLabel: t('labels.payOnSite'),
      });
    },
    [formatters, t]
  );

  const { data: reservationDetailResponse } = useGetReservationDetailQuery(
    reservationId,
    Boolean(reservationId && accessToken)
  );

  useEffect(() => {
    if (!reservationDetailResponse) return;
    const reservation = unwrapReservationDetail(reservationDetailResponse);

    setDetail((previousDetail) => mapReservationDetail(reservation, previousDetail));
  }, [mapReservationDetail, reservationDetailResponse]);

  const handleOpenRefundPolicy = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.open(RESERVATION_REFUND_POLICY_URL, '_blank', 'noopener,noreferrer');
  }, []);

  const markCanceled = useCallback(() => {
    setDetail((previousDetail) =>
      previousDetail ? { ...previousDetail, status: 'canceled' } : previousDetail
    );
  }, []);

  const displayModel = useMemo(() => buildBookingDetailDisplayModel(detail), [detail]);
  const status = useMemo(() => resolveBookingStatus(detail?.status), [detail?.status]);
  const statusLabels = useMemo(
    () => ({
      cancel: t('cta.cancel'),
      bookAgain: t('cta.bookAgain'),
      writeReview: t('cta.writeReview'),
    }),
    [t]
  );
  const cancellationReasonLabels = useMemo(() => {
    return RESERVATION_CANCELLATION_REASONS.reduce(
      (acc, item) => {
        acc[item.key] = t(item.labelKey);
        return acc;
      },
      {} as Record<ReservationCancellationReasonKey, string>
    );
  }, [t]);

  const policyKind = useMemo(
    () => resolvePolicyKind(displayModel.paymentInfo.currency, detail?.status),
    [detail?.status, displayModel.paymentInfo.currency]
  );
  const actionButtons = useMemo(
    () => buildActionButtons(status, statusLabels),
    [status, statusLabels]
  );
  const cancellationReasons = useMemo(
    () => buildCancellationReasons(cancellationReasonLabels),
    [cancellationReasonLabels]
  );

  return useMemo(
    () => ({
      reservationId,
      header: {
        ...displayModel.header,
        status: {
          value: status,
          label: t(`status.${status}`),
          textColor: resolveStatusTextColor(status),
        },
      },
      bookingInfo: displayModel.bookingInfo,
      guestInfo: displayModel.guestInfo,
      providerInfo: displayModel.providerInfo,
      paymentInfo: displayModel.paymentInfo,
      programId: displayModel.programId,
      policy: {
        kind: policyKind,
        openRefundPolicy: handleOpenRefundPolicy,
      },
      actions: {
        buttons: actionButtons,
        cancellationReasons,
        markCanceled,
      },
    }),
    [
      actionButtons,
      cancellationReasons,
      displayModel,
      handleOpenRefundPolicy,
      markCanceled,
      policyKind,
      reservationId,
      status,
      t,
    ]
  );
}
