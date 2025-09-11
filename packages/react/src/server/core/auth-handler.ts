// packages/react/src/server/core/auth-handler.ts
// 框架无关的请求处理逻辑
import { ServerAuthService } from './server-auth';
import { CookieManager } from './cookie-manager';
import type { ServerAuthConfig } from 'itangbao-auth-types';

export interface AuthRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  searchParams: URLSearchParams;
}

export interface AuthResponse {
  status: number;
  headers: Record<string, string>;
  cookies: Array<{
    name: string;
    value: string;
    options: any;
  }>;
  body: any;
  redirect?: string;
}

export class AuthHandler {
  private authService: ServerAuthService;
  private cookieManager: CookieManager;

  constructor(private config: ServerAuthConfig) {
    this.cookieManager = new CookieManager(config);
    this.authService = new ServerAuthService(config, this.cookieManager);
  }

  async handleRequest(request: AuthRequest, action: string, subAction?: string): Promise<AuthResponse> {
    switch (action) {
      case 'callback':
        return this.handleCallback(request);
      case 'logout':
        return this.handleLogout(request);
      case 'me':
        return this.handleMe(request);
      case 'token':
        if (subAction === 'access') {
          return this.handleTokenAccess(request);
        } else if (subAction === 'refresh') {
          return this.handleTokenRefresh(request);
        }
        break;
    }

    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      cookies: [],
      body: { error: 'Invalid action' },
    };
  }

  private async handleCallback(request: AuthRequest): Promise<AuthResponse> {
    const code = request.searchParams.get('code');

    if (!code) {
      return {
        status: 302,
        headers: { 'Location': `${this.config.appUrl}/?error=no_code` },
        cookies: [],
        body: null,
        redirect: `${this.config.appUrl}/?error=no_code`,
      };
    }

    try {
      const redirectUri = `${this.config.appUrl}/api/auth/callback`;
      const result = await this.authService.exchangeCodeForTokens(code, redirectUri);

      return {
        status: 302,
        headers: { 'Location': this.config.appUrl },
        cookies: this.cookieManager.createAuthCookies(result),
        body: null,
        redirect: this.config.appUrl,
      };
    } catch (error: any) {
      return {
        status: 302,
        headers: { 'Location': `${this.config.appUrl}/?error=${encodeURIComponent(error.message)}` },
        cookies: [],
        body: null,
        redirect: `${this.config.appUrl}/?error=${encodeURIComponent(error.message)}`,
      };
    }
  }

  private async handleLogout(request: AuthRequest): Promise<AuthResponse> {
    const accessToken = request.cookies['auth-token'];

    if (accessToken) {
      await this.authService.logout(accessToken);
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      cookies: this.cookieManager.clearAuthCookies(),
      body: { success: true },
    };
  }

  private async handleMe(request: AuthRequest): Promise<AuthResponse> {
    const accessToken = request.cookies['auth-token'];
    const refreshToken = request.cookies['refresh-token'];

    if (accessToken) {
      const isValid = await this.authService.verifyToken(accessToken);
      
      if (isValid) {
        const user = await this.authService.getCurrentUser(accessToken);
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          cookies: [],
          body: { user },
        };
      }
    }

    if (refreshToken) {
      try {
        const result = await this.authService.refreshTokens(refreshToken);
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          cookies: this.cookieManager.createAuthCookies(result),
          body: { user: result.user },
        };
      } catch {
        // Refresh failed
      }
    }

    return {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      cookies: this.cookieManager.clearAuthCookies(),
      body: { error: 'Unauthorized' },
    };
  }

  private async handleTokenAccess(request: AuthRequest): Promise<AuthResponse> {
    const accessToken = request.cookies['auth-token'];

    if (!accessToken) {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        cookies: [],
        body: { error: 'No token' },
      };
    }

    const isValid = await this.authService.verifyToken(accessToken);
    
    if (isValid) {
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        cookies: [],
        body: { accessToken },
      };
    }

    return {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      cookies: this.cookieManager.clearAuthCookies(),
      body: { error: 'Token expired' },
    };
  }

  private async handleTokenRefresh(request: AuthRequest): Promise<AuthResponse> {
    const refreshToken = request.cookies['refresh-token'];

    if (!refreshToken) {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        cookies: [],
        body: { error: 'No refresh token' },
      };
    }

    try {
      const result = await this.authService.refreshTokens(refreshToken);
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        cookies: this.cookieManager.createAuthCookies(result),
        body: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: Math.floor((result.expiresAt - Date.now()) / 1000),
        },
      };
    } catch {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        cookies: this.cookieManager.clearAuthCookies(),
        body: { error: 'Refresh failed' },
      };
    }
  }
}
