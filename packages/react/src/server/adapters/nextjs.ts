// packages/react/src/server/adapters/nextjs.ts
import { AuthHandler, AuthRequest, AuthResponse } from '../core/auth-handler';
import type { ServerAuthConfig } from 'itangbao-auth-types';

export interface NextJSAuthContext {
  params: Promise<{ auth: string[] }>; // 现在 params 是 Promise
}

export class NextJSAdapter {
  parseRequest(request: any): AuthRequest {
    const url = new URL(request.url);
    const cookies: Record<string, string> = {};
    
    request.cookies.getAll().forEach((cookie: any) => {
      cookies[cookie.name] = cookie.value;
    });

    return {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      cookies,
      searchParams: url.searchParams,
    };
  }

  async createResponse(response: AuthResponse): Promise<any> {
    // @ts-ignore
    const { NextResponse } = await import('next/server');

    if (response.redirect) {
      const nextResponse = NextResponse.redirect(response.redirect, response.status || 302);
      
      response.cookies.forEach(cookie => {
        if (cookie.options.maxAge === 0) {
          nextResponse.cookies.delete(cookie.name);
        } else {
          nextResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      });
      
      return nextResponse;
    }

    const nextResponse = NextResponse.json(response.body, { 
      status: response.status,
      headers: response.headers 
    });
    
    response.cookies.forEach(cookie => {
      if (cookie.options.maxAge === 0) {
        nextResponse.cookies.delete(cookie.name);
      } else {
        nextResponse.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    });
    
    return nextResponse;
  }
}

export function createNextJSAuthHandler(config: ServerAuthConfig) {
  const authHandler = new AuthHandler(config);
  const adapter = new NextJSAdapter();

  return async function handler(request: any, context: NextJSAuthContext) {
    try {
      const authRequest = adapter.parseRequest(request);
      
      // 修复：await params
      const params = await context.params;
      const action = params.auth?.[0] || '';
      const subAction = params.auth?.[1];

      const authResponse = await authHandler.handleRequest(authRequest, action, subAction);
      
      return await adapter.createResponse(authResponse);
    } catch (error) {
      console.error('Auth handler error:', error);
      
      try {
        // @ts-ignore
        const { NextResponse } = await import('next/server');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      } catch {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  };
}
