// packages/react/src/components/LoginButton.tsx
// UI 组件
import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';

interface LoginButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onLogin?: () => void;
}



export function LoginButton({ children, className, disabled, onLogin }: LoginButtonProps) {
  const { login, isLoading } = useAuthContext();

  const handleLogin = async () => {
    await login();
    onLogin?.();
  };

  return (
    <button
      onClick={handleLogin}
      disabled={disabled || isLoading}
      className={className}
    >
      {children}
    </button>
  );
}
