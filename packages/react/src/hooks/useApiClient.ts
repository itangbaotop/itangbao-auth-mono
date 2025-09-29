// packages/react/src/hooks/useApiClient.ts
"use client";

import { useCallback, useState, useMemo } from 'react';
import { ApiClient, HttpClient } from 'itangbao-auth-sdk';
import { useAuthContext } from '../components/AuthProvider';

export function useApiClient(baseUrl: string = '') {
  const { getAccessToken } = useAuthContext();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const httpClient = useMemo(() => new HttpClient({ baseUrl }), [baseUrl]);

  const request = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    const requestKey = `${options.method || 'GET'}_${url}`;
    setLoading(prev => ({ ...prev, [requestKey]: true }));

    try {
      // Access Token 的获取和设置由 HttpClient 内部处理，这里不再需要
      // 因为 cookie 是自动发送的 (credentials: 'include')
      return await httpClient.request(url, options);
    } finally {
      setLoading(prev => ({ ...prev, [requestKey]: false }));
    }
  }, [httpClient]);

  const get = useCallback((url: string) => {
    return request(url, { method: 'GET' });
  }, [request]);

  const post = useCallback((url: string, data: any) => {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [request]);

  return useMemo(() => ({
    request,
    get,
    post,
    loading,
  } as ApiClient), [request, get, post, loading]);
}