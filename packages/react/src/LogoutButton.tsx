// @itangbao-auth/react/src/LogoutButton.tsx
"use client";
import React from 'react';
import { useAuth } from './AuthProvider';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  className = '', 
  children = 'Logout' 
}: LogoutButtonProps) {
  const { logout } = useAuth();

  return (
    <button 
      className={className} 
      onClick={() => logout()}
    >
      {children}
    </button>
  );
}
