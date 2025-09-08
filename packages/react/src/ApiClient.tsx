// @itangbao-auth/react/src/ApiClient.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';

export function useApiClient(baseUrl: string = '') {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const request = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    const requestKey = `${options.method || 'GET'}_${url}`;
    setLoading(prev => ({ ...prev, [requestKey]: true }));

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || response.statusText);
      }

      return { data, response };
    } finally {
      setLoading(prev => ({ ...prev, [requestKey]: false }));
    }
  }, [baseUrl]);

  const get = useCallback((url: string) => {
    return request(url, { method: 'GET' });
  }, [request]);

  const post = useCallback((url: string, data: any) => {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [request]);

  // ✅ 使用 useMemo 确保返回的对象引用稳定
  return useMemo(() => ({
    loading,
    get,
    post,
    request
  }), [loading, get, post, request]);
}
