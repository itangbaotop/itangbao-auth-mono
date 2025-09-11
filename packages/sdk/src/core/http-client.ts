// packages/sdk/src/core/http-client.ts
// 纯 HTTP 客户端，不依赖框架
import type { User, AuthTokens } from 'itangbao-auth-types';

export interface HttpClientOptions {
  baseUrl?: string;
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
}

export class HttpClient {
  constructor(private options: HttpClientOptions = {}) {}

  async request<T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<{ data: T; response: Response }> {
    const response = await fetch(`${this.options.baseUrl || ''}${url}`, {
      ...options,
      credentials: this.options.credentials || 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || response.statusText);
    }

    return { data, response };
  }

  async get<T>(url: string, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'GET', headers });
  }

  async post<T>(url: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }
}
