// @itangbao-auth/react/src/LoginButton.tsx
"use client";
import React from 'react';
import { useAuth } from './AuthProvider';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ 
  className = '', 
  children = 'Login' 
}: LoginButtonProps) {
  const { login } = useAuth();

  return (
    <button 
      className={className} 
      onClick={() => login()}
    >
      {children}
    </button>
  );
}
