import axios from 'axios';
import {
  GetReservationsParams,
  GetReservationsResponse,
  PostCreateReservationRequest,
  PostCreateReservationResponse,
} from '@/models/reservation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/apis/config';

// 예약 생성
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

// 예약 목록 조회
export const getReservations = async (params: GetReservationsParams) => {
  return await api.get<GetReservationsResponse>('/api/reservations', {
    params,
    baseURL: '',
  });
};
