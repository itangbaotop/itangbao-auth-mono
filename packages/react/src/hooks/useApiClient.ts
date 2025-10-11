// packages/react/src/hooks/useApiClient.ts
"use client";

import { useCallback, useState, useMemo, useRef } from 'react';
import { HttpClient } from 'itangbao-auth-sdk';
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
      return await httpClient.request(url, options);
    } finally {
      setLoading(prev => ({ ...prev, [requestKey]: false }));
    }
  }, [httpClient]);

  const get = useCallback((url: string, headers?: Record<string, string>) => {
    return request(url, { method: 'GET', headers });
  }, [request]);

  const post = useCallback((url: string, data: any, headers?: Record<string, string>) => {
    return request(url, {
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