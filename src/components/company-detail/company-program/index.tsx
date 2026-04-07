import { Text } from '@/components/text';
import { ProgramCard } from '../program-card';
import { useGetProgramCompanyListQuery } from '@/queries/program';
import { useTranslations } from 'next-intl';
import { ProgramCardSkeletonList, Empty } from '@/components';
import { formatNumberWithCurrencyCode } from '@/i18n/format';
import { useCurrentLocale } from '@/i18n/navigation';
import { resolvePrice } from '@/utils/price';

import { container, wrapper } from './index.styles';

interface CompanyProgramProps {
  badges?: string[];
  companyId: number;
}

export function CompanyProgram({ badges, companyId }: CompanyProgramProps) {
  const locale = useCurrentLocale();
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
          programs.map((program) => {
            const resolvedPrice = resolvePrice({
              currency: 'KRW',
              priceInfo: program.price_info,
            });

            return (
              <ProgramCard
                key={program.id}
                title={program.name}
                duration={t('duration', { minutes: program.duration_minutes })}
                price={
                  typeof resolvedPrice === 'number'
                    ? formatNumberWithCurrencyCode(resolvedPrice, locale, 'KRW')
                    : '-'
                }
                image={program.primary_image_url || program.image_urls?.[0] || '/default.png'}
                badges={badges}
                companyId={String(companyId)}
                programId={program.id}
              />
            );
          })
        ) : (
          <Empty title={t('emptyList')} />
        )}
      </div>
    </div>
  );
}
