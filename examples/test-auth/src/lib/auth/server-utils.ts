// lib/auth/server-utils.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { User } from 'itangbao-auth-types';

// 从请求中获取用户信息
export async function getUserFromRequest(request?: NextRequest): Promise<User | null> {
  let accessToken: string | undefined;
  let requestCookiesHeader: string | undefined; // 用于转发 cookie

  if (request) {
    accessToken = request.cookies.get('auth-token')?.value;
    requestCookiesHeader = request.headers.get('cookie') || undefined;
  } else {
    const cookieStore = cookies();
    accessToken = (await cookieStore).get('auth-token')?.value;

  }

  if (!accessToken) {
    console.log('❌ No auth-token found in request/cookies.');
    return null;
  }

  try {
    console.log("accessToken (in getUserFromRequest):" + accessToken);
    
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requestCookiesHeader) {
      fetchHeaders['Cookie'] = requestCookiesHeader;
      console.log('🍪 Forwarding cookie header:', requestCookiesHeader.substring(0, 50) + '...');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
      method: 'GET', // 确保是 GET 请求
      credentials: 'include', // 仍然保留，以防万一
      headers: fetchHeaders,
    });

    if (!response.ok) {
      console.error('❌ Failed to verify token via /api/auth/me. Status:', response.status);
      return null;
    }

    const authMeResponse = await response.json() as { user?: User };

    const userInfo = authMeResponse.user as User; // 从 /api/auth/me 的 body 中获取 user
    
    // 确保用户信息结构正确
    if (!userInfo || !userInfo.id) {
      return null;
    }

    return userInfo;
  } catch (error) {
    console.error('💥 Error verifying user in getUserFromRequest:', error);
    return null;
  }
}

// 获取用户ID的便捷函数
export async function getUserId(request?: NextRequest): Promise<string | null> {
  const user = await getUserFromRequest(request);
  return user?.id || null;
}

// 检查用户是否已认证
export async function requireAuth(request?: NextRequest): Promise<User> {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
