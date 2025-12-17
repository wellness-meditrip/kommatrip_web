import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { exchangeGoogle } from '@/server/auth/exchangeGoogle';

const META_COOKIE = 'google_auth_meta';

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function readMeta(req: NextApiRequest): { country: string; marketing_consent: boolean } {
  try {
    const raw = req.cookies?.[META_COOKIE];
    if (!raw) return { country: 'KR', marketing_consent: false };
    const parsed = JSON.parse(raw);
    if (typeof parsed.country === 'string' && typeof parsed.marketing_consent === 'boolean') {
      return parsed;
    }
    return { country: 'KR', marketing_consent: false };
  } catch {
    return { country: 'KR', marketing_consent: false };
  }
}

export function authOptions(req: NextApiRequest): NextAuthOptions {
  const meta = readMeta(req);

  return {
    secret: requiredEnv('NEXTAUTH_SECRET'),
    session: { strategy: 'jwt' }, // JWT는 기본적으로 암호화되어 쿠키에 저장됨 :contentReference[oaicite:3]{index=3}

    providers: [
      GoogleProvider({
        clientId: requiredEnv('GOOGLE_CLIENT_ID'),
        clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
        // OIDC id_token이 필요하면 스코프를 명시해두는 게 안전
        authorization: { params: { scope: 'openid email profile' } },
      }),
    ],

    pages: { signIn: '/login' },

    callbacks: {
      async jwt({ token, account }) {
        // 최초 로그인(= account 존재) 때만 교환 수행
        if (account?.provider === 'google' && account.id_token && !token.backendTokens) {
          const result = await exchangeGoogle({
            idToken: account.id_token,
            country: meta.country,
            marketing_consent: meta.marketing_consent,
          });

          // 백엔드가 내려준 user/tokens를 JWT에 저장 (refreshToken은 여기(서버)까지만)
          token.backendUser = result.user;
          token.backendTokens = result.tokens;
        }

        return token;
      },

      async session({ session, token }) {
        // 클라이언트에 내려줄 값만 최소화
        session.user = token.backendUser ?? session.user;

        // 프론트에서 백엔드 API 호출 시 사용할 accessToken 노출
        // (기존 API 클라이언트가 localStorage를 사용하므로 호환성 유지)
        if (token.backendTokens?.access_token) {
          session.accessToken = token.backendTokens.access_token;
        }

        return session;
      },
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions(req));
}
