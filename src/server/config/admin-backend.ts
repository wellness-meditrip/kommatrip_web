import type { NextApiRequest } from 'next';
import {
  ADMIN_BACKEND_TARGET_COOKIE,
  DEFAULT_ADMIN_BACKEND_TARGET,
  isAdminBackendTarget,
  type AdminBackendTarget,
} from '@/constants/admin-backend';
import { getBackendBaseUrl } from './backend-url';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isAdminTestBackendConfigured = () => Boolean(process.env.BACKEND_TEST_API_URL?.trim());

export const resolveAdminBackendTarget = (value: string | undefined | null): AdminBackendTarget => {
  if (!isAdminBackendTarget(value)) return DEFAULT_ADMIN_BACKEND_TARGET;
  if (value === 'test' && !isAdminTestBackendConfigured()) return DEFAULT_ADMIN_BACKEND_TARGET;
  return value;
};

export const getAdminBackendTarget = (req?: Pick<NextApiRequest, 'cookies'>): AdminBackendTarget =>
  resolveAdminBackendTarget(req?.cookies?.[ADMIN_BACKEND_TARGET_COOKIE]);

export const getAdminBackendBaseUrl = (req?: Pick<NextApiRequest, 'cookies'>): string => {
  const target = getAdminBackendTarget(req);

  if (target === 'test') {
    const testBackendBaseUrl = process.env.BACKEND_TEST_API_URL?.trim();

    if (!testBackendBaseUrl) {
      throw new Error('Missing BACKEND_TEST_API_URL');
    }

    return trimTrailingSlash(testBackendBaseUrl);
  }

  return getBackendBaseUrl();
};
