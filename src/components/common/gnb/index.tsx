import { GNB as ONYUGNB } from '../../gnb';
import { MENUS } from '@/constants/commons/gnb';
import { useAuthState } from '@/hooks';
import { useLocalizedRouter } from '@/i18n/navigation';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { openLoginModal } from '@/utils/auth-modal';

export function GNB() {
  const router = useLocalizedRouter();
  const { isAuthenticated } = useAuthState();
  const t = useTranslations('common');

  const localizedMenus = useMemo(
    () =>
      MENUS.map((menu) => ({
        ...menu,
        name: t(menu.labelKey),
      })),
    [t]
  );

  const handleMenuClick = (path: string) => {
    const item = MENUS.find((menu) => menu.path === path);
    const localizedPath = router.localize(path);

    if (!item) return;

    if (!item.canGuest && !isAuthenticated) {
      openLoginModal({
        callbackUrl: localizedPath,
        reason: 'menu',
      });
      return;
    }

    void router.push(localizedPath);
  };

  return (
    <ONYUGNB menus={localizedMenus} activePath={router.pathname} onNavigate={handleMenuClick} />
  );
}
