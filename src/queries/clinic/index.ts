import { useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { getUserSearchClinic } from '@/apis';
import { GetSearchRequestParams } from '@/models';
import { PAGE_SIZE } from '@/constants/clinic';

export const useGetClinicInfiniteQuery = (params: GetSearchRequestParams) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.GET_CLINIC],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      return getUserSearchClinic({ ...params, page: pageParam, size: PAGE_SIZE });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hospitals.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    },
  });
};
