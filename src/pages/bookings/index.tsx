import { useEffect } from 'react';
import { Layout, GNB, AppBar } from '@/components';
import { theme } from '@/styles';
import { ReservationsPanel } from '@/components/mypage/reservations-panel';
import { useMediaQuery } from '@/hooks';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useCurrentLocale } from '@/i18n/navigation';

export default function MyBookingsPage() {
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);

  useEffect(() => {
    if (!router.isReady || typeof window === 'undefined') return;
    if (!isDesktop) return;
    router.replace({
      pathname: `/${currentLocale}${ROUTES.MYPAGE}`,
      query: { tab: 'reservations' },
    });
  }, [currentLocale, isDesktop, router]);

  return (
    <Layout isAppBarExist={false} style={{ background: theme.colors.bg_surface1 }}>
      <AppBar logo="light" backgroundColor="green" />
      <ReservationsPanel />
      <GNB />
    </Layout>
  );
}
