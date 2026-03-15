import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveBackendPath = (
  pathSegments: string[],
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): string | null => {
  if (pathSegments.length === 2 && pathSegments[0] === 'company' && pathSegments[1] === 'recent') {
    return method === 'GET' ? '/non/company/recent' : null;
  }
  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET']);
  if (!method) return;

  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam.filter(isNonEmpty) : [];
  const backendPath = resolveBackendPath(pathSegments, method);

  if (!backendPath) {
    return res.status(404).json({ message: 'Not Found' });
  }

  return proxyJsonToBackend({
    req,
    res,
    method,
    backendPath,
    omitQueryKeys: ['path'],
    errorMessage: 'Non-member proxy failed',
  });
}
