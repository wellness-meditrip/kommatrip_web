import type { NextApiRequest, NextApiResponse } from 'next';
import { handleRecentCompany } from '@/server/api/companies/recent-handler';

// Canonical route: /api/companies/recent
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleRecentCompany(req, res);
}
