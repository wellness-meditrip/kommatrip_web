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

interface QueryOptions {
  suppressGlobalError?: boolean;
  enabled?: boolean;
  initialData?: GetProgramDetailResponse;
  staleTime?: number;
  retry?: number;
}

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

export const useGetProgramDetailQuery = (programId: number, options?: QueryOptions) => {
  return useQuery<GetProgramDetailResponse>({
    queryKey: [...QUERY_KEYS.GET_PROGRAM_DETAIL, programId],
    queryFn: () => getProgramDetail(programId),
    enabled: options?.enabled ?? !!programId,
    initialData: options?.initialData,
    staleTime: options?.staleTime ?? 1000 * 60 * 10,
    retry: options?.retry ?? 1,
    refetchOnWindowFocus: false,
    meta: options?.suppressGlobalError ? { suppressGlobalError: true } : undefined,
  });
};
