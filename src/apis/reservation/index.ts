import {
  GetReservationsParams,
  GetReservationsResponse,
  GetReservationDetailResponse,
  DeleteReservationRequest,
  DeleteReservationResponse,
  PostCreateReservationRequest,
  PostCreateReservationResponse,
} from '@/models/reservation';
import { bffApi } from '@/apis/config';

// 예약 생성
export const postCreateReservation = async (data: PostCreateReservationRequest) => {
  return await bffApi.post<PostCreateReservationResponse>('/api/reservations', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 예약 목록 조회
export const getReservations = async (params: GetReservationsParams) => {
  return await bffApi.get<GetReservationsResponse>('/api/reservations', {
    params,
  });
};

// 예약 상세 조회
export const getReservationDetail = async (reservationId: number | string) => {
  return await bffApi.get<GetReservationDetailResponse>(`/api/reservations/${reservationId}`);
};

// 예약 취소
export const deleteReservation = async ({ reservationId, reason }: DeleteReservationRequest) => {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  return await bffApi.delete<DeleteReservationResponse>(`/api/reservations/${reservationId}`, {
    ...(trimmedReason ? { params: { reason: trimmedReason } } : {}),
  });
};
