// packages/types/src/api.ts

import { User } from "./user";

// API 请求/响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthApiResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// 错误类型
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}
