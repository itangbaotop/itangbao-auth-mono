// @itangbao-auth/react/src/UserInfo.tsx
"use client";
import React from 'react';
import { useAuth } from './AuthProvider';

interface UserInfoProps {
  fallback?: React.ReactNode;
  render?: (user: any) => React.ReactNode;
}

export function UserInfo({ 
  fallback = null,
  render
}: UserInfoProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (render) {
    return <>{render(user)}</>;
  }

  return (
    <div>
      <div>Name: {user.name}</div>
      <div>Email: {user.email}</div>
    </div>
  );
}
