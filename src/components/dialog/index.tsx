import { createContext, HTMLAttributes, ReactNode } from 'react';
import { Text } from '../text';
import { Dim } from '../dim';
import { Portal } from '../portal';
import { wrapper, text, buttonWrapper, button } from './index.styles';

interface DialogContext {
  open: (content: ReactNode) => void;
  close: () => void;
}
const DialogContext = createContext<DialogContext | null>(null);

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'confirm' | 'warn';
  title: string;
  description?: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onClose?: () => void;
}

export function Dialog({
  type = 'confirm',
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
  ...props
}: DialogProps) {
  return (
    <>
      <Portal>
        <Dim fullScreen onClick={onClose} />

        <div {...props} css={wrapper}>
          <div css={text}>
            <Text typo="body_S">{title}</Text>
            <Text typo="body_S" color="black">
              {description}
            </Text>
          </div>

          <div css={buttonWrapper}>
            {secondaryActionLabel && (
              <button onClick={onSecondaryAction} css={button}>
                <Text typo="body_S" color="black">
                  {secondaryActionLabel}
                </Text>
              </button>
            )}

            <button onClick={onPrimaryAction} css={button}>
              <Text typo="body_S" color={type === 'confirm' ? 'primary50' : 'primary90'}>
                {primaryActionLabel}
              </Text>
            </button>
          </div>
        </div>
      </Portal>
    </>
  );
}
