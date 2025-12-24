import { api, guestApi } from '@/apis/config';
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
  PostUserAuthGoogleRequest,
  PostUserAuthGoogleResponse,
  PostTokenReissueResponse,
  PostInterestRequestBody,
  PostInterestResponse,
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

// 소셜 로그인(google)
export const postUserAuthGoogle = async (data: PostUserAuthGoogleRequest) => {
  return await guestApi.post<PostUserAuthGoogleResponse>(
    '/api/users/auth/google',
    {
      idToken: data.idToken,
      country: data.country,
      marketing_consent: data.marketing_consent,
    },
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

// 토큰 재발급 (쿠키에서 refreshToken 자동 전송)
export const postTokenReissue = async (): Promise<PostTokenReissueResponse> => {
  // refreshToken은 쿠키에서 자동으로 전송됨 (withCredentials: true)
  // guestApi는 그대로 두고, 이 함수에서만 withCredentials를 명시적으로 설정
  return api.post<PostTokenReissueResponse>(
    '/token/reissue',
    {},
    {
      withCredentials: true, // 쿠키 전송을 위해 필요
    }
  );
};

// 관심사 등록
export const postInterest = async (
  data: PostInterestRequestBody
): Promise<PostInterestResponse> => {
  return await api.post<PostInterestResponse>('/api/users/interest', data, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });
};
