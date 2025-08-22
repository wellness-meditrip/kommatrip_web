'use client';
import type { CSSObject } from '@emotion/react';
import { Text } from '@/components';
import { wrapper } from './index.styles';
import loading from '../../../../public/json/loading.json';
import Lottie from 'lottie-react';
interface Props {
  title: string;
  onActionButtonClick?: () => void;
  css?: CSSObject;
  fullHeight?: boolean;
}

export function Loading({ title, css, fullHeight = false }: Props) {
  return (
    <div css={[wrapper(fullHeight), css]}>
      <Lottie animationData={loading} style={{ width: 150, height: 150 }} />
      {title && (
        <Text tag="p" typo="title_S" color="gray400">
          {title}
        </Text>
      )}
    </div>
  );
}
