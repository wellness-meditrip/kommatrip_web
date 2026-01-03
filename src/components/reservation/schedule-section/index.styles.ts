import { css } from '@emotion/react';
import { theme } from '@/styles';

export const sectionCard = css`
  margin: 12px 16px 80px;
  padding: 24px 18px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

export const dateSection = css`
  margin-top: 20px;
`;

export const calendarContainer = css`
  margin-top: 16px;
`;

export const calendarHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 16px;
`;

export const arrowButton = css`
  padding: 8px 12px;
  border: none;

  background: none;
  color: ${theme.colors.text_primary};
  font-size: 20px;

  cursor: pointer;

  &:hover {
    border-radius: 4px;

    background: ${theme.colors.bg_surface1};
  }
`;

export const calendarGrid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  gap: 4px;
`;

export const dayHeader = css`
  padding: 8px 0;

  text-align: center;
`;

export const emptyDay = css`
  height: 40px;
`;

export const calendarDay = (isSelected: boolean, isDisabled: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 50%;

  background: ${isSelected ? theme.colors.primary50 : 'transparent'};

  transition: all 0.2s ease;

  cursor: ${isDisabled && !isSelected ? 'not-allowed' : 'pointer'};
  pointer-events: ${isDisabled && !isSelected ? 'none' : 'auto'};

  &:hover {
    background: ${isSelected
      ? theme.colors.primary50
      : isDisabled
        ? 'transparent'
        : theme.colors.bg_surface1};
  }
`;

export const timeSection = css`
  margin-top: 32px;
`;

export const placeholderText = css`
  margin-top: 12px;
`;

export const timeGroup = css`
  margin-top: 16px;
`;

export const selectedTimesBox = () => css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 12px;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 12px;

  background: ${theme.colors.white};

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

export const timeBoxChevron = (isOpen: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${isOpen ? 'rotate(90deg)' : 'rotate(270deg)'};

  transition: transform 0.3s ease;
`;

export const timeChips = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 12px;
`;

export const timeChip = (isSelected: boolean) => css`
  padding: 8px 16px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.divider_2};
  border-radius: 20px;

  background: ${isSelected ? theme.colors.primary50 : theme.colors.bg_surface2};

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;
