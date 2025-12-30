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

export const inquiryTitle = css`
  margin-bottom: 12px;
`;

export const concernsBox = css`
  margin: 12px 0;
  padding: 16px;
  border-radius: 12px;

  background: ${theme.colors.primary10Opacity40};
`;

export const concernsTitle = css`
  margin-bottom: 8px;

  font-weight: 600;
`;

export const concernsList = css`
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const textarea = css`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;

  font-family: inherit;
  font-size: 14px;
  outline: none;
  resize: vertical;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }
`;
