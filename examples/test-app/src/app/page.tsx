// app/page.tsx
'use client';

import { useAuth, ProtectedRoute, LogoutButton, UserInfo } from '@itangbao-auth/react';

export default function HomePage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">我的应用</h1>
              </div>
              <div className="flex items-center space-x-4">
                <UserInfo render={(user) => (
                  <span>欢迎, {user.name}</span>
                )} />
                <LogoutButton className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  登出
                </LogoutButton>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 页面内容 */}
        </main>
      </div>
    </ProtectedRoute>
  );
}
