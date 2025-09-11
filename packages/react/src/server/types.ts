// packages/react/src/server/types.ts
export interface AuthRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  searchParams: URLSearchParams;
  body?: any;
}

export interface AuthCookie {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    maxAge?: number;
    expires?: Date;
    path?: string;
  };
}

export interface AuthResponse {
  status: number;
  headers: Record<string, string>;
  cookies: AuthCookie[];
  body: any;
  redirect?: string;
}

export interface AuthAdapter {
  parseRequest(req: any): Promise<AuthRequest> | AuthRequest;
  createResponse(response: AuthResponse, ...args: any[]): any;
}

// Next.js 15 兼容的上下文类型
export interface NextJSAuthContext {
  params: Promise<{ auth: string[] }>;
}

export interface EdgeAuthContext {
  params: Promise<{ auth: string[] }>;
}
