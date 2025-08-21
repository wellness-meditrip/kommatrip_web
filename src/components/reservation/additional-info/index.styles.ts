import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 20px;
  border-radius: 12px;

  background-color: ${theme.colors.primary0};
`;
export const textareaContainer = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
export const textarea = css`
  min-height: 100px;
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 8px;

  font-family: inherit;
  font-size: 14px;
  resize: none;

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

  color: ${theme.colors.text_tertiary};
  font-size: 12px;
`;
