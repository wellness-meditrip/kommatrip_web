import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { getUserValidate } from '@/apis/auth';

export const useGetUserValidateQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_VALIDATE,
    queryFn: getUserValidate,
  });
};
