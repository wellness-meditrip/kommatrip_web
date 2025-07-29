import { useEffect, useState } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { ToastCheck, PartnerToastCheck } from '../../icons';
import { Text } from '../text';
// import { Portal } from '../portal';
import { toast } from './index.styles';

export interface ToastProps {
  isShow: boolean;
  title: string;
  time?: number;
  service?: 'daengle' | 'partner';
}

export function Toast({ isShow, title, time = 5000, service = 'daengle' }: ToastProps) {
  const [isOpen, setIsOpen] = useState<boolean>(isShow);

  useEffect(() => {
    if (isShow) {
      setIsOpen(true);

      const timer = setTimeout(() => setIsOpen(false), time);
      return () => clearTimeout(timer);
    }
  }, [isShow, time]);

  return (
    // <Portal>
    //   <AnimatePresence>
    //     {isOpen && (
    //       <motion.div
    //         initial={{ opacity: 0 }}
    //         animate={{ opacity: 1 }}
    //         exit={{ opacity: 0 }}
    //         transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    //         onAnimationComplete={() => {
    //           if (!isShow) setIsOpen(false);
    //         }}
    //       >
    //         <div css={toast}>
    //           {service === 'daengle' ? (
    //             <ToastCheck width={16} height={16} />
    //           ) : (
    //             <PartnerToastCheck width={16} height={16} />
    //           )}

    //           <Text typo="body12" color="white">
    //             {title}
    //           </Text>
    //         </div>
    //       </motion.div>
    //     )}
    //   </AnimatePresence>
    // </Portal>
    <></>
  );
}
