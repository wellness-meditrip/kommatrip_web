// 회원가입
export interface PostSignupRequestBody {
  email: string;
  verification_token: string;
  password: string;
  country: string;
  marketing_consent: boolean;
}

export interface PostSignupResponse {
  accessToken?: string;
  message?: string;
}

// 이메일 인증
export interface PostVerifyEmailCodeRequest {
  email: string;
}
// 이메일 인증 코드 전송 응답
export interface PostVerifyEmailCodeResponse {
  message?: string;
}

// 이메일 인증 코드 검증 요청
export interface PostConfirmEmailRequest {
  email: string;
  code: string;
}
export interface PostConfirmEmailResponse {
  message?: string;
  session_token: string;
  email?: string;
}

// 로그인
export interface PostLoginRequestBody {
  email: string;
  password: string;
}

export interface PostLoginResponse {
  message?: string;
  user: User;
  tokens: Token;
}

export interface User {
  id: number;
  email: string;
  username: string;
  country: string;
  role: string;
  is_email_verified: boolean;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  last_login_at: string;
  InterestSetting: boolean;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

// 비밀번호 재설정 요청
export interface PostResetPasswordRequestResponse {
  message?: string;
}

// 비밀번호 재설정 코드 검증
export interface PostResetPasswordConfirmRequest {
  email: string;
  code: string;
}
export interface PostResetPasswordConfirmResponse {
  message?: string;
  session_token: string;
  email?: string;
}

// 비밀번호 재설정 완료
export interface PostResetPasswordCompleteRequest {
  email: string;
  session_token: string;
  new_password: string;
  confirm_password: string;
}
export interface PostResetPasswordCompleteResponse {
  message?: string;
}

// 소셜 로그인(google)
export interface PostUserAuthGoogleRequest {
  idToken: string;
  country: string;
  marketing_consent: boolean;
}

export interface PostUserAuthGoogleResponse {
  message?: string;
  user: User;
  tokens: Token;
}

type LoginMethod = 'email' | 'google' | 'apple';
export interface User {
  id: number;
  email: string;
  username: string;
  country: string;
  role: string;
  login_method: LoginMethod;
  company_code: string | null;
  is_email_verified: boolean;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  last_login_at: string;
  InterestSetting: boolean;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

// 토큰 재발급
export interface PostTokenReissueResponse {
  message: string;
  user: User;
  tokens: Token;
}

// 관심사 등록
export type Gender = 'male' | 'female' | 'no-select';
export type AgeGroup = 'Under18' | '18+' | '30+' | '40+' | '50+' | 'Over60';

export interface PostInterestRequestBody {
  Gender: Gender;
  AgeGroup: AgeGroup;
  TopicInterest: string[];
}

export interface PostInterestResponse {
  message: string;
  data: {
    Gender: Gender;
    AgeGroup: AgeGroup;
    TopicInterest: string[];
    InterestSetting: boolean;
  };
}
