import { css } from '@emotion/react';
import { theme } from '@/styles';

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

export const fieldGroup = css`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const input = css`
  width: 100%;
  margin-top: 8px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;

  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }

  &:disabled {
    background: ${theme.colors.bg_surface2};
    color: ${theme.colors.text_disabled};

    cursor: not-allowed;
  }
`;

export const contactMethodList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin: 8px 0;
`;

export const contactMethodChip = (isSelected: boolean) => css`
  padding: 8px 16px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.divider_2};
  border-radius: 18px;

  background: ${isSelected ? theme.colors.primary50 : theme.colors.bg_surface2};

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

export const select = css`
  width: 100%;
  margin-top: 8px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;

  background: ${theme.colors.white};
  font-size: 14px;

  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary50};
  }
`;
