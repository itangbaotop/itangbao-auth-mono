// src/lib/utils/jwt.ts
import * as jose from 'jose'; // 导入 jose 库
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge'; // 确保在 Edge Runtime 中运行

// 延迟并从 Cloudflare 环境中获取 JWT 密钥，避免在 Edge 顶层引用 Node 的 process
async function getJwtSecret(): Promise<Uint8Array> {
  const { env } = await getCloudflareContext();
  const secret = env.NEXTAUTH_SECRET as string | undefined;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set. It is required for JWT signing.');
  }
  return new TextEncoder().encode(secret);
}

const JWT_ALG = 'HS256'; // 对称加密算法，例如 HMAC SHA256

// JWT 载荷的类型定义
// 包含了用户和应用相关的信息
export type UserJwtPayload = jose.JWTPayload & {
  sub: string;
  aud: string;
  scope: string;
  id: string;
  appId?: string;
  name?: string | null;
  email: string;
  role: string;
  image?: string | null;
};

/**
 * 验证并解码 JWT。
 * 客户端应用（或其后端）使用此函数来验证从认证服务接收到的 JWT。
 *
 * @param token JWT 字符串
 * @param expectedAudience 期望的受众 (appId)，用于验证 aud 字段。可选。
 * @returns 解码后的载荷 (UserJwtPayload)，如果验证失败则抛出 jose.errors.JWTInvalid 等错误
 */
export async function verifyJwt(token: string, expectedAudience?: string): Promise<UserJwtPayload> {
  const secret = await getJwtSecret();
  // 验证 JWT 的签名、过期时间、签发者和受众
  const { payload } = await jose.jwtVerify(token, secret, {
    algorithms: [JWT_ALG], // 验证签名算法
    issuer: 'itangbao-auth', // 验证签发者
    audience: expectedAudience, // 如果提供了期望的受众，则验证受众
  });

  return payload as unknown as UserJwtPayload; // 将载荷断言为 UserJwtPayload 类型
}

/**
 * (可选) 仅解码 JWT，不验证签名。
 * 主要用于在客户端快速获取 JWT 内容，但不要依赖其进行安全判断。
 * 安全判断必须使用 verifyJwt。
 *
 * @param token JWT 字符串
 * @returns 解码后的载荷，如果无法解码则返回 null
 */
export function decodeJwt(token: string): UserJwtPayload | null {
  try {
    const { payload } = jose.decodeJwt(token);
    return payload as UserJwtPayload;
  } catch (e) {
    console.error("解码 JWT 失败:", e);
    return null;
  }
}
