import { api } from '@/apis';
import type {
  ChatCountryResponse,
  ChatLanguageResponse,
  ChatMessageResponse,
  ChatSessionDetailResponse,
  ChatSessionListResponse,
  ChatSessionMetadataResponse,
} from '@/models/chat';

export const createChatSession = async () => {
  return await api.post<ChatSessionMetadataResponse>('/agent/chat/session', {});
};

export const getChatSessions = async () => {
  return await api.get<ChatSessionListResponse>('/agent/chat/sessions');
};

export const getChatSessionDetail = async (sessionId: string) => {
  return await api.get<ChatSessionDetailResponse>(`/agent/chat/session/${sessionId}`);
};

export const deleteChatSession = async (sessionId: string) => {
  return await api.delete<{ message: string }>(`/agent/chat/session/${sessionId}`);
};

export const setChatCountry = async (payload: { session_id: string | null; country: string }) => {
  return await api.post<ChatCountryResponse>('/agent/chat/country', payload);
};

export const setChatLanguage = async (payload: { session_id: string; language: string }) => {
  return await api.post<ChatLanguageResponse>('/agent/chat/language', payload);
};

export const sendChatMessage = async (payload: {
  session_id: string;
  message: string;
  metadata?: { session_name?: string };
}) => {
  return await api.post<ChatMessageResponse>('/agent/chat', payload);
};
