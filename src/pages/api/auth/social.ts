import type { NextApiRequest, NextApiResponse } from 'next';
import { handleSocialLogin } from '@/server/api/auth/social-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleSocialLogin(req, res);
}
