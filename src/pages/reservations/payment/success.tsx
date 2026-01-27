import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { AppBar, DesktopAppBar, Layout, Loading, RoundButton, Text } from '@/components';
import { theme } from '@/styles';
import { useTranslations } from 'next-intl';
import { useCurrentLocale } from '@/i18n/navigation';
import { ROUTES } from '@/constants';
import { Meta, createPageMeta } from '@/seo';
import { useMediaQuery, useToast } from '@/hooks';
import { usePostConfirmPaymentMutation } from '@/queries/payment';
import type { ReservationDataForPaymentConfirm } from '@/models/payment';

type ConfirmStatus = 'loading' | 'error';

export default function ReservationPaymentSuccessPage() {
  const router = useRouter();
  const t = useTranslations('reservation');
  const tCommon = useTranslations('common');
  const { showToast } = useToast();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const { mutateAsync: confirmPayment } = usePostConfirmPaymentMutation();

  useEffect(() => {
    if (!router.isReady) return;
    const { paymentKey, orderId, amount } = router.query;
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      return;
    }

    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('reservation_draft');
    if (!stored) {
      setStatus('error');
      return;
    }

    let reservationData: ReservationDataForPaymentConfirm | null = null;
    try {
      const draft = JSON.parse(stored);
      reservationData = {
        program_id: draft.program_id,
        preferred_contact: draft.preferred_contact,
        language_preference: draft.language_preference,
        availability_options: draft.availability_options,
        inquiries: draft.inquiries,
        contact_line: draft.contact_line,
        contact_whatsapp: draft.contact_whatsapp,
        contact_kakao: draft.contact_kakao,
        contact_phone: draft.contact_phone,
      };
      window.sessionStorage.setItem(
        'reservation_complete',
        JSON.stringify({
          company_name: draft.company_name,
          program_name: draft.program_name,
          program_duration_minutes: draft.program_duration_minutes,
          date: draft.availability_options?.[0]?.date ?? '',
          time: draft.availability_options?.[0]?.times?.[0] ?? '',
        })
      );
    } catch {
      setStatus('error');
      return;
    }

    if (!reservationData) {
      setStatus('error');
      return;
    }

    const resolvedAmount = Number(Array.isArray(amount) ? amount[0] : amount);
    if (!Number.isFinite(resolvedAmount)) {
      setStatus('error');
      return;
    }

    const confirm = async () => {
      try {
        await confirmPayment({
          orderId: Array.isArray(orderId) ? orderId[0] : orderId,
          paymentKey: Array.isArray(paymentKey) ? paymentKey[0] : paymentKey,
          amount: resolvedAmount,
          programId: reservationData?.program_id ?? 0,
          reservationData: reservationData!,
        });
        router.replace(`/${currentLocale}${ROUTES.RESERVATIONS_COMPLETE}`);
      } catch {
        showToast({ title: t('payment.tossFailedDescription'), icon: 'exclaim' });
        setStatus('error');
      }
    };

    confirm();
  }, [router, confirmPayment, currentLocale, showToast, t]);

  const meta = createPageMeta({
    pageTitle: t('payment.title'),
    description: tCommon('app.description'),
    path: router.asPath || '/reservations/payment/success',
    noindex: true,
  });

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={t('payment.title')}>
        {isDesktop ? (
          <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
        ) : (
          <AppBar onBackClick={router.back} leftButton={true} buttonType="dark" />
        )}
        <div css={pageWrapper}>
          {status === 'loading' ? (
            <Loading title={t('payment.tossProcessingTitle')} fullHeight />
          ) : (
            <div css={errorContent}>
              <Text typo="title_M" color="text_primary">
                {t('payment.tossFailedTitle')}
              </Text>
              <Text typo="body_M" color="text_secondary">
                {t('payment.tossFailedDescription')}
              </Text>
              <div css={errorAction}>
                <RoundButton
                  size="L"
                  fullWidth
                  onClick={() => router.replace(`/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT}`)}
                >
                  <Text typo="button_L" color="white">
                    {t('payment.tossFailedCta')}
                  </Text>
                </RoundButton>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

const pageWrapper = css`
  padding: 24px 16px 80px;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const errorContent = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  max-width: 320px;
`;

const errorAction = css`
  margin-top: 16px;
`;
