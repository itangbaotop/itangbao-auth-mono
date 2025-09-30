// app/api/auth/[...auth]/route.ts
import { createNextJSAuthHandler, createAuthConfig } from 'itangbao-auth-react/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

// 辅助函数：在请求时动态创建认证配置
async function getDynamicAuthConfig() {
  const { env } = await getCloudflareContext({async: true});

  // 从 Cloudflare 的 env 上下文中读取变量
  const authServiceUrl = env.AUTH_SERVICE_URL as string;
  const clientId = env.AUTH_CLIENT_ID as string;
  const clientSecret = env.AUTH_CLIENT_SECRET as string;
  const appUrl = env.NEXTAUTH_URL as string; // 注意变量名

  if (!authServiceUrl || !clientId || !clientSecret || !appUrl) {
    throw new Error('Missing required authentication environment variables at runtime.');
  }

  return createAuthConfig({
    authServiceUrl,
    clientId,
    clientSecret,
    appUrl,
  });
}

// 动态创建 GET 处理函数
export async function GET(request: NextRequest, context: { params: Promise<{ auth: string[] }> }) {
  try {
    const authConfig = await getDynamicAuthConfig();
    const handler = createNextJSAuthHandler(authConfig);
    return handler(request, context);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Auth configuration error";
    console.error("Auth GET Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 动态创建 POST 处理函数
export async function POST(request: NextRequest, context: { params: Promise<{ auth: string[] }> }) {
  try {
    const authConfig = await getDynamicAuthConfig();
    const handler = createNextJSAuthHandler(authConfig);
    return handler(request, context);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Auth configuration error";
    console.error("Auth POST Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}