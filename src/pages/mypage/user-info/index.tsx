import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppBar, DesktopAppBar, Layout } from '@/components';
import { UserInfoForm } from '@/components/mypage/user-info-form';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { ROUTES } from '@/constants';

export default function MyPageUserInfo() {
  const router = useRouter();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    router.push(`${ROUTES.SEARCH}${query}`);
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
  }, [isDesktop, router.isReady]);

  return (
    <Layout isAppBarExist={false}>
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
  );
}
