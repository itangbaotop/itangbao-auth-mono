// app/page.tsx
'use client';

import { LoginButton, useAuthContext } from 'itangbao-auth-react';
import { UserDropdown } from '@/components/UserDropdown';

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
