// app/api/auth/token/access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth-service';
import { CookieManager } from '../../../../../lib/cookie-manager';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('auth-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const isValid = await authService.verifyToken(accessToken);
    
    if (isValid) {
      return NextResponse.json({ accessToken });
    }

    if (refreshToken) {
      const tokens = await authService.refreshTokens(refreshToken);
      const response = NextResponse.json({ accessToken: tokens.access_token });
      CookieManager.setAuthCookies(response, tokens);
      return response;
    }

    const response = NextResponse.json({ error: 'Token expired' }, { status: 401 });
    CookieManager.clearAuthCookies(response);
    return response;

  } catch (error) {
    console.error('Token access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
