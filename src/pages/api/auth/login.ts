import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCustomerLogin } from '@/server/api/auth/login-customer-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleCustomerLogin(req, res);
}
