// packages/react/src/components/ProtectedRoute.tsx
// UI 组件，使用 Context
"use client";
import React, { ReactNode, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/',
  requireRoles = []
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  const hasRequiredRole = () => {
    if (requireRoles.length === 0) return true;
    if (!user?.role) return false;
    return requireRoles.includes(user.role);
  };

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated || !hasRequiredRole()) {
    return null;
  }

  return <>{children}</>;
}
