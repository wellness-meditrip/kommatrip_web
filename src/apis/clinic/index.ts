import { guestApi } from '@/apis';
import { GetSearchRequestParams, GetClinicResponse } from '@/models/clinic';

export const getUserSearchClinic = async (params: GetSearchRequestParams) => {
  return await guestApi.get<GetClinicResponse>('/hospitals/', { params });
};
