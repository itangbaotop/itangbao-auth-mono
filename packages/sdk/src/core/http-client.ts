// packages/sdk/src/core/http-client.ts
// 纯 HTTP 客户端，不依赖框架
import type { User, AuthTokens } from 'itangbao-auth-types';

export interface HttpClientOptions {
  baseUrl?: string;
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
}

export class ApiClientError extends Error {
  status: number;
  body: any;

  constructor(message: string, status: number, body: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientSuccessResponse<T = any> {
  data: T;
  response: Response;
}

// 定义 apiClient hook 的完整返回类型
export type ApiClient = {
  /**
   * 发起一个通用的、经过认证的 API 请求。
   * @param url 请求的 URL 路径。
   * @param options 原生的 fetch RequestInit 选项。
   * @returns 成功时返回 Promise<ApiClientSuccessResponse<T>>
   * @throws {ApiClientError} 请求失败时抛出自定义错误。
   */
  request: <T = any>(url: string, options?: RequestInit) => Promise<ApiClientSuccessResponse<T>>;

  /**
   * 发起一个 GET 请求。
   * @param url 请求的 URL 路径。
   * @returns 成功时返回 Promise<ApiClientSuccessResponse<T>>
   * @throws {ApiClientError} 请求失败时抛出自定义错误。
   */
  get: <T = any>(url: string) => Promise<ApiClientSuccessResponse<T>>;

  /**
   * 发起一个 POST 请求。
   * @param url 请求的 URL 路径。
   * @param data 要发送的 JavaScript 对象，会自动 JSON.stringify。
   * @returns 成功时返回 Promise<ApiClientSuccessResponse<T>>
   * @throws {ApiClientError} 请求失败时抛出自定义错误。
   */
  post: <T = any>(url: string, data: any) => Promise<ApiClientSuccessResponse<T>>;

  /**
   * 一个记录当前活动请求状态的对象。
   * key 是 "METHOD_url"，value 是 boolean。
   */
  loading: Record<string, boolean>;
};


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
        console.error("Token refresh failed, session is likely expired.", e);
        
        // 确保后续请求不会继续，抛出一个清晰的错误
        throw new Error("Session expired or invalid.");
      } finally {
        isRefreshing = false;
      }
    }
    
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // 优先使用服务器返回的 error 字段，其次是 message 字段，最后是 statusText
      const errorMessage = data.error || data.message || response.statusText;
      throw new ApiClientError(errorMessage, response.status, data);
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
