import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: ${theme.colors.white};
  border-radius: 12px;
`;
export const textareaContainer = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
export const textarea = css`
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 100px;

  &::placeholder {
    color: ${theme.colors.text_tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary50};
  }
`;
export const textCount = css`
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  color: ${theme.colors.text_tertiary};
`;
