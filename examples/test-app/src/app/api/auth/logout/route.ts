// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth-service';
import { CookieManager } from '../../../../lib/cookie-manager';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('auth-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (accessToken) {
    await authService.logout(accessToken, refreshToken);
  }

  const response = NextResponse.json({ success: true });
  CookieManager.clearAuthCookies(response);
  
  return response;
}
