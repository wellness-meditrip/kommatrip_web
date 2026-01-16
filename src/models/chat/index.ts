export interface ChatSessionMetadataResponse {
  session_id: string;
  user_id: number;
  session_name?: string | null;
  metadata: {
    country?: string;
    language?: string;
    session_name?: string;
    [key: string]: unknown;
  };
}

export interface ChatSessionListResponse {
  session_list: ChatSessionMetadataResponse[];
}

export interface ChatHistoryItem {
  sequence: number;
  question: string;
  answer: string;
  filters: Record<string, unknown>;
  documents?: Array<{
    id: string;
    score: number;
    metadata: {
      tags?: string[];
      [key: string]: unknown;
    };
  }>;
  timestamp: string;
}

export interface ChatSessionDetailResponse extends ChatSessionMetadataResponse {
  history: ChatHistoryItem[];
}

export interface ChatCountryResponse {
  session_id: string;
  metadata: {
    country?: string;
    [key: string]: unknown;
  };
}

export interface ChatLanguageResponse {
  session_id: string;
  metadata: {
    language?: string;
    [key: string]: unknown;
  };
}

export interface ChatMessageResponse {
  session_id: string;
  session_name?: string;
  message_count: number;
  answer: string;
  references?: Array<{
    id: string;
    score: number;
    metadata: {
      tags?: string[];
      [key: string]: unknown;
    };
  }>;
}
