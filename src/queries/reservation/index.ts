import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import {
  deleteReservation,
  getReservationDetail,
  getReservations,
  postCreateReservation,
} from '@/apis/reservation';
import {
  DeleteReservationRequest,
  DeleteReservationResponse,
  GetReservationDetailResponse,
  GetReservationsParams,
  GetReservationsResponse,
  PostCreateReservationRequest,
  PostCreateReservationResponse,
} from '@/models/reservation';

export const getReservationsQueryKey = (params: GetReservationsParams) =>
  [
    ...QUERY_KEYS.GET_RESERVATIONS,
    params.skip ?? 0,
    params.limit ?? 20,
    params.status ?? null,
  ] as const;

export const getReservationDetailQueryKey = (reservationId: number | string) =>
  [...QUERY_KEYS.GET_RESERVATIONS, reservationId, 'detail'] as const;

export const usePostCreateReservationMutation = () => {
  return useMutation<PostCreateReservationResponse, Error, PostCreateReservationRequest>({
    mutationKey: QUERY_KEYS.CREATE_RESERVATION,
    mutationFn: postCreateReservation,
  });
};

export const useGetReservationsQuery = (params: GetReservationsParams, enabled: boolean = true) => {
  return useQuery<GetReservationsResponse>({
    queryKey: getReservationsQueryKey(params),
    queryFn: () => getReservations(params),
    enabled,
  });
};

export const useGetReservationDetailQuery = (
  reservationId: number | string,
  enabled: boolean = true
) => {
  return useQuery<GetReservationDetailResponse>({
    queryKey: getReservationDetailQueryKey(reservationId),
    queryFn: () => getReservationDetail(reservationId),
    enabled,
  });
};

export const useDeleteReservationMutation = () => {
  return useMutation<DeleteReservationResponse, Error, DeleteReservationRequest>({
    mutationKey: QUERY_KEYS.DELETE_RESERVATION,
    mutationFn: deleteReservation,
  });
};
