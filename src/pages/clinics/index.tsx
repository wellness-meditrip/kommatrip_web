import { AppBar } from '@/components/app-bar';
import { GNB } from '@/components/common/gnb';
import { Layout } from '@/components/layout';
import { useRouter } from 'next/router';

// 병원 리스트 페이지
export default function ClinicListPage() {
  const router = useRouter();

  return (
    <Layout isAppBarExist={true}>
      <AppBar onBackClick={router.back} showBackButton={false} title="한의원" />
      병원 리스트 페이지입니다
      <GNB />
    </Layout>
  );
}
