// app/page.tsx
'use client';

import { LoginButton, useAuthContext } from 'itangbao-auth-react';
import { UserDropdown } from '@/components/UserDropdown';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  console.log('isAuthenticated', isAuthenticated);
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">我的应用</h1>
              </div>
              {isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <UserDropdown />
                </div>
              )}
              {!isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <LoginButton>登录</LoginButton>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <h2 className="text-2xl font-semibold text-gray-900">欢迎来到我的应用</h2>
              <p className="text-gray-500">这是一个基于itangbao-auth的应用示例。</p>
            </div>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            <Link href="/business">去业务页面</Link>
          </button>
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">这里是您的应用内容</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
