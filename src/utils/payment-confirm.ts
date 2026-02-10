import type { PostConfirmPaymentResponse } from '@/models/payment';
import { normalizeError } from '@/utils/error-handler';

export type PaymentResultType =
  | 'SUCCESS'
  | 'FAILED'
  | 'RETRYABLE_FAILED'
  | 'TERMINAL_FAILED'
  | 'APPROVED_BUT_PENDING';

export type PaymentReasonCode =
  | 'reservation_pending'
  | 'auth_required'
  | 'retryable_failure'
  | 'generic_failure';

const reservationPendingErrorCodes = new Set([
  'RESERVATION_SERVICE_UNAVAILABLE',
  'RESERVATION_CREATE_INVALID',
  'RESERVATION_CREATE_UNAUTHORIZED',
  'RESERVATION_CREATE_NOT_FOUND',
  'RESERVATION_CREATE_CONFLICT',
  'RESERVATION_CREATE_VALIDATION_ERROR',
  'RESERVATION_CREATE_FAILED',
]);

const retryableErrorCodes = new Set(['TOSS_REQUEST_FAILED', 'PROGRAM_SERVICE_UNAVAILABLE']);

const terminalErrorCodes = new Set(['INSUFFICIENT_PERMISSIONS']);

const reservationPendingFragments = [
  '예약 서비스와 연결할 수 없습니다',
  '예약 생성에 실패했습니다',
  '예약 생성 충돌이 발생했습니다',
  '예약 요청 값 검증에 실패했습니다',
  '예약 생성 권한이 없습니다',
  '예약 대상 정보를 찾을 수 없습니다',
];

const retryableFailureFragments = [
  '토스 결제 승인 요청에 실패했습니다',
  '결제 승인 중 오류가 발생했습니다',
  '프로그램 서비스와 연결할 수 없습니다',
];

const terminalFailureFragments = ['Not authenticated', '결제 접근 권한이 없습니다'];

const includesAny = (message: string, fragments: string[]): boolean => {
  return fragments.some((fragment) => message.includes(fragment));
};

const normalizeMessage = (message?: string): string => {
  return (message ?? '').trim();
};

const toErrorCode = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return undefined;
};

const isReservationPendingFailure = (payload: PostConfirmPaymentResponse): boolean => {
  if (payload.error_code && reservationPendingErrorCodes.has(payload.error_code)) return true;
  return includesAny(normalizeMessage(payload.message), reservationPendingFragments);
};

const isTerminalFailure = (payload: PostConfirmPaymentResponse): boolean => {
  if (payload.error_code && terminalErrorCodes.has(payload.error_code)) return true;

  const status = payload.status;
  if (status === 401 || status === 403) return true;

  return includesAny(normalizeMessage(payload.message), terminalFailureFragments);
};

const isRetryableFailure = (payload: PostConfirmPaymentResponse): boolean => {
  if (payload.error_code && retryableErrorCodes.has(payload.error_code)) return true;

  const status = payload.status;
  if (typeof status === 'number' && status >= 500) return true;

  return includesAny(normalizeMessage(payload.message), retryableFailureFragments);
};

export const resolvePaymentResult = (payload: PostConfirmPaymentResponse): PaymentResultType => {
  if (payload.success === true) return 'SUCCESS';
  if (payload.payment || payload.reservation) return 'SUCCESS';

  if (isReservationPendingFailure(payload)) return 'APPROVED_BUT_PENDING';
  if (isTerminalFailure(payload)) return 'TERMINAL_FAILED';
  if (isRetryableFailure(payload)) return 'RETRYABLE_FAILED';

  return 'FAILED';
};

export const resolvePaymentReasonCode = (
  payload: PostConfirmPaymentResponse
): PaymentReasonCode | undefined => {
  if (isReservationPendingFailure(payload)) return 'reservation_pending';
  if (isTerminalFailure(payload)) return 'auth_required';
  if (isRetryableFailure(payload)) return 'retryable_failure';

  if (!payload.success) return 'generic_failure';
  return undefined;
};

const hasConfirmPayloadShape = (value: unknown): value is PostConfirmPaymentResponse => {
  if (!value || typeof value !== 'object') return false;

  return (
    'success' in value ||
    'error_code' in value ||
    'payment' in value ||
    'reservation' in value ||
    'payment_status' in value ||
    'status' in value
  );
};

export const extractConfirmPayload = (
  errorOrResponse: PostConfirmPaymentResponse | unknown
): PostConfirmPaymentResponse => {
  if (hasConfirmPayloadShape(errorOrResponse)) {
    return errorOrResponse;
  }

  const normalized = normalizeError(errorOrResponse);
  const baseMessage = normalized.message;
  const normalizedErrorCode = toErrorCode(normalized.code);

  if (normalized.details && typeof normalized.details === 'object' && normalized.details !== null) {
    const details = normalized.details as {
      success?: boolean;
      error_code?: string;
      message?: string;
      payment?: PostConfirmPaymentResponse['payment'];
      reservation?: PostConfirmPaymentResponse['reservation'];
      detail?: string | { message?: string; error_code?: string; code?: string | number };
      code?: string | number;
    };

    const nestedDetail =
      details.detail && typeof details.detail === 'object' ? details.detail : undefined;
    const nestedDetailMessage = nestedDetail?.message;
    const nestedDetailErrorCode = toErrorCode(nestedDetail?.error_code ?? nestedDetail?.code);
    const detailsErrorCode = toErrorCode(details.error_code ?? details.code);

    return {
      success: details.success ?? false,
      status: normalized.status,
      error_code: detailsErrorCode ?? nestedDetailErrorCode ?? normalizedErrorCode,
      message:
        details.message ??
        (typeof details.detail === 'string' ? details.detail : undefined) ??
        nestedDetailMessage ??
        baseMessage,
      payment: details.payment,
      reservation: details.reservation,
    };
  }

  return {
    success: false,
    status: normalized.status,
    error_code: normalizedErrorCode,
    message: baseMessage,
  };
};
