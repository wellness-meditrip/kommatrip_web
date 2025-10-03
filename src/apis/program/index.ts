import { api } from '../config';
import { GetProgramCompanyResponseParams, ProgramCompanyParams } from '@/models/program';

export const getProgramCompany = async ({ company_code }: ProgramCompanyParams) => {
  return await api.get<GetProgramCompanyResponseParams>(`/api/programs/company/${company_code}`);
};
