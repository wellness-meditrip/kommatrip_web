import { useCallback, useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { AppBar, Layout, LoginModal, Text, GNB } from '@/components';
import { ReportModal } from '@/components/reviews/report-modal';
import Image from 'next/image';
import { theme } from '@/styles';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useMediaQuery, useRequireAuth } from '@/hooks';
import { useAuthStore } from '@/store/auth';
import { useDeleteReservationMutation, useGetReservationDetailQuery } from '@/queries/reservation';
import type { LanguagePreference, ReservationDetail } from '@/models/reservation';
import { ChevronRight } from '@/icons';
import {
  RESERVATION_CANCELLATION_REASONS,
  ReservationCancellationReasonKey,
  ROUTES,
} from '@/constants';

type BookingStatus = 'request' | 'confirmed' | 'canceled' | 'completed';

interface BookingDetailData {
  id: number;
  displayOrderId?: string;
  companyId?: number;
  programId?: number;
  status: BookingStatus | string;
  title: string;
  image: string;
  clinicName?: string;
  requestDate?: string;
  bookingDates?: { date?: string; time?: string }[];
  guestInfo?: { name?: string; contact?: string; contactMethod?: string; language?: string };
  providerInfo?: { id?: number; name?: string; address?: string; image?: string };
  paymentInfo?: { method?: string; amount?: string; finalAmount?: string };
  hasReview?: boolean;
}

const normalizeStatus = (status?: string): BookingStatus => {
  const value = (status ?? '').toLowerCase();
  if (value.includes('confirm')) return 'confirmed';
  if (value.includes('cancel')) return 'canceled';
  if (value.includes('complete') || value.includes('done')) return 'completed';
  if (value.includes('pending') || value.includes('wait')) return 'request';
  if (value.includes('request')) return 'request';
  return 'request';
};

export default function BookingDetailPage() {
  const router = useRouter();
  const t = useTranslations('booking-detail');
  const tReservation = useTranslations('reservation');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { showLoginModal, setShowLoginModal, isAuthenticated, handleDismissModal } =
    useRequireAuth(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [detail, setDetail] = useState<BookingDetailData | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const reservationId = useMemo(() => {
    if (typeof router.query.reservationId === 'string') {
      return router.query.reservationId;
    }
    return '';
  }, [router.query.reservationId]);

  useEffect(() => {
    if (!reservationId || typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem(`booking_detail_${reservationId}`);
    if (!stored) return;
    try {
      setDetail(JSON.parse(stored));
    } catch {
      window.sessionStorage.removeItem(`booking_detail_${reservationId}`);
    }
  }, [reservationId]);

  const locale = router.locale === 'ko' ? 'ko-KR' : 'en-US';

  const formatDateWithWeekday = useCallback(
    (date: Date) => {
      const dateText = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
      const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
      return `${dateText} (${weekday})`;
    },
    [locale]
  );

  const formatTimeFromDate = useCallback(
    (date: Date) => {
      return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
    },
    [locale]
  );

  const formatDateString = useCallback(
    (value?: string | null) => {
      if (!value) return '-';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return value;
      return formatDateWithWeekday(parsed);
    },
    [formatDateWithWeekday]
  );

  const formatTimeString = useCallback(
    (value?: string | null) => {
      if (!value) return '-';
      const parsed = new Date(`1970-01-01T${value}`);
      if (Number.isNaN(parsed.getTime())) return value;
      return formatTimeFromDate(parsed);
    },
    [formatTimeFromDate]
  );

  const formatDateTimeString = useCallback(
    (value?: string | null) => {
      if (!value) return '-';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return value;
      return `${formatDateWithWeekday(parsed)} ${formatTimeFromDate(parsed)}`;
    },
    [formatDateWithWeekday, formatTimeFromDate]
  );

  const formatAmount = useCallback(
    (value?: number | null, currency?: string | null) => {
      if (typeof value !== 'number') return '-';
      const currencyCode =
        typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'KRW';
      if (currencyCode === 'KRW') return `${Math.round(value).toLocaleString(locale)} KRW`;
      if (currencyCode === 'USD') return `${value.toLocaleString(locale)} USD`;
      return `${value.toLocaleString(locale)} ${currencyCode}`;
    },
    [locale]
  );

  const resolveProgramPrice = useCallback((reservation: ReservationDetail): number | undefined => {
    const currency = (reservation.currency ?? '').toLowerCase();
    const priceInfo = reservation.program_info?.price_info;
    if (priceInfo && currency && typeof priceInfo[currency] === 'number') {
      return priceInfo[currency];
    }
    if (typeof reservation.program_info?.price === 'number') {
      return reservation.program_info.price;
    }
    if (typeof priceInfo?.krw === 'number') return priceInfo.krw;
    if (typeof priceInfo?.usd === 'number') return priceInfo.usd;
    return undefined;
  }, []);

  const languageLabelMap = useMemo<Record<LanguagePreference, string>>(
    () => ({
      korean: tReservation('form.contact.languages.korean'),
      english: tReservation('form.contact.languages.english'),
      chinese: tReservation('form.contact.languages.chinese'),
      japanese: tReservation('form.contact.languages.japanese'),
    }),
    [tReservation]
  );

  const isLanguagePreference = useCallback(
    (value?: string | null): value is LanguagePreference => {
      return Boolean(value && value in languageLabelMap);
    },
    [languageLabelMap]
  );

  const buildBookingDates = useCallback(
    (reservation: ReservationDetail) => {
      if (reservation.availability_options?.length) {
        return reservation.availability_options.map((option) => ({
          date: formatDateString(option.date),
          time: option.times?.length
            ? option.times.map((time) => formatTimeString(time)).join(' / ')
            : '-',
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
        return [{ date: reservation.visit_date, time: '-' }];
      }

      return [{ date: '-', time: '-' }];
    },
    [formatDateString, formatTimeString, formatDateWithWeekday, formatTimeFromDate]
  );

  const formatContactMethodLabel = useCallback((value?: string | null) => {
    const normalized = (value ?? '').toLowerCase();
    if (normalized.includes('line')) return 'Line';
    if (normalized.includes('whatsapp')) return 'WhatsApp';
    if (normalized.includes('kakao')) return 'Kakao';
    if (normalized.includes('phone')) return 'Phone';
    return '';
  }, []);

  const buildContactValue = useCallback((reservation: ReservationDetail) => {
    const method = (reservation.preferred_contact ?? '').toLowerCase();
    if (method.includes('line')) return reservation.contact_line || '-';
    if (method.includes('whatsapp')) return reservation.contact_whatsapp || '-';
    if (method.includes('kakao')) return reservation.contact_kakao || '-';
    if (method.includes('phone')) return reservation.contact_phone || '-';

    return (
      reservation.contact_line ||
      reservation.contact_whatsapp ||
      reservation.contact_kakao ||
      reservation.contact_phone ||
      reservation.customer_email ||
      '-'
    );
  }, []);

  const { data: reservationDetailResponse } = useGetReservationDetailQuery(
    reservationId,
    Boolean(reservationId && accessToken)
  );

  useEffect(() => {
    if (!reservationDetailResponse) return;
    const reservation =
      'reservation' in reservationDetailResponse
        ? reservationDetailResponse.reservation
        : reservationDetailResponse;
    const programInfo = reservation.program_info;
    const paymentCurrency =
      typeof reservation.currency === 'string' && reservation.currency.trim()
        ? reservation.currency.trim().toUpperCase()
        : 'KRW';
    const languagePreference = reservation.language_preference;
    const guestLanguage = isLanguagePreference(languagePreference)
      ? languageLabelMap[languagePreference]
      : languagePreference || '-';

    setDetail((prev) => {
      const fallbackImage = prev?.image || '/default.png';
      const heroImage =
        programInfo?.primary_image_url || programInfo?.image_urls?.[0] || fallbackImage;
      return {
        id: reservation.id,
        displayOrderId:
          reservation.display_order_id || reservation.reservation_code || `${reservation.id}`,
        companyId: reservation.company_id,
        programId: programInfo?.id,
        status: reservation.status ?? prev?.status ?? 'request',
        title: programInfo?.name || prev?.title || '-',
        image: heroImage,
        clinicName: prev?.clinicName,
        requestDate: formatDateTimeString(reservation.created_at),
        bookingDates: buildBookingDates(reservation),
        guestInfo: {
          name: reservation.user_name || prev?.guestInfo?.name,
          contact: buildContactValue(reservation),
          contactMethod: formatContactMethodLabel(reservation.preferred_contact),
          language: guestLanguage,
        },
        providerInfo: {
          id: reservation.company_id,
          name: prev?.providerInfo?.name || prev?.clinicName || '-',
          address: reservation.company_address || prev?.providerInfo?.address || '-',
          image: prev?.providerInfo?.image || heroImage,
        },
        paymentInfo: {
          method: t('labels.payOnline', { currency: paymentCurrency }),
          amount: formatAmount(resolveProgramPrice(reservation), paymentCurrency),
          finalAmount: formatAmount(resolveProgramPrice(reservation), paymentCurrency),
        },
        hasReview: prev?.hasReview ?? false,
      };
    });
  }, [
    reservationDetailResponse,
    formatDateTimeString,
    formatAmount,
    resolveProgramPrice,
    t,
    buildBookingDates,
    buildContactValue,
    formatContactMethodLabel,
    languageLabelMap,
    isLanguagePreference,
  ]);

  const status = normalizeStatus(detail?.status);
  const bookingDates = detail?.bookingDates?.length
    ? detail.bookingDates
    : [{ date: '-', time: '-' }];
  const displayOrderId = detail?.displayOrderId || '-';
  const guestInfo = detail?.guestInfo ?? {};
  const contactValue = guestInfo.contact || '-';
  const contactMethodLabel = guestInfo.contactMethod;
  const providerInfo = detail?.providerInfo ?? {};
  const paymentInfo = detail?.paymentInfo ?? {};
  const companyId = detail?.companyId;
  const programId = detail?.programId;
  const requestDate = detail?.requestDate ?? '-';
  const heroImage = detail?.image || '/default.png';
  const programTitle = detail?.title || '-';
  const providerName = providerInfo.name || detail?.clinicName || '-';
  const providerImage = providerInfo.image || detail?.image || '/default.png';
  const providerAddress = providerInfo.address || '-';
  const providerId = providerInfo.id;
  const statusTextColor =
    status === 'canceled'
      ? 'text_disabled'
      : status === 'confirmed' || status === 'completed'
        ? 'white'
        : 'text_secondary';

  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservationMutation();
  const cancellationReasonLabelMap = useMemo(() => {
    return RESERVATION_CANCELLATION_REASONS.reduce<
      Partial<Record<ReservationCancellationReasonKey, string>>
    >((acc, item) => {
      acc[item.key] = t(item.labelKey);
      return acc;
    }, {});
  }, [t]);

  const cancellationReasons = useMemo(
    () =>
      RESERVATION_CANCELLATION_REASONS.map((item) => ({
        value: item.key,
        label: cancellationReasonLabelMap[item.key] ?? t(item.labelKey),
      })),
    [cancellationReasonLabelMap, t]
  );

  const ctaButtons = useMemo(() => {
    switch (status) {
      case 'canceled':
        return [{ key: 'bookAgain', label: t('cta.bookAgain'), variant: 'secondary' }];
      case 'confirmed':
      case 'request':
        return [{ key: 'cancel', label: t('cta.cancel'), variant: 'primary' }];
      case 'completed':
        return [
          { key: 'bookAgain', label: t('cta.bookAgain'), variant: 'secondary' },
          { key: 'writeReview', label: t('cta.writeReview'), variant: 'primary' },
        ];
      default:
        return [{ key: 'cancel', label: t('cta.cancel'), variant: 'primary' }];
    }
  }, [status, t]);

  const statusLabel = t(`status.${status}`);

  if (!isAuthenticated) {
    return (
      <Layout isAppBarExist={false} title={t('title')} showFooter={false}>
        <AppBar logo="light" backgroundColor="green" />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onCancel={handleDismissModal}
        />
      </Layout>
    );
  }

  if (!accessToken) {
    return (
      <Layout isAppBarExist={false} title={t('title')} showFooter={false}>
        <AppBar logo="light" backgroundColor="green" />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onCancel={handleDismissModal}
        />
      </Layout>
    );
  }

  return (
    <Layout isAppBarExist={false} title={t('title')} showFooter={false}>
      <AppBar
        leftButton
        buttonType="dark"
        title={t('title')}
        backgroundColor="bg_surface1"
        onBackClick={() => router.back()}
      />
      <div css={pageWrapper}>
        <div css={contentWrapper(!isDesktop)}>
          <div css={heroImageWrapper}>
            <Image src={heroImage} alt={programTitle} fill css={heroImageStyle} />
          </div>

          <div css={metaRow}>
            <span css={statusChip(status)}>
              <Text typo="body_S" color={statusTextColor}>
                {statusLabel}
              </Text>
            </span>
            <Text typo="body_S" color="text_tertiary">
              {t('meta.requestDate')}: {requestDate}
            </Text>
          </div>

          <Text typo="title_L" color="text_primary">
            {programTitle}
          </Text>

          <section css={sectionCard}>
            <Text typo="title_M" color="text_primary">
              {t('sections.bookingInfo')}
            </Text>
            <div css={sectionBody}>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.id')}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {displayOrderId}
                </Text>
              </div>
              {bookingDates.map((item, index) => (
                <div key={`${item.date}-${item.time}-${index}`} css={infoBlock}>
                  <div css={infoRow}>
                    <Text typo="body_M" color="text_tertiary">
                      {t('labels.date')}
                    </Text>
                    <Text typo="body_M" color="text_primary">
                      {item.date || '-'}
                    </Text>
                  </div>
                  <div css={infoRow}>
                    <Text typo="body_M" color="text_tertiary">
                      {t('labels.time')}
                    </Text>
                    <Text typo="body_M" color="text_primary">
                      {item.time || '-'}
                    </Text>
                  </div>
                  {index < bookingDates.length - 1 && <div css={divider} />}
                </div>
              ))}
            </div>
          </section>

          <section css={sectionCard}>
            <Text typo="title_M" color="text_primary">
              {t('sections.guestInfo')}
            </Text>
            <div css={sectionBody}>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.name')}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {guestInfo.name || '-'}
                </Text>
              </div>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.contact')}
                </Text>
                {contactMethodLabel ? (
                  <div css={contactTextRow}>
                    <Text typo="body_M" color="primary30">
                      {contactMethodLabel}
                    </Text>
                    <Text typo="body_M" color="text_tertiary">
                      |
                    </Text>
                    <Text typo="body_M" color="text_primary">
                      {contactValue}
                    </Text>
                  </div>
                ) : (
                  <Text typo="body_M" color="text_primary">
                    {contactValue}
                  </Text>
                )}
              </div>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.language')}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {guestInfo.language || '-'}
                </Text>
              </div>
            </div>
          </section>

          <section css={sectionCard}>
            <Text typo="title_M" color="text_primary">
              {t('sections.provider')}
            </Text>
            <div css={sectionBody}>
              <div css={providerCard}>
                <button
                  type="button"
                  css={providerButton}
                  onClick={() => {
                    if (!providerId) return;
                    router.push(`/${router.locale ?? 'en'}${ROUTES.COMPANY_DETAIL(providerId)}`);
                  }}
                  disabled={!providerId}
                >
                  <div css={providerImageWrapper}>
                    <Image src={providerImage} alt={providerName} fill css={providerImageStyle} />
                  </div>
                  <div css={providerInfoWrapper}>
                    <div css={providerTitleRow}>
                      <Text typo="body_M" color="text_primary">
                        {providerName}
                      </Text>
                      <ChevronRight width={20} height={20} />
                    </div>
                    <Text typo="body_S" color="text_tertiary">
                      {providerAddress}
                    </Text>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <section css={sectionCard}>
            <Text typo="title_M" color="text_primary">
              {t('sections.paymentInfo')}
            </Text>
            <div css={sectionBody}>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.paymentMethod')}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {paymentInfo.method || '-'}
                </Text>
              </div>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.paymentAmount')}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {paymentInfo.amount || '-'}
                </Text>
              </div>
              <div css={infoRow}>
                <Text typo="body_M" color="text_tertiary">
                  {t('labels.finalPaymentAmount')}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {paymentInfo.finalAmount || '-'}
                </Text>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div css={actionBar(!isDesktop)}>
        <div css={ctaRow(ctaButtons.length)}>
          {ctaButtons.map((button) => (
            <button
              key={button.key}
              css={button.variant === 'primary' ? ctaPrimaryButton : ctaSecondaryButton}
              disabled={
                (button.key === 'cancel' && isDeleting) ||
                (button.key === 'bookAgain' && (!companyId || !programId))
              }
              onClick={() => {
                if (button.key === 'bookAgain') {
                  if (!companyId || !programId) return;
                  router.push({
                    pathname: `/${router.locale ?? 'en'}${ROUTES.RESERVATIONS}`,
                    query: { companyId, programId },
                  });
                  return;
                }
                if (button.key === 'writeReview') {
                  const schedule =
                    bookingDates.length > 0
                      ? `${bookingDates[0].date ?? '-'} ${bookingDates[0].time ?? '-'}`
                      : '-';
                  if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem(
                      'review_draft',
                      JSON.stringify({
                        reservationId: Number(reservationId),
                        companyId,
                        programId,
                        companyName: providerName,
                        programName: programTitle,
                        schedule,
                        programImage: heroImage,
                      })
                    );
                  }
                  router.push(`/${router.locale ?? 'en'}${ROUTES.REVIEW}`);
                  return;
                }
                if (button.key !== 'cancel') return;
                setIsCancelModalOpen(true);
              }}
            >
              <Text
                typo="button_L"
                color={button.variant === 'primary' ? 'white' : 'text_secondary'}
              >
                {button.label}
              </Text>
            </button>
          ))}
        </div>
      </div>
      <ReportModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={t('cancelModal.title')}
        closeAriaLabel={t('cancelModal.close')}
        submitLabel={t('cancelModal.submit')}
        reasons={cancellationReasons}
        radioName="reservation-cancel-reason"
        showDetailField={false}
        onSubmit={({ reason }) => {
          if (!reservationId) return;
          const cancellationReason =
            cancellationReasonLabelMap[reason as ReservationCancellationReasonKey] ?? '';
          deleteReservation(
            { reservationId, reason: cancellationReason },
            {
              onSuccess: () => {
                setDetail((prev) => (prev ? { ...prev, status: 'canceled' } : prev));
                setIsCancelModalOpen(false);
              },
            }
          );
        }}
      />
      {!isDesktop && <GNB />}
    </Layout>
  );
}

const pageWrapper = css`
  background: ${theme.colors.bg_surface1};
  min-height: 100vh;
`;

const contentWrapper = (hasGnb: boolean) => css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 16px
    calc(${theme.size.ctaButtonHeight} + ${hasGnb ? theme.size.gnbHeight : '0px'} + 32px);
`;

const heroImageWrapper = css`
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  background: ${theme.colors.gray100};
`;

const heroImageStyle = css`
  object-fit: cover;
`;

const metaRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const statusChip = (status: BookingStatus) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid ${theme.colors.border_default};
  background: ${theme.colors.white};

  ${status === 'confirmed' &&
  css`
    background: ${theme.colors.primary50};
    border: none;
  `}

  ${status === 'completed' &&
  css`
    background: ${theme.colors.primary50};
    border: none;
  `}

  ${status === 'canceled' &&
  css`
    background: ${theme.colors.gray200};
    border: none;
  `}
`;

const sectionCard = css`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const sectionBody = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const infoBlock = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const infoRow = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const contactTextRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const divider = css`
  height: 1px;
  background: ${theme.colors.border_default};
`;

const providerCard = css`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${theme.colors.border_default};
  background: ${theme.colors.bg_surface2};
`;

const providerButton = css`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: none;
  padding: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`;

const providerImageWrapper = css`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
`;

const providerImageStyle = css`
  object-fit: cover;
`;

const providerInfoWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const providerTitleRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const actionBar = (hasGnb: boolean) => css`
  position: fixed;
  left: 0;
  right: 0;
  bottom: ${hasGnb ? theme.size.gnbHeight : '0'};
  padding: 16px 18px 24px;
`;

const ctaRow = (count: number) => css`
  display: grid;
  gap: 12px;
  grid-template-columns: ${count > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr'};
`;

const ctaPrimaryButton = css`
  padding: 16px 0;
  border: none;
  border-radius: 28px;
  background: ${theme.colors.primary50};
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ctaSecondaryButton = css`
  padding: 16px 0;
  border-radius: 28px;
  border: 1px solid ${theme.colors.border_default};
  background: ${theme.colors.white};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
