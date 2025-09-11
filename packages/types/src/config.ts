// packages/types/src/config.ts
export interface AuthConfig {
  authServiceUrl: string;    // 重命名：更清晰
  clientId: string;
  clientSecret?: string;     // 服务端使用
  redirectUri: string;
  scopes?: string[];
}

// 服务端专用配置
export interface ServerAuthConfig extends AuthConfig {
  clientSecret: string;      // 服务端必须有
  appUrl: string;           // 应用基础 URL
  cookieConfig?: {
    accessTokenMaxAge?: number;
    refreshTokenMaxAge?: number;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  };
}
