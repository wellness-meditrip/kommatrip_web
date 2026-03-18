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

  const refreshToken =
    typeof req.body?.refreshToken === 'string' && req.body.refreshToken.trim().length > 0
      ? req.body.refreshToken.trim()
      : undefined;

  try {
    const backendResponse = await postBackend(
      BACKEND_ADMIN_REISSUE_PATH,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const payload = resolveBackendPayload(backendResponse.data);
    const message = extractContractMessage(payload, 'Admin token reissued');

    return res.status(backendResponse.status).json(
      buildSuccessContract({
        traceId,
        code: 'ADMIN_TOKEN_REISSUE_SUCCESS',
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
