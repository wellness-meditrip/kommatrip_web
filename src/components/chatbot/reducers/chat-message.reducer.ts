import type { ChatMessageAction, ChatMessageState } from '../types';

export const initialMessageState: ChatMessageState = {
  messagesBySession: {},
  historyLoaded: {},
  introInitialized: {},
  messageCountBySession: {},
  activeSuggestionBySession: {},
};

export const chatMessageReducer = (
  state: ChatMessageState,
  action: ChatMessageAction
): ChatMessageState => {
  switch (action.type) {
    case 'setMessages':
      return {
        ...state,
        messagesBySession: {
          ...state.messagesBySession,
          [action.sessionId]: action.messages,
        },
      };
    case 'appendMessages':
      return {
        ...state,
        messagesBySession: {
          ...state.messagesBySession,
          [action.sessionId]: [
            ...(state.messagesBySession[action.sessionId] ?? []),
            ...action.messages,
          ],
        },
      };
    case 'removeMessage':
      return {
        ...state,
        messagesBySession: {
          ...state.messagesBySession,
          [action.sessionId]: (state.messagesBySession[action.sessionId] ?? []).filter(
            (message) => message.id !== action.messageId
          ),
        },
      };
    case 'setHistoryLoaded':
      return {
        ...state,
        historyLoaded: { ...state.historyLoaded, [action.sessionId]: action.value },
      };
    case 'setIntroInitialized':
      return {
        ...state,
        introInitialized: { ...state.introInitialized, [action.sessionId]: action.value },
      };
    case 'setMessageCount':
      return {
        ...state,
        messageCountBySession: {
          ...state.messageCountBySession,
          [action.sessionId]: action.count,
        },
      };
    case 'setActiveSuggestion':
      return {
        ...state,
        activeSuggestionBySession: {
          ...state.activeSuggestionBySession,
          [action.sessionId]: action.question,
        },
      };
    case 'removeSessionData': {
      const nextMessages = { ...state.messagesBySession };
      const nextHistory = { ...state.historyLoaded };
      const nextIntro = { ...state.introInitialized };
      const nextCounts = { ...state.messageCountBySession };
      const nextSuggestions = { ...state.activeSuggestionBySession };
      delete nextMessages[action.sessionId];
      delete nextHistory[action.sessionId];
      delete nextIntro[action.sessionId];
      delete nextCounts[action.sessionId];
      delete nextSuggestions[action.sessionId];
      return {
        ...state,
        messagesBySession: nextMessages,
        historyLoaded: nextHistory,
        introInitialized: nextIntro,
        messageCountBySession: nextCounts,
        activeSuggestionBySession: nextSuggestions,
      };
    }
    default:
      return state;
  }
};
