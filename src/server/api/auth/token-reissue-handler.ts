import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { AUTH_COOKIE_KEYS } from '@/constants';
import { createRefreshTokenCookies } from '@/server/auth/cookies';
import {
  extractRefreshToken,
  resolvePayload,
  sanitizeTokenPayload,
} from '@/server/auth/token-payload';
import { postBackend } from '@/server/http/backend-client';
import {
  buildErrorContract,
  buildSuccessContract,
  extractContractCode,
  extractContractMessage,
  resolveTraceId,
} from '@/server/http/api-contract';

const BACKEND_REISSUE_PATH = 'api/users/token/reissue';

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

export const handleTokenReissue = async (req: NextApiRequest, res: NextApiResponse) => {
  const traceId = resolveTraceId(req);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json(
      buildErrorContract({
        traceId,
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method Not Allowed',
      })
    );
  }

  try {
    const refreshTokenFromCookie = req.cookies?.[AUTH_COOKIE_KEYS.REFRESH_TOKEN];
    const refreshTokenFromSession = refreshTokenFromCookie
      ? null
      : await getRefreshTokenFromSession(req);
    const refreshToken = refreshTokenFromCookie || refreshTokenFromSession || undefined;

    const backendResponse = await postBackend(
      BACKEND_REISSUE_PATH,
      { refreshToken },
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

    const sanitizedPayload = sanitizeTokenPayload(payload);
    const message = extractContractMessage(sanitizedPayload, 'Token reissued');

    return res.status(backendResponse.status).json(
      buildSuccessContract({
        traceId,
        code: 'TOKEN_REISSUE_SUCCESS',
        message,
        data: sanitizedPayload,
        mergeData: true,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const payload = sanitizeTokenPayload(resolvePayload(error.response.data));
      const code = extractContractCode(payload, 'TOKEN_REISSUE_FAILED');
      const message = extractContractMessage(payload, 'Token reissue failed');

      console.error('[token/reissue] backend error', {
        status: error.response.status,
        data: error.response.data,
        path: error.config?.url,
      });

      return res.status(error.response.status).json(
        buildErrorContract({
          traceId,
          code,
          message,
          data: payload,
          mergeData: true,
        })
      );
    }

    console.error('[token/reissue] unknown error', error);
    return res.status(500).json(
      buildErrorContract({
        traceId,
        code: 'TOKEN_REISSUE_PROXY_FAILED',
        message: 'Token reissue failed',
      })
    );
  }
};
