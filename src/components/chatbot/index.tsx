import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrentLocale } from '@/i18n/navigation';
import { nanoid } from 'nanoid';
import { ChatSessionMetadataResponse } from '@/models/chat';
import { getChatSessionDetail, getChatSessions } from '@/apis/chat';
import { useToast, useAuthState } from '@/hooks';
import { Dim, Portal, Text } from '@/components';
import { Chatbot, ChevronLeft, ChevronRight, Close, Clock, ReviewAi } from '@/icons';
import {
  dateHeader,
  emptyItem,
  emptyState,
  emptyStateChip,
  emptyStateChipRow,
  emptyStateIcon,
  emptyStateTips,
  emptyStateTitle,
  floatingButton,
  headerButton,
  headerTitle,
  inputArea,
  inputField,
  inputRow,
  limitNotice,
  modalBody,
  modalHeader,
  modalWrapper,
  scrollArea,
  sectionTitle,
  sendButton,
  sessionButton,
  sessionDeleteButton,
  sessionItem,
  sessionList,
  sessionRevealZone,
  startNewChatButton,
} from './index.styles';
import { buildOptionsMessage, buildSuggestionsMessage } from './message-builders';
import {
  chatMessageReducer,
  chatSessionReducer,
  chatUIReducer,
  initialMessageState,
  initialSessionState,
  initialUIState,
} from './reducers';
import type { ChatMessage } from './types';
import { MessageRenderer } from './messages';
import { useChatActions } from './hooks/useChatActions';
import { openLoginModal } from '@/utils/auth-modal';

const MESSAGE_LIMIT = 10;
const ENABLE_CHATBOT = true;

export function ChatbotLauncher() {
  const t = useTranslations('chatbot');
  const { isAuthenticated } = useAuthState();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPreparingOpen, setIsPreparingOpen] = useState(false);

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      openLoginModal({
        reason: 'chatbot',
      });
      return;
    }

    // 차단 해제: 기존 챗봇 모달 진입 경로를 사용한다.
    if (!ENABLE_CHATBOT) {
      setIsPreparingOpen(true);
      return;
    }

    setIsChatOpen(true);
  };

  return (
    <>
      <button css={floatingButton} onClick={handleOpenChat} aria-label={t('launcherLabel')}>
        <ReviewAi width={22} height={22} />
      </button>
      <ChatbotPreparingModal isOpen={isPreparingOpen} onClose={() => setIsPreparingOpen(false)} />
      {/* TODO(챗봇): 백엔드 수정 완료 시 기존 ChatbotModal을 다시 기본 진입점으로 사용한다. */}
      {ENABLE_CHATBOT ? (
        <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      ) : null}
    </>
  );
}

function ChatbotPreparingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('chatbot');

  if (!isOpen) return null;

  return (
    <Portal>
      <Dim fullScreen onClick={onClose} />
      <div css={modalWrapper} role="dialog" aria-modal="true">
        <div css={modalHeader}>
          <button css={headerButton} aria-label={t('buttons.back')} disabled />
          <div css={headerTitle}>
            <Text typo="title_S" color="text_primary">
              {t('title')}
            </Text>
          </div>
          <button css={headerButton} onClick={onClose} aria-label={t('buttons.close')}>
            <Close width={14} height={14} />
          </button>
        </div>
        <div css={modalBody}>
          <div css={scrollArea}>
            <Text typo="title_M" color="text_primary">
              {t('maintenance.title')}
            </Text>
            <Text typo="body_M" color="text_secondary">
              {t('maintenance.description')}
            </Text>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function ChatbotModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('chatbot');
  const currentLocale = useCurrentLocale();
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  const [uiState, uiDispatch] = useReducer(chatUIReducer, initialUIState);
  const [sessionState, sessionDispatch] = useReducer(chatSessionReducer, initialSessionState);
  const [messageState, messageDispatch] = useReducer(chatMessageReducer, initialMessageState);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const { view, inputValue, isLoadingSessions, isLoadingSession, isSending, hoveredSessionId } =
    uiState;
  const { sessions, activeSessionId, sessionMeta } = sessionState;
  const {
    messagesBySession,
    historyLoaded,
    introInitialized,
    messageCountBySession,
    activeSuggestionBySession,
  } = messageState;

  const localeMap: Record<string, string> = {
    en: 'en-US',
    ko: 'ko-KR',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ms: 'ms-MY',
    id: 'id-ID',
  };
  const locale = localeMap[currentLocale as string] ?? 'en-US';

  const formatChatTime = useCallback(
    (value?: string) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    },
    [locale]
  );

  const formatChatDate = useCallback(
    (value?: string) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    },
    [locale]
  );

  const activeSession = activeSessionId ? sessionMeta[activeSessionId] : null;
  const activeMessages = useMemo(
    () => (activeSessionId ? (messagesBySession[activeSessionId] ?? []) : []),
    [activeSessionId, messagesBySession]
  );
  const messageCount = useMemo(
    () => (activeSessionId ? (messageCountBySession[activeSessionId] ?? 0) : 0),
    [activeSessionId, messageCountBySession]
  );
  const chatDateLabel = useMemo(() => {
    const firstTimestamp = activeMessages.find((message) => message.createdAt)?.createdAt;
    return formatChatDate(firstTimestamp ?? new Date().toISOString());
  }, [activeMessages, formatChatDate]);

  const countryOptions = useMemo(
    () => [
      { value: 'US', label: t('countries.usa') },
      { value: 'JP', label: t('countries.japan') },
      { value: 'CN', label: t('countries.china') },
      { value: 'KR', label: t('countries.korea') },
      { value: 'EU', label: t('countries.europe') },
      { value: 'SG', label: t('countries.singapore') },
      { value: 'MY', label: t('countries.malaysia') },
      { value: 'ID', label: t('countries.indonesia') },
      { value: 'ETC', label: t('countries.etc') },
    ],
    [t]
  );

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: t('languages.english') },
      { value: 'ja', label: t('languages.japanese') },
      { value: 'zh', label: t('languages.chinese') },
      { value: 'ko', label: t('languages.korean') },
      { value: 'ms', label: t('languages.malay') },
      { value: 'id', label: t('languages.indonesian') },
    ],
    [t]
  );
  const suggestionQuestions = useMemo(() => {
    const raw = t.raw('recommendations.items');
    return Array.isArray(raw) ? raw : [];
  }, [t]);
  const emptyStateTipItems = useMemo(() => {
    const raw = t.raw('emptyState.tips');
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const getCountryLabel = useCallback(
    (value: string) => countryOptions.find((option) => option.value === value)?.label ?? value,
    [countryOptions]
  );

  const getLanguageLabel = useCallback(
    (value: string) => languageOptions.find((option) => option.value === value)?.label ?? value,
    [languageOptions]
  );

  const resetView = () => {
    uiDispatch({ type: 'setView', view: 'list' });
    uiDispatch({ type: 'setInput', value: '' });
    sessionDispatch({ type: 'setActiveSession', sessionId: null });
  };

  const handleClose = () => {
    resetView();
    onClose();
  };

  const upsertSessionSummary = (session: ChatSessionMetadataResponse) => {
    sessionDispatch({ type: 'upsertSessionSummary', session });
  };

  useEffect(() => {
    if (!isOpen) return;
    uiDispatch({ type: 'setLoadingSessions', value: true });
    getChatSessions()
      .then((response) => {
        const list = response?.session_list ?? [];
        sessionDispatch({ type: 'setSessions', sessions: list });
        const nextMeta = list.reduce<Record<string, ChatSessionMetadataResponse>>(
          (acc, session) => {
            acc[session.session_id] = session;
            return acc;
          },
          {}
        );
        sessionDispatch({ type: 'setSessionMetaMap', sessionMeta: nextMeta });
      })
      .catch(() => {
        showToastRef.current({ title: t('errors.loadSessions'), icon: 'exclaim' });
      })
      .finally(() => {
        uiDispatch({ type: 'setLoadingSessions', value: false });
      });
  }, [isOpen, t]);

  useEffect(() => {
    if (!isOpen || view !== 'detail' || !activeSessionId) return;
    if (historyLoaded[activeSessionId]) return;
    uiDispatch({ type: 'setLoadingSession', value: true });
    getChatSessionDetail(activeSessionId)
      .then((response) => {
        sessionDispatch({
          type: 'setSessionMeta',
          sessionId: activeSessionId,
          session: response,
        });
        const mappedMessages: ChatMessage[] = response.history.flatMap((item) => [
          {
            id: `q-${item.sequence}`,
            role: 'user',
            content: item.question,
            kind: 'text',
            createdAt: item.timestamp,
          },
          {
            id: `a-${item.sequence}`,
            role: 'assistant',
            content: item.answer,
            kind: 'text',
            createdAt: item.timestamp,
          },
        ]);
        messageDispatch({
          type: 'setMessages',
          sessionId: activeSessionId,
          messages: mappedMessages,
        });
        messageDispatch({
          type: 'setMessageCount',
          sessionId: activeSessionId,
          count: response.history.length,
        });
        messageDispatch({
          type: 'setHistoryLoaded',
          sessionId: activeSessionId,
          value: true,
        });
        upsertSessionSummary(response);
      })
      .catch(() => {
        showToastRef.current({ title: t('errors.loadSession'), icon: 'exclaim' });
      })
      .finally(() => {
        uiDispatch({ type: 'setLoadingSession', value: false });
      });
  }, [activeSessionId, historyLoaded, isOpen, t, view]);

  useEffect(() => {
    if (view !== 'detail') return;
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeMessages.length, view, activeSessionId]);

  useEffect(() => {
    if (view !== 'detail' || !activeSessionId) return;
    if (introInitialized[activeSessionId]) return;
    const currentMessages = messagesBySession[activeSessionId] ?? [];
    if (currentMessages.length > 0) {
      messageDispatch({ type: 'setIntroInitialized', sessionId: activeSessionId, value: true });
      return;
    }

    const country = activeSession?.metadata?.country;
    const language = activeSession?.metadata?.language;
    const welcomeText = `${t('welcome.title')}\n${t('welcome.subtitle')}\n${t('welcome.prompt')}`;
    const nextMessages: ChatMessage[] = [buildOptionsMessage('country', t, welcomeText)];
    if (country) {
      nextMessages.push({
        id: `country-user-${nanoid()}`,
        role: 'user',
        kind: 'text',
        content: getCountryLabel(country),
        createdAt: new Date().toISOString(),
      });
      nextMessages.push(buildOptionsMessage('language', t, t('prompts.language')));
    }
    if (language) {
      nextMessages.push({
        id: `language-user-${nanoid()}`,
        role: 'user',
        kind: 'text',
        content: getLanguageLabel(language),
        createdAt: new Date().toISOString(),
      });
      nextMessages.push(buildSuggestionsMessage(t('recommendations.title')));
    }

    messageDispatch({ type: 'setMessages', sessionId: activeSessionId, messages: nextMessages });
    messageDispatch({ type: 'setIntroInitialized', sessionId: activeSessionId, value: true });
  }, [
    activeSessionId,
    activeSession?.metadata?.country,
    activeSession?.metadata?.language,
    getCountryLabel,
    getLanguageLabel,
    introInitialized,
    messagesBySession,
    t,
    view,
  ]);

  const canSendMessage =
    !!activeSessionId &&
    !!activeSession?.metadata?.country &&
    !!activeSession?.metadata?.language &&
    messageCount < MESSAGE_LIMIT &&
    !isSending;
  const isInputEmpty = !inputValue.trim();

  const {
    startNewChat,
    selectSession,
    deleteSession,
    selectCountry,
    selectLanguage,
    sendMessage,
    sendSuggestion,
  } = useChatActions({
    t,
    uiDispatch,
    sessionDispatch,
    messageDispatch,
    sessionState: { activeSessionId, sessionMeta },
    messageState: { messagesBySession, messageCountBySession, activeSuggestionBySession },
    countryOptions,
    languageOptions,
    canSendMessage,
    showToast: (args) => showToastRef.current(args),
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
  };

  const handleSendSuggestion = async (question: string) => {
    if (!question) return;
    await sendSuggestion(question);
  };

  const renderListView = () => (
    <div css={scrollArea}>
      {isLoadingSessions ? (
        <Text typo="body_M" color="text_secondary">
          {t('loading')}
        </Text>
      ) : sessions.length === 0 ? (
        <div css={emptyState}>
          <div css={emptyStateTitle}>
            <span css={emptyStateIcon} aria-hidden="true">
              <Chatbot width={22} height={22} />
            </span>
            <div css={emptyItem}>
              <Text typo="title_M" color="text_primary">
                {t('emptyState.title')}
              </Text>
              <Text typo="body_M" color="text_secondary">
                {t('emptyState.description')}
              </Text>
            </div>
          </div>
          <div css={emptyStateTips}>
            <Text typo="body_S" color="text_tertiary">
              {t('emptyState.tipsTitle')}
            </Text>
            <div css={emptyStateChipRow}>
              {emptyStateTipItems.map((tip: string) => (
                <div key={tip} css={emptyStateChip}>
                  <Text typo="body_S" color="text_secondary">
                    {tip}
                  </Text>
                </div>
              ))}
            </div>
          </div>
          <button css={startNewChatButton} onClick={startNewChat}>
            <ReviewAi width={18} height={18} />
            <Text typo="button_M" color="text_primary">
              {t('startNewChat')}
            </Text>
          </button>
        </div>
      ) : (
        <>
          <button css={startNewChatButton} onClick={startNewChat}>
            <ReviewAi width={18} height={18} />
            <Text typo="button_M" color="text_primary">
              {t('startNewChat')}
            </Text>
          </button>

          <div css={sectionTitle}>
            <Clock width={16} height={16} />
            <Text typo="button_M" color="text_tertiary">
              {t('history')}
            </Text>
          </div>
          <div css={sessionList}>
            {sessions.map((session) => (
              <div
                key={session.session_id}
                css={sessionItem}
                className="chat-session-item"
                data-reveal={hoveredSessionId === session.session_id}
                onMouseLeave={() =>
                  uiDispatch({
                    type: 'setHoveredSession',
                    sessionId: hoveredSessionId === session.session_id ? null : hoveredSessionId,
                  })
                }
              >
                <button
                  css={sessionButton}
                  className="chat-session-button"
                  onClick={() => selectSession(session.session_id)}
                >
                  <Text typo="button_M" color="text_primary">
                    {session.session_name || t('untitledSession')}
                  </Text>
                </button>
                <div
                  css={sessionRevealZone}
                  onMouseEnter={() =>
                    uiDispatch({ type: 'setHoveredSession', sessionId: session.session_id })
                  }
                  aria-hidden="true"
                />
                <button
                  css={sessionDeleteButton}
                  className="chat-session-delete"
                  aria-label={t('delete')}
                  onClick={() => deleteSession(session.session_id)}
                  onMouseEnter={() =>
                    uiDispatch({ type: 'setHoveredSession', sessionId: session.session_id })
                  }
                >
                  <Close width={12} height={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderDetailView = () => (
    <>
      <div css={scrollArea} ref={scrollRef}>
        {chatDateLabel ? (
          <div css={dateHeader}>
            <Text typo="body_S" color="text_tertiary">
              {chatDateLabel}
            </Text>
          </div>
        ) : null}
        {activeMessages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            assistantNameText={t('assistantName')}
            countryOptions={countryOptions}
            languageOptions={languageOptions}
            suggestionQuestions={suggestionQuestions}
            selectedCountry={activeSession?.metadata?.country}
            selectedLanguage={activeSession?.metadata?.language}
            activeSuggestion={activeSessionId ? activeSuggestionBySession[activeSessionId] : null}
            formatTime={formatChatTime}
            onSelectCountry={selectCountry}
            onSelectLanguage={selectLanguage}
            onSelectSuggestion={handleSendSuggestion}
          />
        ))}

        {isSending ? (
          <MessageRenderer
            key="chatbot-sending"
            message={{
              id: 'chatbot-sending',
              role: 'assistant',
              kind: 'loading',
              createdAt: new Date().toISOString(),
            }}
            assistantNameText={t('assistantName')}
            countryOptions={countryOptions}
            languageOptions={languageOptions}
            suggestionQuestions={suggestionQuestions}
            selectedCountry={activeSession?.metadata?.country}
            selectedLanguage={activeSession?.metadata?.language}
            activeSuggestion={activeSessionId ? activeSuggestionBySession[activeSessionId] : null}
            formatTime={formatChatTime}
            onSelectCountry={selectCountry}
            onSelectLanguage={selectLanguage}
            onSelectSuggestion={handleSendSuggestion}
          />
        ) : null}
      </div>

      <div css={inputArea}>
        <div css={inputRow}>
          <input
            css={inputField}
            value={inputValue}
            onChange={(event) => uiDispatch({ type: 'setInput', value: event.target.value })}
            placeholder={
              messageCount >= MESSAGE_LIMIT ? t('messageLimitReached') : t('inputPlaceholder')
            }
            disabled={!canSendMessage}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (!isInputEmpty) {
                  handleSendMessage();
                }
              }
            }}
          />
          <button
            css={sendButton}
            onClick={handleSendMessage}
            disabled={!canSendMessage || isInputEmpty}
          >
            <ChevronRight width={16} height={16} />
          </button>
        </div>
        <Text typo="body_S" color="text_tertiary" css={limitNotice}>
          {t('limitNotice')}
        </Text>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <Portal>
      <Dim fullScreen onClick={handleClose} />
      <div css={modalWrapper} role="dialog" aria-modal="true">
        <div css={modalHeader}>
          <button
            css={headerButton}
            onClick={view === 'detail' ? resetView : handleClose}
            aria-label={t('buttons.back')}
            disabled={view === 'list'}
          >
            {view === 'detail' ? <ChevronLeft width={16} height={16} /> : null}
          </button>
          <div css={headerTitle}>
            <Text typo="title_S" color="text_primary">
              {t('title')}
            </Text>
          </div>
          <button css={headerButton} onClick={handleClose} aria-label={t('buttons.close')}>
            <Close width={14} height={14} />
          </button>
        </div>
        <div css={modalBody}>
          {isLoadingSession && view === 'detail' ? (
            <div css={scrollArea}>
              <Text typo="body_M" color="text_secondary">
                {t('loading')}
              </Text>
            </div>
          ) : view === 'list' ? (
            renderListView()
          ) : (
            renderDetailView()
          )}
        </div>
      </div>
    </Portal>
  );
}
