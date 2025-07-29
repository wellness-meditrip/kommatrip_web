import { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, type DialogProps } from '../../components/dialog';

interface DialogContextType {
  open: (
    props: Omit<DialogProps, 'onPrimaryAction' | 'onSecondaryAction'> & {
      onPrimaryAction?: () => void;
      onSecondaryAction?: () => void;
    }
  ) => void;
  close: () => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogProps, setDialogProps] = useState<(DialogProps & { isOpen: boolean }) | null>(null);

  const open = (props: DialogProps) => {
    setDialogProps({ ...props, isOpen: true });
  };

  const close = () => {
    setDialogProps((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  return (
    <DialogContext.Provider value={{ open, close }}>
      {children}

      {dialogProps?.isOpen && (
        <Dialog
          type={dialogProps.type}
          title={dialogProps.title}
          description={dialogProps.description}
          primaryActionLabel={dialogProps.primaryActionLabel}
          secondaryActionLabel={dialogProps.secondaryActionLabel}
          onPrimaryAction={() => {
            dialogProps.onPrimaryAction?.();
            close();
          }}
          onSecondaryAction={() => {
            dialogProps.onSecondaryAction?.();
            close();
          }}
          onClose={close}
        />
      )}
    </DialogContext.Provider>
  );
}

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog 에러');
  return context;
};
