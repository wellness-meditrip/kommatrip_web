import { useQuery } from '@tanstack/react-query';
import {
  getAdminUsers,
  getAdminCompanies,
  getAdminCompanyDetail,
  getAdminCompanyReviews,
  getAdminProgramDetail,
  getAdminProgramsByCompany,
  getAdminReservationDetail,
  getAdminReservations,
  getAdminReservationStats,
  getAdminInfluencers,
} from '@/apis';
import type {
  AdminCompanyStatusFilter,
  AdminReservationListStatus,
  AdminUsersParams,
} from '@/models';
import { QUERY_KEYS } from '../query-keys';

export const useGetAdminUsersQuery = (params: AdminUsersParams, enabled: boolean) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.GET_ADMIN_USERS,
      params.email ?? '',
      params.user_name ?? '',
      params.country ?? '',
      params.gender ?? '',
      params.age_group ?? '',
      params.topic_interest ?? '',
      params.phone ?? '',
      typeof params.marketing_consent === 'boolean' ? String(params.marketing_consent) : '',
    ],
    queryFn: () => getAdminUsers(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useGetAdminCompaniesQuery = (
  statusFilter: AdminCompanyStatusFilter,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_ADMIN_COMPANIES, statusFilter],
    queryFn: () => getAdminCompanies({ status_filter: statusFilter }),
    enabled,
  });
};

export const useGetAdminCompanyDetailQuery = (companyId: number | null, enabled: boolean) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_ADMIN_COMPANY_DETAIL, companyId],
    queryFn: () => getAdminCompanyDetail(companyId as number),
    enabled: enabled && typeof companyId === 'number' && !Number.isNaN(companyId),
  });
};

export const useGetAdminProgramsByCompanyQuery = (companyCode: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAMS_BY_COMPANY, companyCode],
    queryFn: () => getAdminProgramsByCompany(companyCode as string),
    enabled: enabled && typeof companyCode === 'string' && companyCode.length > 0,
  });
};

export const useGetAdminProgramDetailQuery = (programId: number | null, enabled: boolean) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAM_DETAIL, programId],
    queryFn: () => getAdminProgramDetail(programId as number),
    enabled: enabled && typeof programId === 'number' && !Number.isNaN(programId),
  });
};

export const useGetAdminReservationsQuery = (
  params: {
    status: AdminReservationListStatus;
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  },
  enabled: boolean
) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.GET_ADMIN_RESERVATIONS,
      params.status,
      params.skip ?? 0,
      params.limit ?? 20,
      params.start_date ?? '',
      params.end_date ?? '',
    ],
    queryFn: () => getAdminReservations(params),
    enabled,
  });
};

export const useGetAdminReservationStatsQuery = (
  params: {
    start_date?: string;
    end_date?: string;
  },
  enabled: boolean
) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.GET_ADMIN_RESERVATION_STATS,
      params.start_date ?? '',
      params.end_date ?? '',
    ],
    queryFn: () => getAdminReservationStats(params),
    enabled,
  });
};

export const useGetAdminReservationDetailQuery = (
  reservationId: number | string | null,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_ADMIN_RESERVATION_DETAIL, reservationId],
    queryFn: () => getAdminReservationDetail(reservationId as number | string),
    enabled:
      enabled &&
      (typeof reservationId === 'number' ||
        (typeof reservationId === 'string' && reservationId.length > 0)),
  });
};

export const useGetAdminCompanyReviewsQuery = (
  companyId: number | null,
  params: {
    skip?: number;
    limit?: number;
    with_photos?: boolean;
    my_country_only?: boolean;
    country?: string;
    tags?: string;
  },
  enabled: boolean
) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.GET_ADMIN_COMPANY_REVIEWS,
      companyId,
      params.skip ?? 0,
      params.limit ?? 20,
      params.with_photos ?? false,
      params.my_country_only ?? false,
      params.country ?? '',
      params.tags ?? '',
    ],
    queryFn: () => getAdminCompanyReviews(companyId as number, params),
    enabled: enabled && typeof companyId === 'number' && !Number.isNaN(companyId),
  });
};

export const useGetAdminInfluencersQuery = (
  params: { skip?: number; limit?: number },
  enabled: boolean
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_ADMIN_INFLUENCERS, params.skip ?? 0, params.limit ?? 50],
    queryFn: () => getAdminInfluencers(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};
