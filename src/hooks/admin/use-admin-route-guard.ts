import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useAdminAuth } from './use-admin-auth';

export const useAdminRouteGuard = () => {
  const router = useRouter();
  const auth = useAdminAuth();

  useEffect(() => {
    if (!auth.isReady || auth.isAuthenticated) return;

    const nextPath = router.asPath && router.asPath !== '/admin/login' ? router.asPath : '';
    const target = nextPath
      ? `${ROUTES.ADMIN_LOGIN}?next=${encodeURIComponent(nextPath)}`
      : ROUTES.ADMIN_LOGIN;

    void router.replace(target);
  }, [auth.isAuthenticated, auth.isReady, router]);

  const canAccess = useMemo(
    () => auth.isReady && auth.isAuthenticated,
    [auth.isAuthenticated, auth.isReady]
  );

  return {
    ...auth,
    canAccess,
  };
};
