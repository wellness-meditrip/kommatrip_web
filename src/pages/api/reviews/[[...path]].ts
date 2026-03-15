import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyRawToBackend, validateMethod } from '@/server/http/bff-proxy';

export const config = {
  api: {
    bodyParser: false,
  },
};

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveBackendPath = (
  pathSegments: string[],
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): string | null => {
  if (pathSegments.length === 2 && pathSegments[0] === 'v1') {
    return method === 'PUT' ? `/api/v1/reviews/${pathSegments[1]}` : null;
  }

  if (pathSegments.length === 0) {
    return method === 'POST' ? '/api/reviews/' : null;
  }

  if (pathSegments.length === 1 && pathSegments[0] === 'me') {
    return method === 'GET' ? '/api/reviews/me' : null;
  }

  if (
    pathSegments.length === 3 &&
    pathSegments[0] === 'guest-reviews' &&
    pathSegments[2] === 'report'
  ) {
    return method === 'POST' ? `/api/reviews/guest-reviews/${pathSegments[1]}/report` : null;
  }

  if (pathSegments.length === 2 && pathSegments[1] === 'images') {
    return method === 'PUT' ? `/api/reviews/${pathSegments[0]}/images` : null;
  }

  if (pathSegments.length === 2 && pathSegments[1] === 'report') {
    return method === 'POST' ? `/api/reviews/${pathSegments[0]}/report` : null;
  }

  if (pathSegments.length === 1) {
    return method === 'PUT' || method === 'DELETE' ? `/api/reviews/${pathSegments[0]}` : null;
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET', 'POST', 'PUT', 'DELETE']);
  if (!method) return;

  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];
  const backendPath = resolveBackendPath(pathSegments, method);

  if (!backendPath) {
    return res.status(404).json({ message: 'Not Found' });
  }

  return proxyRawToBackend({
    req,
    res,
    method,
    backendPath,
    omitQueryKeys: ['path'],
    errorMessage: 'Review proxy failed',
  });
}
