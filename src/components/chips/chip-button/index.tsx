import { ButtonHTMLAttributes, ReactNode } from 'react';
import { wrapper } from './index.styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function ChipButton({ disabled = false, children, ...props }: Props) {
  return (
    <button type="button" {...props} css={wrapper({ disabled })}>
      {children}
    </button>
  );
}
