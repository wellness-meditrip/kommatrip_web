import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { ADMIN_AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { createAdminRefreshTokenCookies } from '@/server/auth/cookies';
import { resolvePayload, extractRefreshToken } from '@/server/auth/token-payload';
import { postBackend, resolveBackendPayload } from '@/server/http/backend-client';
import { getAdminBackendBaseUrl } from '@/server/config/admin-backend';
import {
  buildErrorContract,
  buildSuccessContract,
  extractContractCode,
  extractContractMessage,
  resolveTraceId,
} from '@/server/http/api-contract';
import { sanitizeAuthPayload } from '@/server/api/auth/auth-proxy-utils';

const BACKEND_ADMIN_REISSUE_PATH = 'api/users/token/reissue';

export const handleAdminTokenReissue = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const refreshTokenFromCookie = req.cookies?.[ADMIN_AUTH_COOKIE_KEYS.REFRESH_TOKEN];
    const refreshToken = refreshTokenFromCookie || undefined;
    const backendBaseUrl = getAdminBackendBaseUrl(req);

    const backendResponse = await postBackend(
      BACKEND_ADMIN_REISSUE_PATH,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.cookie ?? '',
        },
      },
      { baseURL: backendBaseUrl }
    );

    const payload = resolvePayload(resolveBackendPayload(backendResponse.data));
    const rotatedRefreshToken = extractRefreshToken(payload);
    if (rotatedRefreshToken) {
      res.setHeader('Set-Cookie', createAdminRefreshTokenCookies(rotatedRefreshToken));
    }

    const sanitizedPayload = sanitizeAuthPayload(payload);
    const message = extractContractMessage(sanitizedPayload, 'Admin token reissued');

    return res.status(backendResponse.status).json(
      buildSuccessContract({
        traceId,
        code: 'ADMIN_TOKEN_REISSUE_SUCCESS',
        message,
        data: sanitizedPayload,
        mergeData: true,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const payload = sanitizeAuthPayload(resolveBackendPayload(error.response.data));
      return res.status(error.response.status).json(
        buildErrorContract({
          traceId,
          code: extractContractCode(payload, 'ADMIN_TOKEN_REISSUE_FAILED'),
          message: extractContractMessage(payload, 'Admin token reissue failed'),
          data: payload,
          mergeData: true,
        })
      );
    }

    console.error('[admin/token/reissue] unexpected error', error);
    return res.status(500).json(
      buildErrorContract({
        traceId,
        code: 'ADMIN_TOKEN_REISSUE_PROXY_FAILED',
        message: 'Admin token reissue failed',
      })
    );
  }
};
