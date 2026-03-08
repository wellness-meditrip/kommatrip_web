import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  padding: 18px;
  border-radius: 21px;

  background-color: ${theme.colors.white};
`;

export const stars = css`
  margin: 13px 0 3px;
`;
