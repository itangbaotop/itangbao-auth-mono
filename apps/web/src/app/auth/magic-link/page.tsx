// src/app/auth/magic-link/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';
  
  const [statusMessage, setStatusMessage] = useState('正在验证魔术链接...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (error) {
      setIsError(true);
      setStatusMessage(`验证失败: ${decodeURIComponent(error)}`);
      return;
    }

    if (!token) {
      setIsError(true);
      setStatusMessage('魔术链接无效或已过期。');
      return;
    }

    const verifyMagicLink = async () => {
      try {
        // 调用 NextAuth 的 signIn 来验证魔术链接
        // NextAuth 会处理 token 的验证和登录
        const result = await signIn('email', {
          token,
          redirect: false, // 不自动重定向
          callbackUrl: callbackUrl,
        });

        if (result?.error) {
          setIsError(true);
          setStatusMessage(`登录失败: ${result.error}`);
        } else {
          setStatusMessage('魔术链接验证成功，正在重定向...');
          router.push(callbackUrl);
        }
      } catch (err) {
        setIsError(true);
        setStatusMessage('网络错误，请稍后重试。');
        console.error('Magic link sign-in error:', err);
      }
    };

    verifyMagicLink();
  }, [token, error, callbackUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        {isError ? (
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {statusMessage}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {statusMessage}
          </h1>
        )}
        
        {!isError && !token && (
          <p className="text-gray-600 mb-6">
            如果您没有收到魔术链接，请尝试重新发送。
          </p>
        )}

        <Link 
          href="/auth/signin" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          返回登录页面
        </Link>
      </div>
    </div>
  );
}

// 导出页面组件，并用 Suspense 包裹
export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}
