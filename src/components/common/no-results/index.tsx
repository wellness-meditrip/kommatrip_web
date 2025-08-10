'use client';
import type { CSSObject } from '@emotion/react';
import { Text } from '@/components';
import { wrapper, iconWrapper, icon, textContainer } from './index.styles';

interface Props {
  title: string;
  subtitle?: string;
  css?: CSSObject;
}

export function NoResults({ title, subtitle, css }: Props) {
  return (
    <div css={[wrapper, css]}>
      <div css={iconWrapper}>
        <div css={icon}>!</div>
      </div>
      <div css={textContainer}>
        <Text tag="p" typo="title_S" color="primary70">
          {title}
        </Text>
        {subtitle && (
          <Text tag="p" typo="body_M" color="primary70">
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  );
}
