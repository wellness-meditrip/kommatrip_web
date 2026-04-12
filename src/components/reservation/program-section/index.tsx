import { useTranslations } from 'next-intl';
import { Text } from '@/components';
import { Chevron, Clock } from '@/icons';
import { css } from '@emotion/react';
import { Skeleton } from '@/components/common/skeleton';
import type { ProgramPriceDisplay } from '@/utils/the-gate-spa-discount';
import {
  chevronIcon,
  discountedPriceText,
  discountPriceGroup,
  discountRateBadge,
  durationGroup,
  durationText,
  originalPriceText,
  programCard,
  programImage,
  programInfo,
  programMetaRow,
  priceGroup,
  programTitleText,
  programTitleRow,
  sectionCard,
  sectionContent,
  sectionHeader,
} from './index.styles';

interface ProgramListItem {
  id: number;
  name: string;
  price_info: {
    krw: number;
    usd: number;
  };
  duration_minutes: number;
  primary_image_url: string;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  programs: ProgramListItem[];
  selectedProgramId: number | null;
  onSelectProgram: (programId: number) => void;
  formatDuration: (minutes?: number) => string;
  formatPrice: (priceInfo?: { krw: number; usd: number }) => ProgramPriceDisplay;
}

export function ProgramSection({
  isOpen,
  onToggle,
  isLoading = false,
  programs,
  selectedProgramId,
  onSelectProgram,
  formatDuration,
  formatPrice,
}: Props) {
  const t = useTranslations('reservation');
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
    <div css={sectionCard}>
      <div css={sectionHeader} onClick={onToggle}>
        <Text typo="title_M" color="text_primary">
          {t('form.programs.title')}
        </Text>
        <div css={chevronIcon(isOpen)}>
          <Chevron width={24} height={24} />
        </div>
      </div>
      {isOpen && (
        <div css={sectionContent}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} css={[programCard(false), skeletonCard]}>
                <Skeleton width={72} height={72} radius={8} />
                <div css={programInfo}>
                  <Skeleton width="60%" height={18} />
                  <Skeleton width="45%" height={14} />
                </div>
              </div>
            ))}

          {!isLoading && programs.length === 0 && (
            <Text typo="body_S" color="text_tertiary">
              {t('form.programs.empty')}
            </Text>
          )}

          {!isLoading &&
            programs.map((program) => {
              const priceDisplay = formatPrice(program.price_info);

              return (
                <div
                  key={program.id}
                  css={programCard(selectedProgramId === program.id)}
                  onClick={() => onSelectProgram(program.id)}
                >
                  <img
                    src={program.primary_image_url || '/default.png'}
                    alt={program.name}
                    css={programImage}
                  />
                  <div css={programInfo}>
                    <div css={programTitleRow}>
                      <Text typo="title_S" color="text_primary" css={programTitleText}>
                        {program.name}
                      </Text>
                      {priceDisplay.type === 'discount' && (
                        <span css={discountRateBadge}>{priceDisplay.discountRateText}</span>
                      )}
                    </div>
                    <div css={programMetaRow}>
                      <div css={durationGroup}>
                        <Clock width={14} height={14} />
                        <Text typo="body_S" color="text_tertiary" css={durationText}>
                          {formatDuration(program.duration_minutes)}
                        </Text>
                      </div>
                      <Text typo="body_S" color="text_tertiary">
                        |
                      </Text>
                      <Text typo="body_S" color="text_tertiary" css={priceGroup}>
                        {renderPrice(priceDisplay)}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

const skeletonCard = css`
  cursor: default;
`;
