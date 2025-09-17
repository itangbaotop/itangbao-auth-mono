// packages/react/src/components/ProtectedRoute.tsx
// UI 组件，使用 Context
"use client";
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string | (() => Promise<string>) | (() => string);
  requireRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/',
  requireRoles = []
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!isLoading && !isAuthenticated && redirectTo && !isProcessingRedirect) {
        setIsProcessingRedirect(true);
        
        try {
          let targetUrl: string;
          
          if (typeof redirectTo === 'function') {
            // 支持异步和同步函数
            const result = redirectTo();
            targetUrl = result instanceof Promise ? await result : result;
          } else {
            targetUrl = redirectTo;
          }
          
          window.location.href = targetUrl;
        } catch (error) {
          console.error('Error processing redirect:', error);
          // 如果异步函数出错，使用默认重定向
          window.location.href = '/';
        }
      }
    };

    handleRedirect();
  }, [isAuthenticated, isLoading, redirectTo, isProcessingRedirect]);

  const hasRequiredRole = () => {
    if (requireRoles.length === 0) return true;
    if (!user?.role) return false;
    return requireRoles.includes(user.role);
  };

  if (isLoading || isProcessingRedirect) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated || !hasRequiredRole()) {
    return null;
  }

  return <>{children}</>;
}
