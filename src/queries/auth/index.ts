import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
// import { getUserValidate } from '@/apis/auth';

export const useGetUserValidateQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_VALIDATE,
    queryFn: async () => {
      // validate 기능 주석 처리
      throw new Error('getUserValidate is disabled');
      // return getUserValidate();
    },
    retry: (failureCount, error: unknown) => {
      // 404 에러나 403 에러는 재시도하지 않음
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 404 || axiosError?.response?.status === 403) {
        return false;
      }
      // 다른 에러는 최대 1번만 재시도
      return failureCount < 1;
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
