import { Text } from '@/components/text';
import { ProgramCard } from '../program-card';
import { useRouter } from 'next/router';

import { container, wrapper } from './index.styles';
import { CTAButton } from '@/components';
import { ROUTES } from '@/constants';

interface CompanyProgramProps {
  badges?: string[];
}

export function CompanyProgram({ badges }: CompanyProgramProps) {
  const router = useRouter();
  const { companyId } = router.query;

  const handleReserveClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 로그인된 상태 → 예약페이지로 이동
      router.push(ROUTES.RESERVATIONS);
    } else {
      // 로그인 안 된 상태 → RN에 로그인 요청
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOGIN_REQUEST' }));
    }
  };
  return (
    <div css={container}>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Programs
        </Text>
        <ProgramCard
          title="Detox & Slimming"
          duration="90 mins"
          price="500,000 KRW"
          image="/default.png"
          badges={badges}
          companyId={companyId as string}
        />

        <ProgramCard
          title="Natural Spa"
          duration="90 mins"
          price="500,000 KRW"
          image="/default.png"
          badges={badges}
          companyId={companyId as string}
        />
      </div>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          You will also like
        </Text>
        {/* <div css={itemWrapper}>업체 카드 리스트</div> */}
      </div>
      <CTAButton onClick={handleReserveClick}>예약하기</CTAButton>
    </div>
  );
}
