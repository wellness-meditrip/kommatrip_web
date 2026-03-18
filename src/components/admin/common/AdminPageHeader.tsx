import type { ReactNode } from 'react';
import type { Interpolation, Theme } from '@emotion/react';
import { Text } from '@/components/text';
import {
  adminCompactHeader,
  adminCompactHeaderActions,
  adminCompactHeaderCopy,
  adminSectionSubtitle,
  adminSectionTitle,
} from '@/components/admin/admin-console.styles';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  as?: 'div' | 'section' | 'header';
  containerCss?: Interpolation<Theme>;
};

export function AdminPageHeader({
  title,
  description,
  meta,
  actions,
  as = 'section',
  containerCss,
}: AdminPageHeaderProps) {
  const Component = as;

  return (
    <Component css={[adminCompactHeader, containerCss]}>
      <div css={adminCompactHeaderCopy}>
        <Text tag="h1" typo="title_S" css={adminSectionTitle}>
          {title}
        </Text>
        {description ? (
          <Text typo="body10" css={adminSectionSubtitle}>
            {description}
          </Text>
        ) : null}
        {meta}
      </div>

      {actions ? <div css={adminCompactHeaderActions}>{actions}</div> : null}
    </Component>
  );
}
