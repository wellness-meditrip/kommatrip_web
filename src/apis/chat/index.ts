import { bffApi } from '@/apis/config';
import type {
  ChatCountryResponse,
  ChatLanguageResponse,
  ChatMessageResponse,
  ChatSessionDetailResponse,
  ChatSessionListResponse,
  ChatSessionMetadataResponse,
} from '@/models/chat';

export const createChatSession = () => {
  return bffApi.post<ChatSessionMetadataResponse>('/api/agent/chat/session', {});
};

export const getChatSessions = () => {
  return bffApi.get<ChatSessionListResponse>('/api/agent/chat/sessions');
};

export const getChatSessionDetail = (sessionId: string) => {
  return bffApi.get<ChatSessionDetailResponse>(`/api/agent/chat/session/${sessionId}`);
};

export const deleteChatSession = (sessionId: string) => {
  return bffApi.delete<{ message: string }>(`/api/agent/chat/session/${sessionId}`);
};

export const setChatCountry = (payload: { session_id: string | null; country: string }) => {
  return bffApi.post<ChatCountryResponse>('/api/agent/chat/country', payload);
};

export const setChatLanguage = (payload: { session_id: string; language: string }) => {
  return bffApi.post<ChatLanguageResponse>('/api/agent/chat/language', payload);
};

export const sendChatMessage = (payload: {
  session_id: string;
  message: string;
  metadata?: { session_name?: string };
}) => {
  return bffApi.post<ChatMessageResponse>('/api/agent/chat', payload);
};
