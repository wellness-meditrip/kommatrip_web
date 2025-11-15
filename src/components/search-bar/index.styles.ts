import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  justify-content: flex-start;
  z-index: ${theme.zIndex.searchBar};

  width: 100%;
  max-width: ${theme.size.maxWidth};
`;

export const searchBar = css`
  display: flex;
  align-items: center;

  width: 100%;
  height: 48px;
  margin: 12px 20px;
  padding: 0 16px;
  border: 2px solid ${theme.colors.border_default};
  border-radius: 32px;

  background: ${theme.colors.bg_default};
`;

export const input = css`
  width: 100%;

  font-size: ${theme.typo.body_M};
  text-align: left;

  ::placeholder {
    color: ${theme.colors.primary30};
  }
`;

export const button = ({ isLeft }: { isLeft: boolean }) => css`
  flex-shrink: 0;

  width: 24px;
  height: 24px;
  margin: ${isLeft ? '0 8px 0 0' : '0 0 0 8px'};
`;
