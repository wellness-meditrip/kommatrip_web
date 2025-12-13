import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  error?: {
    message?: string;
    code?: string | number;
  };
  message?: string;
}

/**
 * API 에러에서 메시지 추출
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return (
    axiosError?.response?.data?.error?.message ||
    axiosError?.response?.data?.message ||
    defaultMessage
  );
};

/**
 * 세션 만료 에러인지 확인
 */
export const isSessionExpiredError = (error: unknown): boolean => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const status = axiosError?.response?.status;
  const errorMessage =
    axiosError?.response?.data?.error?.message || axiosError?.response?.data?.message || '';

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
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const errorMessage =
    axiosError?.response?.data?.error?.message || axiosError?.response?.data?.message || '';

  if (isSessionExpiredError(error)) {
    return '이메일 인증 세션이 만료되었습니다. 다시 인증 코드를 받아주세요.';
  }

  return errorMessage;
};
