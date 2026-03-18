import type { NextApiRequest, NextApiResponse } from 'next';
import { handleAdminRegister } from '@/server/api/admin/register-admin-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleAdminRegister(req, res);
}
