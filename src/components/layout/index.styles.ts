import { css } from '@emotion/react';
import theme from '@/styles/theme';

export const screen = ({ scrollMode }: { scrollMode: 'container' | 'page' }) => css`
  overscroll-behavior-y: contain;

  width: 100%;
  min-width: ${theme.size.minWidth};
  height: ${scrollMode === 'container' ? '100dvh' : 'auto'};
  min-height: ${scrollMode === 'container' ? 'auto' : '100dvh'};
  margin: 0 auto;
`;

export const main = ({
  isAppBarExist,
  scrollMode,
}: {
  isAppBarExist: boolean;
  scrollMode: 'container' | 'page';
}) => css`
  display: flex;
  flex-direction: column;
  overflow: hidden ${scrollMode === 'container' ? 'auto' : 'visible'};

  width: 100%;
  height: ${scrollMode === 'container' ? '100%' : 'auto'};
  min-height: ${scrollMode === 'container' ? '100%' : '100dvh'};
  padding: ${isAppBarExist ? `${theme.size.appBarHeight} 0 0 0` : 0};

  & > * {
    flex-shrink: 0;
  }
`;
