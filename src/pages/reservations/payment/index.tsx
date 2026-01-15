import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import {
  AppBar,
  CTAButton,
  Empty,
  Layout,
  Text,
  CompanyInfoCard,
  DesktopAppBar,
} from '@/components';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';
import { usePostCreateReservationMutation } from '@/queries/reservation';
import { useToast, useMediaQuery } from '@/hooks';
import { useCurrentLocale } from '@/i18n/navigation';
import { Dim } from '@/components/dim';
import { PaymentLocation } from '@/icons';
import { useTranslations } from 'next-intl';

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

const formatTimeDisplay = (timeString: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

export default function ReservationPaymentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations('reservation');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : currentLocale === 'ja' ? 'ja-JP' : 'en-US';
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: createReservation, isPending } = usePostCreateReservationMutation();

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

  const handleSubmit = async () => {
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

      router.push(`/${currentLocale}${ROUTES.RESERVATIONS_COMPLETE}`);
    } catch {
      showToast({ title: t('payment.toastFailed'), icon: 'exclaim' });
    }
  };

  if (!draft) {
    return (
      <Layout isAppBarExist={false} title={t('payment.title')}>
        {isDesktop ? (
          <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
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
    );
  }

  return (
    <Layout isAppBarExist={false} title={t('payment.title')}>
      {isDesktop ? (
        <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
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
                <div css={paymentMethod}>
                  <div css={radioSelected} />
                  <Text typo="body_M" color="text_primary">
                    {t('payment.payOnSite')}
                  </Text>
                </div>
              </div>

              <div css={infoCard}>
                <Text typo="title_M" color="text_primary">
                  {t('payment.paymentAmount')}
                </Text>
                <div css={amountRow}>
                  <Text typo="body_M" color="text_secondary">
                    {t('payment.paymentAmountLabel')}
                  </Text>
                  <Text typo="body_M" color="text_primary">
                    {formatPrice(draft.program_price)} {t('payment.currency')}
                  </Text>
                </div>
                <div css={divider} />
                <div css={amountRow}>
                  <Text typo="title_S" color="text_primary">
                    {t('payment.finalPaymentAmount')}
                  </Text>
                  <Text typo="title_S" color="primary50">
                    {formatPrice(draft.program_price)} {t('payment.currency')}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div css={actionBar}>
        <CTAButton onClick={() => setIsModalOpen(true)} disabled={isPending}>
          {t('payment.bookNow')}
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

const paymentMethod = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const radioSelected = css`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.primary50};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${theme.colors.primary50};
    transform: translate(-50%, -50%);
  }
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
