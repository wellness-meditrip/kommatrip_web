import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: 백엔드 CORS 수정 후 프록시 제거할 것.
  // 현재 백엔드 설정: Access-Control-Allow-Origin="*" + credentials=true 조합으로 CORS 발생.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      }
    );

    return res.status(backendResponse.status).json(backendResponse.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: 'Reservation failed' });
  }
}
