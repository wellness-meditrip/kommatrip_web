import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;

  width: fit-content;
  padding: 6px 8px;
  border-radius: 12px;

  background-color: ${theme.colors.white};
`;
