// packages/react/src/server/core/server-auth.ts
// 服务端纯逻辑层
import type { ServerAuthConfig, User, AuthTokens, TokenResponse, UserInfoResponse } from 'itangbao-auth-types';
import { CookieManager } from './cookie-manager';

export class ServerAuthService {
  constructor(private config: ServerAuthConfig, private cookieManager: CookieManager) {
     if (!config.authServiceUrl) {
      throw new Error('authServiceUrl is required');
    }
    if (!config.appUrl) {
      throw new Error('appUrl is required');
    }
    if (!config.clientId) {
      throw new Error('clientId is required');
    }
    if (!config.clientSecret) {
      throw new Error('clientSecret is required');
    }
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<AuthTokens & { user: User }> {
    // 纯业务逻辑，不依赖框架
    const response = await fetch(`${this.config.authServiceUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'unknown_error' }));
      throw new Error(`Token exchange failed: ${error.error || response.statusText}`);
    }

    const tokenData: TokenResponse = await response.json();
    
    // 获取用户信息
    const userInfo = tokenData.userinfo;

    // 转换为标准格式
    const user: User = {
      id: userInfo?.sub || '',
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      image: userInfo?.image,
      role: userInfo?.role,
      emailVerified: userInfo?.email_verified,
      createdAt: userInfo?.created_at,
    };

    const tokens: AuthTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
    };

    this.cookieManager.createAuthCookies(tokens);    
    return { ...tokens, user };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens & { user: User }> {
    // 类似的纯逻辑实现...
    const response = await fetch(`${this.config.authServiceUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokenData: TokenResponse = await response.json();
    

    const userInfo = tokenData.userinfo;

    const user: User = {
      id: userInfo?.sub || '',
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      image: userInfo?.image,
      role: userInfo?.role,
      emailVerified: userInfo?.email_verified,
      createdAt: userInfo?.created_at,
    };

    const tokens: AuthTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
    };

    this.cookieManager.createAuthCookies(tokens);
    return { ...tokens, user };
  }

  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.authServiceUrl}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async logout(accessToken?: string): Promise<void> {
    if (!accessToken) return;
    
    try {
      await fetch(`${this.config.authServiceUrl}/api/auth/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: accessToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });
    } catch {
      // 忽略错误
    }
  }

  async getCurrentUser(accessToken: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.config.authServiceUrl}/api/user/info`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        return null;
      }
      const userInfo: UserInfoResponse = await response.json();
      console.log('userInfo', userInfo);

      return {
        id: userInfo.sub,
        name: userInfo.name || '',
        email: userInfo.email || '',
        image: userInfo.image,
        role: userInfo.role,
        emailVerified: userInfo.email_verified,
        createdAt: userInfo.created_at,
      };
    } catch {
      return null;
    }
  }
}
