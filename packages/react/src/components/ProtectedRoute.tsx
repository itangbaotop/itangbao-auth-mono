// packages/react/src/components/ProtectedRoute.tsx
"use client";
import React, { ReactNode, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * 在验证用户身份时显示的加载状态UI
   * @default <div>Loading...</div>
   */
  fallback?: React.ReactNode;
  /**
   * 允许访问此路由的角色列表。如果为空，则只检查是否已登录。
   */
  requireRoles?: string[];
  /**
   * 当用户已登录但角色不满足要求时显示的内容。
   * @default null
   */
  unauthorizedFallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  requireRoles = [],
  unauthorizedFallback = null
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, login } = useAuthContext();

  useEffect(() => {
    // 效果1: 当加载结束且用户未认证时，执行登录跳转
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login...');
      login(); // 调用 AuthContext 提供的 login 方法，跳转到认证中心
    }
  }, [isAuthenticated, isLoading, login]);

  // 检查用户是否拥有所需角色
  const hasRequiredRole = () => {
    if (requireRoles.length === 0) return true; // 如果没要求角色，则通过
    if (!user?.role) return false; // 如果用户没有角色，则不通过
    return requireRoles.includes(user.role); // 检查用户角色是否在要求列表中
  };

  // 渲染逻辑
  // 1. 如果正在加载，或者即将跳转，显示 fallback
  if (isLoading || !isAuthenticated) {
    return <>{fallback}</>;
  }

  // 2. 如果用户已认证，但角色不满足要求，显示未授权的 fallback
  if (isAuthenticated && !hasRequiredRole()) {
    console.warn(`ProtectedRoute: User with role '${user?.role}' does not have required roles: [${requireRoles.join(', ')}]`);
    return <>{unauthorizedFallback}</>;
  }

  // 3. 用户已认证且角色满足要求，渲染子组件
  return <>{children}</>;
}