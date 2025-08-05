import { api } from '@/apis';
import { GetUserValidateResponse } from '@/models/auth';

export const getUserValidate = async () => {
  return await api.get<GetUserValidateResponse>('/user/validate');
};
