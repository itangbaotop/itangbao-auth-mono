// app/components/AuthWrapper.tsx
'use client';

import { AuthProvider } from 'itangbao-auth-react';
import { authConfig } from '@/app/lib/auth-config';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider 
      config={authConfig}
      onSessionExpired={() => {
        console.log('Session expired, redirecting to login');
        window.location.href = '/login';
      }}
      onUserChanged={(user) => {
        console.log('User changed:', user);
      }}
    >
      {children}
    </AuthProvider>
  );
}
