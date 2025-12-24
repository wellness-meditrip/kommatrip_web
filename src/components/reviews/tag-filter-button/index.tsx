import { ButtonHTMLAttributes } from 'react';
import { button } from './index.styles';
import { Text } from '@/components';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected: boolean;
}

export function TagFilterButton({ isSelected, children, ...props }: Props) {
  return (
    <button type="button" css={button(isSelected)} {...props}>
      <Text typo="button_XS">{children}</Text>
    </button>
  );
}
