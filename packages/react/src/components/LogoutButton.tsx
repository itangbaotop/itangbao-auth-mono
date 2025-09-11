// packages/react/src/components/LogoutButton.tsx
import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';

interface LogoutButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onLogout?: () => void;
}

export function LogoutButton({ 
  children, 
  className, 
  disabled,
  onLogout 
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    onLogout?.();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={disabled || isLoading}
      className={className}
    >
      {children}
    </button>
  );
}
