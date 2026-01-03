import { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { Layout, RoundButton, Text, Empty, AppBar, DesktopAppBar } from '@/components';
import { Check } from '@/icons';
import { theme } from '@/styles';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useCurrentLocale } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/hooks';

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

export default function ReservationCompletePage() {
  const router = useRouter();
  const t = useTranslations('reservation');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : currentLocale === 'ja' ? 'ja-JP' : 'en-US';
  const [data, setData] = useState<ReservationCompleteData | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('reservation_complete');
    if (!stored) return;
    try {
      setData(JSON.parse(stored));
    } catch {
      window.sessionStorage.removeItem('reservation_complete');
    }
  }, []);

  const confirmationDate = useMemo(() => {
    if (!data) return '';
    return formatConfirmationDate(data.date, data.time, locale, (values) =>
      t('complete.dateTime', values)
    );
  }, [data, locale, t]);

  return (
    <Layout isAppBarExist={false}>
      {isDesktop ? (
        <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
      ) : (
        <AppBar logo="dark" />
      )}
      <div css={pageWrapper}>
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
  );
}

const pageWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 24px 40px;
  gap: 24px;
  background: ${theme.colors.bg_surface1};
  min-height: calc(100vh - 120px);

  @media (min-width: ${theme.breakpoints.desktop}) {
    max-width: 720px;
    margin: 0 auto;
    padding: 140px 24px 64px;
  }
`;

const successSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const checkIconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const successMessage = css`
  text-align: center;
  line-height: 1.4;
`;

const reservationCard = css`
  width: 100%;
  max-width: 340px;
  padding: 20px 18px;
  border-radius: 16px;
  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    max-width: 480px;
  }
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

const actionBar = css`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 18px 24px;
  background: ${theme.colors.bg_surface1};

  @media (min-width: ${theme.breakpoints.desktop}) {
    position: static;
    max-width: 360px;
    margin: 0 auto 40px;
    padding: 0 24px;
  }
`;

const emptyContainer = css`
  width: 100%;
`;
