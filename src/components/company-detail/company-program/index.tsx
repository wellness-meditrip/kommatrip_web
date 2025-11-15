import { Text } from '@/components/text';
import { ProgramCard } from '../program-card';
import { useRouter } from 'next/router';

import { container, wrapper } from './index.styles';

interface CompanyProgramProps {
  badges?: string[];
}

export function CompanyProgram({ badges }: CompanyProgramProps) {
  const router = useRouter();
  const { companyId } = router.query;

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
    </div>
  );
}
