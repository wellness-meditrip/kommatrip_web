import { ButtonHTMLAttributes, ReactNode } from 'react';
import { wrapper } from './index.styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  suffix?: ReactNode;
  icons?: {
    prefix?: ReactNode;
    suffix?: ReactNode;
  };
}

export function TextButton({ children, icons, ...props }: Props) {
  return (
    <button type="button" css={wrapper} {...props}>
      {icons?.prefix && icons?.prefix}
      {children}
      {icons?.suffix && icons?.suffix}
    </button>
  );
}
