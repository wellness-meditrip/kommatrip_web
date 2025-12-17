import type { NextApiRequest, NextApiResponse } from 'next';

const META_COOKIE = 'google_auth_meta';
const COOKIE_MAX_AGE = 60 * 5; // 5분 (OAuth 리다이렉트 시간 고려)

/**
 * Google OAuth 시작 전에 country와 marketing_consent를 httpOnly 쿠키에 저장합니다.
 * 이 쿠키는 NextAuth 콜백에서 읽어서 백엔드로 전달됩니다.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { country, marketing_consent } = req.body;

    // 유효성 검사
    if (typeof country !== 'string' || typeof marketing_consent !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // httpOnly 쿠키로 저장 (보안을 위해 httpOnly, secure, sameSite 설정)
    const cookieValue = JSON.stringify({ country, marketing_consent });
    const isProduction = process.env.NODE_ENV === 'production';

    res.setHeader('Set-Cookie', [
      `${META_COOKIE}=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${
        isProduction ? '; Secure' : ''
      }`,
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error setting google auth meta:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
