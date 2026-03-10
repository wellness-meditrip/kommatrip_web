import type { Interpolation } from '@emotion/react';
import { css } from '@emotion/react';
import ReactSkeleton from 'react-loading-skeleton';
import { Text } from '@/components/text';
import {
  titleBlock,
  horizontalList,
  gridList,
  companyCardSkeleton,
  companyCardSkeletonCompact,
  companyImageSkeleton,
  companyImageSkeletonDefault,
  companyMeta,
  companyMetaDefault,
  tagRow,
  programList,
  programCard,
  programThumb,
  programContent,
  reviewList,
  reviewCard,
  reviewHeader,
  reviewTags,
  reservationList,
  reservationCard,
  reservationCardRow,
  reservationThumb,
  reservationContent,
  reservationButtonRow,
} from './index.styles';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  css?: Interpolation<object>;
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: string;
}

interface CompanyCardSkeletonListProps {
  title?: string;
  count?: number;
  size?: 'default' | 'compact';
  layout?: 'horizontal' | 'grid';
}

interface ProgramCardSkeletonListProps {
  count?: number;
}

interface ReviewCardSkeletonListProps {
  count?: number;
}

interface ReservationCardSkeletonListProps {
  count?: number;
}

export function Skeleton({
  width = '100%',
  height = 12,
  radius = 8,
  css: customCss,
}: SkeletonProps) {
  return (
    <div css={customCss}>
      <ReactSkeleton width={width} height={height} borderRadius={radius} />
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  lastLineWidth = '70%',
}: SkeletonTextProps) {
  return (
    <div css={css({ display: 'flex', flexDirection: 'column', gap })}>
      {Array.from({ length: lines }).map((_, index) => (
        <ReactSkeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          borderRadius={6}
        />
      ))}
    </div>
  );
}

function CompanyCardSkeletonItem({ size = 'default' }: { size?: 'default' | 'compact' }) {
  return (
    <div css={[companyCardSkeleton, size === 'compact' && companyCardSkeletonCompact]}>
      <div css={[companyImageSkeleton, size === 'default' && companyImageSkeletonDefault]}>
        <ReactSkeleton width="100%" height="100%" />
      </div>
      <div css={[companyMeta, size === 'default' && companyMetaDefault]}>
        <ReactSkeleton width="55%" height={18} />
        <ReactSkeleton width="40%" height={14} />
        <div css={tagRow}>
          <ReactSkeleton width={52} height={24} borderRadius={999} />
          <ReactSkeleton width={64} height={24} borderRadius={999} />
          <ReactSkeleton width={48} height={24} borderRadius={999} />
        </div>
      </div>
    </div>
  );
}

export function CompanyCardSkeletonList({
  title,
  count = 3,
  size = 'default',
  layout = 'horizontal',
}: CompanyCardSkeletonListProps) {
  return (
    <section css={css({ width: '100%' })}>
      {title && (
        <div css={titleBlock}>
          <Text typo="title_M" color="text_primary">
            {title}
          </Text>
        </div>
      )}
      <div css={layout === 'horizontal' ? horizontalList : gridList}>
        {Array.from({ length: count }).map((_, index) => (
          <CompanyCardSkeletonItem key={index} size={size} />
        ))}
      </div>
    </section>
  );
}

export function ProgramCardSkeletonList({ count = 3 }: ProgramCardSkeletonListProps) {
  return (
    <div css={programList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} css={programCard}>
          <div css={programThumb}>
            <ReactSkeleton height={110} />
          </div>
          <div css={programContent}>
            <ReactSkeleton width="55%" height={18} />
            <ReactSkeleton width="35%" height={14} />
            <div css={tagRow}>
              <ReactSkeleton width={52} height={22} borderRadius={999} />
              <ReactSkeleton width={52} height={22} borderRadius={999} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewCardSkeletonList({ count = 2 }: ReviewCardSkeletonListProps) {
  return (
    <div css={reviewList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} css={reviewCard}>
          <div css={reviewHeader}>
            <ReactSkeleton width={36} height={36} circle />
            <div css={css({ flex: 1 })}>
              <ReactSkeleton width="30%" height={12} />
              <div css={css({ marginTop: 6 })}>
                <ReactSkeleton width="20%" height={10} />
              </div>
            </div>
          </div>
          <div css={reviewTags}>
            <ReactSkeleton width={56} height={24} borderRadius={999} />
            <ReactSkeleton width={48} height={24} borderRadius={999} />
            <ReactSkeleton width={60} height={24} borderRadius={999} />
          </div>
          <SkeletonText lines={3} lineHeight={12} lastLineWidth="85%" />
          <ReactSkeleton height={160} borderRadius={10} />
        </div>
      ))}
    </div>
  );
}

export function ReservationCardSkeletonList({ count = 3 }: ReservationCardSkeletonListProps) {
  return (
    <div css={reservationList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} css={reservationCard}>
          <div css={reservationCardRow}>
            <div css={reservationThumb}>
              <ReactSkeleton width={80} height={80} borderRadius={8} />
            </div>
            <div css={reservationContent}>
              <ReactSkeleton width="62%" height={18} />
              <ReactSkeleton width="44%" height={14} />
              <ReactSkeleton width="52%" height={14} />
            </div>
          </div>
          <div css={reservationButtonRow}>
            <ReactSkeleton width="100%" height={22} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}
