// packages/types/src/user.ts
export interface User {
  id: string;
  name: string;              // 改为必需，提供默认值
  email: string;             // 改为必需
  image?: string;
  role?: string;
  emailVerified?: boolean;   // 添加邮箱验证状态
  createdAt?: string;
  updatedAt?: string;
}

// 用户信息响应（来自认证服务）
export interface UserInfoResponse {
  sub: string;               // 用户 ID
  name?: string;
  email?: string;
  image?: string;
  email_verified?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}
