import { guestApi } from '@/apis/config';
import {
  PostConfirmEmailRequest,
  PostConfirmEmailResponse,
  PostLoginRequestBody,
  PostLoginResponse,
  PostSignupRequestBody,
  PostSignupResponse,
  PostVerifyEmailCodeResponse,
  PostResetPasswordConfirmRequest,
  PostResetPasswordConfirmResponse,
  PostResetPasswordRequestResponse,
  PostResetPasswordCompleteRequest,
  PostResetPasswordCompleteResponse,
} from '@/models/auth';

// 이메일 인증 코드 전송
export const postVerifyEmailCode = async (email: string) => {
  return await guestApi.post<PostVerifyEmailCodeResponse>(
    '/api/users/email/verify-email',
    { email },
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

// 이메일 인증 코드 검증
export const postConfirmEmail = async (data: PostConfirmEmailRequest) => {
  return await guestApi.post<PostConfirmEmailResponse>('/api/users/email/confirm-email', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 회원가입
export const postSignup = async (data: PostSignupRequestBody) => {
  return await guestApi.post<PostSignupResponse>('/api/users/register/customer', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 로그인
export const postLogin = async (data: PostLoginRequestBody) => {
  return await guestApi.post<PostLoginResponse>('/api/users/login/customer', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 비밀번호 재설정 코드 발송
export const postResetPasswordRequest = async (email: string) => {
  return await guestApi.post<PostResetPasswordRequestResponse>(
    '/api/users/password/reset/request',
    { email },
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

// 비밀번호 재설정 코드 검증
export const postResetPasswordConfirm = async (data: PostResetPasswordConfirmRequest) => {
  return await guestApi.post<PostResetPasswordConfirmResponse>(
    '/api/users/password/reset/confirm-code',
    data,
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

// 비밀번호 재설정
export const postResetPasswordComplete = async (data: PostResetPasswordCompleteRequest) => {
  return await guestApi.post<PostResetPasswordCompleteResponse>(
    '/api/users/password/reset/complete',
    data,
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};
