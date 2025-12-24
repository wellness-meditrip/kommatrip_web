import {
  ProgramCompanyParams,
  GetProgramCompanyResponseParams,
  ProgramCompanyListParams,
  ProgramCompanyListResponse,
  GetProgramDetailResponse,
} from '@/models/program';
import { QUERY_KEYS } from '../query-keys';
import { useQuery } from '@tanstack/react-query';
import { getProgramCompany, getProgramCompanyList, getProgramDetail } from '@/apis';

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

export const useGetProgramCompanyListQuery = (params: ProgramCompanyListParams) => {
  return useQuery<ProgramCompanyListResponse>({
    queryKey: [
      ...QUERY_KEYS.GET_PROGRAM_COMPANY,
      'list',
      params.company_id,
      params.skip,
      params.limit,
    ],
    queryFn: () => getProgramCompanyList(params),
    enabled: !!params.company_id,
  });
};

export const useGetProgramDetailQuery = (programId: number) => {
  return useQuery<GetProgramDetailResponse>({
    queryKey: [...QUERY_KEYS.GET_PROGRAM_DETAIL, programId],
    queryFn: () => getProgramDetail(programId),
    enabled: !!programId,
  });
};
