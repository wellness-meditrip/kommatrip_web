import { css } from '@emotion/react';
import theme from '@/styles/theme';

export const wrapper = css`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  position: fixed;
  bottom: 0;
  z-index: ${theme.zIndex.gnb};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  margin: 0 auto;
  padding: 4px 0;

  background: ${theme.colors.white};
  box-shadow: 0 -4px 10px 0 ${theme.colors.grayOpacity50};

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
`;

export const menuItem = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;

  width: 71px;
  min-height: 48px;
  padding: 4px 8px;
  border-radius: 12px;

  white-space: nowrap;
`;
