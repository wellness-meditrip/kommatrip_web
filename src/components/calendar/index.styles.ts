import { css } from '@emotion/react';
import { theme } from '@/styles';

const rangeBg = theme.colors.primary10Opacity60;
const rangeEdge = theme.colors.primary70;

export const calendarContainer = css`
  margin: 16px 0 24px;
  padding: 16px;
  border-radius: 20px;

  background-color: ${theme.colors.white};
  box-shadow: 0 6px 20px rgb(0 0 0 / 8%);
`;

export const calendarHeader = css`
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 8px;
`;

export const calendarContent = css`
  padding: 8px 8px 12px;
  border-radius: 16px;

  background-color: ${theme.colors.white};
`;

export const monthHeader = css`
  display: grid;
  grid-template-columns: 40px 1fr 40px;

  align-items: center;

  margin: 4px 0 10px;
`;

export const navButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;

  background: transparent;
  color: ${theme.colors.primary90};

  cursor: pointer;
`;

export const monthLabel = css`
  text-align: center;
`;

export const dayNamesRow = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  margin-bottom: 6px;

  color: ${theme.colors.text_secondary};
  font-size: 12px;
  font-weight: 500;
`;

export const dayName = css`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 28px;
`;

export const calendarGrid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  gap: 10px 0;
`;

export const dayCell = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  height: 44px;
`;

export const dayCellOutside = css`
  opacity: 0.35;
`;

export const dayButton = css`
  position: relative;
  z-index: 1;

  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;

  background: transparent;
  color: ${theme.colors.primary90};
  font-size: 14px;

  cursor: pointer;

  &:disabled {
    color: ${theme.colors.text_tertiary};

    cursor: default;
  }
`;

export const rangeMiddleCell = css`
  &::before {
    position: absolute;
    inset: 6px 0;

    background: ${rangeBg};
    content: '';
  }
`;

export const rangeStartCell = css`
  &::before {
    position: absolute;
    inset: 6px 0 6px 50%;

    background: ${rangeBg};
    content: '';
    border-top-left-radius: 999px;
    border-bottom-left-radius: 999px;
  }
`;

export const rangeEndCell = css`
  &::before {
    position: absolute;
    inset: 6px 50% 6px 0;

    background: ${rangeBg};
    content: '';
    border-top-right-radius: 999px;
    border-bottom-right-radius: 999px;
  }
`;

export const rangeSingleCell = css`
  &::before {
    display: none;
  }
`;

export const rangeStartButton = css`
  background: ${rangeEdge};
  color: ${theme.colors.white};
`;

export const rangeEndButton = css`
  background: ${rangeEdge};
  color: ${theme.colors.white};
`;

export const rangeSingleButton = css`
  background: ${rangeEdge};
  color: ${theme.colors.white};
`;
