// packages/sdk/src/core/auth-api.ts
// 纯业务逻辑，使用 HttpClient
import type { User, AuthTokens } from 'itangbao-auth-types';
import { HttpClient } from './http-client';

export class AuthApi {
  private http: HttpClient;

  constructor(baseUrl?: string) {
    this.http = new HttpClient({ baseUrl });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await this.http.get<{ user: User }>('/api/auth/me');
      return data.user || null;
    } catch {
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const { data } = await this.http.get<{ accessToken: string }>('/api/auth/token/access');
      return data.accessToken || null;
    } catch {
      return null;
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    try {
      const { data } = await this.http.post<{
        accessToken: string;
        refreshToken?: string;
        expiresIn: number;
      }>('/api/auth/token/refresh');

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + data.expiresIn * 1000,
      };
    } catch (error) {
      console.error("Token refresh failed:", error);
      // 将错误继续向上抛出，以便调用方能捕获它
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.http.post('/api/auth/logout');
    } catch {
      // 忽略登出错误
    }
  }
}
