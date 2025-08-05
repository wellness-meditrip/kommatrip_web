import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { getClinic, getClinicClinicId } from '@/apis';
import { GetClinicClinicIdRequestParams, GetClinicRequestParams, Hospital } from '@/models';
import { PAGE_SIZE } from '@/constants/clinic';

export const useGetClinicInfiniteQuery = (params: GetClinicRequestParams) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.GET_CLINIC, params.keyword],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      return getClinic({ ...params, page: pageParam, size: PAGE_SIZE });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hospitals.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    },
  });
};

export const useGetClinicClinicIdQuery = (params: GetClinicClinicIdRequestParams) => {
  return useQuery<Hospital>({
    queryKey: [...QUERY_KEYS.GET_CLINIC_CLINICID, params.hospitalId],
    queryFn: () => getClinicClinicId(params),
    enabled: !!params.hospitalId,
  });
};
