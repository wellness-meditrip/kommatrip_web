import { useMemo } from 'react';

export function useReservationValidation() {
  return useMemo(
    () => ({
      symptoms: {
        required: '증상을 입력해 주세요',
        minLength: { value: 10, message: '증상을 10자 이상 입력해 주세요' },
        maxLength: { value: 500, message: '증상은 최대 500자까지 입력할 수 있어요' },
      },

      medications: {
        maxLength: { value: 200, message: '복용 중인 약물은 최대 200자까지 입력할 수 있어요' },
      },

      selectedDate: {
        required: '방문 일자를 선택해 주세요',
        validate: (value: string) => {
          if (!value) return '방문 일자를 선택해 주세요';

          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            return '오늘 이후의 날짜를 선택해 주세요';
          }

          return true;
        },
      },

      selectedTime: {
        required: '방문 시간을 선택해 주세요',
      },

      email: {
        required: '이메일을 입력해 주세요',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: '올바른 이메일 형식을 입력해 주세요',
        },
      },

      contactPhone: {
        required: '연락처를 입력해 주세요',
        pattern: {
          value: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
          message: '올바른 전화번호 형식을 입력해 주세요 (예: 010-1234-5678)',
        },
        validate: (value: string) => {
          if (!value) return '연락처를 입력해 주세요';

          const cleanPhone = value.replace(/\s/g, '');
          if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(cleanPhone)) {
            return '올바른 전화번호 형식을 입력해 주세요 (예: 010-1234-5678)';
          }

          return true;
        },
      },

      language: {
        required: '통역 언어를 선택해 주세요',
      },

      additionalInfo: {
        maxLength: { value: 300, message: '추가 정보는 최대 300자까지 입력할 수 있어요' },
      },
    }),
    []
  );
}
