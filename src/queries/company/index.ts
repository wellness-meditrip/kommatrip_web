import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import {
  getCompanySearch,
  getCompanyDetail,
  getCompanyAll,
  getRecentCompany,
  getRecommendedCompany,
} from '@/apis';
import {
  SearchParams,
  GetCompanySearchResponseParams,
  GetCompanyIdRequestParams,
  GetCompanyAllResponse,
  GetRecentCompanyResponse,
  GetRecommendedCompanyResponse,
  CompanyDetail,
} from '@/models';

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

export const useGetRecentCompanyQuery = (enabled: boolean = true) => {
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
    enabled,
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
