// packages/react/src/hooks/useApiClient.ts
"use client";

import { useCallback, useState, useMemo, useRef } from 'react';
import { HttpClient } from 'itangbao-auth-sdk';
import { useAuthContext } from '../components/AuthProvider';

export function useApiClient(baseUrl: string = '') {
  const { getAccessToken } = useAuthContext();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const httpClient = useMemo(() => new HttpClient({ baseUrl }), [baseUrl]);

  const request = useCallback(async <T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data: T; response: Response }> => {
    const requestKey = `${options.method || 'GET'}_${url}`;
    setLoading(prev => ({ ...prev, [requestKey]: true }));
    try {
      return await httpClient.request<T>(url, options);
    } finally {
      setLoading(prev => ({ ...prev, [requestKey]: false }));
    }
  }, [httpClient]);

  const get = useCallback(<T = any>(url: string, headers?: Record<string, string>) => {
    return request<T>(url, { method: 'GET', headers });
  }, [request]);

  const post = useCallback(<T = any>(url: string, data: any, headers?: Record<string, string>) => {
    return request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    });
  }, [request]);

  const apiClientRef = useRef({
      request,
      get,
      post,
      loading,
  });

  apiClientRef.current.loading = loading;

  return apiClientRef.current;
}