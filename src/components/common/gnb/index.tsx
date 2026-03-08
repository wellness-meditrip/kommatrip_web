import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { GNB as ONYUGNB } from '../../gnb';
import { LoginModal } from '@/components';
import { MENUS } from '@/constants/commons';
import { useAuthStore } from '@/store/auth';

export function GNB() {
  const router = useRouter();
  const { status } = useSession();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = status === 'authenticated' || !!accessToken;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleMenuClick = (path: string) => {
    const item = MENUS.find((menu) => menu.path === path);

    if (!item) return;

    if (!item.canGuest && !isLoggedIn) {
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
