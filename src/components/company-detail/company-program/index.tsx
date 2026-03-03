import { Text } from '@/components/text';
import { ProgramCard } from '../program-card';
import { useGetProgramCompanyListQuery } from '@/queries/program';
import { useTranslations } from 'next-intl';
import { ProgramCardSkeletonList, Empty } from '@/components';
import { resolvePrice } from '@/utils/price';

import { container, wrapper } from './index.styles';

interface CompanyProgramProps {
  badges?: string[];
  companyId: number;
}

const formatPrice = (price?: number) =>
  typeof price === 'number' ? `${new Intl.NumberFormat('en-US').format(price)} KRW` : '-';

export function CompanyProgram({ badges, companyId }: CompanyProgramProps) {
  const t = useTranslations('program');
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
          {t('listTitle')}
        </Text>
        {isLoading ? (
          <ProgramCardSkeletonList count={3} />
        ) : programs.length > 0 ? (
          programs.map((program) => (
            <ProgramCard
              key={program.id}
              title={program.name}
              duration={t('duration', { minutes: program.duration_minutes })}
              price={formatPrice(
                resolvePrice({
                  currency: 'KRW',
                  priceInfo: program.price_info,
                })
              )}
              image={program.primary_image_url || program.image_urls?.[0] || '/default.png'}
              badges={badges}
              companyId={String(companyId)}
              programId={program.id}
            />
          ))
        ) : (
          <Empty title={t('emptyList')} />
        )}
      </div>
    </div>
  );
}
