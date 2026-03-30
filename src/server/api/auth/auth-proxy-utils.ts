import type { NextApiResponse } from 'next';
import { createRefreshTokenCookies } from '@/server/auth/cookies';
import {
  extractRefreshToken,
  resolvePayload,
  sanitizeTokenPayload,
} from '@/server/auth/token-payload';

export const applyRefreshTokenCookies = (
  res: NextApiResponse,
  payload: unknown,
  createCookies: (refreshToken: string) => string[] = createRefreshTokenCookies
) => {
  const refreshToken = extractRefreshToken(resolvePayload(payload));
  if (refreshToken) {
    res.setHeader('Set-Cookie', createCookies(refreshToken));
  }
  return refreshToken;
};

export const sanitizeAuthPayload = <T = unknown>(payload: unknown): T => {
  return sanitizeTokenPayload(resolvePayload(payload)) as T;
};
