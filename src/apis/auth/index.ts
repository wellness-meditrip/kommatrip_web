import { guestApi } from '@/apis/config';
import {
  PostConfirmEmailRequest,
  PostConfirmEmailResponse,
  PostSignupRequestBody,
  PostSignupResponse,
  PostVerifyEmailCodeResponse,
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
