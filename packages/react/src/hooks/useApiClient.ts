// packages/react/src/hooks/useApiClient.ts
"use client";

import { useCallback, useState, useMemo } from 'react';
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
      const token = await getAccessToken();
      const headers: Record<string, string> = { 
        ...options.headers as Record<string, string>
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const result = await httpClient.request(url, {
        ...options,
        headers,
      });

      return result;
    } catch (error: any) {
      if (error.message?.includes('401')) {
        window.location.href = '/login';
        return;
      }
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [requestKey]: false }));
    }
  }, [httpClient, getAccessToken]);

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
  }), [request, get, post, loading]);
}
