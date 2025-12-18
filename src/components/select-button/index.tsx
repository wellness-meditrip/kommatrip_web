/** @jsxImportSource @emotion/react */
import { ReactNode } from 'react';
import { Text } from '../text';
import { css } from '@emotion/react';
import { theme } from '@/styles';

interface Props {
  label: string;
  icon?: ReactNode;
  isSelected: boolean;
  onClick: () => void;
  variant?: 'square' | 'rectangular' | 'rounded';
}

export function SelectButton({ label, icon, isSelected, onClick, variant = 'square' }: Props) {
  return (
    <button
      css={[buttonBase, variantStyles[variant], isSelected && selectedStyle]}
      onClick={onClick}
      type="button"
    >
      {icon && <div css={iconContainer}>{icon}</div>}
      <Text typo="body_S" color={isSelected ? 'white' : 'text_primary'}>
        {label}
      </Text>
    </button>
  );
}

const buttonBase = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const squareStyle = css`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  background-color: ${theme.colors.primary10Opacity20};
  gap: 4px;
`;

const rectangularStyle = css`
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  background-color: ${theme.colors.primary10Opacity20};
  gap: 8px;
`;

const roundedStyle = css`
  padding: 12px 24px;
  border-radius: 20px;
  background-color: ${theme.colors.primary10Opacity20};
  gap: 4px;
`;

const variantStyles = {
  square: squareStyle,
  rectangular: rectangularStyle,
  rounded: roundedStyle,
};

const selectedStyle = css`
  background-color: ${theme.colors.primary50} !important;
`;

const iconContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;
