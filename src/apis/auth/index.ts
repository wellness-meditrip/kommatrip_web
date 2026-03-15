import axios from 'axios';
import { bffApi, guestApi } from '@/apis/config';
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
  PostUserAuthAppleRequest,
  PostUserAuthAppleResponse,
  PostTokenReissueResponse,
  PostInterestRequestBody,
  PostInterestResponse,
} from '@/models/auth';

// 이메일 인증 코드 전송
export const postVerifyEmailCode = async (email: string) => {
  return await guestApi.post<PostVerifyEmailCodeResponse>(
    'user/non/email/verify-email',
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
  return await guestApi.post<PostConfirmEmailResponse>('user/non/email/confirm-email', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 회원가입
export const postSignup = async (data: PostSignupRequestBody) => {
  return await guestApi.post<PostSignupResponse>('user/non/register/customer', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 로그인
export const postLogin = async (data: PostLoginRequestBody) => {
  return axios
    .post<PostLoginResponse>('/api/user/non/login/customer', data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) =>
      response.data && typeof response.data === 'object' && 'response' in response.data
        ? (response.data as { response: PostLoginResponse }).response
        : response.data
    );
};

// 비밀번호 재설정 코드 발송
export const postResetPasswordRequest = async (email: string) => {
  return await guestApi.post<PostResetPasswordRequestResponse>(
    'user/non/password/reset/request',
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
    'user/non/password/reset/confirm-code',
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
    'user/non/password/reset/complete',
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
    'user/non/auth/google',
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

// 소셜 로그인(apple)
export const postUserAuthApple = async (data: PostUserAuthAppleRequest) => {
  return await guestApi.post<PostUserAuthAppleResponse>(
    'user/non/auth/apple',
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
  // refreshToken은 브라우저 쿠키에 저장되므로 same-origin API를 호출해야 전송됨
  return axios
    .post<PostTokenReissueResponse>(
      '/api/users/token/reissue',
      {},
      {
        withCredentials: true,
      }
    )
    .then((response) => response.data);
};

// 관심사 등록
export const postInterest = async (
  data: PostInterestRequestBody
): Promise<PostInterestResponse> => {
  return await bffApi.post<PostInterestResponse>('/api/users/interest', data, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};
