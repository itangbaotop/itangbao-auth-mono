// app/components/AuthWrapper.tsx
'use client';

import { AuthProvider } from 'itangbao-auth-react';
import { authClient } from '../lib/auth-client';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider client={authClient}>
      {children}
    </AuthProvider>
  );
}
