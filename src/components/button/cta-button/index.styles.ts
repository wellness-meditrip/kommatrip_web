import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 21px;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${theme.zIndex.ctaButton};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  padding: 0 18px 21px;

  background: ${theme.colors.whiteGradient100} !important;
`;
