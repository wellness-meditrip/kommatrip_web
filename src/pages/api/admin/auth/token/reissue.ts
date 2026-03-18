import type { NextApiRequest, NextApiResponse } from 'next';
import { handleAdminTokenReissue } from '@/server/api/admin/token-reissue-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleAdminTokenReissue(req, res);
}
