import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyRawToBackend, validateMethod } from '@/server/http/bff-proxy';
import { getAdminBackendBaseUrl } from '@/server/config/admin-backend';

export const config = {
  api: {
    bodyParser: false,
  },
};

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveBackendRoute = (
  req: NextApiRequest,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): { backendPath: string; omitQueryKeys?: string[] } | null => {
  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];

  if (pathSegments.length === 0) {
    if (method === 'POST') {
      return {
        backendPath: '/api/programs/',
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (
    pathSegments.length === 4 &&
    pathSegments[0] === 'company' &&
    pathSegments[2] === 'admin' &&
    pathSegments[3] === 'list'
  ) {
    if (method === 'GET') {
      return {
        backendPath: `/api/programs/company/${pathSegments[1]}/admin/list`,
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (pathSegments.length === 2 && pathSegments[1] === 'images') {
    if (method === 'PUT') {
      return {
        backendPath: `/api/programs/${pathSegments[0]}/images`,
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (pathSegments.length === 2 && pathSegments[1] === 'activate') {
    if (method === 'POST') {
      return {
        backendPath: `/api/programs/${pathSegments[0]}/activate`,
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (pathSegments.length === 1) {
    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
      return {
        backendPath: `/api/programs/${pathSegments[0]}`,
        omitQueryKeys: ['path'],
      };
    }
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

  return proxyRawToBackend({
    req,
    res,
    method,
    baseURL: backendBaseUrl,
    backendPath: route.backendPath,
    omitQueryKeys: route.omitQueryKeys,
    errorMessage: 'Admin programs proxy failed',
  });
}
