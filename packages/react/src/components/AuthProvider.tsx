// packages/react/src/components/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AuthClient, AuthApi } from 'itangbao-auth-sdk';
import type { User, AuthConfig } from 'itangbao-auth-types';

interface AuthContextType {
  // 状态
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // 操作
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
  getAccessToken: () => Promise<string | null>;
  getProfileUrl: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
  onSessionExpired?: () => void;
  onUserChanged?: (user: User | null) => void;
}

export function AuthProvider({ 
  children,
  config,
  onSessionExpired,
  onUserChanged
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 创建客户端实例（使用 useMemo 避免重复创建）
  const authClient = useMemo(() => new AuthClient(config), [config]);
  const authApi = useMemo(() => new AuthApi(), []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    onUserChanged?.(newUser);
  };

  const refresh = async (): Promise<User | null> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      updateUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      updateUser(null);
      onSessionExpired?.();
      return null;
    }
  };

  const login = async () => {
    const loginUrl = await authClient.generateLoginUrl();
    window.location.href = loginUrl;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      updateUser(null);
    }
  };

  const getAccessToken = async () => {
    return await authApi.getAccessToken();
  };

  const getProfileUrl = () => {
    return authClient.generateProfileUrl();
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refresh();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refresh,
    getAccessToken,
    getProfileUrl,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
