import type { ChatSessionAction, ChatSessionState } from '../types';

export const initialSessionState: ChatSessionState = {
  sessions: [],
  activeSessionId: null,
  sessionMeta: {},
};

export const chatSessionReducer = (
  state: ChatSessionState,
  action: ChatSessionAction
): ChatSessionState => {
  switch (action.type) {
    case 'setSessions':
      return { ...state, sessions: action.sessions };
    case 'setActiveSession':
      return { ...state, activeSessionId: action.sessionId };
    case 'setSessionMeta':
      return {
        ...state,
        sessionMeta: {
          ...state.sessionMeta,
          [action.sessionId]: action.session,
        },
      };
    case 'setSessionMetaMap':
      return { ...state, sessionMeta: action.sessionMeta };
    case 'upsertSessionSummary': {
      const filtered = state.sessions.filter(
        (item) => item.session_id !== action.session.session_id
      );
      return { ...state, sessions: [action.session, ...filtered] };
    }
    case 'removeSession': {
      const nextSessions = state.sessions.filter(
        (session) => session.session_id !== action.sessionId
      );
      const nextMeta = { ...state.sessionMeta };
      delete nextMeta[action.sessionId];
      return {
        ...state,
        sessions: nextSessions,
        sessionMeta: nextMeta,
      };
    }
    default:
      return state;
  }
};
