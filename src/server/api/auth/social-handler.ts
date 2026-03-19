import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import {
  buildErrorContract,
  buildSuccessContract,
  extractContractCode,
  extractContractMessage,
  resolveTraceId,
} from '@/server/http/api-contract';
import { exchangeApple } from '@/server/auth/exchangeApple';
import { exchangeGoogle } from '@/server/auth/exchangeGoogle';
import type {
  PostSocialLoginRequestBody,
  PostSocialLoginResponse,
  SocialProvider,
} from '@/models/auth';
import { applyRefreshTokenCookies, sanitizeAuthPayload } from './auth-proxy-utils';

const isDev = process.env.NODE_ENV !== 'production';

const EXCHANGE_HANDLERS: Record<
  SocialProvider,
  (payload: Omit<PostSocialLoginRequestBody, 'provider'>) => Promise<PostSocialLoginResponse>
> = {
  google: exchangeGoogle,
  apple: exchangeApple,
};

const isSocialProvider = (value: unknown): value is SocialProvider =>
  value === 'google' || value === 'apple';

export const handleSocialLogin = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { provider, idToken, country, marketing_consent } =
    req.body as Partial<PostSocialLoginRequestBody>;

  if (
    !isSocialProvider(provider) ||
    typeof idToken !== 'string' ||
    idToken.trim().length === 0 ||
    typeof country !== 'string' ||
    country.trim().length === 0 ||
    typeof marketing_consent !== 'boolean'
  ) {
    return res.status(400).json(
      buildErrorContract({
        traceId,
        code: 'INVALID_SOCIAL_LOGIN_REQUEST',
        message: 'Invalid social login request',
      })
    );
  }

  try {
    const backendResponse = await EXCHANGE_HANDLERS[provider]({
      idToken,
      country,
      marketing_consent,
    });

    applyRefreshTokenCookies(res, backendResponse);
    const sanitizedPayload = sanitizeAuthPayload<PostSocialLoginResponse>(backendResponse);
    const message = extractContractMessage(sanitizedPayload, 'Social login successful');

    if (isDev) {
      console.info('[auth/social] success', {
        provider,
      });
    }

    return res.status(200).json(
      buildSuccessContract({
        traceId,
        code: 'SOCIAL_LOGIN_SUCCESS',
        message,
        data: sanitizedPayload,
        mergeData: true,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const payload = sanitizeAuthPayload(error.response.data);
        const code = extractContractCode(payload, 'SOCIAL_LOGIN_BACKEND_ERROR');
        const message = extractContractMessage(payload, 'Social login failed');

        console.error('[auth/social] backend response error', {
          provider,
          status: error.response.status,
          data: error.response.data,
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

      console.error('[auth/social] upstream request failed', {
        provider,
        message: error.message,
        code: error.code,
      });

      return res.status(502).json(
        buildErrorContract({
          traceId,
          code: 'SOCIAL_LOGIN_UPSTREAM_UNAVAILABLE',
          message: 'Social login upstream unavailable',
        })
      );
    }

    console.error('[auth/social] unknown error', error);
    return res.status(500).json(
      buildErrorContract({
        traceId,
        code: 'SOCIAL_LOGIN_PROXY_FAILED',
        message: 'Social login failed',
      })
    );
  }
};
