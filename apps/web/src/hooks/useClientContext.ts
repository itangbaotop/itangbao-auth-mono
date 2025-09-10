// hooks/useClientContext.ts
import { useState, useEffect, useCallback, useMemo } from 'react';

interface ClientContext {
  clientId: string;
  redirectUri: string;
  state?: string;
  timestamp: number;
}

export function useClientContext() {
  const [clientContext, setClientContext] = useState<ClientContext | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('auth_client_context');
      if (stored) {
        const context = JSON.parse(stored);
        const isExpired = Date.now() - context.timestamp > 2 * 60 * 60 * 1000;
        
        if (!isExpired) {
          setClientContext(context);
        } else {
          sessionStorage.removeItem('auth_client_context');
        }
      }
    } catch (error) {
      console.error('Failed to parse client context:', error);
      sessionStorage.removeItem('auth_client_context');
    }
  }, []);

  // 使用 useCallback 确保函数引用稳定
  const clearClientContext = useCallback(() => {
    sessionStorage.removeItem('auth_client_context');
    setClientContext(null);
  }, []);

  const getClientHomeUrl = useCallback(() => {
    if (!clientContext) return '/';
    
    try {
      const url = new URL(clientContext.redirectUri);
      return `${url.protocol}//${url.host}`;
    } catch (error) {
      console.error('Invalid redirect URI:', error);
      return '/';
    }
  }, [clientContext]);

  // 使用 useMemo 确保返回对象引用稳定
  return useMemo(() => ({
    clientContext,
    clearClientContext,
    getClientHomeUrl,
    hasClientContext: !!clientContext
  }), [clientContext, clearClientContext, getClientHomeUrl]);
}
