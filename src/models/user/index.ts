export interface UserProfile {
  id: number;
  email: string;
  password_set: boolean;
  login_method: string;
  username: string;
  country: string;
  line: string;
  whatsapp: string;
  kakao: string;
  Gender: string;
  phone: string;
  AgeGroup: string;
  TopicInterest: string[];
  InterestSetting: boolean;
  profile_image_url: string;
  is_email_verified: boolean;
  marketing_consent: boolean;
  marketing_consent_at: string;
  created_at: string;
  updated_at: string;
}

export interface GetUserProfileResponse {
  user: UserProfile;
}

export interface PatchUserProfileRequest {
  username: string;
  country: string;
  line: string;
  whatsapp: string;
  kakao: string;
  phone: string;
}

export interface PatchUserProfileResponse {
  message: string;
  user: UserProfile;
}

export interface PostUserProfileImageResponse {
  message?: string;
  user?: UserProfile;
}

export interface DeleteUserProfileImageResponse {
  message?: string;
  user?: UserProfile;
}

export interface PostMarketingConsentRequest {
  marketing_consent: boolean;
}

export interface PostMarketingConsentResponse {
  message: string;
  marketing_consent: boolean;
  marketing_consent_at: string;
}
