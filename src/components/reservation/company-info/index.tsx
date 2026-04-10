import { ReactNode } from 'react';
import { Text } from '@/components';
import { isTheGateSpaCompany } from '@/utils/the-gate-spa-discount';
import {
  card,
  discountBadge,
  locationIcon,
  locationRow,
  tagChip,
  tagList,
  titleRow,
} from './index.styles';

interface Props {
  name: string;
  address?: string;
  tags?: string[];
  addressIconNode?: ReactNode;
  variant?: 'reservation' | 'payment';
}

export function CompanyInfoCard({
  name,
  address,
  tags = [],
  addressIconNode,
  variant = 'reservation',
}: Props) {
  const isDiscountCompany = isTheGateSpaCompany({ name });

  return (
    <div css={card}>
      <div css={titleRow}>
        <Text typo="title_L" color="text_primary">
          {name}
        </Text>
        {isDiscountCompany && <span css={discountBadge}>30%</span>}
      </div>
      {address && (
        <div css={locationRow}>
          {addressIconNode && <span css={locationIcon}>{addressIconNode}</span>}
          <Text typo="body_M" color="text_tertiary">
            {address}
          </Text>
        </div>
      )}
      {tags.length > 0 && (
        <div css={tagList}>
          {tags.map((tagText, index) => (
            <div key={`${tagText}-${index}`} css={tagChip(variant)}>
              <Text typo="body_S" color="text_secondary">
                {tagText}
              </Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
