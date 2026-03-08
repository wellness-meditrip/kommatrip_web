import { nanoid } from 'nanoid';
import type { ChatMessage } from '../types';

export const buildAskAnythingMessage = (content: string): ChatMessage => ({
  id: `ask-anything-${nanoid()}`,
  role: 'assistant',
  kind: 'text',
  content,
  createdAt: new Date().toISOString(),
});
