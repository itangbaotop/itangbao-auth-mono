// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuthAuth } from "@/lib/auth/config"; 
import { checkApplicationOrigin } from '@/lib/cors/application-cors';

// Next.js 中间件必须有一个默认导出，并且是一个 async function
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CORS 处理 - 优先处理所有 API 路由的 CORS
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    
    // 检查是否是已注册应用的域名
    const isAllowedOrigin = await checkApplicationOrigin(origin);
    
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      
      const response = new NextResponse(null, { status: 200 });
      
      if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin!);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', '86400');
      } else {
        console.log(`[Middleware] CORS 预检拒绝: ${origin}`);
      }
      
      return response;
    }

    // 对于实际的 API 请求，添加 CORS 头后继续处理
    let response: NextResponse;
    
    // 2. NextAuth API 路由特殊处理
    if (pathname.startsWith('/api/auth')) {
      response = NextResponse.next();
    } else {
      // 其他 API 路由正常处理
      response = NextResponse.next();
    }
    
    // 为所有 API 响应添加 CORS 头
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin!);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (origin) {
      console.log(`[Middleware] CORS 拒绝: ${origin} -> ${pathname}`);
    }
    
    return response;
  }

  // 3. 管理员路由保护逻辑（保持原有逻辑不变）
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await nextAuthAuth();

    // 如果用户未登录
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // 如果用户已登录，但角色不是 'admin'
    if (session.user?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // 4. 对于其他所有未被上述逻辑拦截的路由，正常通过
  return NextResponse.next();
}

// 配置中间件的匹配路径
export const config = {
  // 匹配所有 API 路由（用于 CORS）和管理员路由（用于权限保护）
  matcher: [
    '/api/:path*',     // 匹配所有 API 路由，用于 CORS 处理
    '/admin/:path*',   // 匹配所有管理员路由，用于权限保护
  ],
};
