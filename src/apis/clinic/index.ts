import { guestHospitalApi } from '@/apis';
import {
  GetClinicRequestParams,
  GetClinicResponse,
  Hospital,
  GetClinicClinicIdRequestParams,
} from '@/models/clinic';

export const getClinic = async (params: GetClinicRequestParams) => {
  return await guestHospitalApi.get<GetClinicResponse>('/hospitals/', { params });
};

export const getClinicClinicId = async ({ hospitalId }: GetClinicClinicIdRequestParams) => {
  return await guestHospitalApi.get<Hospital>(`/hospitals/${hospitalId}`);
};
