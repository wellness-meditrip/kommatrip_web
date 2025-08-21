import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;

  background-color: ${theme.colors.bg_default};
`;
export const image = css`
  border: 1px solid ${theme.colors.gray200};
  border-radius: 8px;

  background-color: black;
`;
export const content = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const item = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;
export const header = css`
  display: flex;
  gap: 12px;

  margin-bottom: 6px;
  padding: 18px;

  background-color: ${theme.colors.white};
`;

export const container = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  min-height: calc(100vh - ${theme.size.gnbHeight});
  padding: 16px 20px 20px;
`;

export const submitButton = css`
  margin-top: 14px;
  padding: 18px;
`;

//

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

export const itemWrapper = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  padding: 18px;
  border-radius: 21px;

  background-color: ${theme.colors.white};
`;
