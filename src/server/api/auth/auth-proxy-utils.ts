import type { NextApiResponse } from 'next';
import { createRefreshTokenCookies } from '@/server/auth/cookies';
import {
  extractRefreshToken,
  resolvePayload,
  sanitizeTokenPayload,
} from '@/server/auth/token-payload';

export const applyRefreshTokenCookies = (res: NextApiResponse, payload: unknown) => {
  const refreshToken = extractRefreshToken(payload);
  if (refreshToken) {
    res.setHeader('Set-Cookie', createRefreshTokenCookies(refreshToken));
  }
  return refreshToken;
};

export const sanitizeAuthPayload = <T = unknown>(payload: unknown): T => {
  return sanitizeTokenPayload(resolvePayload(payload)) as T;
};
