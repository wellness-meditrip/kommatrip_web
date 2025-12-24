import { api } from '@/apis/config';
import { PostCreateReservationRequest, PostCreateReservationResponse } from '@/models/reservation';

export const postCreateReservation = async (data: PostCreateReservationRequest) => {
  return await api.post<PostCreateReservationResponse>('/reservations', data);
};
