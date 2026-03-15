import type { NextApiRequest, NextApiResponse } from 'next';
import { handleTokenReissue } from '@/server/api/auth/token-reissue-handler';

// Legacy alias route: /api/users/token/reissue
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleTokenReissue(req, res);
}
