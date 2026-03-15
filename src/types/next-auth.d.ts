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
    googleAccessToken?: string; // Google OAuth access token
  }
}
