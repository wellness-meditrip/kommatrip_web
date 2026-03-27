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
  margin: 2px 20px 12px;
  padding: 0 12px;
  border: 2px solid ${theme.colors.border_default};
  border-radius: 32px;

  background: ${theme.colors.bg_default};
`;

export const input = css`
  width: 100%;
  min-width: 0;

  color: ${theme.colors.text_primary};
  font-size: ${theme.typo.body_M};
  text-align: left;

  ::placeholder {
    color: ${theme.colors.text_tertiary};
  }
`;

export const button = ({ isLeft }: { isLeft: boolean }) => css`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;
  margin: ${isLeft ? '0 4px 0 -4px' : '0 -4px 0 4px'};
  border-radius: 999px;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary50};
    outline-offset: 2px;
  }
`;
