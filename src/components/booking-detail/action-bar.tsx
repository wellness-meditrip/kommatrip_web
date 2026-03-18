import { Text } from '@/components';
import { actionBar, ctaPrimaryButton, ctaRow, ctaSecondaryButton } from './index.styles';

export type BookingDetailActionKey = 'cancel' | 'bookAgain' | 'writeReview';

interface BookingDetailActionButton {
  key: BookingDetailActionKey;
  label: string;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
}

interface BookingDetailActionBarProps {
  buttons: BookingDetailActionButton[];
  hasGnb: boolean;
  onAction: (actionKey: BookingDetailActionKey) => void;
}

export function BookingDetailActionBar({ buttons, hasGnb, onAction }: BookingDetailActionBarProps) {
  return (
    <div css={actionBar(hasGnb)}>
      <div css={ctaRow(buttons.length)}>
        {buttons.map((button) => (
          <button
            key={button.key}
            type="button"
            css={button.variant === 'primary' ? ctaPrimaryButton : ctaSecondaryButton}
            disabled={button.disabled}
            onClick={() => onAction(button.key)}
          >
            <Text typo="button_L" color={button.variant === 'primary' ? 'white' : 'text_secondary'}>
              {button.label}
            </Text>
          </button>
        ))}
      </div>
    </div>
  );
}
