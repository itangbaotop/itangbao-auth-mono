// app/components/AuthWrapper.tsx
'use client';

import { AuthProvider, ServiceWorkerRegistrar } from 'itangbao-auth-react';
import { authConfig } from '@/lib/auth/auth-config';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider 
      config={authConfig}
      onSessionExpired={() => {
        console.log('Session expired, redirecting to login');
        window.location.href = '/';
      }}
      onUserChanged={(user) => {
        console.log('User changed:', user);
      }}
    >
      <ServiceWorkerRegistrar />
      {children}
    </AuthProvider>
  );
}
