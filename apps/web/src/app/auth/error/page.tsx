// src/app/auth/error/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useClientContext } from '@/hooks/useClientContext';

function ErrorDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getClientHomeUrl, hasClientContext } = useClientContext(); 
  
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return '邮箱或密码错误，请重试。';
      case 'OAuthAccountNotLinked':
        return '此邮箱已通过其他方式注册，请尝试使用其他登录方式。';
      default:
        return '登录过程中发生未知错误，请稍后重试或联系管理员。';
    }
  };

  const handleGoHome = () => {
    const homeUrl = getClientHomeUrl();
    if (hasClientContext && homeUrl !== '/') {
      // 如果有客户端上下文，跳转到客户端应用主页
      window.location.href = homeUrl;
    } else {
      // 否则跳转到认证服务主页
      router.push("/auth/signin");
    }
  };

  const handleRetryLogin = () => {
    // 重新尝试登录，保持客户端上下文
    const stored = sessionStorage.getItem('auth_client_context');
    if (stored) {
      try {
        const context = JSON.parse(stored);
        const loginUrl = new URL('/auth/signin', window.location.origin);
        loginUrl.searchParams.set('client_id', context.clientId);
        loginUrl.searchParams.set('redirect_uri', context.redirectUri);
        loginUrl.searchParams.set('response_type', 'code');
        if (context.state) {
          loginUrl.searchParams.set('state', context.state);
        }
        window.location.href = loginUrl.toString();
      } catch (error) {
        router.push("/auth/signin");
      }
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          登录失败
        </h1>
        
        <p className="text-gray-700 mb-6">
          {getErrorMessage(error)}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleRetryLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            重新登录
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            {hasClientContext ? '返回应用' : '返回首页'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <ErrorDisplay />
    </Suspense>
  );
}
