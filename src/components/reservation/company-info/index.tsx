import { ReactNode } from 'react';
import { Text } from '@/components';
import { card, locationIcon, locationRow, tagChip, tagList } from './index.styles';

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
  return (
    <div css={card}>
      <Text typo="title_L" color="text_primary">
        {name}
      </Text>
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
