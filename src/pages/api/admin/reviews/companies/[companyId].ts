import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';
import { getAdminBackendBaseUrl } from '@/server/config/admin-backend';

const resolveCompanyId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return (value[0] ?? '').trim();
  return '';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['GET']);
  if (!method) return;

  const companyId = resolveCompanyId(req.query.companyId);
  if (!/^\d+$/.test(companyId)) {
    return res.status(400).json({ message: 'Invalid companyId' });
  }

  const backendBaseUrl = getAdminBackendBaseUrl(req);

  return proxyJsonToBackend({
    req,
    res,
    method,
    baseURL: backendBaseUrl,
    backendPath: `/non/guest-reviews/company/${companyId}`,
    omitQueryKeys: ['companyId'],
    errorMessage: 'Admin company reviews proxy failed',
  });
}
