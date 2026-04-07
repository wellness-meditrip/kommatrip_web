import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { isSupportedCountryCode, normalizeCountryCode, COUNTRY_OPTIONS } from '@/constants';
import { useToast } from '@/hooks';
import { useGetUserProfileQuery, usePatchUserProfileMutation } from '@/queries';
import { getErrorMessage } from '@/utils/error-handler';
import { QUERY_KEYS } from '@/queries/query-keys';
import {
  CONTACT_METHODS,
  CONTACT_METHOD_FIELD_MAP,
  CONTACT_PLACEHOLDER_MAP,
  type ContactMethod,
} from './constants';

export interface UserInfoFormValues {
  username: string;
  country: string;
  profileImageUrl: string;
  contactMethod: ContactMethod;
  line: string;
  whatsapp: string;
  kakao: string;
  phone: string;
}

function mapProfileToFormValues(
  user: NonNullable<ReturnType<typeof useGetUserProfileQuery>['data']>['user']
): UserInfoFormValues {
  const normalizedCountry = normalizeCountryCode(user.country);
  const initialMethod =
    CONTACT_METHODS.find((method) => {
      const field = CONTACT_METHOD_FIELD_MAP[method];
      return (user[field] ?? '').length > 0;
    }) ?? 'Line';

  return {
    username: user.username ?? '',
    country: normalizedCountry,
    profileImageUrl: user.profile_image_url ?? '',
    contactMethod: initialMethod,
    line: user.line ?? '',
    whatsapp: user.whatsapp ?? '',
    kakao: user.kakao ?? '',
    phone: user.phone ?? '',
  };
}

export function useUserInfoForm() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useTranslations('mypage');
  const tValidation = useTranslations('validation');

  const { data: profileData } = useGetUserProfileQuery();
  const patchMutation = usePatchUserProfileMutation();

  const formValues = profileData?.user ? mapProfileToFormValues(profileData.user) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserInfoFormValues>({
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  const contactMethod = watch('contactMethod');
  const profileImageUrl = watch('profileImageUrl');
  const passwordSet = !!profileData?.user?.password_set;
  const email = profileData?.user?.email ?? '';

  const selectedContactValue = watch(CONTACT_METHOD_FIELD_MAP[contactMethod]);
  const contactPlaceholder = CONTACT_PLACEHOLDER_MAP[contactMethod];

  const country = watch('country');
  const countryOptions = isSupportedCountryCode(country)
    ? COUNTRY_OPTIONS
    : country
      ? [...COUNTRY_OPTIONS, { code: country, label: country }]
      : COUNTRY_OPTIONS;

  const onSubmit = handleSubmit((data) => {
    const normalizedCountry = normalizeCountryCode(data.country);

    if (!data.username) {
      showToast({ title: tValidation('username.required'), icon: 'exclaim' });
      return;
    }
    if (!/^[A-Za-z0-9]{2,10}$/.test(data.username)) {
      showToast({ title: tValidation('username.invalid'), icon: 'exclaim' });
      return;
    }
    if (!normalizedCountry) {
      showToast({ title: tValidation('country.required'), icon: 'exclaim' });
      return;
    }

    patchMutation.mutate(
      {
        username: data.username,
        country: normalizedCountry,
        line: data.line,
        whatsapp: data.whatsapp,
        kakao: data.kakao,
        phone: data.phone,
      },
      {
        onSuccess: (response) => {
          reset(mapProfileToFormValues(response.user));
          queryClient.setQueryData(QUERY_KEYS.GET_USER_PROFILE, response);
          showToast({ title: t('toast.profileUpdated'), icon: 'check' });
        },
        onError: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to update profile');
          showToast({ title: message, icon: 'exclaim' });
        },
      }
    );
  });

  return {
    register,
    errors,
    watch,
    setValue,
    onSubmit,
    email,
    passwordSet,
    profileImageUrl,
    contactMethod,
    selectedContactValue,
    contactPlaceholder,
    countryOptions,
    isSaving: patchMutation.isPending,
    isPasswordResetModalOpen,
    setIsPasswordResetModalOpen,
  };
}
