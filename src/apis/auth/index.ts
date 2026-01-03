import axios from 'axios';
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
  return await guestApi.post<PostLoginResponse>('user/non/login/customer', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
  console.log('[postUserAuthGoogle] Request start', {
    idTokenLength: data.idToken?.length,
    country: data.country,
    marketing_consent: data.marketing_consent,
    url: 'user/non/auth/google',
  });

  try {
    const response = await guestApi.post<PostUserAuthGoogleResponse>(
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

    const isObject = typeof response === 'object' && response !== null;
    const responseRecord = isObject ? (response as { user?: unknown; tokens?: unknown }) : null;
    console.log('[postUserAuthGoogle] Response received', {
      hasResponse: !!response,
      responseType: typeof response,
      responseKeys: isObject ? Object.keys(response as object) : [],
      hasUser: !!responseRecord?.user,
      hasTokens: !!responseRecord?.tokens,
    });

    // 백엔드 응답 구조 확인 (response.data.response 형태일 수 있음)
    if (response && typeof response === 'object' && 'response' in response) {
      const wrapped = response as { response?: PostUserAuthGoogleResponse };
      const unwrapped = wrapped.response;
      console.log('[postUserAuthGoogle] Unwrapped response', {
        hasUser: !!unwrapped?.user,
        hasTokens: !!unwrapped?.tokens,
      });
      if (unwrapped) {
        return unwrapped;
      }
    }

    console.log('[postUserAuthGoogle] Returning response as-is');
    return response;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: unknown;
      };
      message?: string;
    };
    // 에러 상세 정보 로깅
    console.error('[postUserAuthGoogle] error details', {
      status: axiosError?.response?.status,
      statusText: axiosError?.response?.statusText,
      data: axiosError?.response?.data,
      errorMessage: axiosError?.message,
      requestData: {
        idTokenLength: data.idToken?.length,
        country: data.country,
        marketing_consent: data.marketing_consent,
      },
    });
    throw axiosError;
  }
};

// 소셜 로그인(apple)
export const postUserAuthApple = async (data: PostUserAuthAppleRequest) => {
  console.log('[postUserAuthApple] Request start', {
    idTokenLength: data.idToken?.length,
    country: data.country,
    marketing_consent: data.marketing_consent,
    url: 'user/non/auth/apple',
  });

  try {
    const response = await guestApi.post<PostUserAuthAppleResponse>(
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

    const isObject = typeof response === 'object' && response !== null;
    const responseRecord = isObject ? (response as { user?: unknown; tokens?: unknown }) : null;
    console.log('[postUserAuthApple] Response received', {
      hasResponse: !!response,
      responseType: typeof response,
      responseKeys: isObject ? Object.keys(response as object) : [],
      hasUser: !!responseRecord?.user,
      hasTokens: !!responseRecord?.tokens,
    });

    if (response && typeof response === 'object' && 'response' in response) {
      const wrapped = response as { response?: PostUserAuthAppleResponse };
      const unwrapped = wrapped.response;
      console.log('[postUserAuthApple] Unwrapped response', {
        hasUser: !!unwrapped?.user,
        hasTokens: !!unwrapped?.tokens,
      });
      if (unwrapped) {
        return unwrapped;
      }
    }

    console.log('[postUserAuthApple] Returning response as-is');
    return response;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: unknown;
      };
      message?: string;
    };
    console.error('[postUserAuthApple] error details', {
      status: axiosError?.response?.status,
      statusText: axiosError?.response?.statusText,
      data: axiosError?.response?.data,
      errorMessage: axiosError?.message,
      requestData: {
        idTokenLength: data.idToken?.length,
        country: data.country,
        marketing_consent: data.marketing_consent,
      },
    });
    throw axiosError;
  }
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
  return await api.post<PostInterestResponse>('/api/users/interest', data, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });
};
