import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: ${theme.colors.primary0};
  border-radius: 20px;
`;

export const datePickerContainer = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const timeSlotContainer = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

export const timeSlot = css`
  padding: 12px 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 20px;
  background-color: ${theme.colors.white};
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text_secondary};
  cursor: pointer;
  text-align: center;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

export const selectedTimeSlot = css`
  ${timeSlot}
  background-color: ${theme.colors.primary50};
  border-color: ${theme.colors.primary50};
  color: ${theme.colors.white};
`;

export const input = css`
  width: 100%;
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 12px;
  background-color: ${theme.colors.white};
  font-size: 16px;
  color: ${theme.colors.text_primary};
  outline: none;

  &::placeholder {
    color: ${theme.colors.text_tertiary};
  }

  &:focus {
    border-color: ${theme.colors.primary50};
  }
`;
