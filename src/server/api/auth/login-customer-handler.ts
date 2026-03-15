import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
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

const BACKEND_LOGIN_PATH = 'user/non/login/customer';
const isDev = process.env.NODE_ENV !== 'production';

const normalizePath = (path: string) => path.trim().replace(/^\/+/, '');

export const handleCustomerLogin = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const path = normalizePath(process.env.BACKEND_LOGIN_PATH ?? BACKEND_LOGIN_PATH);

  try {
    const backendResponse = await postBackend(path, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 7000,
    });

    const payload = resolvePayload(backendResponse.data);
    const refreshToken = extractRefreshToken(payload);
    if (refreshToken) {
      res.setHeader('Set-Cookie', createRefreshTokenCookies(refreshToken));
    }

    const sanitizedPayload = sanitizeTokenPayload(payload);
    const message = extractContractMessage(sanitizedPayload, 'Login successful');

    if (isDev) {
      console.info('[login/customer] success', {
        status: backendResponse.status,
        path,
      });
    }

    return res.status(backendResponse.status).json(
      buildSuccessContract({
        traceId,
        code: 'LOGIN_SUCCESS',
        message,
        data: sanitizedPayload,
        mergeData: true,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const payload = sanitizeTokenPayload(resolvePayload(error.response.data));
        const code = extractContractCode(payload, 'LOGIN_BACKEND_ERROR');
        const message = extractContractMessage(payload, 'Login failed');

        console.error('[login/customer] backend response error', {
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

      console.error('[login/customer] upstream request failed', {
        message: error.message,
        code: error.code,
        path,
      });

      return res.status(502).json(
        buildErrorContract({
          traceId,
          code: 'LOGIN_UPSTREAM_UNAVAILABLE',
          message: 'Login upstream unavailable',
        })
      );
    }

    console.error('[login/customer] unknown error', error);
    return res.status(500).json(
      buildErrorContract({
        traceId,
        code: 'LOGIN_PROXY_FAILED',
        message: 'Login failed',
      })
    );
  }
};
