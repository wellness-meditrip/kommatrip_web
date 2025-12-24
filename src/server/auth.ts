// // src/server/auth.ts
// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';

// function requiredEnv(name: string): string {
//   const v = process.env[name];
//   if (!v) throw new Error(`Missing env: ${name}`);
//   return v;
// }

// export const authOptions: NextAuthOptions = {
//   secret: requiredEnv('NEXTAUTH_SECRET'),
//   session: { strategy: 'jwt' },

//   providers: [
//     GoogleProvider({
//       clientId: requiredEnv('GOOGLE_CLIENT_ID'),
//       clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
//       // 필요 시 refresh token 받기(첫 동의 시점에만 나오는 편)
//       authorization: {
//         params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
//       },
//     }),
//   ],

//   //NextAuth가 에러가 나거나 로그인 필요할 때 무조건 /auth/signin 페이지로 리다이렉트 되도록 설정
//   //   pages: {
//   //     signIn: '/auth/signin',
//   //   },

//   callbacks: {
//     async jwt({ token, account, profile }) {
//       // 최초 로그인 시(= account 존재) 토큰에 필요한 값을 붙임
//       if (account?.provider === 'google') {
//         token.googleAccessToken = account.access_token;
//         // Google OIDC의 고유 id는 보통 profile.sub
//         const sub = (profile as { sub?: string } | undefined)?.sub;
//         if (sub) token.userId = sub;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       // session.user에 id를 “확실하게” 내려주는 게 실무에서 제일 유용함
//       if (session.user) {
//         session.user.id = (token.userId as string | undefined) ?? session.user.id;
//       }
//       session.googleAccessToken = token.googleAccessToken as string | undefined;
//       return session;
//     },
//   },
// };
// src/server/auth.ts
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// ✅ [LOG ADDED] 백엔드 교환 함수 import (2번 플로우라면 필수)
import { exchangeGoogle } from '@/server/auth/exchangeGoogle';
import type { JWT } from 'next-auth/jwt';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const authOptions: NextAuthOptions = {
  secret: requiredEnv('NEXTAUTH_SECRET'),
  session: { strategy: 'jwt' },

  // ✅ [LOG ADDED] next-auth 디버그 로그 활성화(개발에서만)
  debug: process.env.NODE_ENV === 'development',

  providers: [
    GoogleProvider({
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
      authorization: {
        params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
      },
    }),
  ],

  // Note: NextAuth v4 does not support events.error callback
  // Error handling is done in callbacks instead

  callbacks: {
    async jwt({ token, account, profile }) {
      // ✅ [LOG ADDED] jwt 콜백 진입 로그 (account 존재 여부 / provider / id_token 유무)
      const jwtToken = token as JWT;
      console.info('[next-auth][jwt] enter', {
        hasAccount: !!account,
        provider: account?.provider,
        hasIdToken: !!account?.id_token,
        hasAccessToken: !!account?.access_token,
        alreadyHasBackendTokens: !!jwtToken.backendTokens,
      }); // ✅ [LOG ADDED]

      try {
        // (기존) 구글 기본 토큰 저장
        if (account?.provider === 'google') {
          token.googleAccessToken = account.access_token;

          const sub = (profile as { sub?: string } | undefined)?.sub;
          if (sub) token.userId = sub;
        }

        /**
         * ✅ [LOG ADDED] (2번 플로우) Google id_token을 백엔드로 교환
         * - "최초 로그인"이고 id_token이 있을 때만 수행
         * - 이미 교환해서 backendTokens 있으면 재호출하지 않음
         */
        if (account?.provider === 'google' && account.id_token && !jwtToken.backendTokens) {
          console.info('[next-auth][jwt] exchangeGoogle start'); // ✅ [LOG ADDED]

          const result = await exchangeGoogle({
            idToken: account.id_token,
            country: 'KR',
            marketing_consent: false,
          });

          jwtToken.backendUser = result.user;
          jwtToken.backendTokens = result.tokens;

          console.info('[next-auth][jwt] exchangeGoogle success', {
            userId: result.user?.id,
            hasTokens: !!result.tokens,
          }); // ✅ [LOG ADDED]
        }

        console.info('[next-auth][jwt] exit ok'); // ✅ [LOG ADDED]
        return token;
      } catch (e) {
        console.error('[next-auth][jwt] exit error', e); // ✅ [LOG ADDED]
        throw e; // 이게 결국 /auth/signin?error=Callback 로 이어짐
      }
    },

    async session({ session, token }) {
      // ✅ [LOG ADDED] session 콜백 진입 로그
      const jwtToken = token as JWT;
      console.info('[next-auth][session] enter', {
        hasSessionUser: !!session.user,
        tokenUserId: jwtToken.userId,
        hasBackendUser: !!jwtToken.backendUser,
        hasBackendTokens: !!jwtToken.backendTokens,
      }); // ✅ [LOG ADDED]

      try {
        // (기존) userId 주입
        // Note: session.user.id is number, but userId from JWT is string (Google sub)
        // We keep the existing user.id from backend if available
        session.googleAccessToken = jwtToken.googleAccessToken;

        // ✅ [LOG ADDED] (선택) 백엔드 유저/토큰을 세션에 최소한으로 주입
        // - 프론트에서 accessToken 필요하면 주입
        const backendUser = jwtToken.backendUser;
        const backendTokens = jwtToken.backendTokens;

        if (backendUser) {
          // session.user를 우리 서비스 user로 덮고 싶다면 여기서 교체 가능
          // session.user = backendUser; // 필요 시 사용
        }

        if (backendTokens?.access_token) {
          session.accessToken = backendTokens.access_token;
        }

        console.info('[next-auth][session] exit ok', {
          hasAccessToken: !!session.accessToken,
        }); // ✅ [LOG ADDED]
        return session;
      } catch (e) {
        console.error('[next-auth][session] exit error', e); // ✅ [LOG ADDED]
        throw e;
      }
    },
  },
};
