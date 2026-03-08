import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppBar, DesktopAppBar, Layout } from '@/components';
import { SettingsForm } from '@/components/mypage/settings-form';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { ROUTES } from '@/constants';
import { useTranslations } from 'next-intl';
import { Meta, createPageMeta } from '@/seo';

export default function MyPageSettings() {
  const router = useRouter();
  const tMypage = useTranslations('mypage');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [searchValue, setSearchValue] = useState('');
  const meta = createPageMeta({
    pageTitle: tMypage('settings.title'),
    description: tCommon('app.description'),
    path: router.asPath || '/mypage/settings',
    noindex: true,
  });

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    router.push(`${ROUTES.SEARCH}${query}`);
  };

  useEffect(() => {
    if (!router.isReady || !isDesktop) return;
    router.replace(
      {
        pathname: ROUTES.MYPAGE,
        query: { tab: 'settings' },
      },
      undefined,
      { shallow: true }
    );
  }, [isDesktop, router]);

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={tMypage('settings.title')}>
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
        <SettingsForm variant="page" />
      </Layout>
    </>
  );
}
