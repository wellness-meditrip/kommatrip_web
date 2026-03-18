import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveBackendRoute = (
  req: NextApiRequest,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): { backendPath: string; omitQueryKeys?: string[] } | null => {
  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];

  if (method === 'GET') {
    if (pathSegments.length === 0) {
      return {
        backendPath: '/api/users/admin/list',
        omitQueryKeys: ['path'],
      };
    }

    if (pathSegments.length === 1 && pathSegments[0] === 'list') {
      return {
        backendPath: '/api/users/admin/list',
        omitQueryKeys: ['path'],
      };
    }
  }

  if (method === 'DELETE' && pathSegments.length === 1) {
    return {
      backendPath: `/api/users/delete/${pathSegments[0]}`,
      omitQueryKeys: ['path'],
    };
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET', 'DELETE']);
  if (!method) return;

  const route = resolveBackendRoute(req, method);
  if (!route) {
    return res.status(404).json({ message: 'Not Found' });
  }

  return proxyJsonToBackend({
    req,
    res,
    method,
    backendPath: route.backendPath,
    omitQueryKeys: route.omitQueryKeys,
    errorMessage: 'Admin users proxy failed',
  });
}
