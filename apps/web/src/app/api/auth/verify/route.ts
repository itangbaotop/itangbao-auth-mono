// src/app/api/user/info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/utils/jwt";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // 1. 从 Authorization header 获取 token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  const accessToken = authHeader.substring(7); // 移除 "Bearer " 前缀

  try {
    // 2. 验证 JWT token
    const payload = await verifyJwt(accessToken);
    
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'invalid_token', isValid: false }, { status: 401 });
    }

    return NextResponse.json({
      isValid: true,
    })

  } catch (error) {
    console.error('UserInfo: Token 验证失败:', error);
    return NextResponse.json({ error: 'invalid_token', isValid: false }, { status: 401 });
  }
}

// 支持 POST 方法（某些客户端可能使用 POST）
export async function POST(request: NextRequest) {
  return GET(request);
}
