// app/api/auth/token/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth-service';
import { CookieManager } from '../../../../../lib/cookie-manager';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const tokens = await authService.refreshTokens(refreshToken);
    
    const response = NextResponse.json({
      user: tokens.user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });

    // 更新cookies
    CookieManager.setAuthCookies(response, tokens);

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // 刷新失败，清除cookies
    const errorResponse = NextResponse.json(
      { error: 'Refresh failed' }, 
      { status: 401 }
    );
    CookieManager.clearAuthCookies(errorResponse);
    return errorResponse;
  }
}
