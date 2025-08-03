import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Size, Variant } from './index.types';
import { Service } from '../../../types';
import { wrapper } from './index.styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  service?: Service;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

export function RoundButton({
  service = 'daengle',
  variant = 'primary',
  size = 'M',
  fullWidth = false,
  disabled = false,
  children,
  ...props
}: Props) {
  return (
    <button type="button" {...props} css={wrapper({ service, size, variant, disabled, fullWidth })}>
      {children}
    </button>
  );
}
