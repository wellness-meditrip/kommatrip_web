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

export const keyword = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  margin-top: 14px;
`;

export const unroll = css`
  display: flex;
  justify-content: center;

  width: 100%;
  padding-top: 18px;

  cursor: pointer;
`;
