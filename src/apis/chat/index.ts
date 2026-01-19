import { api } from '@/apis';
import type {
  ChatCountryResponse,
  ChatLanguageResponse,
  ChatMessageResponse,
  ChatSessionDetailResponse,
  ChatSessionListResponse,
  ChatSessionMetadataResponse,
} from '@/models/chat';

export const createChatSession = () => {
  return api.post<ChatSessionMetadataResponse>('/agent/chat/session', {});
};

export const getChatSessions = () => {
  return api.get<ChatSessionListResponse>('/agent/chat/sessions');
};

export const getChatSessionDetail = (sessionId: string) => {
  return api.get<ChatSessionDetailResponse>(`/agent/chat/session/${sessionId}`);
};

export const deleteChatSession = (sessionId: string) => {
  return api.delete<{ message: string }>(`/agent/chat/session/${sessionId}`);
};

export const setChatCountry = (payload: { session_id: string | null; country: string }) => {
  return api.post<ChatCountryResponse>('/agent/chat/country', payload);
};

export const setChatLanguage = (payload: { session_id: string; language: string }) => {
  return api.post<ChatLanguageResponse>('/agent/chat/language', payload);
};

export const sendChatMessage = (payload: {
  session_id: string;
  message: string;
  metadata?: { session_name?: string };
}) => {
  return api.post<ChatMessageResponse>('/agent/chat', payload);
};
