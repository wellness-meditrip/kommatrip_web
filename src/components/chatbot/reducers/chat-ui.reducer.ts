import type { ChatUIAction, ChatUIState } from '../types';

export const initialUIState: ChatUIState = {
  view: 'list',
  inputValue: '',
  isLoadingSessions: false,
  isLoadingSession: false,
  isSending: false,
  hoveredSessionId: null,
};

export const chatUIReducer = (state: ChatUIState, action: ChatUIAction): ChatUIState => {
  switch (action.type) {
    case 'setView':
      return { ...state, view: action.view };
    case 'setInput':
      return { ...state, inputValue: action.value };
    case 'setLoadingSessions':
      return { ...state, isLoadingSessions: action.value };
    case 'setLoadingSession':
      return { ...state, isLoadingSession: action.value };
    case 'setSending':
      return { ...state, isSending: action.value };
    case 'setHoveredSession':
      return { ...state, hoveredSessionId: action.sessionId };
    default:
      return state;
  }
};
