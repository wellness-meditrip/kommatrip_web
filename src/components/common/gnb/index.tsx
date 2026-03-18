import { useRouter } from 'next/router';
import { GNB as ONYUGNB } from '../../gnb';
import { MENUS } from '@/constants/commons/gnb';
import { useAuthState } from '@/hooks';
import { openLoginModal } from '@/utils/auth-modal';

export function GNB() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();

  const handleMenuClick = (path: string) => {
    const item = MENUS.find((menu) => menu.path === path);

    if (!item) return;

    if (!item.canGuest && !isAuthenticated) {
      openLoginModal({
        callbackUrl: path,
        reason: 'menu',
      });
      return;
    }

    void router.push(path);
  };

  return <ONYUGNB menus={MENUS} activePath={router.pathname} onNavigate={handleMenuClick} />;
}
