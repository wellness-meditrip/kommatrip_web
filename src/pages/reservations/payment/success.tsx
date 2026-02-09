import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { css } from '@emotion/react';
import { Layout, RoundButton, Text, Empty, AppBar, DesktopAppBar, Loading } from '@/components';
import { Meta, createPageMeta } from '@/seo';
import { Check } from '@/icons';
import { theme } from '@/styles';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useCurrentLocale } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/hooks';
import { usePostConfirmPaymentMutation } from '@/queries/payment';
import type { ReservationDataForPaymentConfirm } from '@/models/payment';
import { useAuthStore } from '@/store/auth';
import { getCookie } from '@/utils/cookie';
import { waitForAuthReady } from '@/utils/auth-refresh';

interface ReservationCompleteData {
  company_name: string;
  program_name: string;
  program_duration_minutes: number;
  date: string;
  time: string;
}

const formatConfirmationDate = (
  date: string,
  time: string,
  locale: string,
  formatDateTime: (values: { date: string; time: string }) => string
) => {
  if (!date || !time) return '';
  const dateTime = new Date(`${date}T${time}`);
  if (Number.isNaN(dateTime.getTime())) return '';
  const dateText = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(dateTime);
  const timeText = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateTime);
  return formatDateTime({ date: dateText, time: timeText });
};

export default function ReservationPaymentSuccessPage() {
  const router = useRouter();
  const t = useTranslations('reservation');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : 'en-US';
  const [data, setData] = useState<ReservationCompleteData | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const hasConfirmedRef = useRef(false);
  const { mutateAsync: confirmPayment } = usePostConfirmPaymentMutation();
  const redirectToFail = useCallback(
    (message?: string) => {
      const basePath = `/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_FAIL}`;
      if (message) {
        router.replace({ pathname: basePath, query: { message } });
        return;
      }
      router.replace(basePath);
    },
    [currentLocale, router]
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window === 'undefined') return;
    const { paymentKey, orderId, amount } = router.query;
    const hasPaymentQuery = !!paymentKey && !!orderId && !!amount;

    if (hasPaymentQuery && !hasConfirmedRef.current) {
      hasConfirmedRef.current = true;
      const storedDraft = window.sessionStorage.getItem('reservation_draft');
      if (!storedDraft) {
        setIsConfirming(false);
        redirectToFail();
        return;
      }

      const confirmWithAuth = async () => {
        let reservationData: ReservationDataForPaymentConfirm | null = null;
        let completeData: ReservationCompleteData | null = null;
        try {
          const draft = JSON.parse(storedDraft);
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
          completeData = {
            company_name: draft.company_name,
            program_name: draft.program_name,
            program_duration_minutes: draft.program_duration_minutes,
            date: draft.availability_options?.[0]?.date ?? '',
            time: draft.availability_options?.[0]?.times?.[0] ?? '',
          };
        } catch {
          redirectToFail();
          return;
        }

        const resolvedAmount = Number(Array.isArray(amount) ? amount[0] : amount);
        if (!Number.isFinite(resolvedAmount) || !reservationData || !completeData) {
          redirectToFail();
          return;
        }

        const ensureAccessToken = async () => {
          let token = useAuthStore.getState().accessToken;
          if (token) return token;
          const refreshToken = getCookie('refreshToken');
          if (!refreshToken) return null;
          await waitForAuthReady();
          for (let i = 0; i < 30; i += 1) {
            token = useAuthStore.getState().accessToken;
            if (token) return token;
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          return useAuthStore.getState().accessToken;
        };

        setIsConfirming(true);
        const token = await ensureAccessToken();
        if (!token) {
          setIsConfirming(false);
          redirectToFail();
          return;
        }

        confirmPayment({
          orderId: Array.isArray(orderId) ? orderId[0] : orderId,
          paymentKey: Array.isArray(paymentKey) ? paymentKey[0] : paymentKey,
          amount: resolvedAmount,
          programId: reservationData.program_id,
          reservationData,
        })
          .then(() => {
            window.sessionStorage.setItem('reservation_complete', JSON.stringify(completeData));
            setData(completeData);
          })
          .catch((error) => {
            window.sessionStorage.removeItem('reservation_complete');
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            if (status && status >= 500) {
              router.replace(`/${currentLocale}/500`);
              return;
            }
            const responseMessage =
              axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message;
            const fallbackMessage = status ? `HTTP ${status}` : undefined;
            redirectToFail(responseMessage || fallbackMessage);
          })
          .finally(() => {
            setIsConfirming(false);
          });
      };

      void confirmWithAuth();
      return;
    }

    const stored = window.sessionStorage.getItem('reservation_complete');
    if (!stored) return;
    try {
      setData(JSON.parse(stored));
    } catch {
      window.sessionStorage.removeItem('reservation_complete');
    }
  }, [router.isReady, router.query, confirmPayment, redirectToFail, currentLocale, router]);

  useEffect(() => {
    if (isConfirming) return;
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('reservation_complete');
    if (!stored) return;
    try {
      setData(JSON.parse(stored));
    } catch {
      window.sessionStorage.removeItem('reservation_complete');
    }
  }, [isConfirming]);

  const confirmationDate = useMemo(() => {
    if (!data) return '';
    return formatConfirmationDate(data.date, data.time, locale, (values) =>
      t('complete.dateTime', values)
    );
  }, [data, locale, t]);
  const meta = createPageMeta({
    pageTitle: t('complete.title'),
    description: tCommon('app.description'),
    path: router.asPath || '/reservations/payment/success',
    noindex: true,
  });

  return (
    <>
      <Meta {...meta} />
      <Layout
        isAppBarExist={false}
        title={t('complete.title')}
        style={{ background: theme.colors.bg_surface1 }}
        showFooter={false}
      >
        {isDesktop ? (
          <div css={desktopAppBarWrap}>
            <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
          </div>
        ) : (
          <AppBar logo="dark" />
        )}
        <div css={pageWrapper}>
          <div css={contentWrapper}>
            {isConfirming ? (
              <Loading title={t('payment.tossProcessingTitle')} fullHeight />
            ) : (
              <>
                <div css={successSection}>
                  <div css={checkIconWrapper}>
                    <Check width={72} height={72} />
                  </div>
                  <Text tag="h1" typo="title_L" color="primary50" css={successMessage}>
                    {t('complete.title')}
                  </Text>
                  <Text tag="p" typo="body_M" color="text_tertiary">
                    {t('complete.subtitle')}
                  </Text>
                </div>

                {data ? (
                  <div css={reservationCard}>
                    <Text tag="p" typo="body_M" color="text_primary" css={clinicName}>
                      {data.company_name}
                    </Text>
                    <Text tag="p" typo="body_M" color="primary50" css={reservationDateTime}>
                      {confirmationDate || '-'}
                    </Text>
                    <Text tag="p" typo="body_M" color="text_tertiary" css={packageName}>
                      {data.program_name} ({data.program_duration_minutes}min)
                    </Text>
                  </div>
                ) : (
                  <div css={emptyContainer}>
                    <Empty title={t('complete.missingData')} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div css={actionBar}>
          <RoundButton
            onClick={() => router.push(`/${currentLocale}${ROUTES.BOOKINGS}`)}
            size="L"
            fullWidth
          >
            <Text typo="button_L" color="white">
              {t('complete.cta')}
            </Text>
          </RoundButton>
        </div>
      </Layout>
    </>
  );
}

const desktopAppBarWrap = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
  }
`;

const pageWrapper = css`
  padding: 0 0 50px 0;
  background: ${theme.colors.bg_surface1};
`;

const contentWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 80px 16px 0;
  text-align: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 100px 0 0;
  }
`;

const successSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const checkIconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  /* background: ${theme.colors.primary10Opacity40}; */
`;

const successMessage = css`
  margin: 0;
`;

const reservationCard = css`
  background: ${theme.colors.white};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  margin: 0 auto;
`;

const clinicName = css`
  margin: 0;
`;

const reservationDateTime = css`
  margin: 0;
`;

const packageName = css`
  margin: 0;
`;

const emptyContainer = css`
  padding: 40px 16px;
`;

const actionBar = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  background: ${theme.colors.white};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  @media (min-width: ${theme.breakpoints.desktop}) {
    position: static;
    min-width: 400px;
    margin: 24px auto 0;
    padding: 0 24px 24px;
    background: transparent;
    box-shadow: none;
  }
`;
