import { api, guestApi } from '../config';
import {
  GetProgramCompanyResponseParams,
  GetProgramDetailResponse,
  ProgramCompanyParams,
  ProgramCompanyListParams,
  ProgramCompanyListResponse,
} from '@/models/program';

export const getProgramCompany = async ({ company_code }: ProgramCompanyParams) => {
  return await api.get<GetProgramCompanyResponseParams>(`/api/programs/company/${company_code}`);
};

export const getProgramCompanyList = async ({
  company_id,
  skip,
  limit,
}: ProgramCompanyListParams) => {
  return await guestApi.get<ProgramCompanyListResponse>(
    `/api/programs/company/${company_id}/list`,
    {
      params: {
        skip,
        limit,
      },
    }
  );
};

export const getProgramDetail = async (program_id: number) => {
  return await guestApi.get<GetProgramDetailResponse>(`/api/programs/${program_id}`);
};

export const getProgramDetailPublic = async (program_id: number) => {
  return await guestApi.get<GetProgramDetailResponse>(`/api/programs/${program_id}`);
};
