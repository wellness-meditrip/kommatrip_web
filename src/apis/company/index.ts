import { api, guestApi } from '@/apis';
import {
  GetRecentCompanyResponse,
  GetRecommendedCompanyResponse,
  GetCompanySearchResponseParams,
  SearchParams,
  GetCompanyIdRequestParams,
  GetCompanyAllResponse,
  CompanyDetail,
} from '@/models/company';

export const getRecentCompany = async (): Promise<GetRecentCompanyResponse[]> => {
  try {
    // 인증이 필요한 API일 수 있으므로 api 사용 (withCredentials: true)
    const response = await api.get<GetRecentCompanyResponse[]>('/non/company/recent');
    // api는 인터셉터에서 response.data?.response를 반환
    // 응답이 배열인지 확인하고 반환
    if (Array.isArray(response)) {
      return response;
    }
    // 응답이 객체로 감싸져 있을 수 있음
    if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as { data?: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error: unknown) {
    const axiosError = error as {
      code?: string;
      message?: string;
      response?: {
        status?: number;
        statusText?: string;
        data?: unknown;
      };
      config?: {
        url?: string;
        baseURL?: string;
        withCredentials?: boolean;
      };
    };
    // CORS 에러 디버깅을 위한 상세 로깅
    if (axiosError?.code === 'ERR_NETWORK' || axiosError?.message?.includes('CORS')) {
      console.error('[getRecentCompany] CORS Error:', {
        message: axiosError?.message,
        code: axiosError?.code,
        response: axiosError?.response,
        config: {
          url: axiosError?.config?.url,
          baseURL: axiosError?.config?.baseURL,
          withCredentials: axiosError?.config?.withCredentials,
        },
      });
    } else if (axiosError?.response) {
      console.error('[getRecentCompany] API Error:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data,
      });
    } else {
      console.error('[getRecentCompany] Unknown Error:', axiosError);
    }
    // 403, 404 에러나 기타 에러 발생 시 빈 배열 반환
    return [];
  }
};

export const getRecommendedCompany = async (): Promise<{
  companies: GetRecommendedCompanyResponse[];
  total: number;
}> => {
  return await guestApi.get<{
    companies: GetRecommendedCompanyResponse[];
    total: number;
  }>('/api/companies/recommended');
};

export const getCompanySearch = async (params: SearchParams) => {
  return await guestApi.get<GetCompanySearchResponseParams>('/api/companies/search', {
    params,
  });
};

export const getCompanyDetail = async ({
  companyId,
}: GetCompanyIdRequestParams): Promise<{ company: CompanyDetail }> => {
  return await guestApi.get<{ company: CompanyDetail }>(`/api/companies/${companyId}`);
};

export const getCompanyAll = async () => {
  return await guestApi.get<GetCompanyAllResponse>('/api/companies/all', {
    params: { status: 'active' },
  });
};
