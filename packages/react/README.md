# itangbao-auth-react

🔐 现代化的 React 认证库，支持多框架服务端集成

[![npm version](https://badge.fury.io/js/itangbao-auth-react.svg)](https://badge.fury.io/js/itangbao-auth-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🏗️ **分层架构** - SDK、Hooks、Components、Server Routes 四层清晰分离
- 🔒 **安全第一** - HttpOnly Cookies、CSRF 保护、XSS 防护
- 🚀 **多框架支持** - Next.js、Express、Edge Runtime
- 📱 **React 18+** - 完整的 TypeScript 支持
- 🎯 **简单易用** - 开箱即用，最少 3 行代码集成
- 🔄 **自动刷新** - Token 自动续期，无缝用户体验

## 📦 安装

```bash
npm install itangbao-auth-react
# or
yarn add itangbao-auth-react
# or
pnpm add itangbao-auth-react
```

🚀 快速开始
1. 环境变量配置
```bash
# .env.local
NEXT_PUBLIC_AUTH_SERVICE_URL=https://your-auth-service.com
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id
AUTH_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

APP_URL=http://localhost:3000
AUTH_SERVICE_URL=https://your-auth-service.com
AUTH_CLIENT_ID=your-client-id
```
2. 设置认证提供者
```tsx
// app/components/AuthWrapper.tsx
'use client';

import { AuthProvider } from 'itangbao-auth-react';

const authConfig = {
  authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  scopes: ['openid', 'profile', 'email'],
};

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider config={authConfig}>
      {children}
    </AuthProvider>
  );
}


// app/layout.tsx
import { AuthWrapper } from './components/AuthWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
```
3. 创建 API 路由
```ts
// app/api/auth/[...auth]/route.ts
import { createNextJSAuthHandler, createAuthConfig } from 'itangbao-auth-react/server';

const handler = createNextJSAuthHandler(
  createAuthConfig({
    authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
    clientSecret: process.env.AUTH_CLIENT_SECRET!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  })
);

export { handler as GET, handler as POST };
```

4. 使用认证功能
```tsx
// app/components/UserProfile.tsx
'use client';

import { useAuthContext, useUserInfo, useUserActions } from 'itangbao-auth-react';

export function UserProfile() {
  const { isLoading, isAuthenticated } = useAuthContext();
  const { userInfo } = useUserInfo();
  const { handleLogin, handleLogout } = useUserActions();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={handleLogin}>登录</button>;
  }

  return (
    <div>
      <h1>欢迎, {userInfo?.name}!</h1>
      <p>{userInfo?.email}</p>
      <button onClick={handleLogout}>登出</button>
    </div>
  );
}
```

📖 API 文档
Hooks
useAuthContext()
获取完整的认证状态和操作方法。

```tsx
const {
  user,           // 用户信息
  isLoading,      // 加载状态
  isAuthenticated,// 是否已认证
  login,          // 登录方法
  logout,         // 登出方法
  refresh,        // 刷新用户信息
  getAccessToken, // 获取访问令牌
  getProfileUrl   // 获取用户资料 URL
} = useAuthContext();

```

useUserInfo()
获取用户信息和便捷的显示数据。

```tsx
const {
  user,        // 原始用户信息
  userInfo: {  // 格式化的用户信息
    id,
    name,
    email,
    image,
    role,
    initials   // 用户名首字母
  },
  isAuthenticated,
  isLoading
} = useUserInfo();

```

useUserActions()
获取用户操作方法。

```tsx
const {
  handleLogin,   // 跳转到登录页面
  handleLogout,  // 登出并重定向
  handleProfile  // 打开用户资料页面
} = useUserActions();
```

useApiClient(baseUrl?)
获取自动添加认证头的 API 客户端。

```tsx
const { 
  get,      // GET 请求
  post,     // POST 请求
  request,  // 通用请求
  loading   // 加载状态
} = useApiClient('/api');

// 使用示例
const fetchProfile = async () => {
  const result = await get('/user/profile');
  console.log(result.data);
};
```

组件
<AuthProvider>
认证上下文提供者。

```tsx
<AuthProvider 
  config={{
    authServiceUrl: string,
    clientId: string,
    redirectUri: string,
    scopes?: string[]
  }}
>
  {children}
</AuthProvider>
```

<ProtectedRoute>
路由保护组件。

```tsx
<ProtectedRoute 
  fallback={<Loading />}        // 加载时显示
  redirectTo="/login"           // 未登录时重定向
  requireRoles={['admin']}      // 需要的角色
>
  <AdminPanel />
</ProtectedRoute>

```

<LoginButton> / <LogoutButton>
预制的登录/登出按钮。

```tsx
<LoginButton className="btn btn-primary">
  登录
</LoginButton>

<LogoutButton 
  className="btn btn-secondary"
  onLogout={() => console.log('已登出')}
>
  登出
</LogoutButton>
```





服务端配置选项
```tsx
// app/api/auth/[...auth]/route.ts
const handler = createNextJSAuthHandler(
  createAuthConfig({
    authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
    clientSecret: process.env.AUTH_CLIENT_SECRET!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    cookieConfig: {
      secure: true,                    // 生产环境使用 HTTPS
      sameSite: 'strict',             // CSRF 保护
      accessTokenMaxAge: 15 * 60,     // 15 分钟
      refreshTokenMaxAge: 60 * 60 * 24, // 1 天
    },
  })
);
```

🔒 安全特性
Cookie 安全
✅ HttpOnly Cookies - 防止 XSS 攻击
✅ Secure 标志 - 仅 HTTPS 传输
✅ SameSite 保护 - 防止 CSRF 攻击
✅ 短期 Access Token - 减少风险窗口