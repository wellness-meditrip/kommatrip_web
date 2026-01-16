import type { ChatSessionMetadataResponse } from '@/models/chat';

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content?: string;
  kind?: 'text' | 'options' | 'loading';
  optionsType?: 'country' | 'language' | 'suggestions';
  title?: string;
  createdAt?: string;
};

export type ViewMode = 'list' | 'detail';

export type ChatUIState = {
  view: ViewMode;
  inputValue: string;
  isLoadingSessions: boolean;
  isLoadingSession: boolean;
  isSending: boolean;
  hoveredSessionId: string | null;
};

export type ChatSessionState = {
  sessions: ChatSessionMetadataResponse[];
  activeSessionId: string | null;
  sessionMeta: Record<string, ChatSessionMetadataResponse>;
};

export type ChatMessageState = {
  messagesBySession: Record<string, ChatMessage[]>;
  historyLoaded: Record<string, boolean>;
  introInitialized: Record<string, boolean>;
  messageCountBySession: Record<string, number>;
  activeSuggestionBySession: Record<string, string | null>;
};

export type ChatUIAction =
  | { type: 'setView'; view: ViewMode }
  | { type: 'setInput'; value: string }
  | { type: 'setLoadingSessions'; value: boolean }
  | { type: 'setLoadingSession'; value: boolean }
  | { type: 'setSending'; value: boolean }
  | { type: 'setHoveredSession'; sessionId: string | null };

export type ChatSessionAction =
  | { type: 'setSessions'; sessions: ChatSessionMetadataResponse[] }
  | { type: 'setActiveSession'; sessionId: string | null }
  | { type: 'setSessionMeta'; sessionId: string; session: ChatSessionMetadataResponse }
  | { type: 'setSessionMetaMap'; sessionMeta: Record<string, ChatSessionMetadataResponse> }
  | { type: 'upsertSessionSummary'; session: ChatSessionMetadataResponse }
  | { type: 'removeSession'; sessionId: string };

export type ChatMessageAction =
  | { type: 'setMessages'; sessionId: string; messages: ChatMessage[] }
  | { type: 'appendMessages'; sessionId: string; messages: ChatMessage[] }
  | { type: 'removeMessage'; sessionId: string; messageId: string }
  | { type: 'setHistoryLoaded'; sessionId: string; value: boolean }
  | { type: 'setIntroInitialized'; sessionId: string; value: boolean }
  | { type: 'setMessageCount'; sessionId: string; count: number }
  | { type: 'setActiveSuggestion'; sessionId: string; question: string | null }
  | { type: 'removeSessionData'; sessionId: string };
