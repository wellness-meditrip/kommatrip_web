import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import {
  createChatSession,
  deleteChatSession,
  sendChatMessage,
  setChatCountry,
  setChatLanguage,
} from '@/apis/chat';
import type { ChatSessionMetadataResponse } from '@/models/chat';
import {
  buildAskAnythingMessage,
  buildOptionsMessage,
  buildSuggestionsMessage,
} from '../message-builders';
import type {
  ChatMessage,
  ChatMessageAction,
  ChatMessageState,
  ChatSessionAction,
  ChatSessionState,
  ChatUIAction,
} from '../types';

type Dispatch<T> = (action: T) => void;

type OptionItem = { value: string; label: string };

interface UseChatActionsParams {
  t: (key: string) => string;
  uiDispatch: Dispatch<ChatUIAction>;
  sessionDispatch: Dispatch<ChatSessionAction>;
  messageDispatch: Dispatch<ChatMessageAction>;
  sessionState: Pick<ChatSessionState, 'activeSessionId' | 'sessionMeta'>;
  messageState: Pick<
    ChatMessageState,
    'messagesBySession' | 'messageCountBySession' | 'activeSuggestionBySession'
  >;
  countryOptions: OptionItem[];
  languageOptions: OptionItem[];
  canSendMessage: boolean;
  showToast: (args: { title: string; icon?: 'check' | 'exclaim' }) => void;
}

export const useChatActions = ({
  t,
  uiDispatch,
  sessionDispatch,
  messageDispatch,
  sessionState,
  messageState,
  countryOptions,
  languageOptions,
  canSendMessage,
  showToast,
}: UseChatActionsParams) => {
  const { activeSessionId, sessionMeta } = sessionState;
  const { messagesBySession, messageCountBySession, activeSuggestionBySession } = messageState;

  const appendMessages = useCallback(
    (sessionId: string, messages: ChatMessage[]) => {
      messageDispatch({ type: 'appendMessages', sessionId, messages });
    },
    [messageDispatch]
  );

  const hasOptionsMessage = useCallback(
    (sessionId: string, type: 'country' | 'language' | 'suggestions') =>
      (messagesBySession[sessionId] ?? []).some(
        (message) => message.kind === 'options' && message.optionsType === type
      ),
    [messagesBySession]
  );

  const getCountryLabel = useCallback(
    (value: string) => countryOptions.find((option) => option.value === value)?.label ?? value,
    [countryOptions]
  );

  const getLanguageLabel = useCallback(
    (value: string) => languageOptions.find((option) => option.value === value)?.label ?? value,
    [languageOptions]
  );

  const removeSessionCompletely = useCallback(
    (sessionId: string) => {
      sessionDispatch({ type: 'removeSession', sessionId });
      messageDispatch({ type: 'removeSessionData', sessionId });
    },
    [messageDispatch, sessionDispatch]
  );

  const startNewChat = useCallback(async () => {
    uiDispatch({ type: 'setLoadingSession', value: true });
    try {
      const session = await createChatSession();
      sessionDispatch({
        type: 'setSessionMeta',
        sessionId: session.session_id,
        session,
      });
      messageDispatch({
        type: 'setMessages',
        sessionId: session.session_id,
        messages: [],
      });
      messageDispatch({
        type: 'setMessageCount',
        sessionId: session.session_id,
        count: 0,
      });
      messageDispatch({
        type: 'setHistoryLoaded',
        sessionId: session.session_id,
        value: true,
      });
      messageDispatch({
        type: 'setIntroInitialized',
        sessionId: session.session_id,
        value: false,
      });
      messageDispatch({
        type: 'setActiveSuggestion',
        sessionId: session.session_id,
        question: null,
      });
      sessionDispatch({ type: 'upsertSessionSummary', session });
      sessionDispatch({ type: 'setActiveSession', sessionId: session.session_id });
      uiDispatch({ type: 'setView', view: 'detail' });
    } catch {
      showToast({ title: t('errors.loadSession'), icon: 'exclaim' });
    } finally {
      uiDispatch({ type: 'setLoadingSession', value: false });
    }
  }, [messageDispatch, sessionDispatch, showToast, t, uiDispatch]);

  const selectSession = useCallback(
    (sessionId: string) => {
      sessionDispatch({ type: 'setActiveSession', sessionId });
      uiDispatch({ type: 'setView', view: 'detail' });
    },
    [sessionDispatch, uiDispatch]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteChatSession(sessionId);
        removeSessionCompletely(sessionId);
        if (activeSessionId === sessionId) {
          sessionDispatch({ type: 'setActiveSession', sessionId: null });
          uiDispatch({ type: 'setView', view: 'list' });
        }
        showToast({ title: t('deleteSuccess'), icon: 'check' });
      } catch {
        showToast({ title: t('errors.deleteSession'), icon: 'exclaim' });
      }
    },
    [activeSessionId, removeSessionCompletely, sessionDispatch, showToast, t, uiDispatch]
  );

  const selectCountry = useCallback(
    async (country: string) => {
      if (!activeSessionId) return;
      if (sessionMeta[activeSessionId]?.metadata?.country) return;
      try {
        const response = await setChatCountry({ session_id: activeSessionId, country });
        const currentSession =
          sessionMeta[activeSessionId] ??
          ({
            session_id: activeSessionId,
            user_id: 0,
            metadata: {},
          } as ChatSessionMetadataResponse);
        sessionDispatch({
          type: 'setSessionMeta',
          sessionId: activeSessionId,
          session: {
            ...currentSession,
            metadata: {
              ...(currentSession.metadata ?? {}),
              country: response.metadata?.country ?? country,
            },
          },
        });
        appendMessages(activeSessionId, [
          {
            id: `country-user-${nanoid()}`,
            role: 'user',
            kind: 'text',
            content: getCountryLabel(country),
            createdAt: new Date().toISOString(),
          },
        ]);
        if (!hasOptionsMessage(activeSessionId, 'language')) {
          appendMessages(activeSessionId, [
            buildOptionsMessage('language', t, t('prompts.language')),
          ]);
        }
      } catch {
        showToast({ title: t('errors.setCountry'), icon: 'exclaim' });
      }
    },
    [
      activeSessionId,
      appendMessages,
      getCountryLabel,
      hasOptionsMessage,
      sessionDispatch,
      sessionMeta,
      showToast,
      t,
    ]
  );

  const selectLanguage = useCallback(
    async (language: string) => {
      if (!activeSessionId) return;
      if (sessionMeta[activeSessionId]?.metadata?.language) return;
      try {
        const response = await setChatLanguage({ session_id: activeSessionId, language });
        const currentSession =
          sessionMeta[activeSessionId] ??
          ({
            session_id: activeSessionId,
            user_id: 0,
            metadata: {},
          } as ChatSessionMetadataResponse);
        sessionDispatch({
          type: 'setSessionMeta',
          sessionId: activeSessionId,
          session: {
            ...currentSession,
            metadata: {
              ...(currentSession.metadata ?? {}),
              language: response.metadata?.language ?? language,
            },
          },
        });
        appendMessages(activeSessionId, [
          {
            id: `language-user-${nanoid()}`,
            role: 'user',
            kind: 'text',
            content: getLanguageLabel(language),
            createdAt: new Date().toISOString(),
          },
        ]);
        if (!hasOptionsMessage(activeSessionId, 'suggestions')) {
          appendMessages(activeSessionId, [buildSuggestionsMessage(t('recommendations.title'))]);
        }
      } catch {
        showToast({ title: t('errors.setLanguage'), icon: 'exclaim' });
      }
    },
    [
      activeSessionId,
      appendMessages,
      getLanguageLabel,
      hasOptionsMessage,
      sessionDispatch,
      sessionMeta,
      showToast,
      t,
    ]
  );

  const sendMessage = useCallback(
    async (text: string, options?: { setTitle?: boolean }) => {
      if (!activeSessionId || !text.trim() || !canSendMessage) return;
      const trimmed = text.trim();
      const optimisticId = `optimistic-${nanoid()}`;
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        role: 'user',
        content: trimmed,
        kind: 'text',
        createdAt: new Date().toISOString(),
      };
      uiDispatch({ type: 'setInput', value: '' });
      messageDispatch({
        type: 'appendMessages',
        sessionId: activeSessionId,
        messages: [optimisticMessage],
      });
      uiDispatch({ type: 'setSending', value: true });

      try {
        const shouldSetTitle = options?.setTitle !== false;
        const metadata =
          shouldSetTitle && !sessionMeta[activeSessionId]?.session_name
            ? { session_name: trimmed }
            : undefined;
        const response = await sendChatMessage({
          session_id: activeSessionId,
          message: trimmed,
          metadata,
        });
        const answerMessage: ChatMessage = {
          id: `answer-${nanoid()}`,
          role: 'assistant',
          content: response.answer,
          kind: 'text',
          createdAt: new Date().toISOString(),
        };
        messageDispatch({
          type: 'appendMessages',
          sessionId: activeSessionId,
          messages: [answerMessage],
        });
        messageDispatch({
          type: 'setMessageCount',
          sessionId: activeSessionId,
          count: response.message_count ?? (messageCountBySession[activeSessionId] ?? 0) + 1,
        });

        if (response.session_name) {
          const currentSession =
            sessionMeta[activeSessionId] ??
            ({
              session_id: activeSessionId,
              user_id: 0,
              metadata: {},
            } as ChatSessionMetadataResponse);
          sessionDispatch({
            type: 'setSessionMeta',
            sessionId: activeSessionId,
            session: {
              ...currentSession,
              session_name: response.session_name,
            },
          });
          sessionDispatch({
            type: 'upsertSessionSummary',
            session: {
              ...currentSession,
              session_name: response.session_name,
            },
          });
        }

        const shouldShowAskAnything = !!activeSuggestionBySession[activeSessionId];
        const hasAskAnything = (messagesBySession[activeSessionId] ?? []).some(
          (message) => message.kind === 'text' && message.content === t('askAnything')
        );
        if (shouldShowAskAnything && !hasAskAnything) {
          appendMessages(activeSessionId, [buildAskAnythingMessage(t('askAnything'))]);
        }
      } catch {
        messageDispatch({
          type: 'removeMessage',
          sessionId: activeSessionId,
          messageId: optimisticId,
        });
        showToast({ title: t('errors.sendMessage'), icon: 'exclaim' });
      } finally {
        uiDispatch({ type: 'setSending', value: false });
      }
    },
    [
      activeSessionId,
      activeSuggestionBySession,
      appendMessages,
      canSendMessage,
      messageCountBySession,
      messageDispatch,
      messagesBySession,
      sessionDispatch,
      sessionMeta,
      showToast,
      t,
      uiDispatch,
    ]
  );

  const sendSuggestion = useCallback(
    async (question: string) => {
      if (!question || !activeSessionId) return;
      messageDispatch({ type: 'setActiveSuggestion', sessionId: activeSessionId, question });
      await sendMessage(question, { setTitle: false });
    },
    [activeSessionId, messageDispatch, sendMessage]
  );

  return {
    startNewChat,
    selectSession,
    deleteSession,
    selectCountry,
    selectLanguage,
    sendMessage,
    sendSuggestion,
  };
};
