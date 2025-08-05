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

export const reviewImage = css`
  margin-top: 14px;
`;

export const reviewInput = css`
  margin-top: 15px;
`;

export const textarea = css`
  width: 100%;
  min-height: 80px;
  padding: 8px;
  ${theme.typo.body10};
  resize: none;
  outline: none;
`;

export const textCount = (upperOne: boolean) => css`
  color: ${upperOne ? theme.colors.blue200 : theme.colors.gray500};
  ${theme.typo.body11};
`;

export const textContainer = css`
  display: flex;
  justify-content: flex-end;

  margin-top: 4px;
`;
