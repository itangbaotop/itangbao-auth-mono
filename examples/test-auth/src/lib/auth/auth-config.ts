// app/lib/auth-config.ts
import type { AuthConfig } from 'itangbao-auth-types';

export const authConfig: AuthConfig = {
  authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/auth/callback`,
  scopes: ['openid', 'profile', 'email'],
};
