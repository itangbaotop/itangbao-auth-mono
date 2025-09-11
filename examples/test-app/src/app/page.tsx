// app/page.tsx
"use client";

import { UserDropdown } from "@/components/UserDropdown";
import { authClient } from "@/lib/auth/auth-client";
import {
  useAuth,
  ProtectedRoute,
  LogoutButton,
  UserInfo,
  LoginButton,
} from "itangbao-auth-react";
import { useEffect } from "react";

export default function HomePage() {
  const { isLoading } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isLogout = urlParams.get("logout");
    const fromAuthService = urlParams.get("from");

    if (isLogout === "true" && fromAuthService === "auth-service") {
      console.log("从认证服务退出，清除本地session");

      authClient.logout();

      // 如果使用自定义token
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // 清除cookies
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 清除URL参数
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("logout");
      newUrl.searchParams.delete("from");
      window.history.replaceState({}, "", newUrl.toString());

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
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">我的应用</h1>
              </div>
              <div className="flex items-center space-x-4">
                <UserDropdown />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="w-20 h-20 bg-blue-500 ring-4 ring-red-500 ring-offset-2">
            Ring 测试
          </div>
          <LoginButton />
          <LogoutButton />
          {/* 页面内容 */}
        </main>
      </div>
    </ProtectedRoute>
  );
}
