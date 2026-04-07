import { ChangeEvent, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks';
import { useDeleteUserProfileImageMutation, usePostUserProfileImageMutation } from '@/queries';
import { getErrorMessage } from '@/utils/error-handler';
import { QUERY_KEYS } from '@/queries/query-keys';

interface UseProfileImageOptions {
  profileImageUrl: string;
  onImageChange: (url: string) => void;
}

export function useProfileImage({ profileImageUrl, onImageChange }: UseProfileImageOptions) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useTranslations('mypage');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const previousImageUrlRef = useRef(profileImageUrl);

  const postImageMutation = usePostUserProfileImageMutation();
  const deleteImageMutation = useDeleteUserProfileImageMutation();

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast({ title: t('toast.profileImageTypeError'), icon: 'exclaim' });
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: t('toast.profileImageSizeError'), icon: 'exclaim' });
      event.target.value = '';
      return;
    }

    previousImageUrlRef.current = profileImageUrl;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    onImageChange(previewUrl);

    postImageMutation.mutate(file, {
      onSuccess: (response) => {
        if (response.user?.profile_image_url) {
          onImageChange(response.user.profile_image_url);
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
        showToast({ title: t('toast.profileImageUploaded'), icon: 'check' });
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error, 'Failed to update profile image');
        showToast({ title: message, icon: 'exclaim' });
        onImageChange(previousImageUrlRef.current);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      },
      onSettled: () => {
        event.target.value = '';
      },
    });
  };

  const handleDelete = () => {
    deleteImageMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (response.user?.profile_image_url === '' || response.user?.profile_image_url == null) {
          onImageChange('');
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
        showToast({ title: t('toast.profileImageDeleted'), icon: 'check' });
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error, 'Failed to delete profile image');
        showToast({ title: message, icon: 'exclaim' });
      },
    });
  };

  return {
    fileInputRef,
    handleEditClick,
    handleFileChange,
    handleDelete,
  };
}
