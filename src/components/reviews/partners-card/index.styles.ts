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

export const plan = css`
  display: flex;
  justify-content: space-between;

  margin-top: 12px;
`;

export const date = css`
  display: flex;
  gap: 11px;
`;
