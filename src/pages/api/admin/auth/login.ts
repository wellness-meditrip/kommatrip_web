import type { NextApiRequest, NextApiResponse } from 'next';
import { handleAdminLogin } from '@/server/api/admin/login-admin-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleAdminLogin(req, res);
}
