import axios from 'axios';

export interface ApiErrorResponse {
  error?: {
    message?: string;
    code?: string | number;
  };
  error_code?: string | number;
  code?: string | number;
  message?: string;
  detail?: string | { message?: string; error_code?: string | number; code?: string | number };
}

export type AppError = {
  status?: number;
  code?: string | number;
  message: string;
  details?: unknown;
  url?: string;
  method?: string;
  source?: 'API' | 'QUERY' | 'UI';
};

const extractMessage = (data?: ApiErrorResponse | null): string => {
  if (!data) return 'Unexpected error';
  if (typeof data.error?.message === 'string' && data.error.message.trim().length > 0) {
    return data.error.message;
  }
  if (typeof data.message === 'string' && data.message.trim().length > 0) {
    return data.message;
  }
  if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
    return data.detail;
  }
  if (data.detail && typeof data.detail === 'object') {
    const detailMessage = data.detail.message;
    if (typeof detailMessage === 'string' && detailMessage.trim().length > 0) {
      return detailMessage;
    }
  }
  return 'Unexpected error';
};

const extractCode = (data?: ApiErrorResponse | null): string | number | undefined => {
  if (!data) return undefined;
  if (typeof data.error?.code !== 'undefined') return data.error.code;
  if (typeof data.error_code !== 'undefined') return data.error_code;
  if (typeof data.code !== 'undefined') return data.code;
  if (data.detail && typeof data.detail === 'object') {
    if (typeof data.detail.error_code !== 'undefined') return data.detail.error_code;
    if (typeof data.detail.code !== 'undefined') return data.detail.code;
  }
  return undefined;
};

const containsHangul = (message: string): boolean => /[가-힣]/.test(message);

export const normalizeError = (error: unknown): AppError => {
  if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
    return error as AppError;
  }

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const message = extractMessage(error.response?.data) || error.message || 'Unexpected error';
    return {
      status,
      code: extractCode(error.response?.data),
      message,
      details: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      source: 'API',
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Unexpected error',
      source: 'UI',
    };
  }

  return {
    message: 'Unexpected error',
    source: 'UI',
  };
};

/**
 * API 에러에서 메시지 추출
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  const normalized = normalizeError(error);
  if (!normalized.message || normalized.message === 'Unexpected error') return defaultMessage;
  return normalized.message;
};

/**
 * API 에러 메시지를 다국어 기본 메시지로 보정
 */
export const getLocalizedErrorMessage = (error: unknown, defaultMessage: string): string => {
  const rawMessage = getErrorMessage(error, defaultMessage);
  if (containsHangul(rawMessage)) return defaultMessage;
  return rawMessage;
};

/**
 * 세션 만료 에러인지 확인
 */
export const isSessionExpiredError = (error: unknown): boolean => {
  const normalized = normalizeError(error);
  const status = normalized.status;
  const errorMessage = normalized.message || '';

  if (status === 400) {
    return (
      errorMessage.includes('만료') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('세션')
    );
  }

  return false;
};

/**
 * 세션 만료 메시지 생성
 */
export const getSessionExpiredMessage = (error: unknown): string => {
  const errorMessage = normalizeError(error).message || '';

  if (isSessionExpiredError(error)) {
    return '이메일 인증 세션이 만료되었습니다. 다시 인증 코드를 받아주세요.';
  }

  return errorMessage;
};

export type ErrorAction = 'toast' | 'redirect' | 'inline' | 'silent';

interface ErrorContext {
  fallbackMessage?: string;
  overrideMessage?: string;
}

export const getUserMessage = (error: unknown): string => {
  const normalized = normalizeError(error);
  const status = normalized.status;
  if (status === 401 || status === 403) return '로그인이 필요합니다';
  if (status === 404) return '요청한 정보를 찾을 수 없습니다';
  if (status === 500 || status === 502 || status === 503 || status === 504)
    return '일시적인 서버 오류가 발생했습니다';
  if (status === 400 || status === 422) return normalized.message || '요청을 처리할 수 없습니다';
  return normalized.message || '예기치 못한 오류가 발생했습니다';
};

export const getToastMessage = (error: unknown, context?: ErrorContext): string => {
  if (context?.overrideMessage) return context.overrideMessage;
  const normalized = normalizeError(error);
  if (!normalized.message || normalized.message === 'Unexpected error') {
    return context?.fallbackMessage || getUserMessage(error);
  }
  return normalized.message;
};

export const getErrorAction = (error: unknown): ErrorAction => {
  const normalized = normalizeError(error);
  const status = normalized.status;
  if (status === 401 || status === 403) return 'toast';
  if (status === 404) return 'toast';
  if (status === 400 || status === 422) return 'inline';
  return 'toast';
};
