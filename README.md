# 🍬 itangbao认证服务 - Monorepo项目

一个基于Next.js的现代化认证服务后端，配套完整的TypeScript SDK和React组件库，专为现代Web应用设计的认证解决方案。

[![npm version](https://img.shields.io/npm/v/itangbao-auth-sdk)](https://www.npmjs.com/package/itangbao-auth-sdk)
[![npm version](https://img.shields.io/npm/v/itangbao-auth-react)](https://www.npmjs.com/package/itangbao-auth-react)
[![npm version](https://img.shields.io/npm/v/itangbao-auth-types)](https://www.npmjs.com/package/itangbao-auth-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 🎯 项目概览

本项目采用**Monorepo架构**，基于**Turborepo**和**pnpm workspaces**构建，提供从认证服务后端到前端SDK的完整认证解决方案：

- **🏗️ 认证服务后端** (`apps/web`) - 基于Next.js的完整OAuth2认证服务
- **📦 核心SDK** (`packages/sdk`) - TypeScript认证客户端SDK
- **⚛️ React集成** (`packages/react`) - React专用组件和Hooks
- **🔧 类型定义** (`packages/types`) - 共享TypeScript类型定义

## 🏗️ 项目架构

```
itangbao-auth-mono/
├── apps/
│   └── web/                    # 🏗️ 认证服务后端 (Next.js)
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   ├── lib/          # 服务端认证逻辑
│       │   ├── db/           # 数据库模型和迁移
│       │   └── middleware.ts # 认证中间件
│       └── package.json
├── packages/
│   ├── types/                 # 🔧 共享类型定义
│   ├── sdk/                   # 📦 核心认证SDK
│   ├── react/                 # ⚛️ React组件库
│   └── ui/                    # 🎨 通用UI组件
├── examples/
│   └── test-auth/            # 🧪 测试应用示例
└── turbo.json               # Turborepo配置
```

## 📦 核心包介绍

### 🏗️ 认证服务后端 (`apps/web`)
基于Next.js 15的完整认证服务，提供：
- **OAuth 2.0** 授权服务器
- **JWT令牌** 颁发和验证
- **用户管理** 注册、登录、找回密码
- **会话管理** 自动续期和失效
- **API路由** RESTful认证API
- **数据库集成** 支持PostgreSQL

### 📦 核心SDK (`itangbao-auth-sdk`)
轻量级的TypeScript认证客户端：
- **认证客户端** - OAuth2流程封装
- **令牌管理** - JWT令牌自动刷新
- **HTTP客户端** - 带认证的API调用
- **类型安全** - 完整的TypeScript支持

### ⚛️ React集成 (`itangbao-auth-react`)
React应用专用组件库：
- **AuthProvider** - 全局认证状态管理
- **useAuth Hook** - 认证状态访问
- **预置组件** - 登录按钮、用户头像等
- **路由保护** - 受保护路由组件

### 🔧 类型定义 (`itangbao-auth-types`)
共享的TypeScript类型定义：
- **认证相关** - 用户、令牌、配置类型
- **API响应** - 标准化的API响应格式
- **OAuth规范** - OAuth2标准类型定义

## 🚀 快速开始

### 📋 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- cloudflare d1

### 🔧 本地开发设置

#### 1. 克隆项目
```bash
git clone https://github.com/itangbaotop/itangbao-auth-mono.git
cd itangbao-auth-mono
```

#### 2. 安装依赖
```bash
pnpm install
```

#### 3. 设置环境变量
```bash
# 复制环境变量模板
cp apps/web/.env.example apps/web/.env.local

# 编辑 .env.local 文件，配置数据库和密钥
```

#### 4. 初始化数据库
```bash
# 运行数据库迁移
pnpm --filter web db:push

# 或者使用Docker
pnpm --filter web db:dev
```

#### 5. 启动开发环境
```bash
# 启动所有服务（推荐）
pnpm dev

# 单独启动认证服务
pnpm --filter web dev

# 启动测试应用
pnpm --filter test-auth dev
```

### 📦 安装SDK

#### 在React项目中使用
```bash
# 安装React SDK
npm install itangbao-auth-react

# 或
pnpm add itangbao-auth-react
```

#### 在普通TypeScript项目中使用
```bash
# 安装核心SDK
npm install itangbao-auth-sdk

# 或
pnpm add itangbao-auth-sdk
```

## 💻 使用示例

### 🏗️ 认证服务后端配置

#### 环境变量配置
```bash
# apps/web/.env.local
DATABASE_URL="postgresql://user:password@localhost:5432/itangbao_auth"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth提供商配置
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### ⚛️ React应用集成

#### 1. 配置认证客户端
```typescript
// src/lib/auth-client.ts
import { AuthHubClient } from 'itangbao-auth-sdk';

export const authClient = new AuthHubClient({
  baseUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}/callback` 
    : '',
  scopes: ['openid', 'profile', 'email'],
});
```

#### 2. 设置AuthProvider
```typescript
// src/app/providers.tsx
'use client';

import { AuthProvider } from 'itangbao-auth-react';
import { authClient } from '@/lib/auth-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider client={authClient}>
      {children}
    </AuthProvider>
  );
}
```

#### 3. 使用认证功能
```typescript
// src/app/login/page.tsx
'use client';

import { useAuth, LoginButton } from 'itangbao-auth-react';

export default function LoginPage() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <h1>欢迎回来, {user?.name}</h1>
        <button onClick={() => logout()}>退出登录</button>
      </div>
    );
  }

  return (
    <div>
      <h1>登录</h1>
      <LoginButton />
    </div>
  );
}
```

#### 4. 保护路由
```typescript
// src/components/protected-route.tsx
'use client';

import { useAuth } from 'itangbao-auth-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

## 🔧 开发命令

### 包管理命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式（带热重载）
pnpm dev

# 代码质量检查
pnpm lint

# 类型检查
pnpm type-check

# 运行测试
pnpm test

# 清理构建缓存
pnpm clean
```

### 特定包命令

```bash
# 认证服务相关
pnpm --filter web dev          # 启动认证服务
pnpm --filter web build        # 构建认证服务
pnpm --filter web start        # 启动生产服务

# SDK开发
pnpm --filter sdk build        # 构建SDK
pnpm --filter react build      # 构建React包
pnpm --filter types build      # 构建类型包

# 测试应用
pnpm --filter test-auth dev    # 启动测试应用
```

### 数据库命令

```bash
# 数据库操作（在apps/web目录下）
cd apps/web

# 启动数据库（Docker）
pnpm db:dev

# 运行迁移
pnpm db:push

# 重置数据库
pnpm db:reset

# 生成客户端
pnpm db:generate
```

## 📊 项目状态

| 组件 | 状态 | 版本 | 描述 |
|---|---|---|---|
| 认证服务后端 | ✅ 生产就绪 | - | Next.js 15认证服务 |
| itangbao-auth-sdk | ✅ 已发布 | 0.1.2 | 核心认证SDK |
| itangbao-auth-react | ✅ 已发布 | 0.1.2 | React组件库 |
| itangbao-auth-types | ✅ 已发布 | 0.1.2 | 类型定义 |

## 🧪 测试

### 单元测试
```bash
# 运行所有测试
pnpm test

# 运行特定包测试
pnpm --filter sdk test
pnpm --filter react test
```

### 集成测试
```bash
# 启动测试环境
pnpm test:e2e

# 运行端到端测试
pnpm test:e2e:run
```


### SDK发布

```bash
# 版本更新
pnpm changeset

# 发布到npm
pnpm release
```

## 🔗 相关链接

- 📦 [itangbao-auth-sdk - npm](https://www.npmjs.com/package/itangbao-auth-sdk)
- ⚛️ [itangbao-auth-react - npm](https://www.npmjs.com/package/itangbao-auth-react)
- 🔧 [itangbao-auth-types - npm](https://www.npmjs.com/package/itangbao-auth-types)
- 📖 [完整文档](https://auth.itangbao.com) (建设中)
- 🚀 [在线演示](https://demo.itangbao.com) (建设中)
- 🐛 [问题反馈](https://github.com/your-org/itangbao-auth-mono/issues)

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 快速开始
1. Fork 这个项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 遵循 [Conventional Commits](https://conventionalcommits.org/)
- 使用 ESLint + Prettier 进行代码格式化
- 所有代码必须通过 TypeScript 类型检查
- 新增功能需要包含单元测试
- 使用 Changesets 进行版本管理

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 👥 维护团队

- **核心维护者**: itangbao
- **项目主页**: [itangbao-auth-mono](https://github.com/your-org/itangbao-auth-mono)

---

<p align="center">
  <strong>🍬 itangbao认证服务 - 让认证变得简单</strong><br>
  基于Next.js构建，为现代Web应用提供完整的认证解决方案
</p>
