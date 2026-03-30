import { useMemo } from 'react';
import { useAdminAuth } from './use-admin-auth';

export const useAdminAccess = () => {
  const auth = useAdminAuth();
  const canAccess = useMemo(() => auth.isAuthenticated, [auth.isAuthenticated]);

  return {
    ...auth,
    canAccess,
  };
};
