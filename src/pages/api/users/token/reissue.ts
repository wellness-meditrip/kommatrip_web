import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { AUTH_COOKIE_KEYS } from '@/constants';
import { createRefreshTokenCookies } from '@/server/auth/cookies';

type TokenReissueResponse =
  | { accessToken: string }
  | { tokens: { access_token: string; refresh_token?: string } }
  | {
      response:
        | { accessToken: string }
        | { tokens: { access_token: string; refresh_token?: string } };
    }
  | Record<string, unknown>;

const resolvePayload = (data: unknown) => {
  if (!data || typeof data !== 'object') return data;
  const nested = (data as { response?: unknown }).response;
  return nested ?? data;
};

const extractRefreshToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const tokens = (payload as { tokens?: unknown }).tokens;
  if (!tokens || typeof tokens !== 'object') return null;
  const refreshToken = (tokens as { refresh_token?: unknown }).refresh_token;
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) return null;
  return refreshToken;
};

const sanitizeResponse = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return payload;
  const obj = payload as Record<string, unknown>;
  const tokens = obj.tokens;
  if (!tokens || typeof tokens !== 'object') return obj;
  const safeTokens = Object.fromEntries(
    Object.entries(tokens as Record<string, unknown>).filter(([key]) => key !== 'refresh_token')
  );
  return { ...obj, tokens: safeTokens };
};

const getRefreshTokenFromSession = async (req: NextApiRequest): Promise<string | null> => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const refreshToken = (token as { backendTokens?: { refresh_token?: unknown } } | null)
      ?.backendTokens?.refresh_token;
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      return null;
    }
    return refreshToken;
  } catch {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const refreshTokenFromCookie = req.cookies?.[AUTH_COOKIE_KEYS.REFRESH_TOKEN];
    const refreshTokenFromSession = refreshTokenFromCookie
      ? null
      : await getRefreshTokenFromSession(req);
    const refreshToken = refreshTokenFromCookie || refreshTokenFromSession || undefined;
    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? '';
    const backendResponse = await axios.post<TokenReissueResponse>(
      `${baseURL}/api/users/token/reissue`,
      {
        refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.cookie ?? '',
        },
      }
    );

    const payload = resolvePayload(backendResponse.data);
    const rotatedRefreshToken = extractRefreshToken(payload);
    if (rotatedRefreshToken) {
      res.setHeader('Set-Cookie', createRefreshTokenCookies(rotatedRefreshToken));
    } else if (!refreshTokenFromCookie && refreshTokenFromSession) {
      // 소셜 로그인 JWT에만 refresh token이 있는 경우, 서버 쿠키로 승격해 다음 재발급 경로를 단순화한다.
      res.setHeader('Set-Cookie', createRefreshTokenCookies(refreshTokenFromSession));
    }

    return res.status(backendResponse.status).json(sanitizeResponse(payload));
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
