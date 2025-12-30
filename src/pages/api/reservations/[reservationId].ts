import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.method || !['GET', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const { reservationId } = req.query;
    const baseConfig = {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    };

    if (req.method === 'GET') {
      const backendResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
        baseConfig
      );
      return res.status(backendResponse.status).json(backendResponse.data);
    }

    const backendResponse = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
      {
        ...baseConfig,
        data: req.body ?? { reason: null },
      }
    );
    return res.status(backendResponse.status).json(backendResponse.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: 'Reservation detail failed' });
  }
}
