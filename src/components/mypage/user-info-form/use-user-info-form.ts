import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import {
  isSupportedCountryCode,
  normalizeCountryCode,
  COUNTRY_OPTIONS,
  type SupportedCountryCode,
} from '@/constants';
import { useToast } from '@/hooks';
import { useGetUserProfileQuery, usePatchUserProfileMutation } from '@/queries';
import { getErrorMessage } from '@/utils/error-handler';
import { QUERY_KEYS } from '@/queries/query-keys';
import {
  CONTACT_METHODS,
  CONTACT_METHOD_I18N_KEYS,
  CONTACT_METHOD_FIELD_MAP,
  type ContactMethod,
} from './constants';

const COUNTRY_LABEL_KEY_MAP: Record<
  SupportedCountryCode,
  'usa' | 'japan' | 'china' | 'korea' | 'europe' | 'singapore' | 'malaysia' | 'indonesia' | 'etc'
> = {
  US: 'usa',
  JP: 'japan',
  CN: 'china',
  KR: 'korea',
  EU: 'europe',
  SG: 'singapore',
  MY: 'malaysia',
  ID: 'indonesia',
  ETC: 'etc',
};

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
  const tSignup = useTranslations('auth.signup');
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
    mode: 'onChange',
    reValidateMode: 'onChange',
    resetOptions: { keepDirtyValues: true },
  });

  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  const contactMethod = watch('contactMethod') || 'Line';
  const profileImageUrl = watch('profileImageUrl') ?? '';
  const passwordSet = !!profileData?.user?.password_set;
  const email = profileData?.user?.email ?? '';
  const canEditProfileImage = profileData?.user
    ? profileData.user.login_method !== 'google'
    : false;

  const selectedContactValue = watch(CONTACT_METHOD_FIELD_MAP[contactMethod]) ?? '';
  const contactPlaceholder = t(
    `userInfo.contactPlaceholders.${CONTACT_METHOD_I18N_KEYS[contactMethod]}`
  );

  const localizedCountryOptions = COUNTRY_OPTIONS.map((option) => ({
    code: option.code,
    label: tSignup(COUNTRY_LABEL_KEY_MAP[option.code]),
  }));

  const country = watch('country') ?? '';
  const countryOptions = isSupportedCountryCode(country)
    ? localizedCountryOptions
    : country
      ? [...localizedCountryOptions, { code: country, label: country }]
      : localizedCountryOptions;

  const usernameField = register('username', {
    required: tValidation('username.required'),
    validate: (value) => {
      if (!value) return tValidation('username.required');
      if (!/^[A-Za-z0-9]{2,10}$/.test(value)) {
        return tValidation('username.invalid');
      }
      return true;
    },
  });

  const countryField = register('country', {
    required: tValidation('country.required'),
    validate: (value) => {
      if (!normalizeCountryCode(value)) {
        return tValidation('country.required');
      }
      return true;
    },
  });

  const onSubmit = handleSubmit(
    (data) => {
      const normalizedCountry = normalizeCountryCode(data.country);

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
            const message = getErrorMessage(error, t('toast.profileUpdateFailed'));
            showToast({ title: message, icon: 'exclaim' });
          },
        }
      );
    },
    (fieldErrors) => {
      const firstErrorMessage =
        fieldErrors.username?.message ?? fieldErrors.country?.message ?? fieldErrors.root?.message;

      if (firstErrorMessage) {
        showToast({ title: firstErrorMessage, icon: 'exclaim' });
      }
    }
  );

  return {
    usernameField,
    countryField,
    errors,
    setValue,
    onSubmit,
    email,
    passwordSet,
    profileImageUrl,
    canEditProfileImage,
    contactMethod,
    selectedContactValue,
    contactPlaceholder,
    countryOptions,
    isSaving: patchMutation.isPending,
    isPasswordResetModalOpen,
    setIsPasswordResetModalOpen,
  };
}
