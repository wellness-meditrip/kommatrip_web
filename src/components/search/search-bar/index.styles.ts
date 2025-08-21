import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: fixed;
  top: 52px;
  z-index: ${theme.zIndex.searchBar};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  height: 80px;
  padding: 16px 20px;

  background-color: ${theme.colors.white};
`;

export const searchBar = css`
  display: flex;
  align-items: center;

  width: 100%;
  height: 100%;
  padding: 0 16px;
  border: 1px solid ${theme.colors.bg_default};
  border-radius: 20px;

  background: ${theme.colors.primary0};
`;

export const input = css`
  width: 100%;

  font-size: ${theme.typo.body_M};
  text-align: left;
  ::placeholder {
    color: ${theme.colors.text_tertiary};
  }
`;

export const button = css`
  width: 24px;
  height: 24px;
  margin: 0 8px 0 0;
`;
