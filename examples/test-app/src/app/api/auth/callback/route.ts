// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth-service';
import { CookieManager } from '../../../../lib/cookie-manager';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  const urlParams = new URLSearchParams(request.url.split('?')[1]);
  const code = urlParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`);
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const tokens = await authService.exchangeCodeForTokens(code, redirectUri);

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
    CookieManager.setAuthCookies(response, tokens);
    
    return response;
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
}
