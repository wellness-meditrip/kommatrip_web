import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getBackendBaseUrl } from '@/server/config/backend-url';

const isDev = process.env.NODE_ENV !== 'production';

const maskValue = (value: string, left = 6, right = 4) => {
  if (value.length <= left + right) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
};

const toErrorCode = (data: unknown): string | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const errorCode = (data as { error_code?: unknown }).error_code;
  if (typeof errorCode === 'string' && errorCode.trim().length > 0) return errorCode;
  const code = (data as { code?: unknown }).code;
  if (typeof code === 'string' && code.trim().length > 0) return code;
  const nestedCode = (data as { error?: { code?: unknown } }).error?.code;
  if (typeof nestedCode === 'string' && nestedCode.trim().length > 0) return nestedCode;
  if (typeof nestedCode === 'number') return String(nestedCode);
  return undefined;
};

const toErrorMessage = (data: unknown, fallback: string): string => {
  if (typeof data === 'string' && data.trim().length > 0) return data;
  if (!data || typeof data !== 'object') return fallback;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim().length > 0) return detail;
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim().length > 0) return message;
  const nestedMessage = (data as { error?: { message?: unknown } }).error?.message;
  if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) return nestedMessage;
  return fallback;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const payload = req.body as {
      orderId?: string;
      paymentKey?: string;
      amount?: number;
      programId?: number;
    };
    if (isDev) {
      console.info('[api/payments/confirm] incoming', {
        orderId: payload?.orderId,
        paymentKey: payload?.paymentKey ? maskValue(payload.paymentKey) : undefined,
        amount: payload?.amount,
        programId: payload?.programId,
      });
    }
    const backendBaseUrl = getBackendBaseUrl();
    const backendResponse = await axios.post(`${backendBaseUrl}/api/payments/confirm`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });
    if (isDev) {
      console.info('[api/payments/confirm] backend success', {
        status: backendResponse.status,
        success: backendResponse.data?.success,
        error_code: backendResponse.data?.error_code,
        message: backendResponse.data?.message,
        payment_status: backendResponse.data?.payment_status,
      });
    }

    return res.status(backendResponse.status).json(backendResponse.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (isDev) {
        console.error('[api/payments/confirm] backend error', {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error('[api/payments/confirm] backend error', {
          status: error.response.status,
        });
      }
      return res.status(error.response.status).json({
        success: false,
        status: error.response.status,
        error_code: toErrorCode(error.response.data),
        message: toErrorMessage(error.response.data, 'Payment confirm failed'),
      });
    }
    console.error('[api/payments/confirm] unexpected error', error);
    return res.status(500).json({
      success: false,
      status: 500,
      error_code: 'PAYMENT_CONFIRM_PROXY_FAILED',
      message: 'Payment confirm failed',
    });
  }
}
