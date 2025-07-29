import { HTMLAttributes, ReactNode } from 'react';
import { colors, typography } from '@/styles';
import { jsx, css } from '@emotion/react';
import { TEXT_TAGS } from './tags';

export const TAGS = TEXT_TAGS;

type KeyOfTags = keyof typeof TEXT_TAGS;
type KeyOfTypography = keyof typeof typography;
type KeyOfColors = keyof typeof colors;

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tag?: KeyOfTags;
  color?: KeyOfColors;
  typo: KeyOfTypography;
  children: ReactNode;
}

export function Text({ tag = 'span', color = 'black', typo, children, ...props }: Props) {
  return jsx(
    tag,
    {
      css: css`
        color: ${colors[color]};
        ${typography[typo]};
        white-space: pre-wrap;
      `,
      ...props,
    },
    [<>{children}</>]
  );
}
