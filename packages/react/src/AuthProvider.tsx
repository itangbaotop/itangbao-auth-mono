// @itangbao-auth/react/src/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthHubClient } from 'itangbao-auth-sdk';
import type { User } from 'itangbao-auth-types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getProfileUrl: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  client: AuthHubClient;
  children: ReactNode;
  onSessionExpired?: () => void;
  loginRedirectPath?: string;
}

export function AuthProvider({ 
  client, 
  children,
  onSessionExpired,
  loginRedirectPath = '/login'
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const currentUser = await client.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      return null;
    }
  };

  const login = async () => {
    const loginUrl = await client.getLoginUrl();
    window.location.href = loginUrl;
  };

  const logout = async () => {
    await client.logout();
    setUser(null);
    if (loginRedirectPath) {
      window.location.href = loginRedirectPath;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      return await client.getValidAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      if (onSessionExpired) {
        onSessionExpired();
      }
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refresh();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refresh: async () => {
      await refresh();
    },
    getAccessToken: async () => {
      return await getAccessToken();
    },
    getProfileUrl: async () => {
      return await client.getUserProfileUrl();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
