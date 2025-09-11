// packages/react/src/server/index.ts
import type { ServerAuthConfig } from 'itangbao-auth-types';
// 第4层：服务端路由完整导出
export { AuthHandler } from './core/auth-handler';
export { ServerAuthService } from './core/server-auth';
export { CookieManager } from './core/cookie-manager';

// 适配器
export { NextJSAdapter, createNextJSAuthHandler } from './adapters/nextjs';
export { EdgeAdapter, createEdgeAuthHandler } from './adapters/edge';

// 类型
export type { AuthRequest, AuthResponse } from './core/auth-handler';
export type { ServerAuthConfig } from 'itangbao-auth-types';

// 便捷函数
export function createAuthConfig(options: {
  authServiceUrl: string;
  clientId: string;
  clientSecret: string;
  appUrl: string;
  cookieConfig?: ServerAuthConfig['cookieConfig'];
}): ServerAuthConfig {
  return {
    authServiceUrl: options.authServiceUrl,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    redirectUri: `${options.appUrl}/api/auth/callback`,
    appUrl: options.appUrl,
    scopes: ['openid', 'profile', 'email'],
    cookieConfig: options.cookieConfig,
  };
}
