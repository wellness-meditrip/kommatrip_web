import { css } from '@emotion/react';
import { theme } from '@/styles';

export const toast = css`
  display: flex;
  align-items: center;
  gap: 6px;
  position: fixed;
  bottom: calc(${theme.size.gnbHeight} + 18px);
  left: 50%;
  transform: translateX(-50%);
  z-index: ${theme.zIndex.toast};

  width: calc(100% - 18px - 18px);
  max-width: calc(${theme.size.maxWidth} - 18px - 18px);
  padding: 10px;
  border-radius: 18px;

  background: ${theme.colors.grayOpacity400};
`;
