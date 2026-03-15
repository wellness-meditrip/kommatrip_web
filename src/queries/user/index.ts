import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import {
  deleteUserProfileImage,
  getUserProfile,
  patchUserProfile,
  postMarketingConsent,
  postUserProfileImage,
} from '@/apis/user';
import {
  DeleteUserProfileImageResponse,
  GetUserProfileResponse,
  PatchUserProfileRequest,
  PatchUserProfileResponse,
  PostMarketingConsentRequest,
  PostMarketingConsentResponse,
  PostUserProfileImageResponse,
} from '@/models/user';
import { useAuthStore } from '@/store/auth';
import { isUsableAccessToken } from '@/utils/auth-token';

interface UseGetUserProfileQueryOptions {
  enabled?: boolean;
}

export const useGetUserProfileQuery = (options?: UseGetUserProfileQueryOptions) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const authState = useAuthStore((state) => state.authState);
  const hasUsableToken = isUsableAccessToken(accessToken, 10);
  const isDefaultEnabled = authState === 'authenticated' && hasUsableToken;
  const enabled = options?.enabled ?? isDefaultEnabled;

  return useQuery<GetUserProfileResponse>({
    queryKey: QUERY_KEYS.GET_USER_PROFILE,
    queryFn: getUserProfile,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const usePatchUserProfileMutation = () => {
  return useMutation<PatchUserProfileResponse, Error, PatchUserProfileRequest>({
    mutationKey: QUERY_KEYS.PATCH_USER_PROFILE,
    mutationFn: patchUserProfile,
  });
};

export const usePostUserProfileImageMutation = () => {
  return useMutation<PostUserProfileImageResponse, Error, File>({
    mutationKey: QUERY_KEYS.POST_USER_PROFILE_IMAGE,
    mutationFn: postUserProfileImage,
  });
};

export const useDeleteUserProfileImageMutation = () => {
  return useMutation<DeleteUserProfileImageResponse, Error, void>({
    mutationKey: QUERY_KEYS.DELETE_USER_PROFILE_IMAGE,
    mutationFn: deleteUserProfileImage,
  });
};

export const usePostMarketingConsentMutation = () => {
  return useMutation<PostMarketingConsentResponse, Error, PostMarketingConsentRequest>({
    mutationKey: QUERY_KEYS.POST_MARKETING_CONSENT,
    mutationFn: postMarketingConsent,
  });
};
