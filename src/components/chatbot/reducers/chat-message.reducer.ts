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
      const { [action.sessionId]: _messages, ...nextMessages } = state.messagesBySession;
      const { [action.sessionId]: _history, ...nextHistory } = state.historyLoaded;
      const { [action.sessionId]: _intro, ...nextIntro } = state.introInitialized;
      const { [action.sessionId]: _count, ...nextCounts } = state.messageCountBySession;
      const { [action.sessionId]: _suggestion, ...nextSuggestions } =
        state.activeSuggestionBySession;
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
