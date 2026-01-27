import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { AppBar, DesktopAppBar, Layout, RoundButton, Text } from '@/components';
import { theme } from '@/styles';
import { useTranslations } from 'next-intl';
import { useCurrentLocale } from '@/i18n/navigation';
import { ROUTES } from '@/constants';
import { Meta, createPageMeta } from '@/seo';
import { useMediaQuery } from '@/hooks';

export default function ReservationPaymentFailPage() {
  const router = useRouter();
  const t = useTranslations('reservation');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();

  const errorMessage = useMemo(() => {
    const message = router.query.message;
    if (!message) return '';
    return Array.isArray(message) ? message[0] : message;
  }, [router.query.message]);

  const meta = createPageMeta({
    pageTitle: t('payment.title'),
    description: tCommon('app.description'),
    path: router.asPath || '/reservations/payment/fail',
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
          <div css={content}>
            <Text typo="title_M" color="text_primary">
              {t('payment.tossFailedTitle')}
            </Text>
            <Text typo="body_M" color="text_secondary">
              {t('payment.tossFailedDescription')}
            </Text>
            {errorMessage && (
              <Text typo="body_S" color="text_tertiary">
                {errorMessage}
              </Text>
            )}
            <div css={action}>
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

const content = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  max-width: 320px;
`;

const action = css`
  margin-top: 16px;
`;
