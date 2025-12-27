import { api } from '@/apis/config';
import {
  GetUserProfileResponse,
  DeleteUserProfileImageResponse,
  PatchUserProfileRequest,
  PatchUserProfileResponse,
  PostMarketingConsentRequest,
  PostMarketingConsentResponse,
  PostUserProfileImageResponse,
} from '@/models/user';

export const getUserProfile = async () => {
  return await api.get<GetUserProfileResponse>('/api/users/profile');
};

export const patchUserProfile = async (data: PatchUserProfileRequest) => {
  return await api.patch<PatchUserProfileResponse>('/api/users/profile', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const postUserProfileImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  return await api.post<PostUserProfileImageResponse>('/api/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 사용자 프로필 이미지 삭제
export const deleteUserProfileImage = async () => {
  return await api.delete<DeleteUserProfileImageResponse>('/api/users/profile/image');
};

// 마케팅 정보 수신 동의 설정
export const postMarketingConsent = async (data: PostMarketingConsentRequest) => {
  return await api.patch<PostMarketingConsentResponse>('/api/users/marketing-consent', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
