import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveBackendRoute = (
  req: NextApiRequest,
  method: HttpMethod
): { backendPath: string; omitQueryKeys?: string[] } | null => {
  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];

  // GET /api/admin/influencers → list
  if (method === 'GET' && pathSegments.length === 0) {
    return { backendPath: '/api/users/admin/influencers', omitQueryKeys: ['path'] };
  }

  // POST /api/admin/influencers → create influencer
  if (method === 'POST' && pathSegments.length === 0) {
    return { backendPath: '/api/users/admin/influencers', omitQueryKeys: ['path'] };
  }

  // PATCH /api/admin/influencers/[id] → update influencer
  if (method === 'PATCH' && pathSegments.length === 1) {
    return {
      backendPath: `/api/users/admin/influencers/${pathSegments[0]}`,
      omitQueryKeys: ['path'],
    };
  }

  // DELETE /api/admin/influencers/[id] → delete influencer
  if (method === 'DELETE' && pathSegments.length === 1) {
    return {
      backendPath: `/api/users/admin/influencers/${pathSegments[0]}`,
      omitQueryKeys: ['path'],
    };
  }

  // POST /api/admin/influencers/[id]/promotion-codes → create promotion code
  if (method === 'POST' && pathSegments.length === 2 && pathSegments[1] === 'promotion-codes') {
    return {
      backendPath: `/api/users/admin/influencers/${pathSegments[0]}/promotion-codes`,
      omitQueryKeys: ['path'],
    };
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET', 'POST', 'PATCH', 'DELETE']);
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
    errorMessage: 'Admin influencers proxy failed',
  });
}
