import { Text } from '@/components/text';
import { ProgramCard } from '../program-card';
import { useGetProgramCompanyListQuery } from '@/queries/program';

import { container, wrapper } from './index.styles';

interface CompanyProgramProps {
  badges?: string[];
  companyId: number;
}

const formatPrice = (price: number) => `${new Intl.NumberFormat('en-US').format(price)} KRW`;

export function CompanyProgram({ badges, companyId }: CompanyProgramProps) {
  const { data, isLoading } = useGetProgramCompanyListQuery({
    company_id: companyId,
    skip: 0,
    limit: 20,
  });

  const programs = data?.programs ?? [];

  return (
    <div css={container}>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Programs
        </Text>
        {isLoading ? (
          <Text typo="body_M" color="text_secondary">
            프로그램을 불러오는 중...
          </Text>
        ) : programs.length > 0 ? (
          programs.map((program) => (
            <ProgramCard
              key={program.id}
              title={program.name}
              duration={`${program.duration_minutes} mins`}
              price={formatPrice(program.price)}
              image={program.primary_image_url || program.image_urls?.[0] || '/default.png'}
              badges={badges}
              companyId={String(companyId)}
              programId={program.id}
            />
          ))
        ) : (
          <Text typo="body_M" color="text_secondary">
            표시할 프로그램이 없습니다.
          </Text>
        )}
      </div>
    </div>
  );
}
