import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createRefreshTokenCookies } from '@/server/auth/cookies';

const BACKEND_LOGIN_PATH = 'user/non/login/customer';
const isDev = process.env.NODE_ENV !== 'production';

const resolvePayload = (data: unknown) => {
  if (!data || typeof data !== 'object') return data;
  const nested = (data as { response?: unknown }).response;
  return nested ?? data;
};

const normalizePath = (path: string) => path.trim().replace(/^\/+/, '');

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

const buildDebugResponseBody = (body: unknown, debug: { baseURL?: string; path?: string }) => {
  if (!isDev) return body;

  if (body && typeof body === 'object') {
    return {
      ...(body as Record<string, unknown>),
      _debug: debug,
    };
  }

  return {
    message: typeof body === 'string' ? body : 'Login failed',
    _debug: debug,
  };
};

const postLoginToBackend = async (body: unknown) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL ?? '';
  if (!baseURL) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }

  const path = normalizePath(process.env.BACKEND_LOGIN_PATH ?? BACKEND_LOGIN_PATH);
  const response = await axios.post(path, body, {
    baseURL,
    timeout: 7000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return { response, usedPath: path };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { response: backendResponse, usedPath } = await postLoginToBackend(req.body);

    const payload = resolvePayload(backendResponse.data);
    const refreshToken = extractRefreshToken(payload);
    if (refreshToken) {
      res.setHeader('Set-Cookie', createRefreshTokenCookies(refreshToken));
    }

    if (isDev) {
      console.info('[login/customer] success', {
        status: backendResponse.status,
        baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
        usedPath,
      });
    }

    return res.status(backendResponse.status).json(sanitizeResponse(payload));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const debugInfo = {
          baseURL: error.config?.baseURL,
          path: error.config?.url,
        };
        console.error('[login/customer] backend response error', {
          status: error.response.status,
          data: error.response.data,
          ...debugInfo,
        });
        return res
          .status(error.response.status)
          .json(buildDebugResponseBody(error.response.data, debugInfo));
      }
      console.error('[login/customer] upstream request failed', {
        message: error.message,
        code: error.code,
      });
      return res.status(502).json({
        message: 'Login upstream unavailable',
        ...(isDev
          ? {
              detail: error.message,
              code: error.code,
              baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
            }
          : {}),
      });
    }
    console.error('[login/customer] unknown error', error);
    return res.status(500).json({
      message: 'Login failed',
      ...(isDev && error instanceof Error ? { detail: error.message } : {}),
    });
  }
}
