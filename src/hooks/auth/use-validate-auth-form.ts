import { useMemo } from 'react';

export function useValidateAuthForm() {
  return useMemo(
    () => ({
      email: {
        required: '이메일을 입력해 주세요',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: '이메일 형식이 올바르지 않아요',
        },
        validate: (value: string) => {
          if (!value) return '이메일을 입력해 주세요';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '이메일 형식이 올바르지 않아요';
          return true;
        },
      },

      password: {
        required: '비밀번호를 입력해 주세요',
        minLength: { value: 8, message: '비밀번호는 8자 이상 16자 이하여야 해요' },
        maxLength: { value: 16, message: '비밀번호는 8자 이상 16자 이하여야 해요' },
        validate: (value: string) => {
          if (!value) return '비밀번호를 입력해 주세요';

          // 길이 검증 (8~16자)
          if (value.length < 8 || value.length > 16) {
            return '비밀번호는 8자 이상 16자 이하여야 해요';
          }

          // 허용된 문자만 사용하는지 검증 (가장 먼저 체크)
          // 허용된 문자: 대문자, 소문자, 숫자, 특수문자 33개
          const allowedPattern = /^[A-Za-z0-9!"#$%&'()*+,\-./:;?@[\\\]^_`{|}~]+$/;
          if (!allowedPattern.test(value)) {
            return '허용되지 않은 문자가 포함되어 있어요';
          }

          // 대문자, 소문자, 숫자 검증
          if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(value)) {
            return '대문자, 소문자, 숫자 각각 1자 이상 포함해 주세요';
          }

          // 특수문자 검증 (!"#$%&'()*+,-./:;?@[\]^_`{|}~)
          if (!/[!"#$%&'()*+,\-./:;?@[\\\]^_`{|}~]/.test(value)) {
            return '특수문자를 1자 이상 포함해 주세요 (예: !, @, #, $, %, &, *, -, _ 등)';
          }

          return true;
        },
      },

      verificationCode: {
        required: '인증 코드를 입력해 주세요',
        validate: (value: string) => {
          if (!value) return '인증 코드를 입력해 주세요';
          return true;
        },
      },

      country: {
        required: '국가를 선택해 주세요',
        validate: (value: string) => {
          if (!value) return '국가를 선택해 주세요';
          return true;
        },
      },
    }),
    []
  );
}
