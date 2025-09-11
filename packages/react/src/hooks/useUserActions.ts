// packages/react/src/hooks/useUserActions.ts
"use client";
// 用户操作的 React 适配
import { useCallback } from 'react';
import { useAuthContext } from '../components/AuthProvider';

export function useUserActions() {
  const { login, logout, getProfileUrl } = useAuthContext();

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(async () => {
    await logout();
    window.location.href = '/';
  }, [logout]);

  const handleProfile = useCallback(() => {
    const profileUrl = getProfileUrl();
    window.location.href = profileUrl || '/profile';
  }, [getProfileUrl]);

  return {
    handleLogin,
    handleLogout,
    handleProfile,
  };
}
