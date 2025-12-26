import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type TokenReissueResponse =
  | { accessToken: string }
  | { tokens: { access_token: string } }
  | Record<string, unknown>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie ?? '';
    const cookiePairs = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean);
    const refreshCookie = cookiePairs.find((pair) => pair.startsWith('refreshToken='));
    const refreshTokenValue = refreshCookie?.split('=')[1] ?? '';
    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? '';
    const backendResponse = await axios.post<TokenReissueResponse>(
      `${baseURL}/api/users/token/reissue`,
      {
        refreshToken: refreshTokenValue || undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.cookie ?? '',
        },
      }
    );

    console.log('[token/reissue] Backend response', {
      status: backendResponse.status,
      keys: Object.keys(backendResponse.data || {}),
    });
    return res.status(backendResponse.status).json(backendResponse.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('[token/reissue] Backend error', {
        status: error.response.status,
        data: error.response.data,
        detail: JSON.stringify((error.response.data as { detail?: unknown })?.detail ?? null),
      });
      return res.status(error.response.status).json(error.response.data);
    }
    console.error('[token/reissue] Unknown error', error);
    return res.status(500).json({ message: 'Token reissue failed' });
  }
}
