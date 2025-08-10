import { useMutation } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { postCreateReservation } from '@/apis/reservation';
import { PostCreateReservationRequest, PostCreateReservationResponse } from '@/models/reservation';

export const usePostCreateReservationMutation = () => {
  return useMutation<PostCreateReservationResponse, Error, PostCreateReservationRequest>({
    mutationKey: QUERY_KEYS.CREATE_RESERVATION,
    mutationFn: postCreateReservation,
  });
};
