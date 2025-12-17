import { api } from '@/apis';
import type { AxiosResponse } from 'axios';
import {
  GetRecentCompanyResponse,
  GetRecommendedCompanyResponse,
  GetCompanySearchResponseParams,
  SearchParams,
  GetCompanyIdRequestParams,
  GetCompanyAllResponse,
  CompanyDetail,
} from '@/models/company';

export const getRecentCompany = async () => {
  return await api.get<GetRecentCompanyResponse>('/api/companies/recent');
};

export const getRecommendedCompany = async (): Promise<{
  companies: GetRecommendedCompanyResponse[];
  total: number;
}> => {
  const response: AxiosResponse<{
    companies: GetRecommendedCompanyResponse[];
    total: number;
  }> = await api.get('/api/companies/recommended');
  return response.data;
};

export const getCompanySearch = async (params: SearchParams) => {
  return await api.get<GetCompanySearchResponseParams>('/api/companies/search', {
    params,
  });
};

export const getCompanyDetail = async ({
  companyId,
}: GetCompanyIdRequestParams): Promise<{ company: CompanyDetail }> => {
  const response: AxiosResponse<{ company: CompanyDetail }> = await api.get(
    `/api/companies/${companyId}`
  );
  return response.data;
};

export const getCompanyAll = async () => {
  return await api.get<GetCompanyAllResponse>('/api/companies/all', {
    params: { status: 'active' },
  });
};
