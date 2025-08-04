import axios from 'axios';
import { api, guestApi } from '@/apis';
import { GetUserValidateResponse } from '@/models/auth';

export const getUserValidate = async () => {
  return await api.get<GetUserValidateResponse>('/user/validate');
};
