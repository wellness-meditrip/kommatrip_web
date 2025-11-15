import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import {
  getClinic,
  getCompanySearch,
  getCompanyDetail,
  getCompanyAll,
  getRecentCompany,
  getRecommendedCompany,
} from '@/apis';
import {
  GetClinicRequestParams,
  SearchParams,
  GetCompanySearchResponseParams,
  GetCompanyIdRequestParams,
  GetCompanyAllResponse,
  GetRecentCompanyResponse,
  GetRecommendedCompanyResponse,
  CompanyDetail,
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

export const useGetCompanyDetailQuery = (params: GetCompanyIdRequestParams) => {
  return useQuery<{ company: CompanyDetail }>({
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

export const useGetRecentCompanyQuery = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_RECENT_COMPANY],
    queryFn: async () => {
      const response = await getRecentCompany();
      // API 응답이 배열이 아닌 경우 배열로 변환
      return Array.isArray(response) ? response : [response];
    },
    select: (data): GetRecentCompanyResponse[] => {
      return Array.isArray(data) ? data : [data];
    },
  });
};

export const useGetRecommendedCompanyQuery = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_RECOMMENDED_COMPANY],
    queryFn: async () => {
      const response = await getRecommendedCompany();
      return response;
    },
    select: (data): GetRecommendedCompanyResponse[] => {
      // data.companies 배열 반환
      return data?.companies || [];
    },
  });
};
