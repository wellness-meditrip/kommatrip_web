import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { getClinic, getCompanySearch, getCompanyDetail, getCompanyAll } from '@/apis';
import {
  GetClinicRequestParams,
  SearchParams,
  GetCompanySearchResponseParams,
  GetCompanyIdRequestParams,
  GetCompanyDetailResponse,
  GetCompanyAllResponse,
} from '@/models';
import { PAGE_SIZE } from '@/constants/clinic';

export const useGetClinicInfiniteQuery = (params: GetClinicRequestParams) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.GET_CLINIC, params.keyword, 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      return getClinic({ ...params, page: pageParam, size: PAGE_SIZE });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hospitals.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    },
  });
};

// export const useGetClinicClinicIdQuery = (params: GetClinicClinicIdRequestParams) => {
//   return useQuery<Hospital>({
//     queryKey: [...QUERY_KEYS.GET_CLINIC_CLINICID, params.hospitalId],
//     queryFn: () => getClinicClinicId(params),
//     enabled: !!params.hospitalId,
//   });
// };

export const useGetCompanyDetailQuery = (params: GetCompanyIdRequestParams) => {
  return useQuery<GetCompanyDetailResponse>({
    queryKey: [...QUERY_KEYS.GET_COMPANY_DETAIL, params.companyId],
    queryFn: () => getCompanyDetail(params),
    enabled: !!params.companyId,
  });
};

export const useGetCompanySearchQuery = (params: SearchParams) => {
  return useQuery<GetCompanySearchResponseParams>({
    queryKey: [
      ...QUERY_KEYS.GET_COMPANY_SEARCH,
      params.search_term,
      params.tags,
      params.location,
      params.skip,
      params.limit,
    ],
    queryFn: () => getCompanySearch(params),
  });
};

export const useGetCompanyAllQuery = () => {
  return useQuery<GetCompanyAllResponse>({
    queryKey: [...QUERY_KEYS.GET_COMPANY_ALL],
    queryFn: () => getCompanyAll(),
  });
};
