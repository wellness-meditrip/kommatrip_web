import 'next-auth';
import 'next-auth/jwt';
import type { User, Token } from '@/models/auth';

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    googleAccessToken?: string;
    backendUser?: User;
    backendTokens?: Token;
  }
}

declare module 'next-auth' {
  interface Session {
    user: User;
    accessToken?: string; // 백엔드 API 호출용 access token
    refreshToken?: string; // 백엔드 refresh token (쿠키 저장용)
    googleAccessToken?: string; // Google OAuth access token
  }
}
