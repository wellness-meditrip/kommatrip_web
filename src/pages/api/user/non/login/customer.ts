import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCustomerLogin } from '@/server/api/auth/login-customer-handler';

// Legacy alias route: /api/user/non/login/customer
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleCustomerLogin(req, res);
}
