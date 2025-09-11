import { User, UserInfoResponse } from "./user";

// packages/types/src/auth.ts
export interface AuthTokens {
  accessToken: string;       // 统一命名风格
  refreshToken?: string;
  expiresAt: number;         // 改为绝对时间戳，更直观
  tokenType?: string;
  scope?: string;
}

// 认证结果
export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

// OAuth token 响应（来自认证服务）
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;        // 相对秒数
  refresh_token?: string;
  scope?: string;
  // 可能包含用户信息
  user?: User;
  userinfo?: UserInfoResponse;
}
