import { css } from '@emotion/react';
import theme from '@/styles/theme';

export const screen = css`
  overscroll-behavior-y: contain;

  width: 100%;
  min-width: ${theme.size.minWidth};
  max-width: ${theme.size.maxWidth};
  height: 100dvh;
  margin: 0 auto;
`;

export const main = ({ isAppBarExist }: { isAppBarExist: boolean }) => css`
  display: flex;
  flex-direction: column;
  overflow: scroll;

  width: 100%;
  height: 100%;
  padding: ${isAppBarExist ? `${theme.size.appBarHeight} 0 0 0` : 0};
`;
