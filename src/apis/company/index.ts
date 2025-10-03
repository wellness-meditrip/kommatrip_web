import { guestHospitalApi, api } from '@/apis';
import {
  GetClinicRequestParams,
  GetClinicResponse,
  Hospital,
  GetClinicClinicIdRequestParams,
  GetCompanySearchResponseParams,
  SearchParams,
  GetCompanyIdRequestParams,
  GetCompanyDetailResponse,
  GetCompanyAllResponse,
} from '@/models/company';

export const getClinic = async (params: GetClinicRequestParams) => {
  return await guestHospitalApi.get<GetClinicResponse>('/hospitals/', { params });
};

export const getClinicClinicId = async ({ hospitalId }: GetClinicClinicIdRequestParams) => {
  return await guestHospitalApi.get<Hospital>(`/hospitals/${hospitalId}`);
};

export const getCompanySearch = async (params: SearchParams) => {
  return await api.get<GetCompanySearchResponseParams>('/api/companies/search', {
    params,
  });
};

export const getCompanyDetail = async ({ companyId }: GetCompanyIdRequestParams) => {
  return await api.get<GetCompanyDetailResponse>(`/api/companies/${companyId}`);
};

export const getCompanyAll = async () => {
  return await api.get<GetCompanyAllResponse>('/api/companies/all', {
    params: { status: 'active' },
  });
};
