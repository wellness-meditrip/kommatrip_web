import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import {
  AppBar,
  CTAButton,
  Empty,
  Layout,
  Text,
  CompanyInfoCard,
  DesktopAppBar,
  Loading,
} from '@/components';
import { theme } from '@/styles';
import {
  ROUTES,
  PAYMENT_WIDGET_CONFIG,
  PaymentMethod,
  PaymentVariantKey,
  isPayNowPaymentMethod,
} from '@/constants';
import { usePostCreateReservationMutation } from '@/queries/reservation';
import { usePostCreatePaymentOrderMutation } from '@/queries/payment';
import { useToast, useMediaQuery, useRequireAuth, useErrorHandler } from '@/hooks';
import { useCurrentLocale } from '@/i18n/navigation';
import { Dim } from '@/components/dim';
import { PaymentLocation } from '@/icons';
import { useTranslations } from 'next-intl';
import { Meta, createPageMeta } from '@/seo';
import type { PaymentOrder } from '@/models/payment';
import type { CurrencyCode } from '@/utils/price';
import { getI18nServerSideProps } from '@/i18n/page-props';

interface ReservationDraft {
  company_id: number;
  company_name: string;
  company_address: string;
  company_tags: string[];
  program_id: number;
  program_name: string;
  program_duration_minutes: number;
  program_price: number;
  preferred_contact: string;
  language_preference: string;
  availability_options: Array<{
    date: string;
    times: string[];
  }>;
  inquiries: string;
  contact_line: string;
  contact_whatsapp: string;
  contact_kakao: string;
  contact_phone: string;
}

const isDev = process.env.NODE_ENV !== 'production';
const logPaymentInfo = (message: string, payload?: Record<string, unknown>) => {
  if (!isDev) return;
  console.info(message, payload);
};

const formatTimeDisplay = (timeString: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

export default function ReservationPaymentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { showErrorToast } = useErrorHandler();
  const t = useTranslations('reservation');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : 'en-US';
  const { isAuthenticated, isLoading: isAuthLoading } = useRequireAuth(false);
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<PaymentMethod>('onSite');
  const isPayNowPayment = isPayNowPaymentMethod(paymentMethodChoice);
  const paymentWidgetConfig = isPayNowPayment ? PAYMENT_WIDGET_CONFIG[paymentMethodChoice] : null;
  const selectedPaymentCurrency: CurrencyCode = paymentWidgetConfig?.currency ?? 'KRW';
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const { mutateAsync: createReservation, isPending } = usePostCreateReservationMutation();
  const { mutateAsync: createPaymentOrder, isPending: isPaymentOrderPending } =
    usePostCreatePaymentOrderMutation();
  const paymentWidgetsRef = useRef<ReturnType<
    Awaited<ReturnType<typeof loadTossPayments>>['widgets']
  > | null>(null);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat(locale).format(price);
  const normalizeCurrency = (currency?: string): CurrencyCode => {
    return currency === 'USD' ? 'USD' : 'KRW';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('reservation_draft');
    if (!stored) return;
    try {
      setDraft(JSON.parse(stored));
    } catch {
      window.sessionStorage.removeItem('reservation_draft');
    }
  }, []);

  const primaryOption = useMemo(() => {
    if (!draft?.availability_options?.length) return null;
    const [first] = draft.availability_options;
    if (!first) return null;
    const [firstTime] = first.times ?? [];
    return { date: first.date, time: firstTime ?? '' };
  }, [draft]);
  const displayAmount =
    isPayNowPayment && paymentOrder ? paymentOrder.amount : (draft?.program_price ?? null);
  const displayCurrency: CurrencyCode = isPayNowPayment
    ? normalizeCurrency(paymentOrder?.currency ?? selectedPaymentCurrency)
    : 'KRW';

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isPayNowPayment || !draft) return;
    if (
      paymentOrder &&
      paymentOrder.program_id === draft.program_id &&
      normalizeCurrency(paymentOrder.currency) === selectedPaymentCurrency
    ) {
      return;
    }
    let isMounted = true;
    const createOrder = async () => {
      try {
        const response = await createPaymentOrder({
          programId: draft.program_id,
          currency: selectedPaymentCurrency,
        });
        if (isMounted) {
          setPaymentOrder(response.order);
        }
      } catch (error) {
        if (isMounted) {
          showErrorToast(error, { fallbackMessage: t('payment.toastPaymentOrderFailed') });
        }
      }
    };
    createOrder();
    return () => {
      isMounted = false;
    };
  }, [
    isPayNowPayment,
    draft,
    paymentOrder,
    selectedPaymentCurrency,
    createPaymentOrder,
    showErrorToast,
    t,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      paymentWidgetsRef.current = null;
      setIsWidgetReady(false);
      setPaymentOrder(null);
      return;
    }
    if (!isPayNowPayment) {
      paymentWidgetsRef.current = null;
      setIsWidgetReady(false);
      setPaymentOrder(null);
      return;
    }
    if (!draft || !paymentOrder) return;
    if (!process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY) {
      showToast({ title: t('payment.toastTossInitFailed'), icon: 'exclaim' });
      return;
    }

    let isMounted = true;
    const initializeWidget = async () => {
      try {
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY!
        );
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        paymentWidgetsRef.current = widgets;
        await widgets.setAmount({
          currency: paymentWidgetConfig?.currency ?? paymentOrder.currency ?? 'KRW',
          value: paymentOrder.amount,
        });
        await widgets.renderPaymentMethods({
          selector: '#toss-payment-methods',
          variantKey: paymentWidgetConfig?.variantKey ?? PaymentVariantKey.KOREA,
        });
        await widgets.renderAgreement({
          selector: '#toss-payment-agreement',
          variantKey: 'AGREEMENT',
        });
        if (isMounted) {
          setIsWidgetReady(true);
        }
      } catch {
        if (isMounted) {
          setIsWidgetReady(false);
          showToast({ title: t('payment.toastTossInitFailed'), icon: 'exclaim' });
        }
      }
    };

    initializeWidget();
    return () => {
      isMounted = false;
    };
  }, [isPayNowPayment, paymentWidgetConfig, draft, paymentOrder, showToast, t, isAuthenticated]);

  useEffect(() => {
    if (!isPayNowPayment) return;
    setPaymentOrder(null);
    setIsWidgetReady(false);
    paymentWidgetsRef.current = null;
  }, [paymentMethodChoice, isPayNowPayment]);

  const meta = createPageMeta({
    pageTitle: t('payment.title'),
    description: tCommon('app.description'),
    path: router.asPath || '/reservations/payment',
    noindex: true,
  });

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    if (!draft) {
      showToast({ title: t('payment.toastMissingDraft'), icon: 'exclaim' });
      return;
    }

    try {
      await createReservation({
        program_id: draft.program_id,
        preferred_contact: draft.preferred_contact,
        language_preference: draft.language_preference as
          | 'korean'
          | 'english'
          | 'chinese'
          | 'japanese',
        availability_options: draft.availability_options,
        inquiries: draft.inquiries,
        contact_line: draft.contact_line,
        contact_whatsapp: draft.contact_whatsapp,
        contact_kakao: draft.contact_kakao,
        contact_phone: draft.contact_phone,
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'reservation_complete',
          JSON.stringify({
            company_name: draft.company_name,
            program_name: draft.program_name,
            program_duration_minutes: draft.program_duration_minutes,
            date: primaryOption?.date ?? '',
            time: primaryOption?.time ?? '',
          })
        );
      }

      router.push(`/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_SUCCESS}`);
    } catch (error) {
      showErrorToast(error, { fallbackMessage: t('payment.toastFailed') });
    }
  };

  const handleTossPayment = async () => {
    if (!isAuthenticated) return;
    if (!draft) {
      showToast({ title: t('payment.toastMissingDraft'), icon: 'exclaim' });
      return;
    }
    if (!paymentOrder) {
      showToast({ title: t('payment.toastMissingPaymentInfo'), icon: 'exclaim' });
      return;
    }
    if (!paymentWidgetsRef.current) {
      showToast({ title: t('payment.toastTossInitFailed'), icon: 'exclaim' });
      return;
    }
    if (typeof window === 'undefined') return;

    const successUrl = `${window.location.origin}/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_SUCCESS}`;
    const failUrl = `${window.location.origin}/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_FAIL}`;

    try {
      window.sessionStorage.setItem('reservation_draft', JSON.stringify(draft));
      logPaymentInfo('[payment][request] prepared order', {
        programId: draft.program_id,
        selectedCurrency: selectedPaymentCurrency,
        orderId: paymentOrder.order_id,
        orderCurrency: paymentOrder.currency,
        orderAmount: paymentOrder.amount,
      });
      await paymentWidgetsRef.current.setAmount({
        currency: selectedPaymentCurrency,
        value: paymentOrder.amount,
      });
      window.sessionStorage.setItem(
        'reservation_payment_context',
        JSON.stringify({
          orderId: paymentOrder.order_id,
          amount: paymentOrder.amount,
          currency: selectedPaymentCurrency,
          programId: draft.program_id,
        })
      );
      await paymentWidgetsRef.current.requestPayment({
        orderId: paymentOrder.order_id,
        orderName: draft.program_name,
        successUrl,
        failUrl,
      });
    } catch {
      showToast({ title: t('payment.toastTossRequestFailed'), icon: 'exclaim' });
    }
  };

  const handleActionClick = () => {
    if (!isAuthenticated) return;
    if (isPayNowPayment) {
      handleTossPayment();
      return;
    }
    setIsModalOpen(true);
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={t('payment.title')}>
          <Loading title={t('loading')} fullHeight />
        </Layout>
      </>
    );
  }

  if (!draft) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={t('payment.title')}>
          {isDesktop ? (
            <DesktopAppBar onSearchChange={() => {}} showSearch={false} disableAuthModal />
          ) : (
            <AppBar
              onBackClick={router.back}
              leftButton={true}
              buttonType="dark"
              title={t('payment.title')}
              backgroundColor="bg_surface1"
            />
          )}
          <div css={emptyContainer}>
            <Empty title={t('payment.missingDraft')} />
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={t('payment.title')}>
        {isDesktop ? (
          <DesktopAppBar onSearchChange={() => {}} showSearch={false} disableAuthModal />
        ) : (
          <AppBar
            onBackClick={router.back}
            leftButton={true}
            buttonType="dark"
            title={t('payment.title')}
            backgroundColor="bg_surface1"
          />
        )}
        <div css={pageWrapper}>
          <div css={contentGrid}>
            <div css={mainColumn}>
              <CompanyInfoCard
                name={draft.company_name}
                address={draft.company_address}
                tags={draft.company_tags}
                addressIconNode={<PaymentLocation width={16} height={16} />}
                variant="payment"
              />

              <div css={infoCard}>
                <Text typo="title_M" color="text_primary">
                  {t('payment.bookingInfo')}
                </Text>
                <div css={infoRow}>
                  <Text typo="body_M" color="text_secondary">
                    {t('payment.date')}
                  </Text>
                  <Text typo="title_S" color="text_primary">
                    {primaryOption ? formatDateDisplay(primaryOption.date) : '-'}
                  </Text>
                </div>
                <div css={infoRow}>
                  <Text typo="body_M" color="text_secondary">
                    {t('payment.time')}
                  </Text>
                  <Text typo="title_S" color="text_primary">
                    {primaryOption ? formatTimeDisplay(primaryOption.time) : '-'}
                  </Text>
                </div>
                <div css={infoRow}>
                  <Text typo="body_M" color="text_secondary">
                    {t('payment.program')}
                  </Text>
                  <Text typo="title_S" color="text_primary" css={programText}>
                    {draft.program_name} ({draft.program_duration_minutes}
                    {t('payment.minutes')})
                  </Text>
                </div>
              </div>
            </div>

            <div css={sideColumn}>
              <div css={sidePanel}>
                <div css={infoCard}>
                  <Text typo="title_M" color="text_primary">
                    {t('payment.paymentMethod')}
                  </Text>
                  <div css={paymentMethodOptions}>
                    <button
                      type="button"
                      css={paymentMethodButton}
                      data-selected={paymentMethodChoice === 'payNowKrw'}
                      onClick={() => setPaymentMethodChoice('payNowKrw')}
                    >
                      <span css={radioDot(paymentMethodChoice === 'payNowKrw')} />
                      <Text typo="body_M" color="text_primary">
                        {t('payment.payNowKrw')}
                      </Text>
                    </button>
                    <button
                      type="button"
                      css={paymentMethodButton}
                      data-selected={paymentMethodChoice === 'payNowUsd'}
                      onClick={() => setPaymentMethodChoice('payNowUsd')}
                    >
                      <span css={radioDot(paymentMethodChoice === 'payNowUsd')} />
                      <Text typo="body_M" color="text_primary">
                        {t('payment.payNowUsd')}
                      </Text>
                    </button>
                    <button
                      type="button"
                      css={paymentMethodButton}
                      data-selected={paymentMethodChoice === 'onSite'}
                      onClick={() => setPaymentMethodChoice('onSite')}
                    >
                      <span css={radioDot(paymentMethodChoice === 'onSite')} />
                      <Text typo="body_M" color="text_primary">
                        {t('payment.payOnSite')}
                      </Text>
                    </button>
                  </div>
                </div>

                {isPayNowPayment && (
                  <div css={infoCard}>
                    <Text typo="title_M" color="text_primary">
                      {t('payment.tossWidgetTitle')}
                    </Text>
                    {!isWidgetReady && (
                      <Text typo="body_M" color="text_secondary">
                        {t('payment.tossPreparing')}
                      </Text>
                    )}
                    <div id="toss-payment-methods" css={widgetBox} />
                    <div id="toss-payment-agreement" css={widgetBox} />
                  </div>
                )}

                <div css={infoCard}>
                  <Text typo="title_M" color="text_primary">
                    {t('payment.paymentAmount')}
                  </Text>
                  <div css={amountRow}>
                    <Text typo="body_M" color="text_secondary">
                      {t('payment.paymentAmountLabel')}
                    </Text>
                    <Text typo="body_M" color="text_primary">
                      {typeof displayAmount === 'number'
                        ? `${formatPrice(displayAmount)} ${displayCurrency}`
                        : '-'}
                    </Text>
                  </div>
                  <div css={divider} />
                  <div css={amountRow}>
                    <Text typo="title_S" color="text_primary">
                      {t('payment.finalPaymentAmount')}
                    </Text>
                    <Text typo="title_S" color="primary50">
                      {typeof displayAmount === 'number'
                        ? `${formatPrice(displayAmount)} ${displayCurrency}`
                        : '-'}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div css={actionBar}>
          <CTAButton
            onClick={handleActionClick}
            disabled={
              isPending ||
              (isPayNowPayment && (isPaymentOrderPending || !paymentOrder || !isWidgetReady))
            }
          >
            {isPayNowPayment ? t('payment.payNow') : t('payment.bookNow')}
          </CTAButton>
        </div>

        {isModalOpen && (
          <>
            <Dim fullScreen onClick={() => setIsModalOpen(false)} />
            <div css={modalCard}>
              <div css={modalText}>
                <Text typo="title_M" color="text_primary">
                  {t('payment.submitTitle')}
                </Text>
                <Text typo="body_M" color="text_tertiary" css={modalDescription}>
                  {t('payment.submitDescription')}
                </Text>
              </div>
              <div css={modalButtonRow}>
                <button css={modalCancel} onClick={() => setIsModalOpen(false)}>
                  <Text typo="body_M" color="text_primary">
                    {t('payment.cancel')}
                  </Text>
                </button>
                <button css={modalSubmit} onClick={handleSubmit}>
                  <Text typo="body_M" color="white">
                    {t('payment.submit')}
                  </Text>
                </button>
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
}

const pageWrapper = css`
  padding: 0 0 120px 0;
  background: ${theme.colors.bg_surface1};

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-bottom: 80px;
  }
`;

const contentGrid = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 24px;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
`;

const mainColumn = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const sideColumn = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    position: sticky;
    top: 24px;
  }
`;

const sidePanel = css`
  @media (min-width: ${theme.breakpoints.desktop}) {
    border: 1px solid ${theme.colors.border_default};
    border-radius: 20px;
    margin: 16px;
    background: ${theme.colors.bg_surface1};
  }
`;

const infoCard = css`
  background: ${theme.colors.white};
  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const infoRow = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const programText = css`
  text-align: right;
`;

const paymentMethodOptions = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const paymentMethodButton = css`
  flex: 1;
  min-width: 140px;
  border-radius: 999px;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border_default};
  background: ${theme.colors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &[data-selected='true'] {
    border-color: ${theme.colors.primary50};
    box-shadow: 0 4px 10px ${theme.colors.grayOpacity50};
  }
`;

const radioDot = (selected: boolean) => css`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid ${selected ? theme.colors.primary50 : theme.colors.border_default};
  background: ${selected ? theme.colors.primary50 : theme.colors.white};
`;

const widgetBox = css`
  border-radius: 12px;
  overflow: hidden;
`;

const amountRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const divider = css`
  height: 1px;
  background: ${theme.colors.border_default};
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
    max-width: 360px;
    margin: 16px auto 0;
    padding: 0 24px 24px;
    background: transparent;
    box-shadow: none;
  }
`;

const modalCard = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${theme.colors.white};
  border-radius: 24px;
  width: calc(100% - 48px);
  max-width: 320px;
  padding: 28px 24px 24px;
  z-index: ${theme.zIndex.dialog};
  text-align: center;
  box-shadow: 0 16px 32px ${theme.colors.grayOpacity200};
`;

const modalText = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const modalDescription = css`
  margin: 0;
  line-height: 1.5;
`;

const modalButtonRow = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const modalButtonBase = css`
  border-radius: 999px;
  padding: 12px 0;
  border: 1px solid ${theme.colors.primary50};
  background: ${theme.colors.white};
  cursor: pointer;
`;

const modalCancel = css`
  ${modalButtonBase};
`;

const modalSubmit = css`
  ${modalButtonBase};
  background: ${theme.colors.primary50};
`;

const emptyContainer = css`
  padding: 40px 16px;
`;

export const getServerSideProps = getI18nServerSideProps(['reservation']);
