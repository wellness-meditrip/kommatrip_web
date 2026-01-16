import { Text } from '@/components';
import {
  assistantLabel,
  messageBubble,
  messageRow,
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
  assistantLabelText: string;
  countryOptions: OptionItem[];
  languageOptions: OptionItem[];
  suggestionQuestions: string[];
  selectedCountry?: string;
  selectedLanguage?: string;
  activeSuggestion?: string | null;
  onSelectCountry: (value: string) => void;
  onSelectLanguage: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
}

export function MessageRenderer({
  message,
  assistantLabelText,
  countryOptions,
  languageOptions,
  suggestionQuestions,
  selectedCountry,
  selectedLanguage,
  activeSuggestion,
  onSelectCountry,
  onSelectLanguage,
  onSelectSuggestion,
}: MessageRendererProps) {
  if (message.kind === 'options' && message.optionsType === 'country') {
    return (
      <div css={messageRow('assistant')}>
        <div css={messageBubble('assistant')}>
          <div css={assistantLabel}>
            <Text typo="body_S" color="text_secondary">
              {assistantLabelText}
            </Text>
          </div>
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
      </div>
    );
  }

  if (message.kind === 'options' && message.optionsType === 'language') {
    return (
      <div css={messageRow('assistant')}>
        <div css={messageBubble('assistant')}>
          <div css={assistantLabel}>
            <Text typo="body_S" color="text_secondary">
              {assistantLabelText}
            </Text>
          </div>
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
      </div>
    );
  }

  if (message.kind === 'options' && message.optionsType === 'suggestions') {
    return (
      <div css={messageRow('assistant')}>
        <div css={messageBubble('assistant')}>
          <div css={assistantLabel}>
            <Text typo="body_S" color="text_secondary">
              {assistantLabelText}
            </Text>
          </div>
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
      </div>
    );
  }

  if (!message.content) return null;

  return (
    <div css={messageRow(message.role)}>
      <div css={messageBubble(message.role)}>
        {message.role === 'assistant' ? (
          <div css={assistantLabel}>
            <Text typo="body_S" color="text_secondary">
              {assistantLabelText}
            </Text>
          </div>
        ) : null}
        <Text typo="body_M" color="text_primary">
          {message.content}
        </Text>
      </div>
    </div>
  );
}
