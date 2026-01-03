import { Layout, GNB, AppBar } from '@/components';
import { theme } from '@/styles';
import { ReservationsPanel } from '@/components/mypage/reservations-panel';

export default function MyBookingsPage() {
  return (
    <Layout isAppBarExist={false} style={{ background: theme.colors.bg_surface1 }}>
      <AppBar logo="light" backgroundColor="green" />
      <ReservationsPanel />
      <GNB />
    </Layout>
  );
}
