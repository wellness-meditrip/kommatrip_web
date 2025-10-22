import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 20px;
  border-radius: 12px;

  background-color: ${theme.colors.primary10};
`;

export const inputContainer = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const input = css`
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 8px;

  font-family: inherit;
  font-size: 14px;

  &::placeholder {
    color: ${theme.colors.text_tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary50};
  }
`;

export const nameInputContainer = css`
  display: grid;
  gap: 8px;
`;

export const selectContainer = css`
  position: relative;
`;

export const select = css`
  width: 100%;
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 8px;

  background-color: ${theme.colors.white};
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  font-family: inherit;
  font-size: 14px;
  appearance: none;
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary50};
  }
`;
