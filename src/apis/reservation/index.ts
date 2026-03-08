import {
  GetReservationsParams,
  GetReservationsResponse,
  GetReservationDetailResponse,
  DeleteReservationRequest,
  DeleteReservationResponse,
  PostCreateReservationRequest,
  PostCreateReservationResponse,
} from '@/models/reservation';
import { api } from '@/apis/config';

// 예약 생성
export const postCreateReservation = async (data: PostCreateReservationRequest) => {
  return await api.post<PostCreateReservationResponse>('/api/reservations', data, {
    headers: {
      'Content-Type': 'application/json',
    },
    baseURL: '',
  });
};

// 예약 목록 조회
export const getReservations = async (params: GetReservationsParams) => {
  return await api.get<GetReservationsResponse>('/api/reservations', {
    params,
    baseURL: '',
  });
};

// 예약 상세 조회
export const getReservationDetail = async (reservationId: number | string) => {
  return await api.get<GetReservationDetailResponse>(`/api/reservations/${reservationId}`, {
    baseURL: '',
  });
};

// 예약 취소
export const deleteReservation = async ({ reservationId, reason }: DeleteReservationRequest) => {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  return await api.delete<DeleteReservationResponse>(`/api/reservations/${reservationId}`, {
    baseURL: '',
    ...(trimmedReason ? { params: { reason: trimmedReason } } : {}),
  });
};
