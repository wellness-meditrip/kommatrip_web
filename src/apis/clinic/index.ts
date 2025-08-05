import { guestApi } from '@/apis';
import {
  GetClinicRequestParams,
  GetClinicResponse,
  Hospital,
  GetClinicClinicIdRequestParams,
} from '@/models/clinic';

export const getClinic = async (params: GetClinicRequestParams) => {
  return await guestApi.get<GetClinicResponse>('/hospitals/', { params });
};

export const getClinicClinicId = async ({ hospitalId }: GetClinicClinicIdRequestParams) => {
  return await guestApi.get<Hospital>(`/hospitals/${hospitalId}`);
};
