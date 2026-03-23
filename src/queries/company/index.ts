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
  enabled?: boolean;
  initialData?: { company: CompanyDetail };
  staleTime?: number;
}

export const getCompanyDetailQueryKey = (companyId: number) =>
  [...QUERY_KEYS.GET_COMPANY_DETAIL, companyId] as const;

export const fetchCompanyDetailQuery = (params: GetCompanyIdRequestParams) =>
  getCompanyDetail(params);

export const getCompanySearchQueryKey = (params: SearchParams) =>
  [
    ...QUERY_KEYS.GET_COMPANY_SEARCH,
    params.search_term,
    params.tags,
    params.location,
    params.skip,
    params.limit,
    params.date ?? null,
    params.endDate ?? null,
  ] as const;

export const fetchCompanySearchQuery = (params: SearchParams) => getCompanySearch(params);

export const getRecommendedCompanyQueryKey = () => [...QUERY_KEYS.GET_RECOMMENDED_COMPANY] as const;

export const fetchRecommendedCompanyQuery = async () => {
  try {
    const response = await getRecommendedCompany();
    return response || { companies: [], total: 0 };
  } catch (error) {
    console.error('[fetchRecommendedCompanyQuery] Error:', error);
    return { companies: [], total: 0 };
  }
};

export const useGetCompanyDetailQuery = (
  params: GetCompanyIdRequestParams,
  options?: QueryOptions
) => {
  return useQuery<{ company: CompanyDetail }>({
    queryKey: getCompanyDetailQueryKey(params.companyId),
    queryFn: () => fetchCompanyDetailQuery(params),
    enabled: options?.enabled ?? !!params.companyId,
    initialData: options?.initialData,
    staleTime: options?.staleTime ?? 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    meta: options?.suppressGlobalError ? { suppressGlobalError: true } : undefined,
  });
};

export const useGetCompanySearchQuery = (params: SearchParams, options?: QueryOptions) => {
  return useQuery<GetCompanySearchResponseParams>({
    queryKey: getCompanySearchQueryKey(params),
    queryFn: () => fetchCompanySearchQuery(params),
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    refetchOnWindowFocus: false,
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
    queryKey: getRecommendedCompanyQueryKey(),
    queryFn: fetchRecommendedCompanyQuery,
    select: (data): GetRecommendedCompanyResponse[] => {
      // data.companies 배열 반환
      return data?.companies || [];
    },
    staleTime: 1000 * 60 * 5,
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
