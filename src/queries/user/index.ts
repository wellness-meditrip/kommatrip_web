import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import {
  deleteUserProfileImage,
  getUserProfile,
  patchUserProfile,
  postUserProfileImage,
} from '@/apis/user';
import {
  DeleteUserProfileImageResponse,
  GetUserProfileResponse,
  PatchUserProfileRequest,
  PatchUserProfileResponse,
  PostUserProfileImageResponse,
} from '@/models/user';

export const useGetUserProfileQuery = () => {
  return useQuery<GetUserProfileResponse>({
    queryKey: QUERY_KEYS.GET_USER_PROFILE,
    queryFn: getUserProfile,
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
