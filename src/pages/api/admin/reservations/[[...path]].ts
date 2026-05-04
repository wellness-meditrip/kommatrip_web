import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';
import { getAdminBackendBaseUrl } from '@/server/config/admin-backend';

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const ADMIN_RESERVATION_LIST_PATH_MAP: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  rejected: 'rejected',
  completed: 'completed',
  'no-show': 'no-show',
  no_show: 'no-show',
  canceled: 'canceled',
};

const resolveBackendRoute = (
  req: NextApiRequest,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): { backendPath: string; omitQueryKeys?: string[] } | null => {
  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];

  if (pathSegments.length === 0) {
    return null;
  }

  if (pathSegments.length === 1) {
    if (method === 'GET' && pathSegments[0] === 'stats') {
      return {
        backendPath: '/api/reservations/admin/stats',
        omitQueryKeys: ['path'],
      };
    }

    const adminListPath = ADMIN_RESERVATION_LIST_PATH_MAP[pathSegments[0]];
    if (method === 'GET' && adminListPath) {
      return {
        backendPath: `/api/reservations/admin/${adminListPath}`,
        omitQueryKeys: ['path'],
      };
    }

    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
      return {
        backendPath: `/api/reservations/${pathSegments[0]}`,
        omitQueryKeys: ['path'],
      };
    }
  }

  if (
    pathSegments.length === 2 &&
    method === 'POST' &&
    ['confirm', 'reject', 'complete', 'no-show'].includes(pathSegments[1])
  ) {
    return {
      backendPath: `/api/reservations/${pathSegments[0]}/${pathSegments[1]}`,
      omitQueryKeys: ['path'],
    };
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET', 'POST', 'PUT', 'DELETE']);
  if (!method) return;

  const route = resolveBackendRoute(req, method);
  if (!route) {
    return res.status(404).json({ message: 'Not Found' });
  }

  const backendBaseUrl = getAdminBackendBaseUrl(req);

  return proxyJsonToBackend({
    req,
    res,
    method,
    baseURL: backendBaseUrl,
    backendPath: route.backendPath,
    omitQueryKeys: route.omitQueryKeys,
    errorMessage: 'Admin reservations proxy failed',
  });
}
