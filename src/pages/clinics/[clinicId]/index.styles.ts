import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;

  background: ${theme.colors.white};

  h1 {
    margin: 0 18px;
  }
`;

export const content = css`
  width: 100%;
`;
