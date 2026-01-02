import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function useValidateAuthForm() {
  const t = useTranslations('validation');
  return useMemo(
    () => ({
      email: {
        required: t('email.required'),
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: t('email.invalid'),
        },
        validate: (value: string) => {
          if (!value) return t('email.required');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('email.invalid');
          return true;
        },
      },

      password: {
        required: t('password.required'),
        minLength: { value: 8, message: t('password.length') },
        maxLength: { value: 16, message: t('password.length') },
        validate: (value: string) => {
          if (!value) return t('password.required');

          // 길이 검증 (8~16자)
          if (value.length < 8 || value.length > 16) {
            return t('password.length');
          }

          // 허용된 문자만 사용하는지 검증 (가장 먼저 체크)
          // 허용된 문자: 대문자, 소문자, 숫자, 특수문자 33개
          const allowedPattern = /^[A-Za-z0-9!"#$%&'()*+,\-./:;?@[\\\]^_`{|}~]+$/;
          if (!allowedPattern.test(value)) {
            return t('password.invalidChar');
          }

          // 대문자, 소문자, 숫자 검증
          if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(value)) {
            return t('password.missingCase');
          }

          // 특수문자 검증 (!"#$%&'()*+,-./:;?@[\]^_`{|}~)
          if (!/[!"#$%&'()*+,\-./:;?@[\\\]^_`{|}~]/.test(value)) {
            return t('password.missingSpecial');
          }

          return true;
        },
      },

      verificationCode: {
        required: t('verificationCode.required'),
        validate: (value: string) => {
          if (!value) return t('verificationCode.required');
          return true;
        },
      },

      country: {
        required: t('country.required'),
        validate: (value: string) => {
          if (!value) return t('country.required');
          return true;
        },
      },
    }),
    [t]
  );
}
