import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dim } from '@/components/dim';
import { Portal } from '@/components/portal';
import { Text } from '@/components/text';
import { useAuthState } from '@/hooks';
import { Close, ReviewAi } from '@/icons';
import {
  floatingButton,
  headerButton,
  headerTitle,
  modalBody,
  modalHeader,
  modalWrapper,
  scrollArea,
} from './index.styles';
import { openLoginModal } from '@/utils/auth-modal';

const ENABLE_CHATBOT = true;

const loadChatbotRuntime = () =>
  import('./chatbot-runtime').then((module) => module.ChatbotRuntime);

const ChatbotRuntime = dynamic(loadChatbotRuntime, {
  ssr: false,
  loading: () => null,
});

let hasPrefetchedRuntime = false;

function prefetchChatbotRuntime() {
  if (hasPrefetchedRuntime) return;
  hasPrefetchedRuntime = true;
  void loadChatbotRuntime();
}

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

    if (!ENABLE_CHATBOT) {
      setIsPreparingOpen(true);
      return;
    }

    prefetchChatbotRuntime();
    setIsChatOpen(true);
  };

  return (
    <>
      <button
        type="button"
        css={floatingButton}
        onClick={handleOpenChat}
        onMouseEnter={prefetchChatbotRuntime}
        onFocus={prefetchChatbotRuntime}
        onTouchStart={prefetchChatbotRuntime}
        aria-label={t('launcherLabel')}
      >
        <ReviewAi width={22} height={22} />
      </button>
      <ChatbotPreparingModal isOpen={isPreparingOpen} onClose={() => setIsPreparingOpen(false)} />
      {ENABLE_CHATBOT && isChatOpen ? (
        <ChatbotRuntime isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
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
          <button type="button" css={headerButton} aria-label={t('buttons.back')} disabled />
          <div css={headerTitle}>
            <Text typo="title_S" color="text_primary">
              {t('title')}
            </Text>
          </div>
          <button
            type="button"
            css={headerButton}
            onClick={onClose}
            aria-label={t('buttons.close')}
          >
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
