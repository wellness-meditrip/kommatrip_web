import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  position: fixed;
  top: 0;
  z-index: ${theme.zIndex.appBar};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  height: 52px;
  margin: 0 auto;
`;

export const contents = css`
  display: flex;
  align-items: center;
  position: relative;

  width: 100%;
  height: 100%;
  padding-left: 16px;
`;

export const center = css`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
`;
