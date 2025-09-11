// packages/react/src/hooks/useUserInfo.ts
"use client";
// 用户信息的 React 适配
import { useMemo } from 'react';
import { useAuthContext } from '../components/AuthProvider';

export function useUserInfo() {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  const userInfo = useMemo(() => {
    if (!user) return null;

    const getInitials = (name: string) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    return {
      id: user.id,
      name: user.name || 'User',
      email: user.email || '',
      image: user.image,
      role: user.role,
      initials: getInitials(user.name || 'User'),
    };
  }, [user]);

  return {
    user,
    userInfo,
    isAuthenticated,
    isLoading,
  };
}
