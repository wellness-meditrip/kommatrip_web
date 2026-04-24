import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastCheck, ToastExclaim, ToastEye } from '../../icons';
import { Text } from '../text';
import { Portal } from '../portal';
import { ToastVariant, toastContainer, watchingIcon, watchingTitle } from './index.styles';

export interface ToastProps {
  isShow: boolean;
  title: string;
  time?: number;
  service?: 'daengle' | 'partner';
  icon?: 'check' | 'exclaim' | 'eye';
  variant?: ToastVariant;
}

const renderIcon = (icon: NonNullable<ToastProps['icon']>) => {
  switch (icon) {
    case 'exclaim':
      return <ToastExclaim width={16} height={16} />;
    case 'eye':
      return <ToastEye width={20} height={20} />;
    case 'check':
    default:
      return <ToastCheck width={16} height={16} />;
  }
};

export function Toast({ isShow, title, time = 5000, icon, variant = 'default' }: ToastProps) {
  const [isOpen, setIsOpen] = useState<boolean>(isShow);
  const resolvedIcon = icon ?? (variant === 'watching' ? 'eye' : 'check');

  useEffect(() => {
    if (isShow) {
      setIsOpen(true);

      const timer = setTimeout(() => setIsOpen(false), time);
      return () => clearTimeout(timer);
    }
  }, [isShow, time]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onAnimationComplete={() => {
              if (!isShow) setIsOpen(false);
            }}
          >
            <div css={toastContainer(variant)}>
              {variant === 'watching' ? (
                <>
                  <span css={watchingIcon}>{renderIcon(resolvedIcon)}</span>
                  <span css={watchingTitle}>{title}</span>
                </>
              ) : (
                <>
                  {renderIcon(resolvedIcon)}
                  <Text typo="body12" color="white">
                    {title}
                  </Text>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
