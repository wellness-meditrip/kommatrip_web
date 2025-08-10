import { guestReservationApi } from '@/apis/config';
import { PostCreateReservationRequest, PostCreateReservationResponse } from '@/models/reservation';

export const postCreateReservation = async (data: PostCreateReservationRequest) => {
  return await guestReservationApi.post<PostCreateReservationResponse>('/reservations', data);
};
