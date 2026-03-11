import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { Layout, AppBar, DesktopAppBar, RoundButton, Text } from '@/components';
import { useMediaQuery } from '@/hooks';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';
import { useCurrentLocale } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getI18nStaticProps } from '@/i18n/page-props';

export default function NotFoundPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const tCommon = useTranslations('common');

  return (
    <Layout isAppBarExist={false} title={tCommon('error.notFound')} showFooter={false}>
      {isDesktop ? (
        <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
      ) : (
        <AppBar onBackClick={router.back} leftButton={true} buttonType="dark" />
      )}
      <div css={pageWrapper}>
        <div css={content}>
          <Text typo="title_M" color="text_primary">
            {tCommon('error.notFound')}
          </Text>
          <Text typo="body_M" color="text_secondary">
            {tCommon('error.notFoundDescription')}
          </Text>
          <div css={action}>
            <RoundButton
              size="L"
              fullWidth
              onClick={() => router.replace(`/${currentLocale}${ROUTES.HOME}`)}
            >
              <Text typo="button_L" color="white">
                {tCommon('button.home')}
              </Text>
            </RoundButton>
          </div>
        </div>
      </div>
    </Layout>
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

export const getStaticProps = getI18nStaticProps(['common']);
