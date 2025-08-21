import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  width: 100%;
  padding: 0 0 36px;
`;

export const tabHeader = css`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;

  background: ${theme.colors.white};

  cursor: pointer;
  border-bottom: 0.5px solid ${theme.colors.gray500};
`;

export const tabContent = css`
  display: flex;
  position: relative;

  width: 100%;
`;

export const tabContentItem = css`
  width: 100%;
`;
