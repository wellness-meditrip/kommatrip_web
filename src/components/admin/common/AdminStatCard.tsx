import type { ReactNode } from 'react';
import { Text } from '@/components/text';
import {
  adminStatCard,
  adminStatLabel,
  adminStatValue,
} from '@/components/admin/admin-console.styles';

type AdminStatCardProps = {
  label: string;
  value: ReactNode;
  as?: 'article' | 'div';
};

export function AdminStatCard({ label, value, as = 'article' }: AdminStatCardProps) {
  const Component = as;

  return (
    <Component css={adminStatCard}>
      <Text typo="body10" css={adminStatLabel}>
        {label}
      </Text>
      <Text typo="title1" css={adminStatValue}>
        {value}
      </Text>
    </Component>
  );
}
