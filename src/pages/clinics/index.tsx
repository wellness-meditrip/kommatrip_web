import { AppBar } from '@/components/app-bar';
import { GNB } from '@/components/common/gnb';
import { Layout } from '@/components/layout';
import SearchBar from '@/components/search/search-bar';
import { useRouter } from 'next/router';
import { useState } from 'react';

// 병원 리스트 페이지
export default function ClinicListPage() {
  const router = useRouter();
  const [childValue, setChildValue] = useState('');

  const handleValueChange = (value: string) => {
    setChildValue(value);
  };
  return (
    <Layout isAppBarExist={true}>
      <AppBar onBackClick={router.back} showBackButton={false} title="한의원" />
      <SearchBar onValueChange={handleValueChange} />
      병원 리스트 페이지입니다
      <GNB />
    </Layout>
  );
}
