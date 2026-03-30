import type { NextApiRequest, NextApiResponse } from 'next';
import { createExpiredAdminAuthCookies } from '@/server/auth/cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  res.setHeader('Set-Cookie', createExpiredAdminAuthCookies());
  return res.status(200).json({ message: 'Admin logout successful' });
}
