import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { postBackend, resolveBackendPayload } from '@/server/http/backend-client';
import {
  buildErrorContract,
  buildSuccessContract,
  extractContractCode,
  extractContractMessage,
  resolveTraceId,
} from '@/server/http/api-contract';

const BACKEND_ADMIN_REGISTER_PATH = 'api/users/register/admin';

export const handleAdminRegister = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const backendResponse = await postBackend(BACKEND_ADMIN_REGISTER_PATH, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 7000,
    });

    const payload = resolveBackendPayload(backendResponse.data);
    const message = extractContractMessage(payload, 'Admin register successful');

    return res.status(backendResponse.status).json(
      buildSuccessContract({
        traceId,
        code: 'ADMIN_REGISTER_SUCCESS',
        message,
        data: payload,
        mergeData: true,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const payload = resolveBackendPayload(error.response.data);
      return res.status(error.response.status).json(
        buildErrorContract({
          traceId,
          code: extractContractCode(payload, 'ADMIN_REGISTER_FAILED'),
          message: extractContractMessage(payload, 'Admin register failed'),
          data: payload,
          mergeData: true,
        })
      );
    }

    console.error('[admin/register] unexpected error', error);
    return res.status(500).json(
      buildErrorContract({
        traceId,
        code: 'ADMIN_REGISTER_PROXY_FAILED',
        message: 'Admin register failed',
      })
    );
  }
};
