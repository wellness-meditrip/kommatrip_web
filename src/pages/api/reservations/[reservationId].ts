import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const getSingleQueryString = (value: string | string[] | undefined): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

const normalizeReservationId = (value: string): string | null => {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return trimmed;
};

const normalizeReason = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.method || !['GET', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const reservationIdValue = getSingleQueryString(req.query.reservationId);
    const reservationId = normalizeReservationId(reservationIdValue);
    if (!reservationId) {
      return res.status(400).json({ detail: '유효하지 않은 예약 ID입니다.' });
    }

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

    const reasonValue = getSingleQueryString(req.query.reason);
    const reason = normalizeReason(reasonValue);
    const backendResponse = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
      {
        ...baseConfig,
        ...(reason ? { params: { reason } } : {}),
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
