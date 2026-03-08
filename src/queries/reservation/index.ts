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

export const usePostCreateReservationMutation = () => {
  return useMutation<PostCreateReservationResponse, Error, PostCreateReservationRequest>({
    mutationKey: QUERY_KEYS.CREATE_RESERVATION,
    mutationFn: postCreateReservation,
  });
};

export const useGetReservationsQuery = (params: GetReservationsParams, enabled: boolean = true) => {
  return useQuery<GetReservationsResponse>({
    queryKey: [...QUERY_KEYS.GET_RESERVATIONS, params.skip, params.limit, params.status],
    queryFn: () => getReservations(params),
    enabled,
  });
};

export const useGetReservationDetailQuery = (
  reservationId: number | string,
  enabled: boolean = true
) => {
  return useQuery<GetReservationDetailResponse>({
    queryKey: [...QUERY_KEYS.GET_RESERVATIONS, reservationId, 'detail'],
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
