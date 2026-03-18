import type {
  AdminCompanyReviewsResponse,
  AdminCompanyDetail,
  AdminCompanyFormValues,
  AdminCompanyImagesState,
  AdminCompanyListItem,
  AdminRegisterRequestBody,
  AdminUserDeleteResponse,
  AdminUsersParams,
  AdminUsersResponse,
  AdminProgramDetail,
  AdminProgramFormValues,
  AdminProgramImagesState,
  AdminProgramListItem,
  AdminReservationActionResponse,
  AdminCompanyStatusFilter,
  AdminProgramsByCompanyResponse,
  AdminReservationDetail,
  AdminReservationUpdateRequest,
  AdminReservationListStatus,
  AdminReservationsResponse,
  AdminReservationStatsResponse,
  AdminLoginResponse,
} from '@/models';
import {
  buildAdminCompanyCreateFormData,
  buildAdminCompanyImagesFormData,
  buildAdminCompanyUpdateFormData,
} from '@/utils/admin-company-form';
import {
  buildAdminProgramCreateFormData,
  buildAdminProgramImagesFormData,
  buildAdminProgramUpdatePayload,
} from '@/utils/admin-program-form';
import { adminApi } from './client';

interface AdminLoginRequestBody {
  email: string;
  password: string;
}

interface AdminCompaniesParams {
  status_filter: AdminCompanyStatusFilter;
}

interface AdminReservationsParams {
  status: AdminReservationListStatus;
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const unwrapPayload = <T = unknown>(payload: unknown): T => {
  if (!isRecord(payload)) return payload as T;
  if (typeof payload.data !== 'undefined') return payload.data as T;
  return payload as T;
};

const parseAdminLoginResponse = (payload: unknown): AdminLoginResponse => {
  const source = unwrapPayload(payload);
  if (!isRecord(source)) return source as AdminLoginResponse;
  return {
    message: typeof source.message === 'string' ? source.message : '관리자 로그인에 성공했습니다.',
    user: source.user as AdminLoginResponse['user'],
    tokens: source.tokens as AdminLoginResponse['tokens'],
  };
};

const parseAdminUsersResponse = (payload: unknown): AdminUsersResponse => {
  const source = unwrapPayload(payload);

  if (!isRecord(source)) {
    return {
      count: 0,
      users: [],
    };
  }

  const users = Array.isArray(source.users) ? (source.users as AdminUsersResponse['users']) : [];

  return {
    count: typeof source.count === 'number' ? source.count : users.length,
    users,
  };
};

const parseAdminUserDeleteResponse = (payload: unknown): AdminUserDeleteResponse => {
  const source = unwrapPayload(payload);

  if (!isRecord(source)) {
    return {
      message: '회원이 삭제되었습니다.',
    };
  }

  return {
    message: typeof source.message === 'string' ? source.message : '회원이 삭제되었습니다.',
  };
};

const parseAdminCompaniesResponse = (
  payload: unknown
): {
  companies: AdminCompanyListItem[];
  total: number;
} => {
  const source = unwrapPayload(payload);

  if (Array.isArray(source)) {
    return {
      companies: source as AdminCompanyListItem[],
      total: source.length,
    };
  }

  if (isRecord(source) && Array.isArray(source.companies)) {
    return {
      companies: source.companies as AdminCompanyListItem[],
      total: typeof source.total === 'number' ? source.total : source.companies.length,
    };
  }

  return {
    companies: [],
    total: 0,
  };
};

const parseAdminCompanyDetail = (payload: unknown): { company: AdminCompanyDetail } => {
  const source = unwrapPayload(payload);
  if (isRecord(source) && isRecord(source.company)) {
    return {
      company: source.company as unknown as AdminCompanyDetail,
    };
  }

  return source as { company: AdminCompanyDetail };
};

const parseAdminProgramsByCompanyResponse = (payload: unknown): AdminProgramsByCompanyResponse => {
  const source = unwrapPayload(payload);
  if (!isRecord(source)) return source as AdminProgramsByCompanyResponse;

  return {
    company_id: typeof source.company_id === 'number' ? source.company_id : undefined,
    company_code: typeof source.company_code === 'string' ? source.company_code : '',
    company_name: typeof source.company_name === 'string' ? source.company_name : undefined,
    programs: Array.isArray(source.programs) ? (source.programs as AdminProgramListItem[]) : [],
    total: typeof source.total === 'number' ? source.total : 0,
  };
};

const parseAdminProgramDetail = (payload: unknown): { program: AdminProgramDetail } => {
  const source = unwrapPayload(payload);
  if (isRecord(source) && isRecord(source.program)) {
    return {
      program: source.program as unknown as AdminProgramDetail,
    };
  }
  return source as { program: AdminProgramDetail };
};

const parseAdminReservationsResponse = (payload: unknown): AdminReservationsResponse => {
  const source = unwrapPayload(payload);
  if (!isRecord(source)) {
    return {
      reservations: [],
      total: 0,
      skip: 0,
      limit: 0,
    };
  }

  return {
    reservations: Array.isArray(source.reservations)
      ? (source.reservations as AdminReservationsResponse['reservations'])
      : [],
    total: typeof source.total === 'number' ? source.total : 0,
    skip: typeof source.skip === 'number' ? source.skip : 0,
    limit: typeof source.limit === 'number' ? source.limit : 0,
    status_filter:
      typeof source.status_filter === 'string'
        ? source.status_filter
        : typeof source.status === 'string'
          ? source.status
          : undefined,
  };
};

const parseAdminReservationStatsResponse = (payload: unknown): AdminReservationStatsResponse => {
  const source = unwrapPayload(payload);
  if (!isRecord(source)) {
    return {
      total: 0,
      counts: {},
    };
  }

  return {
    total: typeof source.total === 'number' ? source.total : 0,
    counts: isRecord(source.counts)
      ? (source.counts as AdminReservationStatsResponse['counts'])
      : {},
    gender_counts: isRecord(source.gender_counts)
      ? (source.gender_counts as NonNullable<AdminReservationStatsResponse['gender_counts']>)
      : undefined,
    age_group_counts: isRecord(source.age_group_counts)
      ? (source.age_group_counts as NonNullable<AdminReservationStatsResponse['age_group_counts']>)
      : undefined,
    start_date: typeof source.start_date === 'string' ? source.start_date : null,
    end_date: typeof source.end_date === 'string' ? source.end_date : null,
  };
};

const parseAdminReservationDetail = (payload: unknown): { reservation: AdminReservationDetail } => {
  const source = unwrapPayload(payload);
  if (isRecord(source) && isRecord(source.reservation)) {
    return {
      reservation: source.reservation as unknown as AdminReservationDetail,
    };
  }

  return {
    reservation: source as unknown as AdminReservationDetail,
  };
};

const parseAdminReservationActionResponse = (payload: unknown): AdminReservationActionResponse => {
  const source = unwrapPayload(payload);

  if (!isRecord(source)) {
    return {
      message: '예약 상태가 변경되었습니다.',
    };
  }

  return {
    message: typeof source.message === 'string' ? source.message : '예약 상태가 변경되었습니다.',
    reservation: isRecord(source.reservation)
      ? (source.reservation as unknown as AdminReservationDetail)
      : undefined,
  };
};

const parseAdminCompanyReviewsResponse = (payload: unknown): AdminCompanyReviewsResponse => {
  const source = unwrapPayload(payload);
  if (!isRecord(source)) {
    return {
      total: 0,
      reviews: [],
    };
  }

  return {
    total: typeof source.total === 'number' ? source.total : 0,
    reviews: Array.isArray(source.reviews)
      ? (source.reviews as AdminCompanyReviewsResponse['reviews'])
      : [],
  };
};

const extractCreatedCompanyId = (payload: unknown): number | null => {
  const source = unwrapPayload(payload);
  if (isRecord(source) && typeof source.id === 'number') return source.id;
  if (isRecord(source) && isRecord(source.company) && typeof source.company.id === 'number') {
    return source.company.id;
  }
  return null;
};

const extractCreatedProgramId = (payload: unknown): number | null => {
  const source = unwrapPayload(payload);
  if (isRecord(source) && typeof source.id === 'number') return source.id;
  if (isRecord(source) && isRecord(source.program) && typeof source.program.id === 'number') {
    return source.program.id;
  }
  return null;
};

export const postAdminLogin = async (data: AdminLoginRequestBody) => {
  const response = await adminApi.post(ADMIN_AUTH_LOGIN_PATH, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseAdminLoginResponse(response);
};

const ADMIN_AUTH_LOGIN_PATH = '/api/admin/auth/login';
const ADMIN_AUTH_REGISTER_PATH = '/api/admin/auth/register';

export const postAdminRegister = async (data: AdminRegisterRequestBody) => {
  const response = await adminApi.post(ADMIN_AUTH_REGISTER_PATH, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseAdminLoginResponse(response);
};

export const getAdminUsers = async (params: AdminUsersParams = {}) => {
  const response = await adminApi.get('/api/admin/users', {
    params,
  });

  return parseAdminUsersResponse(response);
};

export const deleteAdminUser = async (userId: number | string) => {
  const response = await adminApi.delete(`/api/admin/users/${userId}`);
  return parseAdminUserDeleteResponse(response);
};

export const getAdminCompanies = async (params: AdminCompaniesParams) => {
  const response = await adminApi.get('/api/admin/companies', {
    params,
  });

  return parseAdminCompaniesResponse(response);
};

export const getAdminCompanyDetail = async (companyId: number) => {
  const response = await adminApi.get(`/api/admin/companies/${companyId}`, {
    params: {
      increment_view: false,
    },
  });

  return parseAdminCompanyDetail(response);
};

export const postAdminCompany = async (
  values: AdminCompanyFormValues,
  imageState: AdminCompanyImagesState
) => {
  const formData = buildAdminCompanyCreateFormData(values, imageState);
  const response = await adminApi.post('/api/admin/companies', formData);

  return {
    raw: response,
    companyId: extractCreatedCompanyId(response),
  };
};

export const putAdminCompany = async (
  companyId: number,
  values: AdminCompanyFormValues,
  originalValues: AdminCompanyFormValues
) => {
  const { formData, changedCount } = buildAdminCompanyUpdateFormData(values, originalValues);
  if (changedCount === 0) {
    return {
      changedCount,
      raw: null,
    };
  }

  const response = await adminApi.put(`/api/admin/companies/${companyId}`, formData);

  return {
    changedCount,
    raw: response,
  };
};

export const putAdminCompanyImages = async (companyId: number, files: File[]) => {
  const formData = buildAdminCompanyImagesFormData(files);
  return adminApi.put(`/api/admin/companies/${companyId}/images`, formData);
};

export const deleteAdminCompany = async (companyId: number) => {
  return adminApi.delete(`/api/admin/companies/${companyId}`);
};

export const postAdminCompanyApprove = async (companyId: number) => {
  return adminApi.post(`/api/admin/companies/${companyId}/approve`);
};

export const postAdminCompanySuspend = async (companyId: number) => {
  return adminApi.post(`/api/admin/companies/${companyId}/suspend`);
};

export const getAdminProgramsByCompany = async (companyCode: string) => {
  const response = await adminApi.get(`/api/admin/programs/company/${companyCode}/admin/list`, {
    params: {
      include_drafts: true,
      skip: 0,
      limit: 100,
    },
  });

  return parseAdminProgramsByCompanyResponse(response);
};

export const getAdminProgramDetail = async (programId: number) => {
  const response = await adminApi.get(`/api/admin/programs/${programId}`);
  return parseAdminProgramDetail(response);
};

export const getAdminReservations = async (params: AdminReservationsParams) => {
  const { status, ...queryParams } = params;
  const response = await adminApi.get(`/api/admin/reservations/${status}`, {
    params: queryParams,
  });

  return parseAdminReservationsResponse(response);
};

export const getAdminReservationStats = async (
  params: { start_date?: string; end_date?: string } = {}
) => {
  const response = await adminApi.get('/api/admin/reservations/stats', {
    params,
  });

  return parseAdminReservationStatsResponse(response);
};

export const getAdminReservationDetail = async (reservationId: number | string) => {
  const response = await adminApi.get(`/api/admin/reservations/${reservationId}`);
  return parseAdminReservationDetail(response);
};

export const putAdminReservation = async (
  reservationId: number | string,
  data: AdminReservationUpdateRequest
) => {
  const response = await adminApi.put(`/api/admin/reservations/${reservationId}`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseAdminReservationActionResponse(response);
};

export const deleteAdminReservation = async (reservationId: number | string, reason?: string) => {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  const response = await adminApi.delete(`/api/admin/reservations/${reservationId}`, {
    ...(trimmedReason ? { params: { reason: trimmedReason } } : {}),
  });

  return parseAdminReservationActionResponse(response);
};

export const postAdminReservationConfirm = async (reservationId: number | string) => {
  const response = await adminApi.post(`/api/admin/reservations/${reservationId}/confirm`);
  return parseAdminReservationActionResponse(response);
};

export const postAdminReservationReject = async (
  reservationId: number | string,
  reason?: string
) => {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  const response = await adminApi.post(
    `/api/admin/reservations/${reservationId}/reject`,
    undefined,
    {
      ...(trimmedReason ? { params: { reason: trimmedReason } } : {}),
    }
  );

  return parseAdminReservationActionResponse(response);
};

export const postAdminReservationComplete = async (reservationId: number | string) => {
  const response = await adminApi.post(`/api/admin/reservations/${reservationId}/complete`);
  return parseAdminReservationActionResponse(response);
};

export const postAdminReservationNoShow = async (reservationId: number | string) => {
  const response = await adminApi.post(`/api/admin/reservations/${reservationId}/no-show`);
  return parseAdminReservationActionResponse(response);
};

export const getAdminCompanyReviews = async (
  companyId: number,
  params: {
    skip?: number;
    limit?: number;
    with_photos?: boolean;
    my_country_only?: boolean;
    country?: string;
    tags?: string;
  } = {}
) => {
  const response = await adminApi.get(`/api/admin/reviews/companies/${companyId}`, {
    params,
  });

  return parseAdminCompanyReviewsResponse(response);
};

export const postAdminProgram = async (
  values: AdminProgramFormValues,
  params: {
    companyCode: string;
    imageState: AdminProgramImagesState;
  }
) => {
  const formData = buildAdminProgramCreateFormData(values, params);
  const response = await adminApi.post('/api/admin/programs', formData);

  return {
    raw: response,
    programId: extractCreatedProgramId(response),
  };
};

export const putAdminProgram = async (
  programId: number,
  values: AdminProgramFormValues,
  originalValues: AdminProgramFormValues
) => {
  const { payload, changedCount } = buildAdminProgramUpdatePayload(values, originalValues);
  if (changedCount === 0) {
    return {
      changedCount,
      raw: null,
    };
  }

  const response = await adminApi.put(`/api/admin/programs/${programId}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    changedCount,
    raw: response,
  };
};

export const putAdminProgramImages = async (programId: number, files: File[]) => {
  const formData = buildAdminProgramImagesFormData(files);
  return adminApi.put(`/api/admin/programs/${programId}/images`, formData);
};

export const deleteAdminProgram = async (programId: number) => {
  return adminApi.delete(`/api/admin/programs/${programId}`);
};
