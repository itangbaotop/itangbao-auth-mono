// packages/sdk/src/core/http-client.ts
// 纯 HTTP 客户端，不依赖框架
import type { User, AuthTokens } from 'itangbao-auth-types';

export interface HttpClientOptions {
  baseUrl?: string;
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void; }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export class HttpClient {
  constructor(private options: HttpClientOptions = {}) {}

  async request<T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<{ data: T; response: Response }> {
    
    const originalRequest = async () => {
        return fetch(`${this.options.baseUrl || ''}${url}`, {
            ...options,
            credentials: this.options.credentials || 'include',
            headers: {
                'Content-Type': 'application/json',
                ...this.options.headers,
                ...options.headers,
            },
        });
    };

    let response = await originalRequest();

    if (!response.ok && response.status === 401) {
      if (isRefreshing) {
        // 如果已经在刷新token，则将当前请求挂起
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(() => {
            // 刷新成功后，用新的token重试请求
            return originalRequest();
        })
        .then(async res => ({ data: await res.json().catch(() => ({})), response: res }));
      }

      isRefreshing = true;

      try {
        // 尝试刷新 token
        // 注意：这里我们直接调用 refresh API，因为它会处理 cookie，所以不需要手动设置 header
        const refreshResponse = await fetch('/api/auth/token/refresh', {
            method: 'POST',
            credentials: 'include'
        });

        if (!refreshResponse.ok) {
           throw new Error('Failed to refresh token');
        }

        processQueue(null, null); // 通知队列中的请求刷新成功
        
        // 刷新成功，重试原始请求
        response = await originalRequest();

      } catch (e) {
        processQueue(e, null); // 通知队列刷新失败
        // 刷新失败，需要登出
        // 调用登出API并重定向
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '/auth/signin?error=SessionExpired';
        // 抛出错误，中断后续操作
        throw new Error("Session expired. Redirecting to login.");
      } finally {
        isRefreshing = false;
      }
    }
    
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
