// app/page.tsx
'use client';

import { authClient } from '@/lib/auth/auth-client';
import { useAuth, ProtectedRoute, LogoutButton, UserInfo, UserDropdown } from 'itangbao-auth-react';
import { useEffect } from 'react';

export default function HomePage() {
  const { isLoading } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isLogout = urlParams.get('logout');
    const fromAuthService = urlParams.get('from');
    
    if (isLogout === 'true' && fromAuthService === 'auth-service') {
      console.log('从认证服务退出，清除本地session');
      
      authClient.logout();
      
      // 如果使用自定义token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // 清除cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // 清除URL参数
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('logout');
      newUrl.searchParams.delete('from');
      window.history.replaceState({}, '', newUrl.toString());
      
      // 可选：刷新页面确保状态更新
      window.location.reload();
    }
  }, []);


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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* 左侧 Logo */}
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">认证中心</h1>
                  </div>

                  {/* 右侧用户下拉菜单 */}
                  <div className="flex items-center space-x-4">
                    <UserDropdown />
                  </div>
                </div>
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
