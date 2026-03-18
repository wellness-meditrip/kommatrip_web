import { useCallback, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { AppBar, GNB, Layout, ReservationPolicyPanel, Text } from '@/components';
import {
  type BookingDetailActionKey,
  BookingDetailActionBar,
  BookingDetailCard,
  BookingInfoSection,
  GuestInfoSection,
  PaymentInfoSection,
  ProviderInfoSection,
} from '@/components/booking-detail';
import { ReasonModal } from '@/components/reviews/report-modal';
import { ROUTES } from '@/constants';
import { getI18nServerSideProps } from '@/i18n/page-props';
import { useBookingDetailViewModel, useMediaQuery, useRequireAuth } from '@/hooks';
import { useDeleteReservationMutation } from '@/queries/reservation';
import { useAuthStore } from '@/store/auth';
import { theme } from '@/styles';
import type { BookingStatus } from '@/hooks/reservation';

export default function BookingDetailPage() {
  const router = useRouter();
  const t = useTranslations('booking-detail');
  const tReservation = useTranslations('reservation');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { isAuthenticated, isLoading } = useRequireAuth(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const {
    actions,
    bookingInfo,
    guestInfo,
    header,
    policy,
    paymentInfo,
    programId,
    providerInfo,
    reservationId,
  } = useBookingDetailViewModel();

  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservationMutation();
  const canBookAgain = Boolean(providerInfo.id && programId);

  const actionButtons = useMemo(
    () =>
      actions.buttons.map((button) => ({
        ...button,
        disabled:
          (button.key === 'cancel' && isDeleting) || (button.key === 'bookAgain' && !canBookAgain),
      })),
    [actions.buttons, canBookAgain, isDeleting]
  );

  const handleProviderClick = useCallback(() => {
    if (!providerInfo.id) return;
    router.push(`/${router.locale ?? 'en'}${ROUTES.COMPANY_DETAIL(providerInfo.id)}`);
  }, [providerInfo.id, router]);

  const handleAction = useCallback(
    (actionKey: BookingDetailActionKey) => {
      if (actionKey === 'bookAgain') {
        if (!providerInfo.id || !programId) return;
        router.push({
          pathname: `/${router.locale ?? 'en'}${ROUTES.RESERVATIONS}`,
          query: { companyId: providerInfo.id, programId },
        });
        return;
      }

      if (actionKey === 'writeReview') {
        const schedule =
          bookingInfo.dates.length > 0
            ? `${bookingInfo.dates[0].date ?? '-'} ${bookingInfo.dates[0].time ?? '-'}`
            : '-';
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            'review_draft',
            JSON.stringify({
              reservationId: Number(reservationId),
              companyId: providerInfo.id,
              programId,
              companyName: providerInfo.name,
              programName: header.title,
              schedule,
              programImage: header.image,
            })
          );
        }
        router.push(`/${router.locale ?? 'en'}${ROUTES.REVIEW}`);
        return;
      }

      if (actionKey === 'cancel') {
        setIsCancelModalOpen(true);
      }
    },
    [
      bookingInfo.dates,
      header.image,
      header.title,
      programId,
      providerInfo.id,
      providerInfo.name,
      reservationId,
      router,
    ]
  );

  if (isLoading || (isAuthenticated && !accessToken)) {
    return (
      <Layout isAppBarExist={false} title={t('title')} showFooter={false}>
        <AppBar logo="light" backgroundColor="green" />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout isAppBarExist={false} title={t('title')} showFooter={false}>
        <AppBar logo="light" backgroundColor="green" />
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
            <Image src={header.image} alt={header.title} fill css={heroImageStyle} />
          </div>

          <div css={metaRow}>
            <span css={statusChip(header.status.value)}>
              <Text typo="body_S" color={header.status.textColor}>
                {header.status.label}
              </Text>
            </span>
            <Text typo="body_S" color="text_tertiary">
              {t('meta.requestDate')}: {header.requestDate}
            </Text>
          </div>

          <Text typo="title_L" color="text_primary">
            {header.title}
          </Text>

          <BookingInfoSection
            title={t('sections.bookingInfo')}
            bookingIdLabel={t('labels.id')}
            bookingId={bookingInfo.displayOrderId}
            dateLabel={t('labels.date')}
            timeLabel={t('labels.time')}
            bookingDates={bookingInfo.dates}
          />

          <GuestInfoSection
            title={t('sections.guestInfo')}
            nameLabel={t('labels.name')}
            name={guestInfo.name}
            contactLabel={t('labels.contact')}
            contactMethodLabel={guestInfo.contactMethodLabel}
            contactValue={guestInfo.contactValue}
            languageLabel={t('labels.language')}
            language={guestInfo.language}
          />

          <ProviderInfoSection
            title={t('sections.provider')}
            name={providerInfo.name}
            address={providerInfo.address}
            image={providerInfo.image}
            disabled={!providerInfo.id}
            onClick={handleProviderClick}
          />

          <PaymentInfoSection
            title={t('sections.paymentInfo')}
            paymentMethodLabel={t('labels.paymentMethod')}
            paymentMethod={paymentInfo.method}
            paymentAmountLabel={t('labels.paymentAmount')}
            paymentAmount={paymentInfo.amount}
            finalPaymentAmountLabel={t('labels.finalPaymentAmount')}
            finalPaymentAmount={paymentInfo.finalAmount}
          />

          {policy.kind === 'refundPolicy' && (
            <BookingDetailCard>
              <ReservationPolicyPanel
                title={tReservation('payment.refundTitle')}
                actionLabel={tReservation('payment.refundMore')}
                onActionClick={policy.openRefundPolicy}
              />
            </BookingDetailCard>
          )}

          {policy.kind === 'refundNotice' && (
            <BookingDetailCard>
              <ReservationPolicyPanel
                title={tReservation('payment.refundNoticeTitle')}
                notice={tReservation('payment.refundNoticeDescription')}
              />
            </BookingDetailCard>
          )}
        </div>
      </div>

      <BookingDetailActionBar buttons={actionButtons} hasGnb={!isDesktop} onAction={handleAction} />

      <ReasonModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={t('cancelModal.title')}
        closeAriaLabel={t('cancelModal.close')}
        submitLabel={t('cancelModal.submit')}
        reasons={actions.cancellationReasons}
        radioName="reservation-cancel-reason"
        showDetailField={false}
        onSubmit={({ reason }) => {
          if (!reservationId) return;
          deleteReservation(
            { reservationId, reason },
            {
              onSuccess: () => {
                actions.markCanceled();
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
  min-height: 100vh;

  background: ${theme.colors.bg_surface1};
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
  overflow: hidden;

  width: 100%;
  height: 240px;
  border-radius: 16px;

  background: ${theme.colors.gray100};
`;

const heroImageStyle = css`
  object-fit: cover;
`;

const metaRow = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const statusChip = (status: BookingStatus) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 6px 14px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 20px;

  background: ${theme.colors.white};

  ${status === 'confirmed' &&
  css`
    border: none;

    background: ${theme.colors.primary50};
  `}

  ${status === 'completed' &&
  css`
    border: none;

    background: ${theme.colors.primary50};
  `}

  ${status === 'canceled' &&
  css`
    border: none;

    background: ${theme.colors.gray200};
  `}
`;

export const getServerSideProps = getI18nServerSideProps(['booking-detail', 'reservation']);
