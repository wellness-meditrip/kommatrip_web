import type { ReactNode } from 'react';
import { Text } from '@/components';
import { card, infoRow, sectionBody } from './index.styles';

interface BookingDetailCardProps {
  children: ReactNode;
}

interface BookingDetailSectionProps {
  title: string;
  children: ReactNode;
}

interface BookingDetailRowProps {
  label: string;
  value: ReactNode;
}

export function BookingDetailCard({ children }: BookingDetailCardProps) {
  return <section css={card}>{children}</section>;
}

export function BookingDetailSection({ title, children }: BookingDetailSectionProps) {
  return (
    <BookingDetailCard>
      <Text typo="title_M" color="text_primary">
        {title}
      </Text>
      <div css={sectionBody}>{children}</div>
    </BookingDetailCard>
  );
}

export function BookingDetailRow({ label, value }: BookingDetailRowProps) {
  return (
    <div css={infoRow}>
      <Text typo="body_M" color="text_tertiary">
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text typo="body_M" color="text_primary">
          {value}
        </Text>
      ) : (
        value
      )}
    </div>
  );
}
