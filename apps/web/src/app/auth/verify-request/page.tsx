// src/app/auth/verify-request/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          验证请求已发送
        </h1>
        {email && (
          <p className="text-gray-700 mb-4">
            我们已向 <strong>{decodeURIComponent(email)}</strong> 发送了魔术链接。
          </p>
        )}
        {error && (
          <p className="text-red-600 mb-4">
            错误: {decodeURIComponent(error)}
          </p>
        )}
        <p className="text-gray-600 mb-6">
          请检查您的收件箱，并点击链接完成登录。
        </p>
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
export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}
