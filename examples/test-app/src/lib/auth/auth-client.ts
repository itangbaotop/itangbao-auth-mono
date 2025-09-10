// lib/auth-client.ts
import { AuthHubClient } from 'itangbao-auth-sdk';

export const authClient = new AuthHubClient({
  authUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL,
});
