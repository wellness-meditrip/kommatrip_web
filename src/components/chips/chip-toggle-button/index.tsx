import { ButtonHTMLAttributes, ReactNode } from 'react';
import { wrapper } from './index.styles';
import { Service, Size } from './index.types';
// import { colors } from '../../../foundation';

// type KeyOfColors = keyof typeof colors;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  isSelected?: boolean;
  isPartnerSelected?: boolean | null;
  isTagSelected?: boolean;
  service?: Service;
  children: ReactNode;
}

export function ChipToggleButton({
  size = 'fluid',
  disabled = false,
  isSelected = false,
  isPartnerSelected = false,
  isTagSelected = false,
  service = 'user',
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      css={wrapper({ isSelected, size, disabled, isPartnerSelected, isTagSelected, service })}
    >
      {children}
    </button>
  );
}
