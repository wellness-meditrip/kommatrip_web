import { Text } from '@/components';
import { Chatbot } from '@/icons';
import Lottie from 'lottie-react';
import loading from '../../../../public/json/loading.json';
import {
  assistantAvatar,
  assistantHeader,
  assistantName,
  loadingLottie,
  messageBubble,
  messageContentRow,
  messageRow,
  messageTime,
  optionButton,
  optionCard,
  optionGrid,
  suggestionButton,
  suggestionList,
} from '../index.styles';
import type { ChatMessage } from '../types';

type OptionItem = { value: string; label: string };

interface MessageRendererProps {
  message: ChatMessage;
  assistantNameText: string;
  countryOptions: OptionItem[];
  languageOptions: OptionItem[];
  suggestionQuestions: string[];
  selectedCountry?: string;
  selectedLanguage?: string;
  activeSuggestion?: string | null;
  formatTime: (value?: string) => string;
  onSelectCountry: (value: string) => void;
  onSelectLanguage: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
}

export function MessageRenderer({
  message,
  assistantNameText,
  countryOptions,
  languageOptions,
  suggestionQuestions,
  selectedCountry,
  selectedLanguage,
  activeSuggestion,
  formatTime,
  onSelectCountry,
  onSelectLanguage,
  onSelectSuggestion,
}: MessageRendererProps) {
  const timeLabel = formatTime(message.createdAt);
  const assistantHeaderView = (
    <div css={assistantHeader}>
      <div css={assistantAvatar} aria-hidden="true">
        <Chatbot width={18} height={18} />
      </div>
      <Text typo="body_S" color="text_secondary" css={assistantName}>
        {assistantNameText}
      </Text>
    </div>
  );

  if (message.kind === 'options' && message.optionsType === 'country') {
    return (
      <div css={messageRow('assistant')}>
        <div>
          {assistantHeaderView}
          <div css={messageContentRow}>
            <div css={messageBubble('assistant')}>
              {message.content && (
                <Text typo="body_M" color="text_primary">
                  {message.content}
                </Text>
              )}
              <div css={optionCard}>
                {message.title && (
                  <Text typo="title_S" color="text_primary">
                    {message.title}
                  </Text>
                )}
                <div css={optionGrid(3, 2)}>
                  {countryOptions.map((option) => (
                    <button
                      key={option.value}
                      css={optionButton}
                      data-selected={selectedCountry === option.value}
                      disabled={!!selectedCountry}
                      onClick={() => onSelectCountry(option.value)}
                    >
                      <Text typo="button_M" color="text_primary">
                        {option.label}
                      </Text>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {timeLabel ? (
              <Text typo="body_S" color="text_tertiary" css={messageTime('assistant')}>
                {timeLabel}
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'options' && message.optionsType === 'language') {
    return (
      <div css={messageRow('assistant')}>
        <div>
          {assistantHeaderView}
          <div css={messageContentRow}>
            <div css={messageBubble('assistant')}>
              {message.content && (
                <Text typo="body_M" color="text_primary">
                  {message.content}
                </Text>
              )}
              <div css={optionCard}>
                {message.title && (
                  <Text typo="title_S" color="text_primary">
                    {message.title}
                  </Text>
                )}
                <div css={optionGrid(1, 1)}>
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      css={optionButton}
                      data-selected={selectedLanguage === option.value}
                      disabled={!!selectedLanguage}
                      onClick={() => onSelectLanguage(option.value)}
                    >
                      <Text typo="button_M" color="text_primary">
                        {option.label}
                      </Text>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {timeLabel ? (
              <Text typo="body_S" color="text_tertiary" css={messageTime('assistant')}>
                {timeLabel}
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'options' && message.optionsType === 'suggestions') {
    return (
      <div css={messageRow('assistant')}>
        <div>
          {assistantHeaderView}
          <div css={messageContentRow}>
            <div css={messageBubble('assistant')}>
              {message.content && (
                <Text typo="body_M" color="text_primary">
                  {message.content}
                </Text>
              )}
              <div css={optionCard}>
                {message.title && (
                  <Text typo="title_S" color="text_primary">
                    {message.title}
                  </Text>
                )}
                <div css={suggestionList}>
                  {suggestionQuestions.map((question, index) => (
                    <button
                      key={`${message.id}-${index}`}
                      css={suggestionButton}
                      data-active={activeSuggestion === question}
                      onClick={() => onSelectSuggestion(question)}
                    >
                      <Text typo="button_S" color="text_primary">
                        {question}
                      </Text>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {timeLabel ? (
              <Text typo="body_S" color="text_tertiary" css={messageTime('assistant')}>
                {timeLabel}
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'loading') {
    return (
      <div css={messageRow('assistant')}>
        <div>
          {assistantHeaderView}
          <div css={messageContentRow}>
            <div css={messageBubble('assistant')}>
              <Lottie animationData={loading} css={loadingLottie} />
            </div>
            {timeLabel ? (
              <Text typo="body_S" color="text_tertiary" css={messageTime('assistant')}>
                {timeLabel}
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!message.content) return null;

  if (message.role === 'assistant') {
    return (
      <div css={messageRow('assistant')}>
        <div>
          {assistantHeaderView}
          <div css={messageContentRow}>
            <div css={messageBubble('assistant')}>
              <Text typo="body_M" color="text_primary">
                {message.content}
              </Text>
            </div>
            {timeLabel ? (
              <Text typo="body_S" color="text_tertiary" css={messageTime('assistant')}>
                {timeLabel}
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={messageRow(message.role)}>
      <div css={messageContentRow}>
        {timeLabel ? (
          <Text typo="body_S" color="text_tertiary" css={messageTime('user')}>
            {timeLabel}
          </Text>
        ) : null}
        <div css={messageBubble(message.role)}>
          <Text typo="body_M" color="text_primary">
            {message.content}
          </Text>
        </div>
      </div>
    </div>
  );
}
