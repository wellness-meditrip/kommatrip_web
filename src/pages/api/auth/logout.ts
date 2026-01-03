import type { NextApiRequest, NextApiResponse } from 'next';

const META_COOKIE = 'google_auth_meta';
const REFRESH_COOKIE = 'refreshToken';

function buildExpiredCookie(name: string, options: { httpOnly?: boolean; secure?: boolean }) {
  const parts = [
    `${name}=`,
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'SameSite=Lax',
  ];

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isProduction = process.env.NODE_ENV === 'production';

  res.setHeader('Set-Cookie', [
    buildExpiredCookie(META_COOKIE, { httpOnly: true, secure: isProduction }),
    buildExpiredCookie(REFRESH_COOKIE, { secure: isProduction }),
  ]);

  return res.status(200).json({ success: true });
}
