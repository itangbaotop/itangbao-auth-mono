// packages/react/src/server/core/cookie-manager.ts
// 服务端 Cookie 管理纯逻辑
import type { ServerAuthConfig, AuthTokens } from 'itangbao-auth-types';

export interface Cookie {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    maxAge?: number;
    path?: string;
  };
}

export class CookieManager {
  constructor(private config: ServerAuthConfig) {}

  createAuthCookies(tokens: AuthTokens): Cookie[] {
    const cookieConfig = this.config.cookieConfig || {};
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookies: Cookie[] = [
      {
        name: 'auth-token',
        value: tokens.accessToken,
        options: {
          httpOnly: true,
          secure: cookieConfig.secure !== undefined ? cookieConfig.secure : isProduction,
          sameSite: cookieConfig.sameSite || 'lax',
          maxAge: cookieConfig.accessTokenMaxAge || 15 * 60,
          path: '/',
        },
      },
    ];

    if (tokens.refreshToken) {
      cookies.push({
        name: 'refresh-token',
        value: tokens.refreshToken,
        options: {
          httpOnly: true,
          secure: cookieConfig.secure !== undefined ? cookieConfig.secure : isProduction,
          sameSite: cookieConfig.sameSite || 'lax',
          maxAge: cookieConfig.refreshTokenMaxAge || 60 * 60 * 24 * 7,
          path: '/',
        },
      });
    }

    return cookies;
  }

  clearAuthCookies(): Cookie[] {
    return [
      {
        name: 'auth-token',
        value: '',
        options: { maxAge: 0, path: '/' },
      },
      {
        name: 'refresh-token',
        value: '',
        options: { maxAge: 0, path: '/' },
      },
    ];
  }
}
