import { css } from '@emotion/react';
import { theme } from '@/styles';

export const button = (isSelected: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;

  background: ${isSelected ? theme.colors.primary50 : theme.colors.primary10Opacity40};
  color: ${isSelected ? theme.colors.bg_default : theme.colors.text_secondary};

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  & * {
    color: inherit;
  }

  &:hover {
    background: ${isSelected ? theme.colors.primary60 : theme.colors.primary10};
  }
`;
