import { Text } from '@/components/text';
import { Clock } from '@/icons';
import { useRouter } from 'next/router';
import { useCurrentLocale } from '@/i18n/navigation';
import { ROUTES } from '@/constants';

import {
  infoWrapper,
  itemWrapper,
  itemImage,
  programDetails,
  detailRow,
  separator,
} from './index.styles';

interface ProgramCardProps {
  title: string;
  duration: string;
  price: string;
  image: string;
  badges?: string[];
  companyId?: string;
  programId?: number;
}

export function ProgramCard({
  title,
  duration,
  price,
  image,
  companyId,
  programId,
}: ProgramCardProps) {
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  const handleCardClick = () => {
    if (!companyId || !programId) return;
    router.push(`/${currentLocale}${ROUTES.COMPANY_PROGRAM_DETAIL(Number(companyId), programId)}`);
  };

  return (
    <div css={infoWrapper} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <img src={image} alt="program" css={itemImage} />
      <div css={itemWrapper}>
        <Text typo="title_M" color="text_primary">
          {title}
        </Text>
        <div css={programDetails}>
          <div css={detailRow}>
            <Clock width={16} height={16} />
            <Text typo="button_S" color="text_secondary">
              {duration}
            </Text>
            <div css={separator} />
            <Text typo="button_S" color="text_secondary">
              {price}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
