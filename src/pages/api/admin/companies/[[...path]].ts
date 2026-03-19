import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyRawToBackend, validateMethod } from '@/server/http/bff-proxy';

export const config = {
  api: {
    bodyParser: false,
  },
};

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveListBackendPath = (req: NextApiRequest) => {
  const statusFilter = req.query.status_filter;
  if (statusFilter === 'pending') {
    return {
      backendPath: '/api/companies/admin/pending',
      omitQueryKeys: ['path', 'status_filter'],
    };
  }

  return {
    backendPath: '/api/companies/all',
    omitQueryKeys: ['path'],
  };
};

const resolveBackendRoute = (
  req: NextApiRequest,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): { backendPath: string; omitQueryKeys?: string[] } | null => {
  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];

  if (pathSegments.length === 0) {
    if (method === 'GET') return resolveListBackendPath(req);
    if (method === 'POST') {
      return {
        backendPath: '/api/companies/register',
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (pathSegments.length === 1 && pathSegments[0] === 'pending') {
    if (method === 'GET') {
      return {
        backendPath: '/api/companies/admin/pending',
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (pathSegments.length === 1) {
    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
      return {
        backendPath: `/api/companies/${pathSegments[0]}`,
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (
    pathSegments.length === 2 &&
    (pathSegments[1] === 'approve' || pathSegments[1] === 'suspend')
  ) {
    if (method === 'POST') {
      return {
        backendPath: `/api/companies/${pathSegments[0]}/${pathSegments[1]}`,
        omitQueryKeys: ['path'],
      };
    }
    return null;
  }

  if (pathSegments.length === 2 && pathSegments[1] === 'images') {
    if (method === 'PUT') {
      return {
        backendPath: `/api/companies/${pathSegments[0]}/images`,
        omitQueryKeys: ['path'],
      };
    }
    return null;
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

  return proxyRawToBackend({
    req,
    res,
    method,
    backendPath: route.backendPath,
    omitQueryKeys: route.omitQueryKeys,
    errorMessage: 'Admin companies proxy failed',
  });
}
