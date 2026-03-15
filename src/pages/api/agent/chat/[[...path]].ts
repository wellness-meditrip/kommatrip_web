import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';

const isNonEmpty = (value: string | undefined): value is string => !!value && value.length > 0;

const resolveBackendPath = (
  pathSegments: string[],
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): string | null => {
  if (pathSegments.length === 0) {
    return method === 'POST' ? '/agent/chat' : null;
  }

  if (pathSegments[0] === 'sessions' && pathSegments.length === 1) {
    return method === 'GET' ? '/agent/chat/sessions' : null;
  }

  if (pathSegments[0] === 'session') {
    if (pathSegments.length === 1) return method === 'POST' ? '/agent/chat/session' : null;
    if (pathSegments.length === 2 && isNonEmpty(pathSegments[1])) {
      return method === 'GET' || method === 'DELETE'
        ? `/agent/chat/session/${pathSegments[1]}`
        : null;
    }
    return null;
  }

  if (pathSegments[0] === 'country' && pathSegments.length === 1) {
    return method === 'POST' ? '/agent/chat/country' : null;
  }

  if (pathSegments[0] === 'language' && pathSegments.length === 1) {
    return method === 'POST' ? '/agent/chat/language' : null;
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET', 'POST', 'DELETE']);
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
    errorMessage: 'Agent chat proxy failed',
  });
}
