import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { postBackend, resolveBackendPayload } from '@/server/http/backend-client';
import { getBackendBaseUrl } from '@/server/config/backend-url';
import {
  buildErrorContract,
  buildSuccessContract,
  extractContractCode,
  extractContractMessage,
  resolveTraceId,
} from '@/server/http/api-contract';

const isDebugRuntime =
  process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview';

const maskValue = (value: string, left = 6, right = 4) => {
  if (value.length <= left + right) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const resolveSuccessFlag = (payload: unknown): boolean => {
  if (!isRecord(payload)) return true;
  if (typeof payload.success === 'boolean') return payload.success;
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const authHeader = req.headers.authorization;
    const payload = req.body as {
      orderId?: string;
      paymentKey?: string;
      amount?: number;
      programId?: number;
    };

    const backendBaseUrl = getBackendBaseUrl();
    const backendConfirmUrl = `${backendBaseUrl}/api/payments/confirm`;

    if (isDebugRuntime) {
      console.info('[api/payments/confirm] incoming', {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        backendBaseUrl,
        backendConfirmUrl,
        hasAuthorization: Boolean(authHeader),
        orderId: payload?.orderId,
        paymentKey: payload?.paymentKey ? maskValue(payload.paymentKey) : undefined,
        amount: payload?.amount,
        programId: payload?.programId,
      });
    }

    const backendResponse = await postBackend('api/payments/confirm', req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const backendPayload = resolveBackendPayload(backendResponse.data);
    const successFlag = resolveSuccessFlag(backendPayload);
    const code = extractContractCode(
      backendPayload,
      successFlag ? 'PAYMENT_CONFIRM_SUCCESS' : 'PAYMENT_CONFIRM_FAILED'
    );
    const message = extractContractMessage(
      backendPayload,
      successFlag ? 'Payment confirmed' : 'Payment confirm failed'
    );

    if (isDebugRuntime) {
      console.info('[api/payments/confirm] backend response', {
        status: backendResponse.status,
        success: successFlag,
        code,
        message,
      });
    }

    return res.status(backendResponse.status).json(
      buildSuccessContract({
        traceId,
        code,
        message,
        success: successFlag,
        data: backendPayload,
        mergeData: true,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const backendPayload = resolveBackendPayload(error.response.data);
      const code = extractContractCode(backendPayload, 'PAYMENT_CONFIRM_FAILED');
      const message = extractContractMessage(backendPayload, 'Payment confirm failed');
      const legacyFields = isRecord(backendPayload) ? backendPayload : {};
      const errorData = {
        ...legacyFields,
        status:
          typeof legacyFields.status === 'number' ? legacyFields.status : error.response.status,
        error_code:
          typeof legacyFields.error_code === 'string' && legacyFields.error_code.trim().length > 0
            ? legacyFields.error_code
            : code,
      };

      if (isDebugRuntime) {
        console.error('[api/payments/confirm] backend error', {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          backendBaseUrl: getBackendBaseUrl(),
          status: error.response.status,
          code,
          message,
          data: error.response.data,
        });
      } else {
        console.error('[api/payments/confirm] backend error', {
          status: error.response.status,
          code,
        });
      }

      return res.status(error.response.status).json(
        buildErrorContract({
          traceId,
          code,
          message,
          data: errorData,
          mergeData: true,
        })
      );
    }

    console.error('[api/payments/confirm] unexpected error', error);
    return res.status(500).json(
      buildErrorContract({
        traceId,
        code: 'PAYMENT_CONFIRM_PROXY_FAILED',
        message: 'Payment confirm failed',
        data: {
          status: 500,
          error_code: 'PAYMENT_CONFIRM_PROXY_FAILED',
        },
        mergeData: true,
      })
    );
  }
}
