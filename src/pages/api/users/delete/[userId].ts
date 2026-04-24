import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getBackendBaseUrl } from '@/server/config/backend-url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const backendBaseUrl = getBackendBaseUrl();
    const userId = req.query.userId;

    const backendResponse = await axios.delete(`${backendBaseUrl}/api/users/delete/${userId}`, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    return res.status(backendResponse.status).json(backendResponse.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
  }
}
