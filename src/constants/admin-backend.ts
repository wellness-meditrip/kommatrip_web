export type AdminBackendTarget = 'prod' | 'test';

export const ADMIN_BACKEND_TARGET_COOKIE = 'adminBackendTarget';

export const DEFAULT_ADMIN_BACKEND_TARGET: AdminBackendTarget = 'prod';

export const ADMIN_BACKEND_TARGET_LABELS: Record<AdminBackendTarget, string> = {
  prod: '운영 서버',
  test: '테스트 서버',
};

export const isAdminBackendTarget = (value: unknown): value is AdminBackendTarget =>
  value === 'prod' || value === 'test';
