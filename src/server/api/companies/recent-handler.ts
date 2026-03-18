import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';

export const handleRecentCompany = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: { omitQueryKeys?: string[] } = {}
) => {
  const method = validateMethod(req, res, ['GET']);
  if (!method) return;

  return proxyJsonToBackend({
    req,
    res,
    method,
    backendPath: '/non/company/recent',
    omitQueryKeys: options.omitQueryKeys,
    errorMessage: 'Company recent proxy failed',
  });
};
