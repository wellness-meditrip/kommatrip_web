import { ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  children: ReactNode;
}

export function Portal({ children }: Props) {
  const element = typeof window !== 'undefined' && document.querySelector('#portal-container');
  return element && children ? ReactDOM.createPortal(<>{children}</>, element) : null;
}
