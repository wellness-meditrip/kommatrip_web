import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { exchangeGoogle } from '@/server/auth/exchangeGoogle';
import type { Token, User } from '@/models/auth';

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
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleProvider =
    googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            // OIDC id_token이 필요하면 스코프를 명시해두는 게 안전
            authorization: { params: { scope: 'openid email profile' } },
          }),
        ]
      : [];

  return {
    secret: requiredEnv('NEXTAUTH_SECRET'),
    session: { strategy: 'jwt', maxAge: 60 * 60 }, // 1시간
    jwt: { maxAge: 60 * 60 }, // 1시간
    debug: process.env.NODE_ENV === 'development', // 개발 환경에서 디버그 로그 활성화

    providers: googleProvider,

    pages: { signIn: '/login' },

    callbacks: {
      async jwt({ token, account }) {
        // 최초 로그인(= account 존재) 때만 교환 수행
        if (account?.provider === 'google' && account.id_token && !token.backendTokens) {
          console.log('[next-auth][jwt] Starting Google exchange', {
            hasIdToken: !!account.id_token,
            idTokenLength: account.id_token?.length,
            country: meta.country,
            marketing_consent: meta.marketing_consent,
          });

          try {
            const result = await exchangeGoogle({
              idToken: account.id_token,
              country: meta.country,
              marketing_consent: meta.marketing_consent,
            });

            console.log('[next-auth][jwt] Google exchange success', {
              hasUser: !!result.user,
              hasTokens: !!result.tokens,
              userId: result.user?.id,
              resultKeys: Object.keys(result || {}),
              userKeys: result.user ? Object.keys(result.user) : [],
              tokensKeys: result.tokens ? Object.keys(result.tokens) : [],
            });

            // 백엔드가 내려준 user/tokens를 JWT에 저장
            // JWT 토큰에 저장할 때 직렬화 가능한 형태로 변환
            token.backendUser = result.user as User;
            token.backendTokens = result.tokens as Token;

            console.log('[next-auth][jwt] Token updated', {
              hasBackendUser: !!token.backendUser,
              hasBackendTokens: !!token.backendTokens,
            });

            // refreshToken을 쿠키에 저장하기 위해 별도 처리 필요
            // (NextAuth 콜백에서는 직접 쿠키를 설정할 수 없으므로 클라이언트에서 처리)
          } catch (error: unknown) {
            const axiosError = error as {
              message?: string;
              response?: {
                status?: number;
                statusText?: string;
                data?: unknown;
              };
            };
            console.error('[next-auth][jwt] Google exchange failed', {
              error: axiosError?.message,
              status: axiosError?.response?.status,
              statusText: axiosError?.response?.statusText,
              data: axiosError?.response?.data,
            });
            throw axiosError;
          }
        }

        return token;
      },

      async session({ session, token }) {
        try {
          console.log('[next-auth][session] Starting session callback', {
            hasBackendUser: !!token.backendUser,
            hasBackendTokens: !!token.backendTokens,
            hasAccessToken: !!token.backendTokens?.access_token,
            hasRefreshToken: !!token.backendTokens?.refresh_token,
            sessionUserExists: !!session.user,
          });

          // 클라이언트에 내려줄 값만 최소화
          // backendUser가 있으면 사용하고, 없으면 기본 session.user 사용
          if (token.backendUser) {
            session.user = token.backendUser;
          } else if (!session.user) {
            // 둘 다 없으면 기본 구조 생성
            session.user = {
              id: 0,
              email: '',
              username: '',
              country: '',
              role: '',
              login_method: 'email',
              company_code: null,
              is_email_verified: false,
              marketing_consent: false,
              marketing_consent_at: null,
              last_login_at: '',
              InterestSetting: false,
            } as User;
          }

          // 프론트에서 백엔드 API 호출 시 사용할 accessToken 노출
          if (token.backendTokens?.access_token) {
            session.accessToken = token.backendTokens.access_token;
          }

          // refreshToken도 세션에 포함 (클라이언트에서 쿠키에 저장하기 위해)
          if (token.backendTokens?.refresh_token) {
            session.refreshToken = token.backendTokens.refresh_token;
          }

          console.log('[next-auth][session] Session callback success', {
            hasUser: !!session.user,
            userId: session.user?.id,
            hasAccessToken: !!session.accessToken,
            hasRefreshToken: !!session.refreshToken,
          });

          return session;
        } catch (error: unknown) {
          const sessionError = error as { message?: string; stack?: string };
          console.error('[next-auth][session] Session callback error', {
            error: sessionError?.message,
            stack: sessionError?.stack,
            tokenKeys: token ? Object.keys(token) : [],
            sessionKeys: session ? Object.keys(session) : [],
          });
          throw sessionError;
        }
      },
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions(req));
}
