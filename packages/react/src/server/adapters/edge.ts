// packages/react/src/server/adapters/edge.ts
import { AuthHandler, AuthRequest, AuthResponse } from '../core/auth-handler';
import type { ServerAuthConfig } from 'itangbao-auth-types';

export class EdgeAdapter {
  parseRequest(request: Request): AuthRequest {
    const url = new URL(request.url);
    const cookies: Record<string, string> = {};
    
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      });
    }

    return {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      cookies,
      searchParams: url.searchParams,
    };
  }

  createResponse(response: AuthResponse): Response {
    const headers = new Headers(response.headers);

    response.cookies.forEach(cookie => {
      const cookieValue = cookie.options.maxAge === 0 
        ? `${cookie.name}=; Max-Age=0; Path=${cookie.options.path || '/'}`
        : `${cookie.name}=${encodeURIComponent(cookie.value)}; Max-Age=${cookie.options.maxAge}; Path=${cookie.options.path || '/'}; ${cookie.options.httpOnly ? 'HttpOnly; ' : ''}${cookie.options.secure ? 'Secure; ' : ''}SameSite=${cookie.options.sameSite || 'Lax'}`;
      
      headers.append('Set-Cookie', cookieValue);
    });

    if (response.redirect) {
      headers.set('Location', response.redirect);
      return new Response(null, {
        status: response.status || 302,
        headers,
      });
    }

    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers,
    });
  }
}

export function createEdgeAuthHandler(config: ServerAuthConfig) {
  const authHandler = new AuthHandler(config);
  const adapter = new EdgeAdapter();

  return async function handler(request: Request, context: { params: Promise<{ auth: string[] }> }) {
    try {
      const authRequest = adapter.parseRequest(request);
      
      // 修复：await params
      const params = await context.params;
      const action = params.auth?.[0] || '';
      const subAction = params.auth?.[1];

      const authResponse = await authHandler.handleRequest(authRequest, action, subAction);
      
      return adapter.createResponse(authResponse);
    } catch (error) {
      console.error('Edge auth handler error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
