import axios from 'axios';
import { PostCreateReservationRequest, PostCreateReservationResponse } from '@/models/reservation';
import { useAuthStore } from '@/store/auth';

export const postCreateReservation = async (data: PostCreateReservationRequest) => {
  // TODO: 백엔드 CORS 수정 후 api 클라이언트 직접 호출로 되돌릴 것.
  // 현재 백엔드 설정: Access-Control-Allow-Origin="*" + credentials=true 조합으로 CORS 발생.
  // CORS 수정 후 Next API 프록시 제거하고 api.post('/api/reservations/') 사용.
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await axios.post<PostCreateReservationResponse>('/api/reservations', data, {
    headers,
  });
  return response.data;
};
