import type { NextApiRequest, NextApiResponse } from 'next';
import { getI18nConfig } from '@/i18n';
import { routing, type Locale } from '@/i18n/routing';

/**
 * API 라우트를 통해 메시지를 로드
 * 클라이언트 사이드에서 사용
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { locale } = req.query;

  // 유효한 로케일인지 확인
  const validLocale: Locale =
    locale && typeof locale === 'string' && routing.locales.includes(locale as Locale)
      ? (locale as Locale)
      : routing.defaultLocale;

  try {
    const { messages } = await getI18nConfig(validLocale);
    return res.status(200).json({ messages, locale: validLocale });
  } catch (error) {
    console.error('Failed to load messages:', error);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}
