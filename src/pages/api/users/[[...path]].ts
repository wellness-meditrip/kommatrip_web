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
  if (pathSegments.length === 1 && pathSegments[0] === 'profile') {
    return method === 'GET' || method === 'PATCH' ? '/api/users/profile' : null;
  }

  if (pathSegments.length === 2 && pathSegments[0] === 'profile' && pathSegments[1] === 'image') {
    return method === 'POST' || method === 'DELETE' ? '/api/users/profile/image' : null;
  }

  if (pathSegments.length === 1 && pathSegments[0] === 'marketing-consent') {
    return method === 'PATCH' ? '/api/users/marketing-consent' : null;
  }

  if (pathSegments.length === 1 && pathSegments[0] === 'interest') {
    return method === 'POST' ? '/api/users/interest' : null;
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET', 'POST', 'PATCH', 'DELETE']);
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
    errorMessage: 'Users proxy failed',
  });
}
