import { nanoid } from 'nanoid';
import type { ChatMessage } from '../types';

export const buildOptionsMessage = (
  type: 'country' | 'language',
  t: (key: string) => string,
  content?: string
): ChatMessage => ({
  id: `${type}-options-${nanoid()}`,
  role: 'assistant',
  kind: 'options',
  optionsType: type,
  content,
  title: type === 'country' ? t('selectCountry') : t('selectLanguage'),
  createdAt: new Date().toISOString(),
});
