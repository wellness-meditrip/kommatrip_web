import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { getReservations, postCreateReservation } from '@/apis/reservation';
import {
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
