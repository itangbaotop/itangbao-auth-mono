// packages/sdk/src/core/auth-client.ts
// 纯逻辑，不依赖任何框架
import type { AuthConfig } from 'itangbao-auth-types';

export class AuthClient {
  constructor(private config: AuthConfig) {}

  /**
   * 纯函数：生成登录 URL
   */
  async generateLoginUrl(state?: string): Promise<string> {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes?.join(' ') || 'openid profile email',
    });

    if (state) params.set('state', state);
    // PKCE 支持
    if (!this.config.clientSecret) {
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    return `${this.config.authServiceUrl}/auth/signin?${params.toString()}`;
  }

  /**
   * 纯函数：生成资料 URL
   */
  generateProfileUrl(): string {
    return `${this.config.authServiceUrl}/profile`;
  }

  /**
   * 纯函数：生成登出 URL
   */
  generateLogoutUrl(redirectUrl?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
    });

    if (redirectUrl) {
      params.set('post_logout_redirect_uri', redirectUrl);
    }

    return `${this.config.authServiceUrl}/oauth/logout?${params}`;
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
