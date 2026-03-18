import { randomUUID } from 'crypto';
import type { NextApiRequest } from 'next';

type ApiContractBase = {
  success: boolean;
  code: string;
  message: string;
  traceId: string;
};

const CONTRACT_KEYS = new Set(['success', 'code', 'message', 'traceId', 'data']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return undefined;
};

const pickHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value.find((entry) => typeof entry === 'string' && entry.trim().length > 0)?.trim();
  }
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return undefined;
};

const omitContractKeys = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([key]) => !CONTRACT_KEYS.has(key)));

export const resolveTraceId = (req: NextApiRequest): string => {
  return (
    pickHeaderValue(req.headers['x-trace-id']) ??
    pickHeaderValue(req.headers['x-request-id']) ??
    randomUUID()
  );
};

export const extractContractCode = (data: unknown, fallback: string): string => {
  if (!data) return fallback;

  if (typeof data === 'string') return fallback;

  if (isRecord(data)) {
    const code = toStringValue(data.code);
    if (code) return code;

    const errorCode = toStringValue(data.error_code);
    if (errorCode) return errorCode;

    const nestedError = isRecord(data.error) ? data.error : undefined;
    const nestedCode = toStringValue(nestedError?.code);
    if (nestedCode) return nestedCode;

    const detail = data.detail;
    if (isRecord(detail)) {
      const detailCode = toStringValue(detail.code) ?? toStringValue(detail.error_code);
      if (detailCode) return detailCode;
    }
  }

  return fallback;
};

export const extractContractMessage = (data: unknown, fallback: string): string => {
  if (typeof data === 'string' && data.trim().length > 0) return data;
  if (!isRecord(data)) return fallback;

  const message = toStringValue(data.message);
  if (message) return message;

  const detail = data.detail;
  if (typeof detail === 'string' && detail.trim().length > 0) return detail;
  if (isRecord(detail)) {
    const detailMessage = toStringValue(detail.message);
    if (detailMessage) return detailMessage;
  }

  const nestedError = isRecord(data.error) ? data.error : undefined;
  const nestedMessage = toStringValue(nestedError?.message);
  if (nestedMessage) return nestedMessage;

  return fallback;
};

type BuildSuccessContractParams<T> = {
  traceId: string;
  code: string;
  message: string;
  data?: T;
  mergeData?: boolean;
  success?: boolean;
};

export const buildSuccessContract = <T>({
  traceId,
  code,
  message,
  data,
  mergeData = false,
  success = true,
}: BuildSuccessContractParams<T>): ApiContractBase & Record<string, unknown> => {
  const base: ApiContractBase & Record<string, unknown> = {
    success,
    code,
    message,
    traceId,
  };

  if (typeof data === 'undefined') return base;

  if (mergeData && isRecord(data)) {
    return {
      ...base,
      ...omitContractKeys(data),
      data,
    };
  }

  return {
    ...base,
    data,
  };
};

type BuildErrorContractParams<T> = {
  traceId: string;
  code: string;
  message: string;
  data?: T;
  mergeData?: boolean;
};

export const buildErrorContract = <T>({
  traceId,
  code,
  message,
  data,
  mergeData = false,
}: BuildErrorContractParams<T>): ApiContractBase & Record<string, unknown> => {
  const base: ApiContractBase & Record<string, unknown> = {
    success: false,
    code,
    message,
    traceId,
  };

  if (typeof data === 'undefined') return base;

  if (mergeData && isRecord(data)) {
    return {
      ...base,
      ...omitContractKeys(data),
      data,
    };
  }

  return {
    ...base,
    data,
  };
};
