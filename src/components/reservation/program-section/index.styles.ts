import { css } from '@emotion/react';
import { theme, typography } from '@/styles';

export const sectionCard = css`
  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

export const sectionHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  cursor: pointer;
  user-select: none;
`;

export const chevronIcon = (isOpen: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${isOpen ? 'rotate(90deg)' : 'rotate(-90deg)'};

  transition: transform 0.1s ease;
`;

export const sectionContent = css`
  margin-top: 16px;
`;

export const programCard = (isSelected: boolean) => css`
  display: flex;
  gap: 12px;

  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid ${isSelected ? theme.colors.divider_2 : theme.colors.bg_surface2};
  border-radius: 8px;

  background: ${isSelected ? theme.colors.sub_sub_3 : theme.colors.bg_surface2};

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.divider_2};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const programImage = css`
  flex-shrink: 0;

  width: 72px;
  min-width: 72px;
  height: 72px;
  min-height: 72px;
  border-radius: 8px;
  object-fit: cover;
`;

export const programInfo = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

export const programTitleRow = css`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

export const discountPriceGroup = css`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
`;

export const discountRateBadge = css`
  display: inline-flex;
  align-items: center;

  height: 16px;
  padding: 0 4px;
  border-radius: 4px;

  background: ${theme.colors.red200};
  color: ${theme.colors.white};
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
`;

export const originalPriceText = css`
  color: ${theme.colors.text_disabled};
  text-decoration: line-through;
`;

export const discountedPriceText = css`
  color: ${theme.colors.red200};
  ${typography.button_S};
`;
