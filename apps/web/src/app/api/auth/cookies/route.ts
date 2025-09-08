// apps/web/src/app/api/auth/cookies/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, key, value, options } = await request.json();
    
    const response = NextResponse.json({ success: true });
    
    if (action === 'set') {
      response.cookies.set(key, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
      });
    } else if (action === 'remove') {
      response.cookies.delete(key);
    }
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 });
  }
  
  const value = request.cookies.get(key)?.value || null;
  
  return NextResponse.json({ value });
}
