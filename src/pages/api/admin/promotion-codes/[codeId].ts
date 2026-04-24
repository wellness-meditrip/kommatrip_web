import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyJsonToBackend, validateMethod } from '@/server/http/bff-proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = validateMethod(req, res, ['PATCH', 'DELETE']);
  if (!method) return;

  const { codeId } = req.query;
  if (!codeId || typeof codeId !== 'string') {
    return res.status(400).json({ message: 'Missing codeId' });
  }

  return proxyJsonToBackend({
    req,
    res,
    method,
    backendPath: `/api/users/admin/promotion-codes/${codeId}`,
    omitQueryKeys: ['codeId'],
    errorMessage: 'Admin promotion-codes proxy failed',
  });
}
