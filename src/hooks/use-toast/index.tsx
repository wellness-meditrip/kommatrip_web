import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProps } from '../../components/toast';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'isShow'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = ({ title, time, service }: Omit<ToastProps, 'isShow'>) => {
    setToastProps({ isShow: true, title, time, service });

    setTimeout(() => {
      setToastProps((prev) => (prev ? { ...prev, isShow: false } : null));
    }, time || 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toastProps?.isShow && (
        <Toast
          isShow={toastProps.isShow}
          title={toastProps.title}
          time={toastProps.time}
          service={toastProps.service}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast 에러');
  return context;
};
