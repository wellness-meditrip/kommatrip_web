import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Service } from '../../../types';
import { Text } from '../../text';
import { RoundButton } from '../round-button';
import { TextButton } from '../text-button';
import { wrapper } from './index.styles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  secondaryButtonLabel?: string;
  onSecondaryButtonClick?: () => void;
  service?: Service;
}

export function CTAButton({
  children,
  secondaryButtonLabel,
  onSecondaryButtonClick,
  service = 'daengle',
  ...props
}: Props) {
  return (
    <div css={wrapper}>
      <RoundButton service={service} size="L" fullWidth {...props}>
        {children}
      </RoundButton>

      {secondaryButtonLabel && (
        <TextButton
          type="button"
          onClick={onSecondaryButtonClick ? onSecondaryButtonClick : undefined}
        >
          <Text typo="body8" color="gray200">
            {secondaryButtonLabel}
          </Text>
        </TextButton>
      )}
    </div>
  );
}
