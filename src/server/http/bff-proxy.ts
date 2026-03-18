import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getBackendBaseUrl } from '@/server/config/backend-url';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const toAxiosParams = (query: NextApiRequest['query'], omitKeys: string[] = []) => {
  const params: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(query)) {
    if (omitKeys.includes(key)) continue;
    if (typeof value === 'undefined') continue;
    if (typeof value === 'string' || Array.isArray(value)) {
      params[key] = value;
    }
  }
  return params;
};

const buildHeaders = (
  req: NextApiRequest,
  options: { includeContentHeaders?: boolean; includeCookie?: boolean } = {}
) => {
  const headers: Record<string, string> = {};
  const authorization = req.headers.authorization;
  if (typeof authorization === 'string' && authorization.length > 0) {
    headers.Authorization = authorization;
  }

  const accept = req.headers.accept;
  if (typeof accept === 'string' && accept.length > 0) {
    headers.Accept = accept;
  }

  if (options.includeCookie) {
    const cookie = req.headers.cookie;
    if (typeof cookie === 'string' && cookie.length > 0) {
      headers.cookie = cookie;
    }
  }

  if (options.includeContentHeaders) {
    const contentType = req.headers['content-type'];
    if (typeof contentType === 'string' && contentType.length > 0) {
      headers['Content-Type'] = contentType;
    }
    const contentLength = req.headers['content-length'];
    if (typeof contentLength === 'string' && contentLength.length > 0) {
      headers['Content-Length'] = contentLength;
    }
  }

  return headers;
};

const sendProxyError = (res: NextApiResponse, error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    return res.status(error.response.status).send(error.response.data);
  }
  console.error('[bff-proxy] unexpected error', error);
  return res.status(500).json({ message: fallbackMessage });
};

export const validateMethod = (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: HttpMethod[]
): HttpMethod | null => {
  const method = req.method as HttpMethod | undefined;
  if (!method || !allowedMethods.includes(method)) {
    res.setHeader('Allow', allowedMethods);
    res.status(405).json({ message: 'Method Not Allowed' });
    return null;
  }
  return method;
};

export const proxyJsonToBackend = async ({
  req,
  res,
  method,
  backendPath,
  omitQueryKeys,
  includeCookie,
  errorMessage,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  method: HttpMethod;
  backendPath: string;
  omitQueryKeys?: string[];
  includeCookie?: boolean;
  errorMessage: string;
}) => {
  try {
    const baseURL = getBackendBaseUrl();
    const response = await axios.request({
      method,
      url: `${baseURL}${backendPath}`,
      params: toAxiosParams(req.query, omitQueryKeys),
      data: METHODS_WITH_BODY.has(method) ? req.body : undefined,
      headers: buildHeaders(req, { includeCookie }),
    });

    return res.status(response.status).send(response.data);
  } catch (error: unknown) {
    return sendProxyError(res, error, errorMessage);
  }
};

export const proxyRawToBackend = async ({
  req,
  res,
  method,
  backendPath,
  omitQueryKeys,
  includeCookie,
  errorMessage,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  method: HttpMethod;
  backendPath: string;
  omitQueryKeys?: string[];
  includeCookie?: boolean;
  errorMessage: string;
}) => {
  try {
    const baseURL = getBackendBaseUrl();
    const response = await axios.request({
      method,
      url: `${baseURL}${backendPath}`,
      params: toAxiosParams(req.query, omitQueryKeys),
      data: METHODS_WITH_BODY.has(method) ? req : undefined,
      headers: buildHeaders(req, {
        includeContentHeaders: METHODS_WITH_BODY.has(method),
        includeCookie,
      }),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (isRecord(response.data) || Array.isArray(response.data)) {
      return res.status(response.status).json(response.data);
    }
    return res.status(response.status).send(response.data);
  } catch (error: unknown) {
    return sendProxyError(res, error, errorMessage);
  }
};
