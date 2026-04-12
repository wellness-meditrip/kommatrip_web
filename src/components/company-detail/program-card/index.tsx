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
  discountedPriceText,
  discountPriceGroup,
  discountRateBadge,
  durationGroup,
  durationText,
  infoWrapper,
  itemWrapper,
  itemImage,
  originalPriceText,
  priceGroup,
  programDetails,
  programTitleText,
  programTitleRow,
  detailRow,
  separator,
} from './index.styles';
import type { ProgramPriceDisplay } from '@/utils/the-gate-spa-discount';

interface ProgramCardProps {
  title: string;
  duration: string;
  price: ProgramPriceDisplay;
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
  const renderPrice = (priceDisplay: ProgramPriceDisplay) => {
    if (priceDisplay.type === 'discount') {
      return (
        <span css={discountPriceGroup}>
          <span css={originalPriceText}>{priceDisplay.originalPriceText}</span>
          <span css={discountedPriceText}>{priceDisplay.discountedPriceText}</span>
        </span>
      );
    }

    return priceDisplay.priceText;
  };

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
        <div css={programTitleRow}>
          <Text typo="title_M" color="text_primary" css={programTitleText}>
            {title}
          </Text>
          {price.type === 'discount' && (
            <span css={discountRateBadge}>{price.discountRateText}</span>
          )}
        </div>
        <div css={programDetails}>
          <div css={detailRow}>
            <div css={durationGroup}>
              <Clock width={16} height={16} />
              <Text typo="button_S" color="text_secondary" css={durationText}>
                {duration}
              </Text>
            </div>
            <div css={separator} />
            <Text typo="button_S" color="text_secondary" css={priceGroup}>
              {renderPrice(price)}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
