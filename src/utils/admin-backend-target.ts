import {
  ADMIN_BACKEND_TARGET_COOKIE,
  DEFAULT_ADMIN_BACKEND_TARGET,
  isAdminBackendTarget,
  type AdminBackendTarget,
} from '@/constants/admin-backend';
import { getCookie, setCookie } from '@/utils/cookie';

const ADMIN_BACKEND_TARGET_COOKIE_DAYS = 30;

export const isAdminTestBackendEnabled =
  process.env.NEXT_PUBLIC_ADMIN_TEST_BACKEND_ENABLED === 'true';

export const getStoredAdminBackendTarget = (): AdminBackendTarget => {
  const target = getCookie(ADMIN_BACKEND_TARGET_COOKIE);
  if (!isAdminBackendTarget(target)) return DEFAULT_ADMIN_BACKEND_TARGET;
  if (target === 'test' && !isAdminTestBackendEnabled) return DEFAULT_ADMIN_BACKEND_TARGET;
  return target;
};

export const persistAdminBackendTarget = (target: AdminBackendTarget) => {
  setCookie(ADMIN_BACKEND_TARGET_COOKIE, target, ADMIN_BACKEND_TARGET_COOKIE_DAYS);
};
