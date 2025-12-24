import { useQuery, useMutation } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
// import { getUserValidate } from '@/apis/auth';
import {
  postVerifyEmailCode,
  postConfirmEmail,
  postSignup,
  postLogin,
  postResetPasswordConfirm,
  postResetPasswordRequest,
  postResetPasswordComplete,
  postInterest,
} from '@/apis/auth';
import {
  PostVerifyEmailCodeResponse,
  PostConfirmEmailRequest,
  PostConfirmEmailResponse,
  PostSignupRequestBody,
  PostSignupResponse,
  PostLoginResponse,
  PostLoginRequestBody,
  PostResetPasswordRequestResponse,
  PostResetPasswordConfirmResponse,
  PostResetPasswordConfirmRequest,
  PostResetPasswordCompleteResponse,
  PostResetPasswordCompleteRequest,
  PostInterestRequestBody,
  PostInterestResponse,
} from '@/models/auth';

export const useGetUserValidateQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_VALIDATE,
    queryFn: async () => {
      // validate 기능 주석 처리
      throw new Error('getUserValidate is disabled');
      // return getUserValidate();
    },
    retry: (failureCount, error: unknown) => {
      // 404 에러나 403 에러는 재시도하지 않음
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 404 || axiosError?.response?.status === 403) {
        return false;
      }
      // 다른 에러는 최대 1번만 재시도
      return failureCount < 1;
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// 이메일 인증 코드 전송
export const usePostVerifyEmailCodeMutation = () => {
  return useMutation<PostVerifyEmailCodeResponse, Error, string>({
    mutationKey: QUERY_KEYS.POST_VERIFY_EMAIL_CODE,
    mutationFn: postVerifyEmailCode,
  });
};

// 이메일 인증 코드 검증
export const usePostConfirmEmailMutation = () => {
  return useMutation<PostConfirmEmailResponse, Error, PostConfirmEmailRequest>({
    mutationKey: QUERY_KEYS.POST_CONFIRM_EMAIL,
    mutationFn: postConfirmEmail,
  });
};

// 회원가입
export const usePostSignupMutation = () => {
  return useMutation<PostSignupResponse, Error, PostSignupRequestBody>({
    mutationKey: QUERY_KEYS.POST_SIGNUP,
    mutationFn: postSignup,
  });
};

// 로그인
export const usePostLoginMutation = () => {
  return useMutation<PostLoginResponse, Error, PostLoginRequestBody>({
    mutationKey: QUERY_KEYS.POST_LOGIN,
    mutationFn: postLogin,
  });
};

// 비밀번호 재설정 요청
export const usePostResetPasswordRequestMutation = () => {
  return useMutation<PostResetPasswordRequestResponse, Error, string>({
    mutationKey: QUERY_KEYS.POST_RESET_PASSWORD,
    mutationFn: postResetPasswordRequest,
  });
};

// 비밀번호 재설정 코드 검증
export const usePostResetPasswordConfirmMutation = () => {
  return useMutation<PostResetPasswordConfirmResponse, Error, PostResetPasswordConfirmRequest>({
    mutationKey: QUERY_KEYS.POST_RESET_PASSWORD_CONFIRM,
    mutationFn: postResetPasswordConfirm,
  });
};

// 비밀번호 재설정
export const usePostResetPasswordMutation = () => {
  return useMutation<PostResetPasswordCompleteResponse, Error, PostResetPasswordCompleteRequest>({
    mutationKey: QUERY_KEYS.POST_RESET_PASSWORD,
    mutationFn: postResetPasswordComplete,
  });
};

// 관심사 등록
export const usePostInterestMutation = () => {
  return useMutation<PostInterestResponse, Error, PostInterestRequestBody>({
    mutationKey: QUERY_KEYS.POST_INTEREST,
    mutationFn: postInterest,
  });
};
