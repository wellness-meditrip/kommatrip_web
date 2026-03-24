import { Text } from '@/components/text';
import { Clock } from '@/icons';
import { useRouter } from 'next/router';
import { useCurrentLocale } from '@/i18n/navigation';
import { ROUTES } from '@/constants';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  isOptimizableImage,
  normalizeSafeImageSrc,
  shouldBypassNextImageOptimization,
} from '@/utils/image';

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
  const normalizedImageSrc = useMemo(() => normalizeSafeImageSrc(image) || '/default.png', [image]);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [normalizedImageSrc]);

  const handleCardClick = () => {
    if (!companyId || !programId) return;
    router.push(`/${currentLocale}${ROUTES.COMPANY_PROGRAM_DETAIL(Number(companyId), programId)}`);
  };

  const imageSrc = hasImageError ? '/default.png' : normalizedImageSrc;
  const shouldUseNextImage = isOptimizableImage(imageSrc);
  const shouldBypassOptimization = shouldBypassNextImageOptimization(imageSrc);

  return (
    <div css={infoWrapper} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {shouldUseNextImage ? (
        <Image
          src={imageSrc}
          alt={title}
          width={80}
          height={80}
          sizes="80px"
          quality={70}
          unoptimized={shouldBypassOptimization}
          css={itemImage}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          css={itemImage}
          onError={() => setHasImageError(true)}
        />
      )}
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
