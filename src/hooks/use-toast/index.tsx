import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Toast, ToastProps } from '@/components/toast';
import { subscribeToast } from '@/utils/toast-bus';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'isShow'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = useCallback(({ title, time, service, icon }: Omit<ToastProps, 'isShow'>) => {
    setToastProps({ isShow: true, title, time, service, icon });

    setTimeout(() => {
      setToastProps((prev) => (prev ? { ...prev, isShow: false } : null));
    }, time || 4000);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToast(showToast);
    return unsubscribe;
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toastProps?.isShow && (
        <Toast
          isShow={toastProps.isShow}
          title={toastProps.title}
          time={toastProps.time}
          service={toastProps.service}
          icon={toastProps.icon}
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
