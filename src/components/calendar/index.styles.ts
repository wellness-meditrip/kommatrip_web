import { css } from '@emotion/react';
import { theme } from '@/styles';

export const calendarContainer = css`
  margin: 24px 0;
`;

export const calendarHeader = css`
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 16px;
`;

export const calendarContent = css`
  border-radius: 8px;

  background-color: ${theme.colors.bg_default};
`;
export const monthNavigation = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  padding: 16px;
`;

export const navigationButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;

  background-color: transparent;

  transition: opacity 0.2s ease;

  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

export const calendarGrid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  gap: 4px;

  padding: 0 7px 7px;
`;

export const dayHeader = css`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 32px;
  padding: 8px 0;
`;

export const dayCell = css`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 40px;

  transition: background-color 0.2s ease;

  cursor: pointer;

  &:hover {
    border-radius: 4px;

    background-color: ${theme.colors.primary40};
  }
`;

export const dayNumber = css`
  color: ${theme.colors.primary90};
  font-size: 14px;
`;

export const selectedDay = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  border-radius: 50%;

  background-color: ${theme.colors.primary50};
  color: ${theme.colors.primary90};
`;

export const otherMonthDay = css`
  opacity: 0.3;
`;
