import { useRouter } from 'next/router';
import { useState } from 'react';
import { GNB as ONYUGNB } from '../../gnb';
import { LoginModal } from '@/components';
import { MENUS } from '@/constants/commons/gnb';
import { useAuthState } from '@/hooks';

export function GNB() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleMenuClick = (path: string) => {
    const item = MENUS.find((menu) => menu.path === path);

    if (!item) return;

    if (!item.canGuest && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    router.push(path);
  };

  return (
    <>
      <ONYUGNB menus={MENUS} activePath={router.pathname} onNavigate={handleMenuClick} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
