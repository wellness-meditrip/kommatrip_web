import { ProgramCompanyParams, GetProgramCompanyResponseParams } from '@/models/program';
import { QUERY_KEYS } from '../query-keys';
import { useQuery } from '@tanstack/react-query';
import { getProgramCompany } from '@/apis';

export const useGetProgramCompanyQuery = (params: ProgramCompanyParams) => {
  return useQuery<GetProgramCompanyResponseParams>({
    queryKey: [
      ...QUERY_KEYS.GET_PROGRAM_COMPANY,
      params.company_code,
      params.include_drafts,
      params.skip,
      params.limit,
    ],
    queryFn: () => getProgramCompany(params),
  });
};
