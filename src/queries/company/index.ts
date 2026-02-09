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

interface QueryOptions {
  suppressGlobalError?: boolean;
}

export const useGetCompanyDetailQuery = (
  params: GetCompanyIdRequestParams,
  options?: QueryOptions
) => {
  return useQuery<{ company: CompanyDetail }>({
    queryKey: [...QUERY_KEYS.GET_COMPANY_DETAIL, params.companyId],
    queryFn: () => getCompanyDetail(params),
    enabled: !!params.companyId,
    meta: options?.suppressGlobalError ? { suppressGlobalError: true } : undefined,
  });
};

export const useGetCompanySearchQuery = (params: SearchParams, options?: QueryOptions) => {
  return useQuery<GetCompanySearchResponseParams>({
    queryKey: [
      ...QUERY_KEYS.GET_COMPANY_SEARCH,
      params.search_term,
      params.tags,
      params.location,
      params.skip,
      params.limit,
      params.date,
      params.endDate,
    ],
    queryFn: () => getCompanySearch(params),
    meta: options?.suppressGlobalError ? { suppressGlobalError: true } : undefined,
  });
};

export const useGetCompanyAllQuery = (options?: QueryOptions) => {
  return useQuery<GetCompanyAllResponse>({
    queryKey: [...QUERY_KEYS.GET_COMPANY_ALL],
    queryFn: () => getCompanyAll(),
    meta: options?.suppressGlobalError ? { suppressGlobalError: true } : undefined,
  });
};

export const useGetRecentCompanyQuery = (enabled: boolean = true) => {
  return useQuery<GetRecentCompanyResponse[]>({
    queryKey: [...QUERY_KEYS.GET_RECENT_COMPANY],
    queryFn: async () => {
      try {
        const response = await getRecentCompany();
        // API 응답이 배열인지 확인하고 반환
        return Array.isArray(response) ? response : [];
      } catch (error) {
        // CORS 에러나 기타 에러 발생 시 빈 배열 반환
        console.error('[useGetRecentCompanyQuery] Error:', error);
        return [];
      }
    },
    enabled,
    retry: (failureCount, error: unknown) => {
      // CORS 에러나 404, 403 에러는 재시도하지 않음
      const axiosError = error as { response?: { status?: number }; code?: string };
      if (
        axiosError?.response?.status === 404 ||
        axiosError?.response?.status === 403 ||
        axiosError?.code === 'ERR_NETWORK' ||
        axiosError?.code === 'ERR_CORS'
      ) {
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
      try {
        const response = await getRecommendedCompany();
        // response가 { companies, total } 형태로 반환됨
        return response || { companies: [], total: 0 };
      } catch (error) {
        // 에러 발생 시 빈 배열 반환
        console.error('[useGetRecommendedCompanyQuery] Error:', error);
        return { companies: [], total: 0 };
      }
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
