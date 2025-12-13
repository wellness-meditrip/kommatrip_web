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

export interface PostKakaoResponse {
  isOnboarding: boolean;
  email: string | null;
  grantType: 'Bearer' | null;
  accessToken: string | null;
}

export interface PostJoinWithoutPetRequestBody {
  email: string;
  username: string;
  phoneNumber: string;
  nickname: string;
  address: string;
}

export interface PostJoinWithoutPetResponse {
  accessToken: string;
}

export interface PostAvailableNicknameRequestBody {
  nickname: string;
}

export interface PostAvailableNicknameResponse {
  isAvailable: boolean;
}

export interface GetBreedListResponse {
  breedList: Breed[];
}

export interface Breed {
  breedName: string;
  breed: string;
}

export interface PostJoinWithPetRequestBody extends PostJoinWithoutPetRequestBody {
  petName: string;
  petBirth: number;
  petGender: string;
  isNeutered: boolean;
  breed: string;
  petWeight: string;
}

export interface PostJoinWithPetResponse {
  accessToken: string;
}

export interface GetUserInfoResponse {
  image: string | null;
  nickname: string;
  username: string;
  phoneNumber: string;
  email: string;
}

export interface PatchUserInfoResponse {
  requestResult: string;
}

export interface PatchUserInfoRequestBody {
  image: string;
  nickname: string;
}

export interface SignificantTag {
  tagName: string;
  tag: string;
}

export type PostUserPetResponse = string;

export interface PatchUserPetInfoRequestBody {
  id: number;
  image: string;
  name: string;
  birth: number;
  gender: 'MALE' | 'FEMALE';
  breed: string;
  isNeutered: boolean;
  weight: 'SMALL' | 'MEDIUM' | 'LARGE';
  groomingExperience: boolean;
  isBite: boolean;
  dislikeParts: string[];
  significantTags: string[];
  significant: string;
}

export type PatchUserPetInfoResponse = boolean;

export interface DeleteUserPetResponse {
  requestResult: string;
}

export interface DeleteUserPetRequestData {
  petId: number;
}
export interface GetUserValidateResponse {
  isValidateMember: boolean;
}

export interface GetUserMypageResponse {
  id: number;
  image: string;
  nickname: string;
  reviewCount: number;
  estimateCount: number;
  petInfos: PetInfo[];
}
export interface PetInfo {
  petId: number;
  petImage: string;
  petName: string;
}

export interface GetUserWithdrawInfoResponse {
  waitingForServiceCount: number;
}

export interface DeleteUserInfoResponse {
  accountId: number;
  withdrawDate: string;
}
