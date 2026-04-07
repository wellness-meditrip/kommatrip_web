import { useEffect, useState } from 'react';
import { AppBar, DesktopAppBar, Layout } from '@/components';
import { UserInfoForm } from '@/components/mypage/user-info-form';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { ROUTES } from '@/constants';
import { useLocalizedRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Meta, createPageMeta } from '@/seo';
import { getPrivateI18nServerSideProps } from '@/i18n/page-props';

export default function MyPageUserInfo() {
  const router = useLocalizedRouter();
  const tMypage = useTranslations('mypage');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [searchValue, setSearchValue] = useState('');
  const meta = createPageMeta({
    pageTitle: tMypage('detail.userInfo'),
    description: tCommon('app.description'),
    path: router.asPath || '/mypage/user-info',
    noindex: true,
  });

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    void router.push(`${router.localize(ROUTES.SEARCH)}${query}`);
  };

  useEffect(() => {
    if (!router.isReady || !isDesktop) return;
    router.replace(
      {
        pathname: ROUTES.MYPAGE,
        query: { tab: 'user-info' },
      },
      undefined,
      { shallow: true }
    );
  }, [isDesktop, router]);

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={tMypage('detail.userInfo')}>
        {isDesktop ? (
          <DesktopAppBar onSearchChange={setSearchValue} onSearch={handleSearch} />
        ) : (
          <AppBar
            leftButton
            buttonType="dark"
            onBackClick={() => router.back()}
            logo="dark"
            backgroundColor="bg_surface1"
          />
        )}
        <UserInfoForm variant="page" />
      </Layout>
    </>
  );
}

export const getServerSideProps = getPrivateI18nServerSideProps(['mypage']);
