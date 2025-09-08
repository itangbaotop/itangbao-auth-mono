# 🍬 itangbao认证SDK - 单仓库项目

一个现代化的TypeScript认证SDK，提供完整的用户认证解决方案，支持React应用快速集成。

[![npm version](https://img.shields.io/npm/v/itangbao-auth-sdk)](https://www.npmjs.com/package/itangbao-auth-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 🎯 项目简介

`itangbao-auth-mono` 是一个基于TypeScript构建的认证SDK单仓库项目，专为现代Web应用设计。它提供了从底层认证逻辑到React组件的完整解决方案，帮助开发者快速集成用户认证功能。

## 🏗️ 项目架构

本项目采用Monorepo架构，基于Turborepo构建，包含以下核心包：

### 📦 认证核心包

| 包名 | 描述 | 版本 |
|---|---|---|
| `itangbao-auth-types` | TypeScript类型定义 | ![npm](https://img.shields.io/npm/v/itangbao-auth-types) |
| `itangbao-auth-sdk` | 核心认证SDK | ![npm](https://img.shields.io/npm/v/itangbao-auth-sdk) |
| `itangbao-auth-react` | React专用组件库 | ![npm](https://img.shields.io/npm/v/itangbao-auth-react) |

### 🛠️ 开发工具包

- `eslint-config` - ESLint配置共享
- `typescript-config` - TypeScript配置共享
- `ui` - 通用UI组件库

## 🚀 快速开始

### 安装

#### 使用npm
```bash
npm install itangbao-auth-react
```

#### 使用pnpm（推荐）
```bash
pnpm add itangbao-auth-react
```

#### 使用yarn
```bash
yarn add itangbao-auth-react
```

### 基础使用

#### 1. 配置认证客户端

```typescript
// src/config/auth.ts
import { AuthHubClient } from 'itangbao-auth-sdk';

const authClient = new AuthHubClient({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  scopes: ['openid', 'profile', 'email'],
  authUrl: 'https://your-auth-server.com/oauth',
  clientSecret: 'your-client-secret' // 仅服务端需要
});

export default authClient;
```

#### 2. React集成

```typescript
// src/app/layout.tsx
import { AuthProvider } from 'itangbao-auth-react';
import authClient from '@/config/auth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider client={authClient}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
```

#### 3. 使用认证组件

```typescript
// src/app/login/page.tsx
import { LoginButton, useAuth } from 'itangbao-auth-react';

export default function LoginPage() {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <h1>欢迎, {user?.name}</h1>
        <button onClick={logout}>退出登录</button>
      </div>
    );
  }

  return <LoginButton />;
}
```

## 📋 功能特性

### 🔐 认证功能
- **OAuth 2.0** - 完整的OAuth 2.0流程支持
- **JWT令牌** - 支持JWT令牌的生成和验证
- **会话管理** - 自动处理会话过期和刷新
- **权限控制** - 基于角色的权限控制

### 🎨 React组件
- **AuthProvider** - 全局认证状态管理
- **LoginButton** - 一键登录按钮
- **ProtectedRoute** - 路由保护组件
- **useAuth Hook** - 认证状态访问Hook

### 🛡️ 安全特性
- **CSRF保护** - 跨站请求伪造防护
- **XSS防护** - 跨站脚本攻击防护
- **安全存储** - 敏感信息安全存储
- **HTTPS强制** - 生产环境HTTPS强制

## 🏃‍♂️ 开发指南

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 本地开发

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/itangbao-auth-mono.git
cd itangbao-auth-mono
```

#### 2. 安装依赖
```bash
pnpm install
```

#### 3. 启动开发环境
```bash
# 构建所有包
pnpm build

# 启动测试应用
pnpm --filter test-app dev

# 构建特定包
pnpm --filter itangbao-auth-sdk build
```

### 包管理命令

```bash
# 构建所有包
pnpm build

# 开发模式
pnpm dev

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 发布包
pnpm release
```

### 构建特定包
```bash
# 构建SDK包
pnpm --filter itangbao-auth-sdk build

# 构建React包
pnpm --filter itangbao-auth-react build

# 构建类型包
pnpm --filter itangbao-auth-types build
```

## 📁 项目结构

```
itangbao-auth-mono/
├── packages/
│   ├── types/           # TypeScript类型定义
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── sdk/            # 核心认证SDK
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── react/          # React专用组件
│   │   ├── src/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── hooks.ts
│   │   └── package.json
│   ├── ui/             # 通用UI组件
│   ├── eslint-config/   # ESLint配置
│   └── typescript-config/ # TypeScript配置
├── examples/
│   └── test-app/       # 测试应用示例
│       ├── src/
│       └── package.json
├── apps/
│   └── web/            # 生产应用
├── pnpm-workspace.yaml # pnpm工作区配置
├── turbo.json          # Turborepo配置
└── README.md           # 项目文档
```

## 🔗 相关链接

- [📖 完整文档](https://auth.itangbao.com) (待更新)
- [🚀 在线示例](https://demo.itangbao.com) (待更新)
- [📦 npm包](https://www.npmjs.com/search?q=itangbao-auth)
- [🐛 问题反馈](https://github.com/your-org/itangbao-auth-mono/issues)

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 这个项目
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范
- 遵循 [Conventional Commits](https://conventionalcommits.org/)
- 使用 ESLint + Prettier 进行代码格式化
- 所有代码必须通过 TypeScript 类型检查
- 新增功能需要包含单元测试

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 👥 维护团队

- **核心维护者**: itangbao
- **项目主页**: [itangbao-auth-mono](https://github.com/your-org/itangbao-auth-mono)

## 📊 项目状态

- ✅ **稳定版本** - 已发布到npm
- ✅ **生产就绪** - 已在多个生产环境使用
- ✅ **活跃开发** - 持续维护和更新

---

<p align="center">
  <strong>🍬 itangbaoSDK - 让认证变得简单</strong><br>
  用TypeScript构建，为现代Web应用而生
</p>
