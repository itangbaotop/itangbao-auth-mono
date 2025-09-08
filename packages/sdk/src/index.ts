// packages/sdk/src/index.ts
import type { 
  ItangbaoAuthConfig, 
  User, 
  AuthResult, 
  TokenResponse, 
} from '@itangbao-auth/types';

export * from '@itangbao-auth/types';

export interface AuthHubClientConfig extends ItangbaoAuthConfig {
  apiBaseUrl?: string; // 添加后端API基础URL配置
}

export class AuthHubClient {
  private config: AuthHubClientConfig;
  private codeVerifier?: string;
  private apiBaseUrl: string;

  constructor(config: AuthHubClientConfig) {
    this.config = config;
    this.apiBaseUrl = config.apiBaseUrl || ''; // 默认使用相对路径
  }

  /**
   * 生成登录 URL
   */
  async getLoginUrl(state?: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes?.join(' ') || 'profile email',
    });

    if (state) {
      params.set('state', state);
    }

    // PKCE 支持
    if (!this.config.clientSecret) {
      this.codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    return `${this.config.authUrl}/auth/signin?${params.toString()}`;
  }

  /**
   * 获取当前用户信息（从后端API获取）
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // 包含HttpOnly Cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * 获取有效的访问令牌（从后端API获取）
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/token/access`, {
        method: 'GET',
        credentials: 'include', // 包含HttpOnly Cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.accessToken || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * 检查当前是否已认证
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getValidAccessToken();
    return !!token;
  }

  /**
   * 手动刷新访问令牌（通过后端API）
   */
  async refreshToken(): Promise<AuthResult | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/token/refresh`, {
        method: 'POST',
        credentials: 'include', // 包含HttpOnly Cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // 包含HttpOnly Cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }

  // PKCE 辅助方法
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    return crypto.subtle.digest('SHA-256', data).then(hash => 
      btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(hash))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    );
  }
}
