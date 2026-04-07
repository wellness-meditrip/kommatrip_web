import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { AppBar, DesktopAppBar, Layout, Text } from '@/components';
import { LoginForm } from '@/components/auth/LoginForm';
import { ROUTES } from '@/constants';
import { useMediaQuery, useToast } from '@/hooks';
import { useAuthState } from '@/hooks/auth/use-auth-state';
import { getPrivateI18nServerSideProps } from '@/i18n/page-props';
import { useAuthStore } from '@/store/auth';
import { theme } from '@/styles';
import { createPageMeta, Meta } from '@/seo';
import { getAuthFeedback, resolveLoginErrorFeedbackCode } from '@/utils/auth-feedback';
import { resolveSafeAuthRedirect } from '@/utils/auth-session';

export default function Login() {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthState();
  const authUser = useAuthStore((state) => state.user);
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [inputValue, setInputValue] = useState('');
  const hasHandledError = useRef(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!router.isReady || hasRedirected.current) return;
    if (isAuthLoading || !isAuthenticated || !authUser) return;

    const callbackUrl = resolveSafeAuthRedirect(router.query.callbackUrl);
    const redirectUrl = authUser.InterestSetting === false ? ROUTES.INTEREST : callbackUrl;

    hasRedirected.current = true;
    void router.replace(redirectUrl);
  }, [authUser, isAuthenticated, isAuthLoading, router, router.isReady, router.query.callbackUrl]);

  useEffect(() => {
    if (!router.isReady || hasHandledError.current) return;

    const error = router.query.error;
    if (typeof error !== 'string') return;

    hasHandledError.current = true;
    showToast(getAuthFeedback(t, resolveLoginErrorFeedbackCode(error)));

    const nextQuery = { ...router.query };
    delete nextQuery.error;

    void router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [router, router.isReady, router.pathname, router.query, showToast, t]);

  const handleSearch = () => {
    const query = inputValue.trim() ? `?q=${encodeURIComponent(inputValue)}` : '';
    void router.push(`${ROUTES.SEARCH}${query}`);
  };

  const meta = createPageMeta({
    pageTitle: t('title'),
    description: tCommon('app.description'),
    path: router.asPath || ROUTES.LOGIN,
    noindex: true,
  });

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={t('title')}>
        {isDesktop ? (
          <DesktopAppBar onSearchChange={setInputValue} onSearch={handleSearch} />
        ) : (
          <AppBar leftButton buttonType="dark" onBackClick={() => router.back()} logo="dark" />
        )}

        <div css={container}>
          <div css={gradientHeader}>
            <Text typo="title_XL" color="text_primary">
              {t('title')}
            </Text>
          </div>

          <div css={content}>
            <LoginForm
              variant="page"
              callbackUrl={resolveSafeAuthRedirect(router.query.callbackUrl)}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}

const container = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${theme.colors.bg_default};

  @media (min-width: ${theme.breakpoints.desktop}) {
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
`;

const gradientHeader = css`
  position: relative;
  width: 100%;
  padding: 60px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const content = css`
  width: 100%;
  padding: 0 20px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 480px;
    max-width: 480px;
    padding: 0;
    flex: 0 0 480px;
  }
`;

export const getServerSideProps = getPrivateI18nServerSideProps(['auth']);
