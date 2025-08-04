import { ButtonHTMLAttributes, ReactNode } from 'react';
import { wrapper } from './index.styles';
import { Size } from './index.types';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  children: ReactNode;
}

export function CapsuleButton({ disabled = false, size = 'M', children, ...props }: Props) {
  return (
    <button type="button" {...props} css={wrapper({ disabled, size })}>
      {children}
    </button>
  );
}
