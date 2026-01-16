import { nanoid } from 'nanoid';
import type { ChatMessage } from '../types';

export const buildSuggestionsMessage = (title: string): ChatMessage => ({
  id: `suggestions-${nanoid()}`,
  role: 'assistant',
  kind: 'options',
  optionsType: 'suggestions',
  content: title,
  createdAt: new Date().toISOString(),
});
